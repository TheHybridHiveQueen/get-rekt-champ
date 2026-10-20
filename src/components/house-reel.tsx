import { HOUSE_LOOPS, type HouseLoop, type Lane } from "@/lib/catalog";

export function HouseReel({
  lane,
  champ,
  onPick,
}: {
  lane: Lane | "all";
  champ: string | null;
  onPick: (loop: HouseLoop) => void;
}) {
  const loops = HOUSE_LOOPS.filter((loop) => lane === "all" || loop.lane === lane).sort((a, b) => {
    if (a.champ === champ) return -1;
    if (b.champ === champ) return 1;
    return 0;
  });

  return (
    <section className="mb-5" aria-label="House loops">
      <p className="font-display text-xs tracking-widest text-gold uppercase">House loops</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {loops.map((loop) => (
          <button
            key={loop.id}
            type="button"
            onClick={() => onPick(loop)}
            className="stamp-card w-72 shrink-0 overflow-hidden p-0 text-left sm:w-80"
          >
            <img src={loop.src} alt={loop.alt} className="aspect-[4/3] w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
