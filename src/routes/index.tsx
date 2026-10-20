import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { listMemes } from "@/lib/roasts";

export const Route = createFileRoute("/")({
  loader: () => listMemes(),
  component: Board,
});
