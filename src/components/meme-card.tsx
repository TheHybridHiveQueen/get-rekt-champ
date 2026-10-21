import * as Dialog from "@radix-ui/react-dialog";
import {
  AppWindow,
  Blend,
  Bot,
  Cloud,
  Cpu,
  Crown,
  Dumbbell,
  Flame,
  Glasses,
  House,
  IceCreamCone,
  Megaphone,
  Music,
  Package,
  PartyPopper,
  Pencil,
  Radio,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Table,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { champBy, CARD_MEMES, type Kind, type Meme } from "@/lib/catalog";
import { lineIsStock } from "@/lib/now-pack";
import { REPORT_REASONS, type ReportReason } from "@/lib/reports";

const ICONS: Record<string, LucideIcon> = {
  elon: Rocket,
  zuck: Glasses,
  altman: Bot,
  jensen: Cpu,
  gates: AppWindow,
  cook: Smartphone,
  nadella: Cloud,
  trump: Megaphone,
  putin: Table,
  bezos: Package,
  buffett: House,
  biden: IceCreamCone,
  swift: Music,
  beast: PartyPopper,
  rock: Dumbbell,
  oprah: Sparkles,
  ronaldo: Trophy,
  now: Radio,
  hand: Pencil,
  allbot: Bot,
  both: Blend,
};

const MONO: Record<string, string> = {
  stripes: "mono mono-stripes",
  dots: "mono mono-dots",
  grid: "mono mono-grid",
  solid: "mono mono-solid",
  ink: "mono mono-ink",
};

function stampDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function MemeCard({
  meme,
  featured = false,
  compact = false,
  dense = false,
  mine,
  pending = false,
  onReact,
  onReport,
}: {
  meme: Meme;
  featured?: boolean;
  compact?: boolean;
  dense?: boolean;
  mine: Kind | null;
  pending?: boolean;
  onReact?: (kind: Kind) => void;
  onReport?: (reason: ReportReason) => void;
}) {
  const champ = champBy(meme.champSlug);
  const Icon = ICONS[meme.champSlug] ?? Flame;
  const interactive = Boolean(onReact);
  const gif = meme.gifUrl || CARD_MEMES[meme.champSlug]?.src || "";
  const gifAlt = meme.gifUrl ? `${meme.lineA}. ${meme.lineB}` : CARD_MEMES[meme.champSlug]?.alt || "Meme";
  const badge = featured ? "Main" : meme.format === "score" ? "Score" : meme.format === "quote" ? "Quote" : "Poster";
  const [peek, setPeek] = useState(false);
  const stock = lineIsStock(meme.lineA, meme.lineB);
  const lines = stock ? null : <StampLines meme={meme} dense={dense} big={!compact} />;
  const controls = interactive ? (
    <div className={compact ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-2"}>
      <ReactButton label="Rekt" count={meme.rekt} pressed={mine === "rekt"} disabled={pending} tile={compact} onClick={() => onReact?.("rekt")} icon={Flame} />
      <ReactButton label="Defend" count={meme.defend} pressed={mine === "defend"} disabled={pending} tile={compact} onClick={() => onReact?.("defend")} icon={Shield} />
      <ReactButton label="Crown" count={meme.crown} pressed={mine === "crown"} disabled={pending} tile={compact} onClick={() => onReact?.("crown")} icon={Crown} />
    </div>
  ) : null;

  const card = compact ? (
      <article
        className={`stamp-card is-tile min-w-0 rounded-card p-2.5 sm:p-3 ${featured ? "is-main" : ""}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="border-2 border-ink bg-gold px-2 py-1 font-display text-xs leading-none tracking-wide text-ink uppercase">
            {champ?.short ?? meme.champSlug}
          </p>
          <button
            type="button"
            onClick={() => setPeek(true)}
            className="h-8 rounded-full border-2 border-ink px-3 font-display text-[10px] tracking-widest uppercase"
          >
            Peek
          </button>
        </div>
        <button type="button" onClick={() => setPeek(true)} className="block w-full overflow-hidden bg-ink text-left">
          <HandmadeGif
            url={gif}
            alt={gifAlt}
            className={dense ? "mt-0 max-h-28 object-contain sm:max-h-36" : "mt-0 max-h-32 object-contain sm:max-h-48"}
          />
        </button>
        {lines ? <div className="px-1 py-2 text-center">{lines}</div> : null}
        <p className="truncate px-1 pb-2 text-center text-xs text-ink/60">
          {gif ? `${meme.aliasA} ${meme.aliasB}` : champ?.role}
        </p>
        <footer className="border-t-2 border-ink/15 pt-2">
          {controls}
          <ReportControl onReport={onReport} />
        </footer>
      </article>
    ) : (
    <article className={featured ? "stamp-card is-main rounded-card p-4 sm:p-5" : "stamp-card rounded-card p-4 sm:p-5"}>
      <header className="flex items-center gap-3">
        <div className={MONO[champ?.pattern ?? "solid"]} aria-hidden>
          <Icon className="size-5" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-none tracking-wide uppercase">{champ?.name ?? meme.champSlug}</p>
          <p className="mt-1 text-sm text-ink/70">{champ?.role}</p>
        </div>
        <p className="tilt-tag border-2 border-ink bg-rekt px-2 py-1 font-display text-[10px] tracking-widest text-paper uppercase">
          {badge}
        </p>
      </header>

      <div className="px-1 py-4 text-center">
        {lines}
        <button type="button" onClick={() => setPeek(true)} className="relative mt-4 block w-full bg-ink text-left">
          <HandmadeGif url={gif} alt={gifAlt} className="mt-0 max-h-72 object-contain sm:max-h-80" />
          <span className="absolute right-2 bottom-2 border-2 border-ink bg-paper px-2 py-1 font-display text-[10px] tracking-widest text-ink uppercase">
            Peek
          </span>
        </button>
      </div>

      <footer className="space-y-3 border-t-2 border-ink/15 pt-3">
        <p className="text-sm text-ink/70">
          Stamped by {meme.aliasA} {meme.aliasB}
          <span className="px-1">·</span>
          <time dateTime={meme.createdAt}>{stampDate(meme.createdAt)} UTC</time>
        </p>
        {controls ?? <p className="font-display text-xs tracking-widest uppercase">Preview</p>}
        <ReportControl onReport={onReport} />
      </footer>
    </article>
    );

  return (
    <>
      {card}
      <CardPeek
        open={peek}
        onOpenChange={setPeek}
        meme={meme}
        gif={gif}
        gifAlt={gifAlt}
        mine={mine}
        pending={pending}
        onReact={onReact}
      />
    </>
  );
}

function StampLines({ meme, dense, big }: { meme: Meme; dense: boolean; big: boolean }) {
  if (meme.format === "impact") {
    const size = big
      ? "text-2xl sm:text-3xl"
      : dense
        ? "text-sm sm:text-base"
        : "text-lg sm:text-xl";
    return (
      <>
        <p className={`font-display leading-none tracking-tight uppercase ${size}`}>{meme.lineA}</p>
        {big ? <div className="mx-auto my-3 h-0.5 w-16 bg-rekt" /> : null}
        <p className={`${big ? "" : "mt-1 text-rekt"} font-display leading-none tracking-tight uppercase ${size}`}>{meme.lineB}</p>
      </>
    );
  }
  if (meme.format === "quote") {
    return (
      <p className={big ? "font-body text-2xl leading-snug text-pretty italic sm:text-3xl" : `line-clamp-3 font-body leading-snug text-pretty italic ${dense ? "text-sm" : "text-base"}`}>
        {big ? `“${meme.lineA}”` : meme.lineA}
      </p>
    );
  }
  return big ? (
    <>
      <p className="font-display text-xs tracking-widest text-rekt uppercase">House score</p>
      <p className="mt-3 font-body text-2xl leading-snug text-pretty sm:text-3xl">{meme.lineA}</p>
    </>
  ) : (
    <p className={`line-clamp-3 font-body leading-snug text-pretty italic ${dense ? "text-sm" : "text-base"}`}>{meme.lineA}</p>
  );
}

function CardPeek({
  open,
  onOpenChange,
  meme,
  gif,
  gifAlt,
  mine,
  pending,
  onReact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meme: Meme;
  gif: string;
  gifAlt: string;
  mine: Kind | null;
  pending: boolean;
  onReact?: (kind: Kind) => void;
}) {
  const champ = champBy(meme.champSlug);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/80" />
        <Dialog.Content className="fixed inset-x-3 top-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-card border-2 border-ink bg-paper p-3 text-ink shadow-card sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Dialog.Title className="font-display text-lg tracking-wide uppercase">{champ?.name ?? meme.champSlug}</Dialog.Title>
            <Dialog.Close className="h-10 rounded-full border-2 border-ink px-3 font-display text-xs tracking-widest uppercase">
              Close
            </Dialog.Close>
          </div>
          <HandmadeGif url={gif} alt={gifAlt} className="mt-0 max-h-[70dvh] object-contain" />
          {lineIsStock(meme.lineA, meme.lineB) ? null : (
            <div className="px-1 py-4 text-center">
              <StampLines meme={meme} dense={false} big />
            </div>
          )}
          {onReact ? (
            <div className="flex flex-wrap justify-center gap-2 border-t-2 border-ink/15 pt-3">
              <ReactButton label="Rekt" count={meme.rekt} pressed={mine === "rekt"} disabled={pending} onClick={() => onReact("rekt")} icon={Flame} />
              <ReactButton label="Defend" count={meme.defend} pressed={mine === "defend"} disabled={pending} onClick={() => onReact("defend")} icon={Shield} />
              <ReactButton label="Crown" count={meme.crown} pressed={mine === "crown"} disabled={pending} onClick={() => onReact("crown")} icon={Crown} />
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReportControl({ onReport }: { onReport?: (reason: ReportReason) => void }) {
  if (!onReport) return null;
  return (
    <Dialog.Root>
      <Dialog.Trigger className="mt-2 text-xs font-semibold text-ink/60 underline">Report</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/80" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-[60] max-h-[80dvh] -translate-y-1/2 overflow-y-auto rounded-card border-2 border-ink bg-paper p-4 text-ink sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <Dialog.Title className="font-display text-2xl uppercase">Pull this off the wall</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink/70">
            A report hides it immediately. Use this if a minor is in it, it is explicit, it is a private person, it is harassment, or it is someone else's copyright.
          </Dialog.Description>
          <div className="mt-4 grid gap-2">
            {REPORT_REASONS.map((reason) => (
              <Dialog.Close key={reason.id} asChild>
                <button
                  type="button"
                  onClick={() => onReport(reason.id)}
                  className="h-11 rounded-full border-2 border-ink px-4 text-left text-sm font-semibold"
                >
                  {reason.label}
                </button>
              </Dialog.Close>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function HandmadeGif({ url, alt, className = "" }: { url: string; alt: string; className?: string }) {
  const [hidden, setHidden] = useState(false);
  if (!url || hidden) return null;
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHidden(true)}
      className={`mx-auto w-full border-2 border-ink ${className}`}
    />
  );
}

function ReactButton({
  label,
  count,
  pressed,
  disabled,
  compact = false,
  tile = false,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  pressed: boolean;
  disabled: boolean;
  compact?: boolean;
  tile?: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  const tone = pressed
    ? label === "Crown"
      ? "border-ink bg-gold text-ink"
      : label === "Defend"
        ? "border-ink bg-ink text-paper"
        : "border-ink bg-rekt text-paper"
    : "border-ink/30 bg-paper text-ink hover:border-ink";

  return (
    <button
      type="button"
      aria-label={`${label} ${count}`}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-full border-2 font-semibold disabled:opacity-50 ${tile ? "h-11 px-1 text-xs" : compact ? "h-9 px-1 text-xs" : "h-11 px-3 text-sm"} ${tone}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className={compact && !tile ? "sr-only" : ""}>{label}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
