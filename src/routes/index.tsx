import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { CHAMPS, champBy } from "@/lib/catalog";
import { listMemes } from "@/lib/roasts";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const name = typeof search.name === "string" ? search.name : "";
    return { name: CHAMPS.some((champ) => champ.slug === name) ? name : "" };
  },
  loader: () => listMemes(),
  head: ({ match }) => {
    const champ = champBy(match.search.name);
    if (!champ) return { meta: [] };
    return {
      meta: [
        { title: `${champ.name} — Get Rekt Champ` },
        {
          name: "description",
          content: `T-rated parody stamps about ${champ.name}. ${champ.role}.`,
        },
      ],
    };
  },
  component: Board,
});
