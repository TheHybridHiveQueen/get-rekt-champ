import { Link } from "@tanstack/react-router";
import { IDEA_CREDIT } from "@/lib/credit";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pt-8 pb-28 text-sm leading-relaxed text-paper/75">
      <p className="font-display text-base tracking-wide text-paper uppercase">{IDEA_CREDIT}</p>
      <p className="mt-2 max-w-xl">
        Jokes come from the house book. Moving pictures are handmade GIFs, linked by the person who made them.
      </p>
      <nav aria-label="More" className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <Link to="/" className="text-paper underline decoration-rekt underline-offset-4">
          The pit
        </Link>
        <Link to="/press" className="text-paper underline decoration-rekt underline-offset-4">
          Press release
        </Link>
        <Link to="/roadmap" className="text-paper underline decoration-rekt underline-offset-4">
          Roadmap
        </Link>
        <a
          href="https://github.com/TheHybridHiveQueen/get-rekt-champ"
          className="text-paper underline decoration-rekt underline-offset-4"
        >
          Public source
        </a>
      </nav>
    </footer>
  );
}
