import { Link } from "@tanstack/react-router";
import { GITHUB_URL, IDEA_CREDIT, REPO_URL, SITE_URL } from "@/lib/credit";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pt-8 pb-28 text-sm leading-relaxed text-paper/75">
      <p className="font-display text-base tracking-wide text-paper uppercase">{IDEA_CREDIT}</p>
      <p className="mt-2 max-w-xl">
        House lines, 2020s memes, and a wall that keeps the stamp. Public names only.
      </p>
      <nav aria-label="More" className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <Link to="/" className="text-paper underline decoration-rekt underline-offset-4">
          The pit
        </Link>
        <Link to="/press" className="text-paper underline decoration-rekt underline-offset-4">
          Press
        </Link>
        <Link to="/roadmap" className="text-paper underline decoration-rekt underline-offset-4">
          Roadmap
        </Link>
        <Link to="/contributors" className="text-paper underline decoration-rekt underline-offset-4">
          Contributors
        </Link>
        <a href={SITE_URL} className="text-paper underline decoration-gold underline-offset-4">
          thehybridhivequeen.com
        </a>
        <a href={GITHUB_URL} className="text-paper underline decoration-rekt underline-offset-4">
          GitHub
        </a>
        <a href={REPO_URL} className="text-paper underline decoration-rekt underline-offset-4">
          Source
        </a>
      </nav>
    </footer>
  );
}