import { Link, useRouterState } from "@tanstack/react-router";
import { REPO_URL, SITE_URL } from "@/lib/credit";

const PAGES = [
  { to: "/", label: "Pit", id: "pit" },
  { to: "/press", label: "Press", id: "press" },
  { to: "/roadmap", label: "Roadmap", id: "roadmap" },
  { to: "/contributors", label: "Contribute", id: "contributors" },
  { to: "/rules", label: "Rules", id: "rules" },
] as const;

function currentPage(path: string) {
  if (path.startsWith("/press")) return "press";
  if (path.startsWith("/roadmap")) return "roadmap";
  if (path.startsWith("/contributors")) return "contributors";
  if (path.startsWith("/rules")) return "rules";
  return "pit";
}

export function SiteNav() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const current = currentPage(path);

  return (
    <nav aria-label="Site" className="flex flex-nowrap gap-2 overflow-x-auto">
      {PAGES.map((page) => {
        const on = page.id === current;
        return (
          <Link
            key={page.id}
            to={page.to}
            search={page.id === "pit" ? { name: "" } : undefined}
            aria-current={on ? "page" : undefined}
            className={
              on
                ? "inline-flex h-9 shrink-0 items-center rounded-full bg-paper px-3 text-sm font-semibold text-ink"
                : "inline-flex h-9 shrink-0 items-center rounded-full border-2 border-paper/30 px-3 text-sm font-semibold text-paper"
            }
          >
            {page.label}
          </Link>
        );
      })}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 shrink-0 items-center rounded-full bg-gold px-3 text-sm font-semibold text-ink"
      >
        Website
      </a>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 shrink-0 items-center rounded-full border-2 border-paper/30 px-3 text-sm font-semibold text-paper"
      >
        GitHub
      </a>
    </nav>
  );
}
