# Security

Get Rekt Champ is a public gag wall. The wrap below is what ships with the web app.

## Response wrap

Every response gets:

- `Content-Security-Policy` so scripts, images, and fonts stay on this app, Google Fonts, and Giphy
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with camera, mic, location, and payment off
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- `Strict-Transport-Security` on public HTTPS only (not on local or sandbox preview hosts)

The app can still be framed by the preview. A deny-all frame rule would blank that view.

Dev CSP is looser so the local server and its socket can run. Production CSP is the tight one.

## Moderators

Community moderators live in `src/lib/moderator-allowlist.ts`. Adding one is a commit, not a form. Passphrases are stored only as hashes. Each moderator must confirm they are 21 or older and accept the terms before the queue opens. `GRC_MOD_TOKEN` on the host remains the house key.

## Automod

Every GIF is decoded on the server and scored by two local picture models before it can enter the queue. Explicit, hentai, and R-rated frames are blocked. The file is remembered by its link and by a hash of the bytes, so a renamed link to the same file does not sneak through. A blocked file is a warning, and the message names the rule and why. The second violation mutes uploads for 30 days. The third is permanent. A muted booth is told the date it can upload again. Sending a blocked file again counts as the next violation.

## What the pit already refuses

- Roast text that is not in the house book
- GIF links that are not a direct `https` Giphy file ending in `.gif`
- Votes without a booth token
- A flood of stamps, reports, or reactions from one booth or one network
- Any visitor stamp going on the public wall before the house approves it

## Review

Visitor stamps are stored as `pending` and are not listed. A report sets a live stamp to `hidden` immediately, including a report that a minor is in it.

Approval uses `GRC_MOD_TOKEN` on the host (16 or more characters). The passphrase is checked on the server and is not in the app. If it is missing, review stays shut and nothing pending can go live. Open `/review` and enter it there.

## Durable wall

On the public host, the app refuses to run the wall if the durable database is not configured. The preview can still use the local database.

## House scan

`/contributors` shows the last pattern scan and SHA-256 manifest. The same file is at `/security-manifest.json`. That scan looks for eval payloads and miner strings. It is not a desktop antivirus product.

## Web app

`/manifest.webmanifest` is the installable app: standalone, pit colors, starts at `/`.
