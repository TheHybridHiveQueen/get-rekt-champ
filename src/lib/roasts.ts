import { createServerFn } from "@tanstack/react-start";
import {
  ALIAS_A,
  ALIAS_B,
  BEATS,
  CHAMPS,
  SEEDS,
  linesFor,
  type Draft,
  type Format,
  type Kind,
  type Meme,
  type Tally,
} from "@/lib/catalog";
import { confirmPublicGif, gifProblem } from "@/lib/gif-check";
import { isReportReason, type ReportReason } from "@/lib/reports";
import { stampCheckError, TERMS_VERSION } from "@/lib/agreements";
import { blockWhy, gifKey, isBanReason, MOD_RULES } from "@/lib/automod";
import { parseGate } from "@/lib/review-gate";
import { NOW_PACK } from "@/lib/now-pack";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MemeRow = {
  id: number;
  champ_slug: string;
  format: Format;
  line_a: string;
  line_b: string;
  alias_a: string;
  alias_b: string;
  rekt: number;
  defend: number;
  crown: number;
  created_at: string;
  gif_url: string;
};

const MEME_RETURNING = `
  id, champ_slug, format, line_a, line_b, alias_a, alias_b, rekt, defend, crown, gif_url,
  to_char(created_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
`;

function toMeme(row: MemeRow): Meme {
  return {
    id: row.id,
    champSlug: row.champ_slug,
    format: row.format,
    lineA: row.line_a,
    lineB: row.line_b,
    aliasA: row.alias_a,
    aliasB: row.alias_b,
    rekt: row.rekt,
    defend: row.defend,
    crown: row.crown,
    createdAt: row.created_at,
    gifUrl: row.gif_url ?? "",
  };
}

function isUnique(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  if (code === "23505") return true;
  const message = "message" in err ? String((err as { message: unknown }).message) : "";
  return /unique|duplicate/i.test(message);
}

async function ensureSeed(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  const existing = await sql<{ n: number }>`select count(*)::int as n from memes`;
  if ((existing[0]?.n ?? 0) === 0) {
  for (const seed of SEEDS) {
    const top = BEATS.find((b) => b.id === seed.a);
    const bottom = seed.b ? BEATS.find((b) => b.id === seed.b) : undefined;
    if (!top) throw new Error(`Missing house line ${seed.a}`);
    await sql`
      insert into memes (
        seed_key, champ_slug, format, line_a, line_b, alias_a, alias_b,
        rekt, defend, crown, created_at
      )
      values (
        ${seed.key},
        ${seed.champ},
        ${seed.format},
        ${top.text},
        ${bottom?.text ?? ""},
        ${seed.aliasA},
        ${seed.aliasB},
        ${seed.rekt},
        ${seed.defend},
        ${seed.crown},
        now() - make_interval(mins => ${seed.mins}::int)
      )
      on conflict (seed_key) do nothing
    `;
  }
  }
  await syncSeedLines(sql);
  await insertNowPack(sql);
  await syncNowChamps(sql);
  await pruneDroppedViews(sql);
}

async function insertNowPack(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  const have = await sql<{ seed_key: string }>`select seed_key from memes where seed_key like 'now-%'`;
  const got = new Set(have.map((row) => row.seed_key));
  const missing = NOW_PACK.filter((card) => !got.has(card.key));
  if (missing.length === 0) return;
  for (let offset = 0; offset < missing.length; offset += 40) {
    const chunk = missing.slice(offset, offset + 40);
    const params: Array<string | number> = [];
    const values: string[] = [];
    chunk.forEach((card, index) => {
      const base = index * 11;
      const n = Math.max(0, NOW_PACK.findIndex((item) => item.key === card.key));
      values.push(
        `($${base + 1}, $${base + 2}, 'impact', $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, now() - make_interval(mins => $${base + 11}::int))`,
      );
      params.push(
        card.key,
        card.champ,
        card.lineA,
        card.lineB,
        ALIAS_A[n % ALIAS_A.length] ?? "Velvet",
        ALIAS_B[n % ALIAS_B.length] ?? "Stamp",
        card.gif,
        (n * 3) % 17,
        (n * 5) % 9,
        n % 4,
        20 + (n % 5000),
      );
    });
    await sql.query(
      `insert into memes (seed_key, champ_slug, format, line_a, line_b, alias_a, alias_b, gif_url, rekt, defend, crown, created_at)
       values ${values.join(", ")}
       on conflict (seed_key) do nothing`,
      params,
    );
  }
}

async function syncNowChamps(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  for (let offset = 0; offset < NOW_PACK.length; offset += 80) {
    const chunk = NOW_PACK.slice(offset, offset + 80);
    const params: string[] = [];
    const values: string[] = [];
    chunk.forEach((card, index) => {
      const base = index * 2;
      values.push(`($${base + 1}, $${base + 2})`);
      params.push(card.key, card.champ);
    });
    await sql.query(
      `update memes as m
       set champ_slug = v.champ
       from (values ${values.join(", ")}) as v(seed_key, champ)
       where m.seed_key = v.seed_key
         and m.champ_slug is distinct from v.champ`,
      params,
    );
  }
}

async function pruneDroppedViews(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  const keep = NOW_PACK.filter((card) => card.champ === "hand" || card.champ === "allbot" || card.champ === "both").map(
    (card) => card.key,
  );
  if (keep.length === 0) return;
  const params = keep;
  const list = keep.map((_, index) => `$${index + 1}`).join(", ");
  await sql.query(
    `delete from memes
     where champ_slug in ('hand', 'allbot', 'both')
       and seed_key is not null
       and seed_key not in (${list})`,
    params,
  );
}

async function syncSeedLines(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  const params: string[] = [];
  const values: string[] = [];
  SEEDS.forEach((seed, index) => {
    const top = BEATS.find((b) => b.id === seed.a);
    const bottom = seed.b ? BEATS.find((b) => b.id === seed.b) : undefined;
    if (!top) return;
    const base = index * 3;
    values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
    params.push(seed.key, top.text, bottom?.text ?? "");
  });
  if (values.length === 0) return;
  await sql.query(
    `update memes as m
     set line_a = v.line_a, line_b = v.line_b
     from (values ${values.join(", ")}) as v(seed_key, line_a, line_b)
     where m.seed_key = v.seed_key
       and (m.line_a is distinct from v.line_a or m.line_b is distinct from v.line_b)`,
    params,
  );
}

function assertDraft(data: unknown): Draft {
  if (!data || typeof data !== "object") throw new Error("That stamp is blank.");
  const d = data as Record<string, unknown>;
  const champSlug = d.champSlug;
  const format = d.format;
  const lineA = d.lineA;
  const lineB = d.lineB;
  const aliasA = d.aliasA;
  const aliasB = d.aliasB;
  if (typeof champSlug !== "string" || !CHAMPS.some((c) => c.slug === champSlug)) {
    throw new Error("Pick a public name from the board.");
  }
  if (format !== "impact" && format !== "quote" && format !== "score") {
    throw new Error("Pick a format.");
  }
  if (typeof lineA !== "string" || typeof lineB !== "string") throw new Error("Those lines got lost.");
  if (typeof aliasA !== "string" || !ALIAS_A.includes(aliasA)) {
    throw new Error("Pick a house byline.");
  }
  if (typeof aliasB !== "string" || !ALIAS_B.includes(aliasB)) {
    throw new Error("Pick a house byline.");
  }
  if (format === "impact") {
    if (!linesFor(champSlug, "top").some((b) => b.text === lineA)) {
      throw new Error("That top line is not in the house book.");
    }
    if (!linesFor(champSlug, "bottom").some((b) => b.text === lineB)) {
      throw new Error("That bottom line is not in the house book.");
    }
  } else if (format === "quote") {
    if (lineB !== "") throw new Error("Quotes stay one line.");
    if (!linesFor(champSlug, "quote").some((b) => b.text === lineA)) {
      throw new Error("That quote is not in the house book.");
    }
  } else {
    if (lineB !== "") throw new Error("Scores stay one line.");
    if (!linesFor(champSlug, "score").some((b) => b.text === lineA)) {
      throw new Error("That score is not in the house book.");
    }
  }
  return { champSlug, format, lineA, lineB, aliasA, aliasB, gifUrl: handmadeGif(d.gifUrl) };
}

function handmadeGif(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value !== "string") throw new Error("That GIF link is not a link.");
  const problem = gifProblem(value);
  if (problem) throw new Error(problem);
  return new URL(value.trim()).toString();
}

function assertVote(data: unknown): { id: number; token: string; kind: Kind } {
  if (!data || typeof data !== "object") throw new Error("That reaction missed.");
  const d = data as Record<string, unknown>;
  if (typeof d.id !== "number" || !Number.isInteger(d.id) || d.id < 1) {
    throw new Error("That stamp wandered off.");
  }
  if (typeof d.token !== "string" || !UUID.test(d.token)) throw new Error("Bad booth token.");
  if (d.kind !== "rekt" && d.kind !== "defend" && d.kind !== "crown") {
    throw new Error("Pick a reaction.");
  }
  return { id: d.id, token: d.token, kind: d.kind };
}

export const listMemes = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureSeed(sql);
  const memes = await sql<MemeRow>`
    select id, champ_slug, format, line_a, line_b, alias_a, alias_b, rekt, defend, crown, gif_url,
      to_char(created_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from memes
    where status = 'live'
    order by created_at desc
    limit 900
  `;
  const tallies = await sql<Tally>`
    select champ_slug as slug, count(*)::int as posts, coalesce(sum(rekt), 0)::int as rekt
    from memes
    where status = 'live'
    group by champ_slug
  `;
  return { memes: memes.map(toMeme), tallies };
});

export const myVotes = createServerFn({ method: "GET" })
  .validator((token: unknown) => (typeof token === "string" && UUID.test(token) ? token : ""))
  .handler(async ({ data: token }) => {
    if (!token) return [] as { memeId: number; kind: Kind }[];
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ meme_id: number; kind: Kind }>`
      select meme_id, kind from votes where token = ${token}
    `;
    return rows.map((row) => ({ memeId: row.meme_id, kind: row.kind }));
  });

function assertStamp(data: unknown): Draft & { token: string; acceptedTerms: true } {
  const draft = assertDraft(data);
  const row = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const token = row.token;
  if (typeof token !== "string" || !UUID.test(token)) throw new Error("Bad booth token.");
  const missing = stampCheckError({
    age13: row.age13 === true,
    terms: row.terms === true,
    ladder: row.ladder === true,
  });
  if (missing) throw new Error(missing);
  return { ...draft, token, acceptedTerms: true };
}

export const createMeme = createServerFn({ method: "POST" })
  .validator(assertStamp)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { charge, assertUploadsOpen, networkHash, recordViolation } = await import("@/lib/safety.server");
    const gifProblemText = await confirmPublicGif(data.gifUrl);
    if (gifProblemText) throw new Error(gifProblemText);
    const sql = await getSql();
    await assertUploadsOpen(sql, data.token);
    await charge(sql, "stamp", data.token);
    const key = gifKey(data.gifUrl);
    if (key) {
      const banned = await sql.query<{ gif_key: string }>(
        `select gif_key from blocked_gifs where gif_key = $1 limit 1`,
        [key],
      );
      if (banned.length > 0) {
        throw new Error(
          await recordViolation(
            sql,
            data.token,
            networkHash(),
            "No sending a blocked file again",
            "This GIF was already blocked. Sending it again is cheating the check.",
          ),
        );
      }
    }
    if (data.gifUrl) {
      const { scanGifUrl } = await import("@/lib/automod-scan.server");
      const scan = await scanGifUrl(data.gifUrl);
      const knownFile = await sql.query<{ sha256: string }>(
        `select sha256 from blocked_hashes where sha256 = $1 limit 1`,
        [scan.fileHash],
      );
      if (knownFile.length > 0) {
        throw new Error(
          await recordViolation(
            sql,
            data.token,
            networkHash(),
            "No sending a blocked file again",
            "This is the same file that was already blocked, under a different link.",
          ),
        );
      }
      if (scan.verdict === "block") {
        const why = blockWhy(scan.scores);
        if (key) {
          await sql.query(
            `insert into blocked_gifs (gif_key, reason) values ($1, 'explicit') on conflict (gif_key) do nothing`,
            [key],
          );
        }
        await sql.query(
          `insert into blocked_hashes (sha256, reason) values ($1, 'explicit') on conflict (sha256) do nothing`,
          [scan.fileHash],
        );
        throw new Error(await recordViolation(sql, data.token, networkHash(), why.rule, why.why));
      }
      if (scan.verdict === "review") {
        const dupes = await sql<{ id: number }>`
          select id from memes
          where champ_slug = ${data.champSlug}
            and line_a = ${data.lineA}
            and line_b = ${data.lineB}
            and coalesce(gif_url, '') = ${data.gifUrl}
            and status <> 'hidden'
          limit 1
        `;
        if (dupes.length > 0) throw new Error("That stamp is already waiting or already on the wall.");
        try {
          await sql.query(
            `insert into memes (champ_slug, format, line_a, line_b, alias_a, alias_b, gif_url, status, submitter_token, submitter_net, accepted_terms, terms_version, terms_accepted_at, automod_note)
             values ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, true, $10, now(), $11)`,
            [
              data.champSlug,
              data.format,
              data.lineA,
              data.lineB,
              data.aliasA,
              data.aliasB,
              data.gifUrl,
              data.token,
              networkHash(),
              TERMS_VERSION,
              "Scanner wants a closer look. Not a ban.",
            ],
          );
        } catch (err) {
          if (isUnique(err)) throw new Error("That combo already has a stamp. Spin it.");
          throw err;
        }
        return { ok: true as const };
      }
    }
    const dupes = await sql<{ id: number }>`
      select id from memes
      where champ_slug = ${data.champSlug}
        and line_a = ${data.lineA}
        and line_b = ${data.lineB}
        and coalesce(gif_url, '') = ${data.gifUrl}
        and status <> 'hidden'
      limit 1
    `;
    if (dupes.length > 0) throw new Error("That stamp is already waiting or already on the wall.");
    try {
      await sql.query(
        `insert into memes (champ_slug, format, line_a, line_b, alias_a, alias_b, gif_url, status, submitter_token, submitter_net, accepted_terms, terms_version, terms_accepted_at)
         values ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, true, $10, now())`,
        [data.champSlug, data.format, data.lineA, data.lineB, data.aliasA, data.aliasB, data.gifUrl, data.token, networkHash(), TERMS_VERSION],
      );
      return { ok: true as const };
    } catch (err) {
      if (isUnique(err)) throw new Error("That combo already has a stamp. Spin it.");
      throw err;
    }
  });

const VOTE_SQL = `
with prior as (
  select kind from votes where meme_id = $1 and token = $2
),
cleared as (
  delete from votes v
  where v.meme_id = $1 and v.token = $2
    and exists (select 1 from prior p where p.kind = $3)
  returning v.kind
),
flipped as (
  update votes v
  set kind = $3
  where v.meme_id = $1 and v.token = $2
    and exists (select 1 from prior p where p.kind <> $3)
  returning (select p.kind from prior p) as old_kind
),
added as (
  insert into votes (meme_id, token, kind)
  select $1, $2, $3
  where not exists (select 1 from prior)
  returning kind
),
bump as (
  update memes m
  set
    rekt = greatest(0, rekt + (
      case when $3 = 'rekt' and exists (select 1 from added) then 1 else 0 end
      + case when $3 = 'rekt' and exists (select 1 from cleared) then -1 else 0 end
      + case when exists (select 1 from flipped f where f.old_kind = 'rekt') then -1 else 0 end
      + case when $3 = 'rekt' and exists (select 1 from flipped) then 1 else 0 end
    )),
    defend = greatest(0, defend + (
      case when $3 = 'defend' and exists (select 1 from added) then 1 else 0 end
      + case when $3 = 'defend' and exists (select 1 from cleared) then -1 else 0 end
      + case when exists (select 1 from flipped f where f.old_kind = 'defend') then -1 else 0 end
      + case when $3 = 'defend' and exists (select 1 from flipped) then 1 else 0 end
    )),
    crown = greatest(0, crown + (
      case when $3 = 'crown' and exists (select 1 from added) then 1 else 0 end
      + case when $3 = 'crown' and exists (select 1 from cleared) then -1 else 0 end
      + case when exists (select 1 from flipped f where f.old_kind = 'crown') then -1 else 0 end
      + case when $3 = 'crown' and exists (select 1 from flipped) then 1 else 0 end
    ))
  where m.id = $1 and m.status = 'live'
  returning ${MEME_RETURNING}
)
select bump.*,
  case when exists (select 1 from cleared) then null else $3 end as my_kind
from bump
`;

export const reactToMeme = createServerFn({ method: "POST" })
  .validator(assertVote)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { charge } = await import("@/lib/safety.server");
    const sql = await getSql();
    await charge(sql, "vote", data.token);
    const rows = await sql.query<MemeRow & { my_kind: Kind | null }>(VOTE_SQL, [
      data.id,
      data.token,
      data.kind,
    ]);
    const row = rows[0];
    if (!row) throw new Error("That stamp wandered off.");
    return { meme: toMeme(row), myKind: row.my_kind };
  });

const REFUSED = "House review refused that.";

function assertReport(data: unknown): { id: number; token: string; reason: ReportReason } {
  if (!data || typeof data !== "object") throw new Error("That report missed.");
  const d = data as Record<string, unknown>;
  if (typeof d.id !== "number" || !Number.isInteger(d.id) || d.id < 1) throw new Error("That stamp wandered off.");
  if (typeof d.token !== "string" || !UUID.test(d.token)) throw new Error("Bad booth token.");
  if (!isReportReason(d.reason)) throw new Error("Pick a reason.");
  return { id: d.id, token: d.token, reason: d.reason };
}

export const reportMeme = createServerFn({ method: "POST" })
  .validator(assertReport)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { charge } = await import("@/lib/safety.server");
    const sql = await getSql();
    await charge(sql, "report", data.token);
    await sql.query(
      `insert into reports (meme_id, token, reason)
       select $1, $2, $3
       where exists (select 1 from memes where id = $1 and status = 'live')
       on conflict (meme_id, token) do nothing`,
      [data.id, data.token, data.reason],
    );
    await sql.query(`update memes set status = 'hidden' where id = $1 and status = 'live'`, [data.id]);
    return { ok: true as const };
  });

export type ReviewCard = {
  id: number;
  champSlug: string;
  lineA: string;
  lineB: string;
  gifUrl: string;
  status: "pending" | "hidden";
  seeded: boolean;
  reason: string | null;
  automodNote: string;
};

export const reviewQueue = createServerFn({ method: "POST" })
  .validator(parseGate)
  .handler(async ({ data: gate }) => {
    const { reviewAllowed } = await import("@/lib/safety.server");
    if (!reviewAllowed(gate)) throw new Error(REFUSED);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(`insert into mod_acceptances (mod_id, terms_version) values ($1, $2)`, [
      gate.mode === "house" ? "house" : gate.id,
      TERMS_VERSION,
    ]);
    const rows = await sql<{
      id: number;
      champ_slug: string;
      line_a: string;
      line_b: string;
      gif_url: string;
      status: "pending" | "hidden";
      seed_key: string | null;
      reason: string | null;
      automod_note: string;
    }>`
      select m.id, m.champ_slug, m.line_a, m.line_b, m.gif_url, m.status, m.seed_key, m.automod_note,
        (select r.reason from reports r where r.meme_id = m.id order by r.created_at desc limit 1) as reason
      from memes m
      where m.status in ('pending', 'hidden')
      order by m.created_at desc
      limit 80
    `;
    const queue: ReviewCard[] = rows.map((row) => ({
      id: row.id,
      champSlug: row.champ_slug,
      lineA: row.line_a,
      lineB: row.line_b,
      gifUrl: row.gif_url,
      status: row.status,
      seeded: Boolean(row.seed_key),
      reason: row.reason,
      automodNote: row.automod_note,
    }));
    return { queue };
  });

export const reviewAct = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const gate = parseGate(data);
    const d = data as { memeId?: unknown; action?: unknown; banReason?: unknown };
    if (typeof d.memeId !== "number" || !Number.isInteger(d.memeId) || d.memeId < 1) throw new Error("That stamp wandered off.");
    if (d.action !== "approve" && d.action !== "drop" && d.action !== "violate") throw new Error("Pick an action.");
    if (d.action === "violate" && !isBanReason(d.banReason)) throw new Error("Pick why it breaks the rules.");
    return { gate, id: d.memeId, action: d.action, banReason: isBanReason(d.banReason) ? d.banReason : null };
  })
  .handler(async ({ data }) => {
    const { reviewAllowed, recordViolation } = await import("@/lib/safety.server");
    if (!reviewAllowed(data.gate)) throw new Error(REFUSED);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.action === "violate") {
      const rows = await sql.query<{ gif_url: string; submitter_token: string; submitter_net: string }>(
        `select gif_url, submitter_token, submitter_net from memes where id = $1 and status in ('pending', 'hidden')`,
        [data.id],
      );
      const row = rows[0];
      if (!row) throw new Error("That stamp wandered off.");
      const key = gifKey(row.gif_url);
      if (key) {
        await sql.query(
          `insert into blocked_gifs (gif_key, reason) values ($1, $2) on conflict (gif_key) do nothing`,
          [key, data.banReason],
        );
      }
      const marked = MOD_RULES[data.banReason ?? "explicit"];
      const note = row.submitter_token
        ? await recordViolation(sql, row.submitter_token, row.submitter_net, marked.rule, marked.why)
        : `The file is blocked. Rule: ${marked.rule}. Why: ${marked.why}`;
      await sql.query(`update memes set status = 'hidden' where id = $1`, [data.id]);
      return { ok: true as const, note };
    }
    if (data.action === "approve") {
      const rows = await sql.query<{ gif_url: string }>(`select gif_url from memes where id = $1`, [data.id]);
      const key = gifKey(rows[0]?.gif_url ?? "");
      if (key) {
        const banned = await sql.query(`select gif_key from blocked_gifs where gif_key = $1`, [key]);
        if (banned.length > 0) throw new Error("That GIF is on the block list. It cannot go on the wall.");
      }
      await sql.query(`update memes set status = 'live' where id = $1 and status in ('pending', 'hidden')`, [data.id]);
    } else {
      await sql.query(`delete from memes where id = $1 and status in ('pending', 'hidden') and seed_key is null`, [data.id]);
      await sql.query(`update memes set status = 'hidden' where id = $1 and seed_key is not null and status <> 'live'`, [data.id]);
    }
    return { ok: true as const };
  });
