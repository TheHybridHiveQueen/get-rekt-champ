import {
  AppWindow,
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
  mine,
  pending = false,
  onReact,
}: {
  meme: Meme;
  featured?: boolean;
  compact?: boolean;
  mine: Kind | null;
  pending?: boolean;
  onReact?: (kind: Kind) => void;
}) {
  const champ = champBy(meme.champSlug);
  const Icon = ICONS[meme.champSlug] ?? Flame;
  const interactive = Boolean(onReact);
  const gif = meme.gifUrl || CARD_MEMES[meme.champSlug]?.src || "";
  const gifAlt = meme.gifUrl ? `${meme.lineA}. ${meme.lineB}` : CARD_MEMES[meme.champSlug]?.alt || "Meme";
  const badge = featured ? "Main" : meme.format === "score" ? "Score" : meme.format === "quote" ? "Quote" : "Poster";

  if (compact) {
    return (
      <article className={featured ? "stamp-card is-main min-w-0 rounded-card p-3 sm:p-4" : "stamp-card min-w-0 rounded-card p-3 sm:p-4"}>
        <div className="relative">
          <HandmadeGif url={gif} alt={gifAlt} className="mt-0 aspect-[4/5] max-h-none min-h-64 object-cover sm:min-h-[28rem]" />
          <p className="tilt-tag absolute top-3 left-3 border-2 border-ink bg-gold px-3 py-1.5 font-display text-sm leading-none tracking-wide text-ink uppercase sm:text-base">
            {champ?.short ?? meme.champSlug}
          </p>
          <p className="absolute top-3 right-3 border-2 border-ink bg-rekt px-3 py-1.5 font-display text-xs leading-none tracking-widest text-paper uppercase sm:text-sm">
            {badge}
          </p>
        </div>
        <div className="px-2 py-4 text-center sm:py-5">
          {meme.format === "impact" ? (
            <>
              <p className="font-display text-2xl leading-none tracking-tight uppercase sm:text-4xl">{meme.lineA}</p>
              <p className="mt-2 font-display text-2xl leading-none tracking-tight text-rekt uppercase sm:text-4xl">{meme.lineB}</p>
            </>
          ) : (
            <p className="font-body text-xl leading-snug text-pretty italic sm:text-3xl">{meme.lineA}</p>
          )}
        </div>
        <footer className="space-y-3 border-t-2 border-ink/15 pt-3">
          <p className="truncate text-sm text-ink/60 sm:text-base">
            {meme.aliasA} {meme.aliasB}
          </p>
          {interactive ? (
            <div className="grid grid-cols-3 gap-2">
              <ReactButton label="Rekt" count={meme.rekt} pressed={mine === "rekt"} disabled={pending} huge onClick={() => onReact?.("rekt")} icon={Flame} />
              <ReactButton label="Defend" count={meme.defend} pressed={mine === "defend"} disabled={pending} huge onClick={() => onReact?.("defend")} icon={Shield} />
              <ReactButton label="Crown" count={meme.crown} pressed={mine === "crown"} disabled={pending} huge onClick={() => onReact?.("crown")} icon={Crown} />
            </div>
          ) : null}
        </footer>
      </article>
    );
  }

  return (
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

      <div className="px-1 py-5 text-center">
        {meme.format === "impact" ? (
          <>
            <p className="font-display text-3xl leading-none tracking-tight text-balance uppercase sm:text-4xl">
              {meme.lineA}
            </p>
            <div className="mx-auto my-4 h-0.5 w-16 bg-rekt" />
            <p className="font-display text-3xl leading-none tracking-tight text-balance uppercase sm:text-4xl">
              {meme.lineB}
            </p>
          </>
        ) : meme.format === "quote" ? (
          <p className="font-body text-2xl leading-snug text-pretty italic sm:text-3xl">“{meme.lineA}”</p>
        ) : (
          <>
            <p className="font-display text-xs tracking-widest text-rekt uppercase">House score</p>
            <p className="mt-3 font-body text-2xl leading-snug text-pretty sm:text-3xl">{meme.lineA}</p>
          </>
        )}
        <HandmadeGif url={gif} alt={gifAlt} className="max-h-72" />
      </div>

      <footer className="space-y-3 border-t-2 border-ink/15 pt-3">
        <p className="text-sm text-ink/70">
          Stamped by {meme.aliasA} {meme.aliasB}
          <span className="px-1">·</span>
          <time dateTime={meme.createdAt}>{stampDate(meme.createdAt)} UTC</time>
        </p>
        {interactive ? (
          <div className="flex flex-wrap gap-2">
            <ReactButton label="Rekt" count={meme.rekt} pressed={mine === "rekt"} disabled={pending} onClick={() => onReact?.("rekt")} icon={Flame} />
            <ReactButton label="Defend" count={meme.defend} pressed={mine === "defend"} disabled={pending} onClick={() => onReact?.("defend")} icon={Shield} />
            <ReactButton label="Crown" count={meme.crown} pressed={mine === "crown"} disabled={pending} onClick={() => onReact?.("crown")} icon={Crown} />
          </div>
        ) : (
          <p className="font-display text-xs tracking-widest uppercase">Preview</p>
        )}
      </footer>
    </article>
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
      className={`mx-auto mt-5 w-full border-2 border-ink object-contain ${className}`}
    />
  );
}

function ReactButton({
  label,
  count,
  pressed,
  disabled,
  compact = false,
  huge = false,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  pressed: boolean;
  disabled: boolean;
  compact?: boolean;
  huge?: boolean;
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
      className={`inline-flex items-center justify-center gap-1 rounded-full border-2 font-semibold disabled:opacity-50 ${huge ? "h-12 px-2 text-sm sm:h-14 sm:text-base" : compact ? "h-9 px-1 text-xs" : "h-11 px-3 text-sm"} ${tone}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className={compact && !huge ? "sr-only" : ""}>{label}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
