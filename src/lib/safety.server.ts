import { createHash, timingSafeEqual } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import type { Sql } from "@/lib/db";
import { communityModOk } from "@/lib/moderator-allowlist";
import { activeBanMessage, muteDeadline, offenseMessage } from "@/lib/penalties";
import type { ReviewGate } from "@/lib/review-gate";

const LIMITS = {
  stamp: { max: 3, secs: 60 * 60 },
  report: { max: 6, secs: 60 * 60 },
  vote: { max: 40, secs: 10 * 60 },
} as const;

function ipHash(): string {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ip = forwarded || request?.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`grc-rate-v1:${ip}`).digest("hex").slice(0, 24);
}

export function networkHash(): string {
  return ipHash();
}

/** Count this booth and this network. Throws when the window is full. Raw IPs are not stored. */
export async function charge(sql: Sql, kind: keyof typeof LIMITS, token: string): Promise<void> {
  const { max, secs } = LIMITS[kind];
  const keys =
    kind === "vote" ? [`${kind}:ip:${ipHash()}`] : [`${kind}:ip:${ipHash()}`, `${kind}:tok:${token}`];
  for (const bucket of keys) {
    const rows = await sql.query<{ hits: number }>(
      `insert into rate_hits (bucket, hits, window_start)
       values ($1, 1, now())
       on conflict (bucket) do update set
         hits = case
           when rate_hits.window_start < now() - make_interval(secs => $2::int) then 1
           else rate_hits.hits + 1
         end,
         window_start = case
           when rate_hits.window_start < now() - make_interval(secs => $2::int) then now()
           else rate_hits.window_start
         end
       returning hits`,
      [bucket, secs],
    );
    if (Number(rows[0]?.hits ?? 1) > max) {
      if (kind === "stamp") throw new Error("Slow down. A few stamps an hour is the limit.");
      if (kind === "report") throw new Error("Too many reports from this booth. Wait and try again.");
      throw new Error("Too many reactions from this network. Wait a little.");
    }
  }
}

/** True only when the host has a long review passphrase and this one matches. Never logged. */
export function moderatorOk(given: string): boolean {
  const expected = process.env.GRC_MOD_TOKEN?.trim() ?? "";
  if (expected.length < 16 || given.length < 16 || given.length > 200) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function reviewAllowed(gate: ReviewGate): boolean {
  if (gate.adult !== true || gate.modTerms !== true) return false;
  if (gate.mode === "house") return moderatorOk(gate.secret);
  return communityModOk(gate.id, gate.secret);
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function assertUploadsOpen(sql: Sql, token: string): Promise<void> {
  const rows = await sql.query<{ reason: string; expires_at: string | Date | null }>(
    `select reason, expires_at from upload_bans
     where bucket in ($1, $2) and (expires_at is null or expires_at > now())
     order by expires_at nulls first
     limit 1`,
    [`tok:${token}`, `net:${networkHash()}`],
  );
  const row = rows[0];
  if (!row) return;
  throw new Error(activeBanMessage({ reason: row.reason, until: asDate(row.expires_at) }));
}

export async function banUploads(sql: Sql, token: string, net: string, reason: string, until: Date | null): Promise<void> {
  const buckets = [token ? `tok:${token}` : "", net ? `net:${net}` : ""].filter(Boolean);
  for (const bucket of buckets) {
    await sql.query(
      `insert into upload_bans (bucket, reason, expires_at) values ($1, $2, $3)
       on conflict (bucket) do update set
         reason = excluded.reason,
         expires_at = case
           when upload_bans.expires_at is null then null
           when excluded.expires_at is null then null
           else greatest(upload_bans.expires_at, excluded.expires_at)
         end`,
      [bucket, reason, until ? until.toISOString() : null],
    );
  }
}

/** Counts a violation for this booth. Does not use the moderator's network. */
export async function noteBlockedScan(sql: Sql, token: string, net: string): Promise<number> {
  const buckets = [token ? `tok:${token}` : "", net ? `net:${net}` : ""].filter(Boolean);
  let hits = 1;
  for (const bucket of buckets) {
    const rows = await sql.query<{ hits: number }>(
      `insert into scan_strikes (bucket, hits) values ($1, 1)
       on conflict (bucket) do update set hits = scan_strikes.hits + 1, updated_at = now()
       returning hits`,
      [bucket],
    );
    hits = Math.max(hits, Number(rows[0]?.hits ?? 1));
  }
  return hits;
}

/** Strike 1 warns. Strike 2 mutes uploads for 30 days. Strike 3 is permanent. */
export async function recordViolation(sql: Sql, token: string, net: string, rule: string, why: string): Promise<string> {
  if (!token && !net) return `The file is blocked. Rule: ${rule}. Why: ${why}`;
  const hits = await noteBlockedScan(sql, token, net);
  const until = hits === 2 ? muteDeadline() : null;
  if (hits >= 2) await banUploads(sql, token, net, `${rule}. ${why}`, hits === 2 ? until : null);
  return offenseMessage({ hits, rule, why, until });
}
