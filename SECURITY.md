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

## What the pit already refuses

- Roast text that is not in the house book
- GIF links that are not plain `https` and do not end in `.gif`
- Votes without a booth token

## House scan

`/contributors` shows the last pattern scan and SHA-256 manifest. The same file is at `/security-manifest.json`. That scan looks for eval payloads and miner strings. It is not a desktop antivirus product.

## Web app

`/manifest.webmanifest` is the installable app: standalone, pit colors, starts at `/`.
