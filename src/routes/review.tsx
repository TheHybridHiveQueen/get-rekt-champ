import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { BAN_REASONS, type BanReason } from "@/lib/automod";
import type { ReviewGate } from "@/lib/review-gate";
import { reviewAct, reviewQueue, type ReviewCard } from "@/lib/roasts";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "House review — Get Rekt Champ" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Review,
});

function Review() {
  const [mode, setMode] = useState<ReviewGate["mode"]>("house");
  const [id, setId] = useState("");
  const [secret, setSecret] = useState("");
  const [adult, setAdult] = useState(false);
  const [modTerms, setModTerms] = useState(false);
  const [queue, setQueue] = useState<ReviewCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banReason, setBanReason] = useState<BanReason>("minor");

  function gate(): ReviewGate {
    return { mode, id: id.trim(), secret, adult, modTerms };
  }

  async function openQueue(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await reviewQueue({ data: gate() });
      setQueue(result.queue);
    } catch (err) {
      setQueue(null);
      setError(err instanceof Error ? err.message : "House review refused that.");
    } finally {
      setBusy(false);
    }
  }

  async function act(memeId: number, action: "approve" | "drop" | "violate") {
    setBusy(true);
    setError(null);
    try {
      const acted = await reviewAct({ data: { ...gate(), memeId, action, banReason } });
      if ("note" in acted && acted.note) setError(acted.note);
      const result = await reviewQueue({ data: gate() });
      setQueue(result.queue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "House review refused that.");
    } finally {
      setBusy(false);
    }
  }

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
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-display text-xs tracking-widest text-gold uppercase">Not public</p>
        <h1 className="mt-3 font-display text-4xl leading-none">House review</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/75">
          Moderators are a locked list in the repo, and every one of them has to be 21 or older. The house key is{" "}
          <span className="text-paper">GRC_MOD_TOKEN</span> on the host. Neither secret is stored in the app.{" "}
          <Link to="/rules" className="underline">Terms</Link>
        </p>
        <form onSubmit={openQueue} autoComplete="off" className="mt-6 space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode("house")} className={mode === "house" ? "h-10 rounded-full bg-paper px-4 text-sm font-semibold text-ink" : "h-10 rounded-full border-2 border-paper/30 px-4 text-sm"}>
              House key
            </button>
            <button type="button" onClick={() => setMode("mod")} className={mode === "mod" ? "h-10 rounded-full bg-paper px-4 text-sm font-semibold text-ink" : "h-10 rounded-full border-2 border-paper/30 px-4 text-sm"}>
              Moderator
            </button>
          </div>
          {mode === "mod" ? (
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder="moderator id"
              autoComplete="username"
              className="h-11 w-full rounded-full border-2 border-paper/30 bg-ink px-4"
            />
          ) : null}
          <input
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder={mode === "house" ? "House passphrase" : "Moderator passphrase"}
            className="h-11 w-full rounded-full border-2 border-paper/30 bg-ink px-4"
          />
          <label className="flex items-start gap-3 text-sm leading-snug">
            <input type="checkbox" name="adult" autoComplete="off" required checked={adult} onChange={(event) => setAdult(event.target.checked)} className="mt-1 size-4" />
            <span>I agree that I am 21 or older.</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-snug">
            <input type="checkbox" name="mod-terms" autoComplete="off" required checked={modTerms} onChange={(event) => setModTerms(event.target.checked)} className="mt-1 size-4" />
            <span>
              I agree to the <Link to="/rules" className="underline">moderator terms</Link>. I will not approve a minor, anything explicit, a private person, or harassment.
            </span>
          </label>
          <p className="text-sm text-paper/70">Both boxes start empty. You have to click each one.</p>
          <button type="submit" disabled={busy || !adult || !modTerms || secret.length < 16} className="h-11 rounded-full bg-paper px-5 font-semibold text-ink disabled:opacity-50">
            {busy ? "Checking…" : "I agree and open the queue"}
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-gold">{error}</p> : null}
        {queue ? (
          <ul className="mt-6 space-y-4">
            {queue.length === 0 ? <li className="text-paper/70">The queue is empty.</li> : null}
            {queue.map((card) => (
              <li key={card.id} className="rounded-card border-2 border-paper/20 p-3">
                <p className="text-xs tracking-widest text-gold uppercase">
                  {card.status}
                  {card.seeded ? " · house card" : " · visitor"}
                  {card.reason ? ` · ${card.reason}` : ""}
                  {card.automodNote ? " · scanner" : ""}
                </p>
                <p className="mt-2 font-display text-xl uppercase">
                  {card.lineA}
                  {card.lineB ? ` / ${card.lineB}` : ""}
                </p>
                <p className="text-sm text-paper/60">{card.champSlug}</p>
                {card.automodNote ? <p className="mt-1 text-sm text-gold">{card.automodNote}</p> : null}
                {card.gifUrl ? <img src={card.gifUrl} alt="" className="mt-3 max-h-48 w-full object-contain" /> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => act(card.id, "approve")} className="h-11 rounded-full bg-paper px-4 font-semibold text-ink disabled:opacity-50">
                    Approve
                  </button>
                  {card.seeded ? null : (
                    <button type="button" disabled={busy} onClick={() => act(card.id, "drop")} className="h-11 rounded-full border-2 border-paper/30 px-4 font-semibold disabled:opacity-50">
                      Drop
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-paper/60" htmlFor={`why-${card.id}`}>Violation</label>
                  <select
                    id={`why-${card.id}`}
                    value={banReason}
                    onChange={(event) => setBanReason(event.target.value as BanReason)}
                    className="h-10 rounded-full border-2 border-paper/30 bg-ink px-3 text-sm"
                  >
                    {BAN_REASONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  <button type="button" disabled={busy} onClick={() => act(card.id, "violate")} className="h-11 rounded-full bg-rekt px-4 font-semibold text-paper disabled:opacity-50">
                    Block uploader
                  </button>
                </div>
                {banReason === "minor" ? (
                  <p className="mt-2 text-sm text-gold">
                    If a minor is in this, do not save or share the file. Report it to the NCMEC CyberTipline. This button hides it and blocks the uploader.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
