import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { TERMS_VERSION } from "@/lib/agreements";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Rules and terms — Get Rekt Champ" },
      {
        name: "description",
        content:
          "Rules and terms for Get Rekt Champ. Public names only. No minors. Nothing explicit. First break is a warning. Second mutes uploads for 30 days. Third is a permanent ban.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Rules,
});

function Rules() {
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
        <p className="font-display text-xs tracking-widest text-gold uppercase">Rules and terms</p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-tight sm:text-5xl">Read this before you stamp.</h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-paper/85">
          <p>Version {TERMS_VERSION}. Looking at the wall is not an agreement. A stamp is an agreement only if you click each box yourself and then press “I agree and send for review.” The boxes start empty. We do not check them for you. A browser refill does not count. The server throws the stamp out unless every box was sent as clicked.</p>
          <p>Each accepted stamp stores this version and the time of that click. It does not store your name. Opening the review queue works the same way: both moderator boxes start empty, and the click is recorded without the passphrase.</p>
          <h2 className="pt-2 font-display text-2xl uppercase">Who can use it</h2>
          <p>You have to be 13 or older. The age box is your own statement. We do not collect a name or a birth date, and we do not verify an identity. If we learn a stamp came from someone under 13, it comes down. This is parody about public figures. Nobody on the roster runs this, endorses it, or is affiliated with it.</p>
          <h2 className="pt-2 font-display text-2xl uppercase">We do not tolerate</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Minors in a stamp, a GIF, or a joke. Not as a punchline. Not as a background. Not at all.</li>
            <li>Explicit nudity, sexual drawings, or R-rated sexual content.</li>
            <li>Private people, home addresses, families, or anyone who is not a public name on the roster.</li>
            <li>Harassment, threats, or anything that is not a joke about a public name.</li>
            <li>Sending a blocked file again, including under a new link.</li>
          </ul>
          <h2 className="pt-2 font-display text-2xl uppercase">What happens if you break one</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>First violation: a warning. The message names the rule and why. The file is blocked. You can still upload.</li>
            <li>Second violation: uploads are muted for 30 days. The message includes the date the mute ends.</li>
            <li>Third violation: uploads are permanently banned.</li>
          </ol>
          <p>A new form does not lift a mute or a permanent ban. Reports still work. Uploads do not, until a 30-day mute ends. A permanent ban does not end.</p>
          <h2 className="pt-2 font-display text-2xl uppercase">How a stamp gets on the wall</h2>
          <p>You do not publish. A stamp waits for a moderator. It is not on the wall until they approve it. Roast text has to come from the house book. A GIF has to be a direct Giphy link. Every GIF is scanned on the way in. If the scanner is unsure, the stamp still waits, with a note. It is not a violation.</p>
          <p>Report on a card pulls that stamp off the wall right away.</p>
          <h2 className="pt-2 font-display text-2xl uppercase">What we keep</h2>
          <p>We keep the stamp, the booth id in this browser, a hash of the network, this terms version, and the time you clicked agree. A blocked file is also stored as a hash of the bytes so the same file cannot come back under a new link. That is so the warning and the ban stick to the click you made. It is not a profile.</p>
          <h2 className="pt-2 font-display text-2xl uppercase">Moderators</h2>
          <p>
            Community moderators are a locked list in the project. Getting on it is a reviewed change, not a signup. Every moderator has to check that they are 21 or older and that they accept these terms before the queue opens. The house passphrase on the host is the other key.{" "}
            <Link to="/review" className="underline">House review</Link>
          </p>
          <p>
            If a stamp shows a minor, do not save it or pass it around. Report apparent child sexual exploitation to the{" "}
            <a href="https://report.cybertip.org/" className="underline" rel="noopener noreferrer">NCMEC CyberTipline</a>.
            The pit hides the file. The booth gets the same warning, 30-day mute, or permanent ban as any other violation.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
