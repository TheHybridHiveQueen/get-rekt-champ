import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { IDEA_CREDIT, SEARCH_DESCRIPTION } from "@/lib/credit";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Get Rekt Champ" },
      { name: "description", content: SEARCH_DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "author", content: "TheHybridHiveQueen" },
    ],
  }),
  component: Roadmap,
});

const SHIPPED = [
  "Shared parody wall for public names, lanes for nerds, titans, and culture.",
  "House-book stamps: poster, quote, and score. No freestyle caption box.",
  "Reactions: Rekt, Defend, Crown.",
  "Handmade GIF links on a stamp. Direct https .gif files only.",
  "Nine house loops on the wall, three per lane, plus pit noise you can mute.",
];

const NEXT = [
  "A shelf of handmade GIF packs checked in by pull request, one folder per champ, so the pit is not only hotlinks.",
  "Champ pages with their own titles so each public name can be found on its own.",
  "A short credit line on every stamp that used a handmade GIF, still chosen from the house byline book.",
];

const LATER = [
  "More public names, added by people, reviewed in the open.",
  "A printable poster view of a single stamp.",
  "Translations of the house book, written by humans.",
];

const NEVER = [
  "Private people. The roster stays public names.",
  "Threats, slurs, or sexual jokes.",
  "A freestyle caption box. The house book is the joke.",
];

function Roadmap() {
  return (
    <div className="min-h-dvh bg-ink text-paper">
      <header className="border-b-2 border-paper/15">
        <div className="mx-auto flex max-w-3xl flex-wrap items-end justify-between gap-3 px-4 py-5">
          <p className="font-display text-2xl leading-none">
            GET REKT <span className="text-rekt">CHAMP</span>
          </p>
          <Link to="/" className="text-sm text-paper underline decoration-rekt underline-offset-4">
            Back to the pit
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-display text-xs tracking-widest text-gold uppercase">Update roadmap</p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-tight sm:text-5xl">
          Handmade GIFs on every tab.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-paper/80">
          {IDEA_CREDIT}. The starter reel is three looping gags for Nerds, three for Titans, and three for Culture.
          Everybody plays the whole set.
        </p>
        <Section title="Now" items={SHIPPED} />
        <Section title="Next" items={NEXT} />
        <Section title="Later" items={LATER} />
        <Section title="Off the card" items={NEVER} />
      </article>
      <SiteFooter />
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl tracking-wide uppercase">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="border-l-2 border-rekt pl-3 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
