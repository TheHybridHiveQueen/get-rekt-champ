import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Shuffle, X } from "lucide-react";
import { MemeCard } from "@/components/meme-card";
import {
  ALIAS_A,
  ALIAS_B,
  CHAMPS,
  champBy,
  linesFor,
  type Draft,
  type Format,
  type Meme,
} from "@/lib/catalog";

const FORMATS: { id: Format; label: string }[] = [
  { id: "impact", label: "Poster" },
  { id: "quote", label: "Quote" },
  { id: "score", label: "Score" },
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function nextOf(items: readonly string[], current: string): string {
  const index = items.indexOf(current);
  return items[(index + 1) % items.length];
}

function draftFor(slug: string, format: Format): Pick<Draft, "lineA" | "lineB"> {
  if (format === "impact") {
    return {
      lineA: linesFor(slug, "top")[0]?.text ?? "",
      lineB: linesFor(slug, "bottom")[0]?.text ?? "",
    };
  }
  return {
    lineA: linesFor(slug, format)[0]?.text ?? "",
    lineB: "",
  };
}

function spin(slug: string, format: Format, aliasA: string, aliasB: string): Draft {
  if (format === "impact") {
    return {
      champSlug: slug,
      format,
      lineA: pick(linesFor(slug, "top")).text,
      lineB: pick(linesFor(slug, "bottom")).text,
      aliasA,
      aliasB,
      gifUrl: "",
    };
  }
  return {
    champSlug: slug,
    format,
    lineA: pick(linesFor(slug, format)).text,
    lineB: "",
    aliasA,
    aliasB,
    gifUrl: "",
  };
}

export function Composer({
  open,
  initialSlug,
  busy,
  error,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  initialSlug: string | null;
  busy: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: Draft) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/80" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-dvh overflow-y-auto border-2 border-paper bg-ink-2 p-4 text-paper sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card">
          <ComposerForm
            key={open ? (initialSlug ?? "open") : "closed"}
            initialSlug={initialSlug}
            busy={busy}
            error={error}
            onSubmit={onSubmit}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ComposerForm({
  initialSlug,
  busy,
  error,
  onSubmit,
}: {
  initialSlug: string | null;
  busy: boolean;
  error: string | null;
  onSubmit: (draft: Draft) => void;
}) {
  const starter = initialSlug && champBy(initialSlug) ? initialSlug : "elon";
  const [draft, setDraft] = useState<Draft>(() => ({
    champSlug: starter,
    format: "impact",
    ...draftFor(starter, "impact"),
    aliasA: "Velvet",
    aliasB: "Goblin",
    gifUrl: "",
  }));

  const preview = useMemo<Meme>(
    () => ({
      id: 0,
      champSlug: draft.champSlug,
      format: draft.format,
      lineA: draft.lineA,
      lineB: draft.lineB,
      aliasA: draft.aliasA,
      aliasB: draft.aliasB,
      rekt: 0,
      defend: 0,
      crown: 0,
      createdAt: "2026-01-01T00:00:00Z",
      gifUrl: draft.gifUrl,
    }),
    [draft],
  );

  const tops = linesFor(draft.champSlug, "top").map((b) => b.text);
  const bottoms = linesFor(draft.champSlug, "bottom").map((b) => b.text);
  const quotes = linesFor(draft.champSlug, "quote").map((b) => b.text);
  const scores = linesFor(draft.champSlug, "score").map((b) => b.text);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Dialog.Title className="font-display text-3xl leading-none tracking-wide uppercase">
            Stamp a roast
          </Dialog.Title>
          <Dialog.Description className="mt-2 max-w-sm text-sm text-paper/70">
            House lines only. The meme can come with. Keep it a joke, not a felony.
          </Dialog.Description>
        </div>
        <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-full border-2 border-paper/40 text-paper" aria-label="Close">
          <X className="size-5" />
        </Dialog.Close>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3">
        {CHAMPS.map((champ) => {
          const on = champ.slug === draft.champSlug;
          return (
            <button
              key={champ.slug}
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  champSlug: champ.slug,
                  ...draftFor(champ.slug, current.format),
                }))
              }
              className={
                on
                  ? "h-11 shrink-0 rounded-full border-2 border-paper bg-paper px-3 font-semibold text-ink"
                  : "h-11 shrink-0 rounded-full border-2 border-paper/30 px-3 font-semibold text-paper"
              }
            >
              {champ.short}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        {FORMATS.map((format) => {
          const on = draft.format === format.id;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  format: format.id,
                  ...draftFor(current.champSlug, format.id),
                }))
              }
              className={
                on
                  ? "h-11 flex-1 rounded-full bg-rekt font-semibold text-paper"
                  : "h-11 flex-1 rounded-full border-2 border-paper/30 font-semibold text-paper"
              }
            >
              {format.label}
            </button>
          );
        })}
      </div>

      <MemeCard meme={preview} mine={null} />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setDraft((current) => ({
              ...spin(current.champSlug, current.format, pick(ALIAS_A), pick(ALIAS_B)),
              gifUrl: current.gifUrl,
            }))
          }
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-gold px-4 font-semibold text-gold"
        >
          <Shuffle className="size-4" aria-hidden />
          Spin
        </button>
        {draft.format === "impact" ? (
          <>
            <button
              type="button"
              className="h-11 rounded-full border-2 border-paper/30 px-4 font-semibold"
              onClick={() => setDraft((current) => ({ ...current, lineA: nextOf(tops, current.lineA) }))}
            >
              Next top
            </button>
            <button
              type="button"
              className="h-11 rounded-full border-2 border-paper/30 px-4 font-semibold"
              onClick={() => setDraft((current) => ({ ...current, lineB: nextOf(bottoms, current.lineB) }))}
            >
              Next bottom
            </button>
          </>
        ) : (
          <button
            type="button"
            className="h-11 rounded-full border-2 border-paper/30 px-4 font-semibold"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                lineA: nextOf(current.format === "quote" ? quotes : scores, current.lineA),
              }))
            }
          >
            Next line
          </button>
        )}
        <button
          type="button"
          className="h-11 rounded-full border-2 border-paper/30 px-4 font-semibold"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              aliasA: nextOf(ALIAS_A, current.aliasA),
              aliasB: nextOf(ALIAS_B, current.aliasB),
            }))
          }
        >
          Next byline
        </button>
      </div>

      <label className="mt-4 block text-sm">
        <span className="font-display tracking-widest uppercase">Handmade GIF</span>
        <input
          type="url"
          inputMode="url"
          name="gif"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://yoursite.com/hand-drawn.gif"
          value={draft.gifUrl}
          onChange={(event) => setDraft((current) => ({ ...current, gifUrl: event.target.value }))}
          className="mt-2 h-11 w-full rounded-full border-2 border-paper/30 bg-ink px-4 text-paper"
        />
        <span className="mt-2 block text-paper/70">
          Optional. A direct .gif you drew, filmed, or cut by hand. Leave blank for type only.
        </span>
      </label>

      {error ? <p className="mt-3 text-sm text-paper">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 h-12 w-full rounded-full bg-rekt font-display text-lg tracking-wide text-paper uppercase disabled:opacity-60"
      >
        {busy ? "Stamping…" : "Stamp it"}
      </button>
    </form>
  );
}
