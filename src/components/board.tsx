import { useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Plus, Ticket } from "lucide-react";
import { Composer } from "@/components/composer";
import { MemeCard } from "@/components/meme-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { IDEA_CREDIT } from "@/lib/credit";
import { loadNoise, playPit, setNoise } from "@/lib/pit-sound";
import {
  CHAMPS,
  LANES,
  champBy,
  heat,
  type Draft,
  type Kind,
  type Lane,
  type Meme,
  type Tally,
} from "@/lib/catalog";
import { createMeme, myVotes, reactToMeme, reportMeme } from "@/lib/roasts";
import type { StampChecks } from "@/lib/agreements";
import type { ReportReason } from "@/lib/reports";

const routeApi = getRouteApi("/");
const TOKEN_KEY = "grc-booth";
type WallView = "list" | "2" | "3" | "4";

function mixKey(text: string, salt: number) {
  let h = salt || 1;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 0x9e3779b1);
  return h >>> 0;
}

function freshSalt() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] || 1;
}

/** One card per public name. Jumble picks which meme, never a second copy. */
function dealSpread(rows: Meme[], salt: number) {
  const buckets = new Map<string, Meme[]>();
  for (const meme of rows) {
    const name = meme.champSlug;
    const list = buckets.get(name);
    if (list) list.push(meme);
    else buckets.set(name, [meme]);
  }
  const picked: Meme[] = [];
  for (const [name, list] of buckets) {
    const index = mixKey(name, salt) % list.length;
    const card = list[index];
    if (card) picked.push(card);
  }
  picked.sort((a, b) => mixKey(a.champSlug, salt) - mixKey(b.champSlug, salt));
  return picked;
}

function readView(): WallView {
  if (typeof localStorage === "undefined") return "2";
  const saved = localStorage.getItem("grc-view");
  if (saved === "list" || saved === "stack") return "list";
  if (saved === "3" || saved === "4" || saved === "2") return saved;
  return "2";
}

function messageOf(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return "The pit hiccuped. Try again.";
}

export function Board() {
  const loaded = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [memes, setMemes] = useState<Meme[]>(loaded.memes);
  const [tallies, setTallies] = useState<Tally[]>(loaded.tallies);
  const [lane, setLane] = useState<Lane | "all">(() => champBy(search.name)?.lane ?? "all");
  const [champ, setChamp] = useState<string | null>(search.name || null);
  const [sort, setSort] = useState<"fresh" | "hot">("fresh");
  const [mine, setMine] = useState<Map<number, Kind>>(new Map());
  const [token, setToken] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [noise, setNoiseOn] = useState(true);
  const [view, setView] = useState<WallView>("2");
  const [shown, setShown] = useState(12);
  const [salt, setSalt] = useState(1);
  const [pinned, setPinned] = useState<"jumble" | "fresh" | "hot">("jumble");

  useEffect(() => {
    if (!search.name) {
      setChamp(null);
      return;
    }
    const person = champBy(search.name);
    if (!person) return;
    setChamp(search.name);
    setLane(person.lane);
  }, [search.name]);

  function pickName(slug: string | null, nextLane?: Lane | "all") {
    setChamp(slug);
    if (slug) {
      const person = champBy(slug);
      if (person) setLane(person.lane);
    } else if (nextLane) {
      setLane(nextLane);
    }
    void navigate({ search: { name: slug ?? "" }, replace: true });
  }

  useEffect(() => {
    let booth = localStorage.getItem(TOKEN_KEY);
    if (!booth) {
      booth = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, booth);
    }
    setToken(booth);
    setNoiseOn(loadNoise());
    setView(readView());
    setSalt(freshSalt());
    let cancel = false;
    myVotes({ data: booth })
      .then((rows) => {
        if (cancel) return;
        setMine(new Map(rows.map((row) => [row.memeId, row.kind])));
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    setShown(view === "4" ? 16 : view === "3" ? 12 : 8);
  }, [lane, champ, sort, view]);

  const pool = useMemo(() => {
    return memes.filter((meme) => {
      if (champ) return meme.champSlug === champ;
      if (lane === "all") return true;
      return champBy(meme.champSlug)?.lane === lane;
    });
  }, [memes, champ, lane]);

  const featured = useMemo(() => {
    return [...pool].sort((a, b) => heat(b) - heat(a))[0];
  }, [pool]);

  const rest = useMemo(() => {
    const rows = pool.filter((meme) => meme.id !== featured?.id);
    if (sort === "hot") return [...rows].sort((a, b) => heat(b) - heat(a));
    return [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [pool, featured, sort]);

  const wall = useMemo(() => {
    const rows = featured ? [featured, ...rest] : [];
    if (pinned !== "jumble" || lane !== "all" || champ) return rows;
    return dealSpread(rows, salt);
  }, [featured, rest, pinned, salt, lane, champ]);
  const visibleWall = wall.slice(0, shown);

  const standings = useMemo(() => {
    return [...tallies].sort((a, b) => b.rekt - a.rekt).slice(0, 5);
  }, [tallies]);

  const total = tallies.reduce((sum, row) => sum + row.posts, 0);

  async function onReact(meme: Meme, kind: Kind) {
    if (!token || pendingId !== null) return;
    setPendingId(meme.id);
    setNote(null);
    try {
      const result = await reactToMeme({ data: { id: meme.id, token, kind } });
      setMemes((current) => current.map((item) => (item.id === result.meme.id ? result.meme : item)));
      setMine((current) => {
        const next = new Map(current);
        if (result.myKind) next.set(result.meme.id, result.myKind);
        else next.delete(result.meme.id);
        return next;
      });
      setTallies((current) =>
        current.map((row) =>
          row.slug === result.meme.champSlug ? { ...row, rekt: row.rekt + (result.meme.rekt - meme.rekt) } : row,
        ),
      );
      if (result.myKind) playPit(result.myKind);
    } catch (err) {
      setNote(messageOf(err));
    } finally {
      setPendingId(null);
    }
  }

  async function onReport(meme: Meme, reason: ReportReason) {
    if (!token) {
      setNote("The booth is still opening. Try the report again in a second.");
      return;
    }
    setNote(null);
    try {
      await reportMeme({ data: { id: meme.id, token, reason } });
      setMemes((current) => current.filter((item) => item.id !== meme.id));
      setNote("Pulled off the wall. It stays down until the house puts it back.");
    } catch (err) {
      setNote(messageOf(err));
    }
  }

  async function onSubmit(draft: Draft & StampChecks) {
    if (!token) {
      setError("The booth is still opening. Try again in a second.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createMeme({
        data: {
          ...draft,
          token,
          age13: draft.age13 === true,
          terms: draft.terms === true,
          ladder: draft.ladder === true,
        },
      });
      setComposerOpen(false);
      setNote("Sent for review. It will not show on the wall until the house approves it.");
      playPit("stamp");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <header className="border-b-2 border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display flex items-center gap-2 text-xs tracking-widest text-gold uppercase">
              <Ticket className="size-4" aria-hidden />
              Public names. Bad timing.
            </p>
            <h1 className="mt-1 font-display text-3xl leading-none tracking-tight sm:text-5xl">
              GET REKT
              <span className="text-rekt"> CHAMP</span>
            </h1>
          </div>
          <p className="hidden max-w-sm text-sm leading-snug text-paper/70 sm:block sm:text-right">{IDEA_CREDIT}</p>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <SiteNav />
        </div>
      </header>

      <div
        className={
          view === "list"
            ? "mx-auto grid max-w-6xl gap-6 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_16rem]"
            : view === "4"
              ? "mx-auto max-w-[110rem] px-3 py-3"
              : view === "3"
                ? "mx-auto max-w-[90rem] px-3 py-3"
                : "mx-auto max-w-5xl px-3 py-3"
        }
      >
        <main className="min-w-0">
          <div className="pit-dock sticky top-0 z-20 mb-3 space-y-2 rounded-card p-2">
            <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Wall">
              {LANES.map((item) => (
                <FilterChip
                  key={item.id}
                  on={lane === item.id && !champ}
                  label={item.label}
                  onClick={() => {
                    pickName(null, item.id);
                    if (item.id === "all") {
                      setPinned("jumble");
                      setSalt(freshSalt());
                    }
                  }}
                />
              ))}
              <span className="mx-1 w-px shrink-0 self-stretch bg-paper/20" aria-hidden />
              <FilterChip
                on={pinned === "jumble" && lane === "all" && !champ}
                label="Jumble"
                onClick={() => {
                  pickName(null, "all");
                  setPinned("jumble");
                  setSalt(freshSalt());
                  setShown(view === "4" ? 16 : 12);
                  playPit("loop");
                }}
              />
              <FilterChip on={pinned === "fresh"} label="New" onClick={() => { setPinned("fresh"); setSort("fresh"); }} />
              <FilterChip on={pinned === "hot"} label="Hot" onClick={() => { setPinned("hot"); setSort("hot"); }} />
              <span className="mx-1 w-px shrink-0 self-stretch bg-paper/20" aria-hidden />
              {(
                [
                  ["2", "2"],
                  ["3", "3"],
                  ["4", "4"],
                  ["list", "List"],
                ] as const
              ).map(([id, label]) => (
                <FilterChip
                  key={id}
                  on={view === id}
                  label={label}
                  onClick={() => {
                    setView(id);
                    localStorage.setItem("grc-view", id);
                  }}
                />
              ))}
              <FilterChip
                on={noise}
                label={noise ? "Sound" : "Muted"}
                onClick={() => {
                  const next = !noise;
                  setNoiseOn(next);
                  setNoise(next);
                  if (next) playPit("loop");
                }}
              />
            </div>
            {lane !== "all" ? (
              <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Names">
                <FilterChip on={!champ} label="Everyone" onClick={() => pickName(null, lane)} />
                {CHAMPS.filter((item) => item.lane === lane).map((item) => (
                  <FilterChip
                    key={item.slug}
                    on={champ === item.slug}
                    label={item.short}
                    onClick={() => pickName(champ === item.slug ? null : item.slug)}
                  />
                ))}
              </div>
            ) : null}
            <p className="px-1 text-sm text-paper/60">
              {champ
                ? champBy(champ)?.name
                : lane === "views"
                  ? "By Hand, All In, or Both."
                  : pinned === "jumble" && lane === "all"
                    ? `${total} jokes, one of each name`
                    : `${total} on the wall`}
            </p>
          </div>

          {note ? (
            <p className="mb-4 rounded-card border-2 border-gold px-4 py-3 text-sm text-paper" role="status">
              {note}
            </p>
          ) : null}

          {view !== "list" && visibleWall.length > 0 ? (
            <div className="pb-32">
              <div
                className={`grid gap-3 ${
                  view === "4"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : view === "3"
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1 min-[520px]:grid-cols-2"
                }`}
              >
                {visibleWall.map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    compact
                    dense={view === "3" || view === "4"}
                    featured={pinned !== "jumble" && meme.id === featured?.id}
                    mine={mine.get(meme.id) ?? null}
                    pending={pendingId === meme.id}
                    onReact={(kind) => onReact(meme, kind)}
                    onReport={(reason) => onReport(meme, reason)}
                  />
                ))}
              </div>
              {visibleWall.length < wall.length ? (
                <button
                  type="button"
                  onClick={() => setShown((count) => count + 12)}
                  className="mx-auto mt-5 flex h-12 items-center rounded-full bg-paper px-5 font-display tracking-wide text-ink uppercase"
                >
                  More memes ({wall.length - visibleWall.length} left)
                </button>
              ) : null}
            </div>
          ) : view === "list" && featured ? (
            <>
              <MemeCard
                meme={featured}
                featured
                mine={mine.get(featured.id) ?? null}
                pending={pendingId === featured.id}
                onReact={(kind) => onReact(featured, kind)}
                onReport={(reason) => onReport(featured, reason)}
              />
              <div className="mt-5 space-y-5 pb-32">
                {rest.slice(0, Math.max(0, shown - 1)).map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    mine={mine.get(meme.id) ?? null}
                    pending={pendingId === meme.id}
                    onReact={(kind) => onReact(meme, kind)}
                    onReport={(reason) => onReport(meme, reason)}
                  />
                ))}
                {shown < wall.length ? (
                  <button
                    type="button"
                    onClick={() => setShown((count) => count + 12)}
                    className="flex h-12 items-center rounded-full bg-paper px-5 font-display tracking-wide text-ink uppercase"
                  >
                    More memes ({wall.length - shown} left)
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="stamp-card rounded-card p-8 text-center">
              <p className="font-display text-2xl uppercase">This lane is suspiciously quiet.</p>
              <p className="mt-2 text-ink/70">Be the first stamp. The meme will not defend itself.</p>
            </div>
          )}
        </main>

        <aside className={view === "list" ? "hidden lg:block" : "hidden"}>
          <div className="rounded-card border-2 border-paper/20 bg-ink-2 p-4">
            <p className="font-display text-xs tracking-widest text-gold uppercase">Most rekt</p>
            <ol className="mt-3 space-y-2">
              {standings.map((row, index) => {
                const person = champBy(row.slug);
                return (
                  <li key={row.slug}>
                    <button
                      type="button"
                      onClick={() => pickName(row.slug)}
                      className="flex h-11 w-full items-center gap-3 text-left"
                    >
                      <span className="font-display w-5 text-rekt">{index + 1}</span>
                      <span className="flex-1 font-semibold">{person?.short}</span>
                      <span className="tabular-nums text-paper/70">{row.rekt}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="mt-4 rounded-card border-2 border-paper/20 p-4 text-sm leading-relaxed text-paper/75">
            <p className="font-display text-xs tracking-widest text-paper uppercase">House rules</p>
            <p className="mt-2">
              Big names only, played for laughs. Remix the house book. The meme is already on the card.
              Tap a reaction. Tap it again if you got brave.
            </p>
          </div>
        </aside>
      </div>

      <SiteFooter />

      <button
        type="button"
        onClick={() => {
          setError(null);
          setComposerOpen(true);
        }}
        className="pit-fab fixed bottom-4 left-4 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-rekt px-5 font-display tracking-wide text-paper uppercase sm:left-auto sm:right-4"
      >
        <Plus className="size-5" aria-hidden />
        Send a roast
      </button>

      <Composer
        open={composerOpen}
        initialSlug={champ}
        busy={busy}
        error={error}
        onOpenChange={setComposerOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function FilterChip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "h-9 shrink-0 rounded-full bg-paper px-3 text-sm font-semibold text-ink"
          : "h-9 shrink-0 rounded-full border-2 border-paper/30 px-3 text-sm font-semibold text-paper"
      }
    >
      {label}
    </button>
  );
}
