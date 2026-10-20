import { useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Plus, Ticket } from "lucide-react";
import { Composer } from "@/components/composer";
import { MemeCard } from "@/components/meme-card";
import { SiteFooter } from "@/components/site-footer";
import { IDEA_CREDIT, REPO_URL, SITE_URL } from "@/lib/credit";
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
import { createMeme, myVotes, reactToMeme } from "@/lib/roasts";

const routeApi = getRouteApi("/");
const TOKEN_KEY = "grc-booth";

function messageOf(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return "The pit hiccuped. Try again.";
}

export function Board() {
  const loaded = routeApi.useLoaderData();
  const [memes, setMemes] = useState<Meme[]>(loaded.memes);
  const [tallies, setTallies] = useState<Tally[]>(loaded.tallies);
  const [lane, setLane] = useState<Lane | "all">("all");
  const [champ, setChamp] = useState<string | null>(null);
  const [sort, setSort] = useState<"fresh" | "hot">("fresh");
  const [mine, setMine] = useState<Map<number, Kind>>(new Map());
  const [token, setToken] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [noise, setNoiseOn] = useState(true);
  const [view, setView] = useState<"stack" | "grid">("grid");
  const [shown, setShown] = useState(8);

  useEffect(() => {
    let booth = localStorage.getItem(TOKEN_KEY);
    if (!booth) {
      booth = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, booth);
    }
    setToken(booth);
    setNoiseOn(loadNoise());
    const saved = localStorage.getItem("grc-view");
    if (saved === "grid" || saved === "stack") setView(saved);
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
    setShown(8);
  }, [lane, champ, sort]);

  const visibleChamps = CHAMPS.filter((item) => lane === "all" || item.lane === lane);

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

  const wall = useMemo(() => (featured ? [featured, ...rest] : []), [featured, rest]);
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

  async function onSubmit(draft: Draft) {
    setBusy(true);
    setError(null);
    try {
      const created = await createMeme({ data: draft });
      setMemes((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setTallies((current) => {
        const found = current.some((row) => row.slug === created.champSlug);
        if (!found) return [...current, { slug: created.champSlug, posts: 1, rekt: created.rekt }];
        return current.map((row) =>
          row.slug === created.champSlug ? { ...row, posts: row.posts + 1, rekt: row.rekt + created.rekt } : row,
        );
      });
      setComposerOpen(false);
      setNote("Stamped. The group chat is unwell.");
      playPit("stamp");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <header className="border-b-2 border-paper/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display flex items-center gap-2 text-xs tracking-widest text-gold uppercase">
              <Ticket className="size-4" aria-hidden />
              Public names. Bad timing.
            </p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-tight sm:text-6xl">
              GET REKT
              <span className="block text-rekt">CHAMP</span>
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-paper/75 sm:text-right">
            Big public names, small dignity, T-rated. Spin a house line. The meme is already losing. {IDEA_CREDIT}.
          </p>
        </div>
          <nav aria-label="Site" className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4 text-sm">
            <Link to="/press" className="inline-flex h-11 items-center rounded-full border-2 border-paper/30 px-4 font-semibold">
              Press
            </Link>
            <Link to="/roadmap" className="inline-flex h-11 items-center rounded-full border-2 border-paper/30 px-4 font-semibold">
              Roadmap
            </Link>
            <Link to="/contributors" className="inline-flex h-11 items-center rounded-full border-2 border-paper/30 px-4 font-semibold">
              Contributors
            </Link>
            <a href={SITE_URL} className="inline-flex h-11 items-center rounded-full bg-gold px-4 font-semibold text-ink">
              Website
            </a>
            <a href={REPO_URL} className="inline-flex h-11 items-center rounded-full bg-paper px-4 font-semibold text-ink">
              GitHub
            </a>
          </nav>
      </header>

      <div
        className={
          view === "grid"
            ? "mx-auto max-w-[96rem] px-3 py-4 sm:px-4"
            : "mx-auto grid max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[15rem_minmax(0,1fr)_15rem]"
        }
      >
        <aside className={view === "grid" ? "hidden" : "hidden lg:block"}>
          <p className="font-display text-xs tracking-widest text-paper/60 uppercase">The roster</p>
          <ul className="mt-3 space-y-1">
            {CHAMPS.map((item) => {
              const on = champ === item.slug;
              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setChamp(on ? null : item.slug);
                      setLane(item.lane);
                    }}
                    className={
                      on
                        ? "flex h-11 w-full items-center justify-between rounded-full bg-paper px-3 text-left font-semibold text-ink"
                        : "flex h-11 w-full items-center justify-between rounded-full px-3 text-left text-paper/80 hover:bg-ink-2"
                    }
                  >
                    <span>{item.short}</span>
                    <span className="text-xs tracking-widest uppercase">{item.lane}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="min-w-0">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {LANES.map((item) => (
              <FilterChip
                key={item.id}
                on={lane === item.id && !champ}
                label={item.label}
                onClick={() => {
                  setLane(item.id);
                  setChamp(null);
                }}
              />
            ))}
          </div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {visibleChamps.map((item) => (
              <FilterChip
                key={item.slug}
                on={champ === item.slug}
                label={item.short}
                onClick={() => setChamp(champ === item.slug ? null : item.slug)}
              />
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sort">
              <FilterChip on={sort === "fresh"} label="New" onClick={() => setSort("fresh")} />
              <FilterChip on={sort === "hot"} label="Hot" onClick={() => setSort("hot")} />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="View">
              <FilterChip
                on={view === "stack"}
                label="List"
                onClick={() => {
                  setView("stack");
                  localStorage.setItem("grc-view", "stack");
                }}
              />
              <FilterChip
                on={view === "grid"}
                label="2×2"
                onClick={() => {
                  setView("grid");
                  localStorage.setItem("grc-view", "grid");
                }}
              />
            </div>
            <FilterChip
              on={noise}
              label={noise ? "Sound on" : "Sound off"}
              onClick={() => {
                const next = !noise;
                setNoise(next);
                setNoiseOn(next);
                if (next) playPit("loop");
              }}
            />
            <p className="text-sm text-paper/60 tabular-nums">{total} on the wall</p>
          </div>

          {note ? (
            <p className="mb-4 rounded-card border-2 border-gold px-4 py-3 text-sm text-paper" role="status">
              {note}
            </p>
          ) : null}

          {view === "grid" && visibleWall.length > 0 ? (
            <div className="pb-32">
              <div className="sticker-grid grid grid-cols-2 gap-3 sm:gap-4">
                {visibleWall.map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    compact
                    featured={meme.id === featured?.id}
                    mine={mine.get(meme.id) ?? null}
                    pending={pendingId === meme.id}
                    onReact={(kind) => onReact(meme, kind)}
                  />
                ))}
              </div>
              {visibleWall.length < wall.length ? (
                <button
                  type="button"
                  onClick={() => setShown((count) => count + 8)}
                  className="mx-auto mt-5 flex h-12 items-center rounded-full bg-paper px-5 font-display tracking-wide text-ink uppercase"
                >
                  More memes ({wall.length - visibleWall.length} left)
                </button>
              ) : null}
            </div>
          ) : view === "stack" && featured ? (
            <>
              <MemeCard
                meme={featured}
                featured
                mine={mine.get(featured.id) ?? null}
                pending={pendingId === featured.id}
                onReact={(kind) => onReact(featured, kind)}
              />
              <div className="mt-5 space-y-5 pb-32">
                {rest.slice(0, Math.max(0, shown - 1)).map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    mine={mine.get(meme.id) ?? null}
                    pending={pendingId === meme.id}
                    onReact={(kind) => onReact(meme, kind)}
                  />
                ))}
                {shown < wall.length ? (
                  <button
                    type="button"
                    onClick={() => setShown((count) => count + 8)}
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

        <aside className={view === "grid" ? "hidden" : "hidden lg:block"}>
          <div className="rounded-card border-2 border-paper/20 bg-ink-2 p-4">
            <p className="font-display text-xs tracking-widest text-gold uppercase">Most rekt</p>
            <ol className="mt-3 space-y-2">
              {standings.map((row, index) => {
                const person = champBy(row.slug);
                return (
                  <li key={row.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setChamp(row.slug);
                        if (person) setLane(person.lane);
                      }}
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
        className="pit-fab fixed right-4 bottom-4 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-rekt px-5 font-display tracking-wide text-paper uppercase"
      >
        <Plus className="size-5" aria-hidden />
        Stamp a roast
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
          ? "h-11 shrink-0 rounded-full bg-paper px-4 font-semibold text-ink"
          : "h-11 shrink-0 rounded-full border-2 border-paper/30 px-4 font-semibold text-paper"
      }
    >
      {label}
    </button>
  );
}
