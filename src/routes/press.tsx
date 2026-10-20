import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { IDEA_CREDIT, SEARCH_DESCRIPTION } from "@/lib/credit";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press release — Get Rekt Champ" },
      { name: "description", content: SEARCH_DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "author", content: "TheHybridHiveQueen" },
    ],
  }),
  component: Press,
});

function Press() {
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
        <p className="font-display text-xs tracking-widest text-gold uppercase">For immediate release</p>
        <p className="mt-2 text-sm text-paper/70">October 20, 2026</p>
        <h1 className="mt-4 font-display text-4xl leading-none tracking-tight sm:text-5xl">
          Get Rekt Champ opens a handmade parody pit.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-paper/80">
          A community gag board lets anyone stamp a T-rated roast of a public name, and hang a GIF they made by
          hand.
        </p>

        <div className="mt-8 space-y-4 text-base leading-relaxed text-pretty">
          <p>
            <strong className="text-paper">Get Rekt Champ</strong> is a public parody wall for the biggest names on
            the planet: tech nerds, political titans, and culture main characters. Visitors spin lines from a house
            book, stamp the combo, and react with Rekt, Defend, or Crown. The jokes stay inside comedy-club rules.
            Private people, threats, and cruelty are not the bit.
          </p>
          <p>
            Handmade GIFs are in. Every card starts with a human-made meme of that public name. A stamp can also carry a direct <code>.gif</code> link someone filmed, drew, or cut themselves.
          </p>
          <p>
            {IDEA_CREDIT}. The project is open source under the MIT license so the house book can grow by pull
            request.
          </p>
          <p>
            The source lives at{" "}
            <a
              className="text-paper underline decoration-rekt underline-offset-4"
              href="https://github.com/TheHybridHiveQueen/get-rekt-champ"
            >
              github.com/TheHybridHiveQueen/get-rekt-champ
            </a>
            . A written roadmap is on the site. Search engines are invited to index the pit, this release, and that
            roadmap.
          </p>
        </div>

        <h2 className="mt-10 font-display text-2xl tracking-wide uppercase">Boilerplate</h2>
        <p className="mt-3 leading-relaxed text-paper/80">
          Get Rekt Champ is an independent community gag. It is satire of public personas. It is not affiliated
          with the people on the roster. {IDEA_CREDIT}. Contact and contributions go through the public GitHub
          repository.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
