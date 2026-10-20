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
}

async function insertNowPack(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>) {
  const existing = await sql<{ n: number }>`select count(*)::int as n from memes where seed_key like 'now-%'`;
  if ((existing[0]?.n ?? 0) >= NOW_PACK.length) return;
  const have = await sql<{ seed_key: string }>`select seed_key from memes where seed_key like 'now-%'`;
  const got = new Set(have.map((row) => row.seed_key));
  const missing = NOW_PACK.filter((card) => !got.has(card.key));
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
  const trimmed = value.trim();
  if (trimmed.length > 400) throw new Error("That GIF link is too long.");
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Paste a direct https link ending in .gif.");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Handmade GIFs have to be a plain https link.");
  }
  const path = url.pathname.toLowerCase();
  if (!path.endsWith(".gif")) throw new Error("Paste a direct .gif file you made by hand.");
  return url.toString();
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
    order by created_at desc
    limit 420
  `;
  const tallies = await sql<Tally>`
    select champ_slug as slug, count(*)::int as posts, coalesce(sum(rekt), 0)::int as rekt
    from memes
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

export const createMeme = createServerFn({ method: "POST" })
  .validator(assertDraft)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    try {
      const rows = await sql.query<MemeRow>(
        `insert into memes (champ_slug, format, line_a, line_b, alias_a, alias_b, gif_url)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning ${MEME_RETURNING}`,
        [data.champSlug, data.format, data.lineA, data.lineB, data.aliasA, data.aliasB, data.gifUrl],
      );
      const row = rows[0];
      if (!row) throw new Error("The stamp did not stick.");
      return toMeme(row);
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
  where m.id = $1
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
    const sql = await getSql();
    const rows = await sql.query<MemeRow & { my_kind: Kind | null }>(VOTE_SQL, [
      data.id,
      data.token,
      data.kind,
    ]);
    const row = rows[0];
    if (!row) throw new Error("That stamp wandered off.");
    return { meme: toMeme(row), myKind: row.my_kind };
  });

