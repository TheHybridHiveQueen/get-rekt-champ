import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { GITHUB_URL, IDEA_CREDIT, REPO_URL, SITE_URL } from "@/lib/credit";
import { SECURITY_MANIFEST } from "@/lib/security-manifest";

export const Route = createFileRoute("/contributors")({
  head: () => ({
    meta: [
      { title: "Contributors — Get Rekt Champ" },
      {
        name: "description",
        content: "Who built Get Rekt Champ, how to add a joke, and the house security scan.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "author", content: "TheHybridHiveQueen" },
    ],
  }),
  component: Contributors,
});

function Contributors() {
  const scan = SECURITY_MANIFEST;
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
        <p className="font-display text-xs tracking-widest text-gold uppercase">The roster</p>
        <h1 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Contributors</h1>
        <p className="mt-4 text-lg leading-relaxed text-paper/80">
          {IDEA_CREDIT}. The pit is open source. A joke lands when a pull request does.
        </p>

        <section className="mt-8" aria-labelledby="how-title">
          <h2 id="how-title" className="font-display text-2xl uppercase">
            Add something
          </h2>
          <ol className="mt-4 space-y-3">
            <li className="stamp-card rounded-card p-4">
              <p className="font-display text-lg uppercase">1. Stamp it here</p>
              <p className="mt-1 text-ink/75">
                Open the pit, hit Stamp a roast, pick a name, and spin a house line. A GIF is optional.
              </p>
              <Link to="/" search={{ name: "" }} className="mt-3 inline-flex h-11 items-center rounded-full bg-rekt px-4 font-semibold text-paper">
                Open the pit
              </Link>
            </li>
            <li className="stamp-card rounded-card p-4">
              <p className="font-display text-lg uppercase">2. Add a house line</p>
              <p className="mt-1 text-ink/75">
                New wording lives in <span className="font-semibold">src/lib/catalog.ts</span>. One short line for a name already on the roster. Then open a pull request.
              </p>
              <a
                href={`${REPO_URL}/issues/new?title=House%20line&body=${encodeURIComponent("Name:\nLine:\nWhy it is a joke, not a personal attack:\n")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-11 items-center rounded-full bg-paper px-4 font-semibold text-ink"
              >
                Start a GitHub issue
              </a>
            </li>
            <li className="stamp-card rounded-card p-4">
              <p className="font-display text-lg uppercase">3. What gets refused</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/75">
                <li>Lines that are not in the house book.</li>
                <li>The same stamp twice.</li>
                <li>GIF links that are not public https files ending in .gif.</li>
                <li>Private hosts, raw IP addresses, pages, and redirects off the public web.</li>
                <li>Anything past a joke about a public name.</li>
              </ul>
            </li>
          </ol>
        </section>

        <ul className="mt-8 space-y-3">
          <li className="stamp-card rounded-card p-4">
            <p className="font-display text-xl uppercase">TheHybridHiveQueen</p>
            <p className="mt-1 text-ink/70">Idea, house book, and the first stamp.</p>
            <p className="mt-3 flex flex-wrap gap-3 text-sm">
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-rekt underline underline-offset-4">
                thehybridhivequeen.com
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                GitHub
              </a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                This repo
              </a>
            </p>
          </li>
          <li className="rounded-card border-2 border-dashed border-paper/40 p-4">
            <p className="font-display text-xl uppercase">Your name</p>
            <p className="mt-1 text-paper/75">
              Add a public name or a 2020s line in the house book. Keep it T-rated, short, and about the bit.
              Open a pull request on GitHub.
            </p>
          </li>
        </ul>

        <section className="mt-10" aria-labelledby="scan-title">
          <h2 id="scan-title" className="font-display text-2xl uppercase">
            House scan
          </h2>
          <p className="mt-2 text-paper/75">
            Responses also wear a content-security wrap, nosniff, a locked permissions policy, and HTTPS
            transport on the public site. Details are in the repo SECURITY file. Status of the house scan:{" "}
            {scan.status}.
          </p>
          <dl className="stamp-card mt-4 grid gap-3 rounded-card p-4 sm:grid-cols-2">
            <div>
              <dt className="font-display text-xs tracking-widest text-rekt uppercase">Scanned</dt>
              <dd className="mt-1">{scan.scannedAt}</dd>
            </div>
            <div>
              <dt className="font-display text-xs tracking-widest text-rekt uppercase">Files</dt>
              <dd className="mt-1 tabular-nums">{scan.filesChecked}</dd>
            </div>
            <div>
              <dt className="font-display text-xs tracking-widest text-rekt uppercase">Findings</dt>
              <dd className="mt-1">{scan.findings.length === 0 ? "None" : scan.findings.join(", ")}</dd>
            </div>
            <div>
              <dt className="font-display text-xs tracking-widest text-rekt uppercase">Checks</dt>
              <dd className="mt-1">{scan.checks.join(" · ")}</dd>
            </div>
          </dl>
          <h3 className="mt-6 font-display text-sm tracking-widest uppercase">Manifest</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {Object.entries(scan.sha256).map(([file, hash]) => (
              <li key={file} className="break-all rounded-card border-2 border-paper/20 px-3 py-2">
                <span className="font-semibold">{file}</span>
                <span className="mt-1 block text-paper/70">{hash}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <a href="/security-manifest.json" className="text-paper underline decoration-gold underline-offset-4">
              Download the manifest
            </a>
          </p>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
