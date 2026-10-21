import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
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
        <div className="mx-auto max-w-3xl px-4 py-5">
          <p className="font-display text-2xl leading-none">
            GET REKT <span className="text-rekt">CHAMP</span>
          </p>
          <div className="mt-4">
            <SiteNav />
          </div>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-display text-xs tracking-widest text-gold uppercase">For immediate release</p>
        <p className="mt-2 text-sm text-paper/70">October 20, 2026</p>
        <h1 className="mt-4 font-display text-4xl leading-none tracking-tight sm:text-5xl">
          Get Rekt Champ opens a handmade parody pit.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-paper/80">
          A community gag board of T-rated roasts about public names. New stamps wait for the house to approve them. They do not go on the wall by themselves.
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
              className="font-semibold text-paper underline decoration-rekt underline-offset-4"
              href="https://github.com/TheHybridHiveQueen/get-rekt-champ"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/TheHybridHiveQueen/get-rekt-champ
            </a>
            . The{" "}
            <Link to="/roadmap" className="font-semibold text-paper underline decoration-gold underline-offset-4">
              roadmap
            </Link>{" "}
            is on the site.
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
