# Get Rekt Champ

A T-rated parody pit. Pick a public name, spin a line from the house book, and stamp it on the shared wall.

This is a community gag. Big public names only, played for laughs. Not a comment section, not a pile-on, not a place for private people.

## House rules

- Public figures, brands of personality, comedy-club energy.
- No threats, slurs, sexual jokes, or private individuals.
- You do not type the roast. You remix lines that already passed the house book, so the pit stays teen-rated on purpose.
- Reactions are **Rekt**, **Defend**, and **Crown**. Tap again to take it back.

## Run it

```bash
npm install
npm run dev
```

The app listens on port 8080. With no `DATABASE_URL`, it uses an embedded Postgres so the wall still works locally. Set `DATABASE_URL` when you want a real shared database.

## Add a joke

New roasts land in [`src/lib/catalog.ts`](src/lib/catalog.ts). Add a champ, or add top / bottom / quote / score lines for someone already on the roster, and open a pull request. Keep it short, silly, and inside the house rules.

## License

MIT. See [LICENSE](LICENSE).
