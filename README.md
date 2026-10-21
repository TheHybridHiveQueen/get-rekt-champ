# Get Rekt Champ

A T-rated parody pit. Pick a public name, spin a line from the house book, and stamp it on the shared wall. The wall also carries a pack of 2020s memes, not reruns from the 90s.

**Idea by the Brain of TheHybridHiveQueen.**

- Site: https://thehybridhivequeen.com
- GitHub: https://github.com/TheHybridHiveQueen/get-rekt-champ
- Contributors, house scan, and hash manifest: `/contributors`

This is a community gag. Big public names only, played for laughs. Not a comment section, not a pile-on, not a place for private people.

## House rules

- Public figures, brands of personality, comedy-club energy.
- No threats, slurs, sexual jokes, or private individuals.
- You do not type the roast. You remix lines that already passed the house book, so the pit stays teen-rated on purpose.
- A handmade GIF is optional: a direct `https` link that ends in `.gif`.
- Reactions are **Rekt**, **Defend**, and **Crown**. Tap again to take it back.
- Pit noise is on until you mute it. It is a handful of original blips, not a soundtrack you licensed from somewhere else.

## Find it

- [Press release](PRESS-RELEASE.md)
- [Roadmap](ROADMAP.md)
- Live pages: `/`, `/press`, `/roadmap`, `/robots.txt`, `/sitemap.xml`, `/humans.txt`

## Run it

```bash
npm install
npm run dev
```

The app listens on port 8080. With no `DATABASE_URL`, it uses an embedded Postgres so the wall still works locally. Set `DATABASE_URL` when you want a real shared database.

## Add a joke

Two ways in:

1. **Stamp it in the app.** Pick a public name, spin a house line, and optionally paste a public `https` link that ends in `.gif`. The server refuses a second copy of the same stamp, and it refuses GIF links that are not a public file (private hosts, raw IPs, pages, or redirects off the public web).
2. **Add a line to the house book.** Edit [`src/lib/catalog.ts`](src/lib/catalog.ts). One short T-rated line for a name already on the roster, then open a pull request. Card memes sit next to the roster in that same file.

Say what you changed and why it is a joke. The checks are listed on `/contributors`.

## License

MIT. See [LICENSE](LICENSE).
