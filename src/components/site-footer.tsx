import { Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { IDEA_CREDIT } from "@/lib/credit";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pt-8 pr-4 pb-28 text-sm leading-relaxed text-paper/75">
      <p className="font-display text-base tracking-wide text-paper uppercase">{IDEA_CREDIT}</p>
      <p className="mt-2 max-w-xl">
        House lines, 2020s memes, and a wall that keeps the stamp. Public names only. Nothing goes up until the house approves it. Looking at the wall is not an agreement. Posting one means you clicked the boxes on the form.{" "}
        <Link to="/rules" className="underline">Rules and terms</Link>. Not for anyone under 13.
      </p>
      <div className="mt-4">
        <SiteNav />
      </div>
    </footer>
  );
}