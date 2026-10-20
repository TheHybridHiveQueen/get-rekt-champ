export type Lane = "nerds" | "titans" | "culture";
export type Format = "impact" | "quote" | "score";
export type Slot = "top" | "bottom" | "quote" | "score";
export type Kind = "rekt" | "defend" | "crown";
export type Pattern = "stripes" | "dots" | "grid" | "solid" | "ink";

export type Champ = {
  slug: string;
  name: string;
  short: string;
  lane: Lane;
  role: string;
  initials: string;
  pattern: Pattern;
};

export type Beat = {
  id: string;
  champ: string;
  slot: Slot;
  text: string;
};

export type Meme = {
  id: number;
  champSlug: string;
  format: Format;
  lineA: string;
  lineB: string;
  aliasA: string;
  aliasB: string;
  rekt: number;
  defend: number;
  crown: number;
  createdAt: string;
  gifUrl: string;
};

export type Tally = {
  slug: string;
  posts: number;
  rekt: number;
};

export type Draft = {
  champSlug: string;
  format: Format;
  lineA: string;
  lineB: string;
  aliasA: string;
  aliasB: string;
  gifUrl: string;
};

export const LANES: { id: Lane | "all"; label: string }[] = [
  { id: "all", label: "Everybody" },
  { id: "nerds", label: "Nerds" },
  { id: "titans", label: "Titans" },
  { id: "culture", label: "Culture" },
];

export const ALIAS_A: readonly string[] = [
  "Velvet",
  "Midnight",
  "Rowdy",
  "Paper",
  "Golden",
  "Quiet",
  "Bold",
  "Sneaky",
  "Cosmic",
  "Lucky",
  "Rusty",
  "Neon",
];

export const ALIAS_B: readonly string[] = [
  "Goblin",
  "Stamp",
  "Ticket",
  "Chorus",
  "Ribbon",
  "Moth",
  "Badge",
  "Pigeon",
  "Banter",
  "Usher",
  "Gavel",
  "Mascot",
];

export const CHAMPS: Champ[] = [
  { slug: "elon", name: "Elon Musk", short: "Elon", lane: "nerds", role: "Chief reply officer", initials: "EM", pattern: "stripes" },
  { slug: "zuck", name: "Mark Zuckerberg", short: "Zuck", lane: "nerds", role: "Headset diplomat", initials: "MZ", pattern: "dots" },
  { slug: "altman", name: "Sam Altman", short: "Sam", lane: "nerds", role: "One-more-model guy", initials: "SA", pattern: "grid" },
  { slug: "jensen", name: "Jensen Huang", short: "Jensen", lane: "nerds", role: "Leather-jacket keynote", initials: "JH", pattern: "solid" },
  { slug: "gates", name: "Bill Gates", short: "Gates", lane: "nerds", role: "Polite reboot", initials: "BG", pattern: "ink" },
  { slug: "cook", name: "Tim Cook", short: "Tim", lane: "nerds", role: "Incremental shine", initials: "TC", pattern: "stripes" },
  { slug: "nadella", name: "Satya Nadella", short: "Satya", lane: "nerds", role: "Muted, spiritually", initials: "SN", pattern: "dots" },
  { slug: "trump", name: "Donald Trump", short: "Trump", lane: "titans", role: "Superlative correspondent", initials: "DT", pattern: "solid" },
  { slug: "putin", name: "Vladimir Putin", short: "Putin", lane: "titans", role: "Long-table executive", initials: "VP", pattern: "ink" },
  { slug: "bezos", name: "Jeff Bezos", short: "Bezos", lane: "titans", role: "Cardboard sovereign", initials: "JB", pattern: "grid" },
  { slug: "buffett", name: "Warren Buffett", short: "Warren", lane: "titans", role: "Same-house billionaire", initials: "WB", pattern: "stripes" },
  { slug: "biden", name: "Joe Biden", short: "Joe", lane: "titans", role: "Cone security", initials: "JOE", pattern: "dots" },
  { slug: "swift", name: "Taylor Swift", short: "Taylor", lane: "culture", role: "Era economist", initials: "TS", pattern: "solid" },
  { slug: "beast", name: "MrBeast", short: "Beast", lane: "culture", role: "Prize velocity", initials: "MB", pattern: "stripes" },
  { slug: "rock", name: "Dwayne Johnson", short: "The Rock", lane: "culture", role: "Eyebrow lead", initials: "DJ", pattern: "grid" },
  { slug: "oprah", name: "Oprah Winfrey", short: "Oprah", lane: "culture", role: "You-get-a-moment", initials: "OW", pattern: "ink" },
  { slug: "ronaldo", name: "Cristiano Ronaldo", short: "CR7", lane: "culture", role: "Rent-is-due finisher", initials: "CR", pattern: "dots" },
];

function beat(champ: string, slot: Slot, n: number, text: string): Beat {
  const prefix = slot === "top" ? "t" : slot === "bottom" ? "b" : slot === "quote" ? "q" : "s";
  return { id: `${champ}-${prefix}${n}`, champ, slot, text };
}

export const BEATS: Beat[] = [
  beat("elon", "top", 1, "3AM POST"),
  beat("elon", "top", 2, "NEXT LAUNCH"),
  beat("elon", "top", 3, "THE BOTS"),
  beat("elon", "bottom", 1, "BEAT THE ROCKET"),
  beat("elon", "bottom", 2, "HAS NOTES NOW"),
  beat("elon", "bottom", 3, "ANSWERED FIRST"),
  beat("elon", "quote", 1, "He promised Mars and delivered a very committed reply guy."),
  beat("elon", "quote", 2, "Full self-driving. Partial self-awareness."),
  beat("elon", "score", 1, "Touching grass: postponed for a launch window."),

  beat("zuck", "top", 1, "METAVERSE"),
  beat("zuck", "top", 2, "SMALL TALK"),
  beat("zuck", "top", 3, "SUNSCREEN"),
  beat("zuck", "bottom", 1, "NO LEGS INVITED"),
  beat("zuck", "bottom", 2, "STILL IN BETA"),
  beat("zuck", "bottom", 3, "VIBE LOADING"),
  beat("zuck", "quote", 1, "He walked in and the room became a product review."),
  beat("zuck", "quote", 2, "The headset was on. The vibe was still downloading."),
  beat("zuck", "score", 1, "Human update: still buffering."),

  beat("altman", "top", 1, "ONE MORE MODEL"),
  beat("altman", "top", 2, "THE CHATBOT"),
  beat("altman", "top", 3, "SAFETY MEMO"),
  beat("altman", "bottom", 1, "WILL BE NORMAL"),
  beat("altman", "bottom", 2, "SAID SORRY FIRST"),
  beat("altman", "bottom", 3, "HOLD, WE SHIP"),
  beat("altman", "quote", 1, "He said a little smarter. The timeline started a fanfic."),
  beat("altman", "quote", 2, "The disclaimer ran longer than the demo."),
  beat("altman", "score", 1, "Hype: maxed. Fine print: also maxed."),

  beat("jensen", "top", 1, "KEYNOTE"),
  beat("jensen", "top", 2, "IN STOCK"),
  beat("jensen", "top", 3, "THE JACKET"),
  beat("jensen", "bottom", 1, "LEATHER AGAIN"),
  beat("jensen", "bottom", 2, "THAT WAS A PRANK"),
  beat("jensen", "bottom", 3, "HAS FANS NOW"),
  beat("jensen", "quote", 1, "Every chart showed up dressed like the CEO."),
  beat("jensen", "quote", 2, "He sold the future and the future was sold out."),
  beat("jensen", "score", 1, "Jacket consistency: perfect. Availability: a rumor."),

  beat("gates", "top", 1, "UPDATE READY"),
  beat("gates", "top", 2, "BOOK LIST"),
  beat("gates", "top", 3, "REBOOT"),
  beat("gates", "bottom", 1, "TOOK THE NIGHT"),
  beat("gates", "bottom", 2, "OUTRUNS THE PATCH"),
  beat("gates", "bottom", 3, "PLANS CAN WAIT"),
  beat("gates", "quote", 1, "He built the future and it still asks to restart."),
  beat("gates", "quote", 2, "A very rich man with a very polite reboot."),
  beat("gates", "score", 1, "Generosity: high. Forced restart: a tradition."),

  beat("cook", "top", 1, "NEW IPHONE"),
  beat("cook", "top", 2, "THE KEYNOTE"),
  beat("cook", "top", 3, "NEW CAMERA"),
  beat("cook", "bottom", 1, "COLOR YOU OWN"),
  beat("cook", "bottom", 2, "NODS ON CUE"),
  beat("cook", "bottom", 3, "FEELINGS PENDING"),
  beat("cook", "quote", 1, "Best iPhone ever, said the man who also said it last year."),
  beat("cook", "quote", 2, "Innovation, now in a slightly different silver."),
  beat("cook", "score", 1, "Shine: high. Surprise: a polite inch."),

  beat("nadella", "top", 1, "TEAMS CALL"),
  beat("nadella", "top", 2, "THE CLOUD"),
  beat("nadella", "top", 3, "EMPATHY"),
  beat("nadella", "bottom", 1, "YOU ARE MUTED"),
  beat("nadella", "bottom", 2, "RENTED COMPUTERS"),
  beat("nadella", "bottom", 3, "THEN 8 INVITES"),
  beat("nadella", "quote", 1, "He said empathy and the calendar believed him too hard."),
  beat("nadella", "quote", 2, "You are muted, spiritually and also actually."),
  beat("nadella", "score", 1, "Cloud: raining. Meetings: a weather system."),

  beat("trump", "top", 1, "THE STEAK"),
  beat("trump", "top", 2, "ALL GOLD"),
  beat("trump", "top", 3, "HUGE CROWD"),
  beat("trump", "bottom", 1, "DONE LIKE THE BIT"),
  beat("trump", "bottom", 2, "OPINIONS TOO"),
  beat("trump", "bottom", 3, "SAYS THE CROWD"),
  beat("trump", "quote", 1, "The teleprompter tried to leave. He kept going."),
  beat("trump", "quote", 2, "Tremendous. The subtlety was not invited."),
  beat("trump", "score", 1, "Understatement: not on the menu."),

  beat("putin", "top", 1, "LONG TABLE"),
  beat("putin", "top", 2, "PHOTO DAY"),
  beat("putin", "top", 3, "THE SMILE"),
  beat("putin", "bottom", 1, "NEEDS A ZIP CODE"),
  beat("putin", "bottom", 2, "HORSE LIT BETTER"),
  beat("putin", "bottom", 3, "STILL LOADING"),
  beat("putin", "quote", 1, "The handshake needed its own connecting flight."),
  beat("putin", "quote", 2, "Very serious. The table was the main character."),
  beat("putin", "score", 1, "Approachable: please remain behind the rope."),

  beat("bezos", "top", 1, "YOUR PACKAGE"),
  beat("bezos", "top", 2, "THAT LAUGH"),
  beat("bezos", "top", 3, "SPACE DAY"),
  beat("bezos", "bottom", 1, "BEAT YOU HOME"),
  beat("bezos", "bottom", 2, "TRADED UP"),
  beat("bezos", "bottom", 3, "LABEL STILL WORKS"),
  beat("bezos", "quote", 1, "He left the planet and the cardboard empire held."),
  beat("bezos", "quote", 2, "Prime delivery. The laugh ships separately."),
  beat("bezos", "score", 1, "Box game: elite. Chill: two-day shipping."),

  beat("buffett", "top", 1, "SAME HOUSE"),
  beat("buffett", "top", 2, "CHERRY COKE"),
  beat("buffett", "top", 3, "BUY AND HOLD"),
  beat("buffett", "bottom", 1, "MARKET BLINKED"),
  beat("buffett", "bottom", 2, "THE WHOLE PLAN"),
  beat("buffett", "bottom", 3, "STILL THERE"),
  beat("buffett", "quote", 1, "He got rich and kept the same kitchen."),
  beat("buffett", "quote", 2, "Patience so long the yacht brochure gave up."),
  beat("buffett", "score", 1, "Patience: infinite. Flash: politely declined."),

  beat("biden", "top", 1, "AVIATORS"),
  beat("biden", "top", 2, "ICE CREAM"),
  beat("biden", "top", 3, "THE BRIEFING"),
  beat("biden", "bottom", 1, "CONE SECURED"),
  beat("biden", "bottom", 2, "FOUND HIM FIRST"),
  beat("biden", "bottom", 3, "MALARKEY FLAG"),
  beat("biden", "quote", 1, "The cone was located. Order was mostly restored."),
  beat("biden", "quote", 2, "Aviators on. Malarkey formally on notice."),
  beat("biden", "score", 1, "Cone technique: elite. Rush: not really."),

  beat("swift", "top", 1, "ERAS TOUR"),
  beat("swift", "top", 2, "NEW BRIDGE"),
  beat("swift", "top", 3, "THE TIMELINE"),
  beat("swift", "bottom", 1, "GDP SAID THANKS"),
  beat("swift", "bottom", 2, "CITIES MOVED"),
  beat("swift", "bottom", 3, "IS HOMEWORK"),
  beat("swift", "quote", 1, "She dropped a bridge and three cities rescheduled."),
  beat("swift", "quote", 2, "Pen game undisputed. A quiet week is theoretical."),
  beat("swift", "score", 1, "Economy: boosted. Low-key: not this decade."),

  beat("beast", "top", 1, "LAST TO LEAVE"),
  beat("beast", "top", 2, "I GAVE AWAY"),
  beat("beast", "top", 3, "DAY THREE"),
  beat("beast", "bottom", 1, "WINS A HOUSE"),
  beat("beast", "bottom", 2, "MY WHOLE SLEEP"),
  beat("beast", "bottom", 3, "BLINK TO WIN"),
  beat("beast", "quote", 1, "The car was the prize. Blinking was the real win."),
  beat("beast", "quote", 2, "He generosity-speedran the entire afternoon."),
  beat("beast", "score", 1, "Giving: unreal. Chill: not in the budget."),

  beat("rock", "top", 1, "THE EYEBROW"),
  beat("rock", "top", 2, "CAN YOU SMELL"),
  beat("rock", "top", 3, "MEAL PREP"),
  beat("rock", "bottom", 1, "DID THE SCENE"),
  beat("rock", "bottom", 2, "IT IS COOKING"),
  beat("rock", "bottom", 3, "IS THE BRAND"),
  beat("rock", "quote", 1, "One eyebrow went up and the scene clocked out."),
  beat("rock", "quote", 2, "The people's champ also packs the lunchbox."),
  beat("rock", "score", 1, "Intensity: always. A day off: a myth."),

  beat("oprah", "top", 1, "YOU GET A CAR"),
  beat("oprah", "top", 2, "THE POINT"),
  beat("oprah", "top", 3, "AUDIENCE"),
  beat("oprah", "bottom", 1, "AND A MOMENT"),
  beat("oprah", "bottom", 2, "LANDED CLEAN"),
  beat("oprah", "bottom", 3, "STOOD RIGHT UP"),
  beat("oprah", "quote", 1, "She pointed and a Tuesday became an event."),
  beat("oprah", "quote", 2, "Understatement visited. It did not get a seat."),
  beat("oprah", "score", 1, "Gift game: unmatched. Quiet: not invited."),

  beat("ronaldo", "top", 1, "SIUUU"),
  beat("ronaldo", "top", 2, "NEW CLUB"),
  beat("ronaldo", "top", 3, "FREE KICK"),
  beat("ronaldo", "bottom", 1, "RENT IS DUE"),
  beat("ronaldo", "bottom", 2, "STATUE SHIPPED"),
  beat("ronaldo", "bottom", 3, "THE QUIET BIT"),
  beat("ronaldo", "quote", 1, "He celebrated like the goal owed him rent."),
  beat("ronaldo", "quote", 2, "Humility download: sold separately."),
  beat("ronaldo", "score", 1, "Finish: clinical. Volume: not low."),
];

export type Seed = {
  key: string;
  champ: string;
  format: Format;
  a: string;
  b: string;
  aliasA: string;
  aliasB: string;
  rekt: number;
  defend: number;
  crown: number;
  mins: number;
};

export const SEEDS: Seed[] = [
  { key: "elon-1", champ: "elon", format: "impact", a: "elon-t1", b: "elon-b1", aliasA: "Midnight", aliasB: "Goblin", rekt: 228, defend: 36, crown: 41, mins: 18 },
  { key: "elon-2", champ: "elon", format: "quote", a: "elon-q2", b: "", aliasA: "Neon", aliasB: "Moth", rekt: 96, defend: 18, crown: 12, mins: 240 },
  { key: "zuck-1", champ: "zuck", format: "impact", a: "zuck-t1", b: "zuck-b1", aliasA: "Quiet", aliasB: "Badge", rekt: 174, defend: 22, crown: 19, mins: 55 },
  { key: "zuck-2", champ: "zuck", format: "score", a: "zuck-s1", b: "", aliasA: "Paper", aliasB: "Usher", rekt: 61, defend: 9, crown: 7, mins: 800 },
  { key: "altman-1", champ: "altman", format: "quote", a: "altman-q1", b: "", aliasA: "Cosmic", aliasB: "Chorus", rekt: 142, defend: 27, crown: 33, mins: 90 },
  { key: "altman-2", champ: "altman", format: "impact", a: "altman-t3", b: "altman-b3", aliasA: "Sneaky", aliasB: "Ticket", rekt: 88, defend: 14, crown: 11, mins: 1100 },
  { key: "jensen-1", champ: "jensen", format: "impact", a: "jensen-t3", b: "jensen-b1", aliasA: "Bold", aliasB: "Stamp", rekt: 151, defend: 11, crown: 28, mins: 130 },
  { key: "jensen-2", champ: "jensen", format: "quote", a: "jensen-q2", b: "", aliasA: "Golden", aliasB: "Ribbon", rekt: 73, defend: 6, crown: 15, mins: 1600 },
  { key: "gates-1", champ: "gates", format: "quote", a: "gates-q1", b: "", aliasA: "Rusty", aliasB: "Gavel", rekt: 119, defend: 15, crown: 18, mins: 200 },
  { key: "gates-2", champ: "gates", format: "impact", a: "gates-t1", b: "gates-b1", aliasA: "Lucky", aliasB: "Pigeon", rekt: 64, defend: 8, crown: 9, mins: 2200 },
  { key: "cook-1", champ: "cook", format: "impact", a: "cook-t1", b: "cook-b1", aliasA: "Velvet", aliasB: "Mascot", rekt: 133, defend: 19, crown: 14, mins: 70 },
  { key: "cook-2", champ: "cook", format: "quote", a: "cook-q2", b: "", aliasA: "Paper", aliasB: "Banter", rekt: 47, defend: 5, crown: 8, mins: 1900 },
  { key: "nadella-1", champ: "nadella", format: "impact", a: "nadella-t1", b: "nadella-b1", aliasA: "Quiet", aliasB: "Usher", rekt: 158, defend: 12, crown: 21, mins: 40 },
  { key: "nadella-2", champ: "nadella", format: "quote", a: "nadella-q2", b: "", aliasA: "Midnight", aliasB: "Chorus", rekt: 82, defend: 7, crown: 10, mins: 980 },
  { key: "trump-1", champ: "trump", format: "impact", a: "trump-t1", b: "trump-b1", aliasA: "Rowdy", aliasB: "Gavel", rekt: 206, defend: 44, crown: 25, mins: 26 },
  { key: "trump-2", champ: "trump", format: "quote", a: "trump-q1", b: "", aliasA: "Golden", aliasB: "Stamp", rekt: 121, defend: 31, crown: 16, mins: 640 },
  { key: "putin-1", champ: "putin", format: "impact", a: "putin-t1", b: "putin-b1", aliasA: "Sneaky", aliasB: "Ribbon", rekt: 167, defend: 20, crown: 13, mins: 110 },
  { key: "putin-2", champ: "putin", format: "quote", a: "putin-q2", b: "", aliasA: "Bold", aliasB: "Badge", rekt: 77, defend: 11, crown: 6, mins: 1400 },
  { key: "bezos-1", champ: "bezos", format: "quote", a: "bezos-q1", b: "", aliasA: "Cosmic", aliasB: "Pigeon", rekt: 139, defend: 16, crown: 22, mins: 160 },
  { key: "bezos-2", champ: "bezos", format: "impact", a: "bezos-t2", b: "bezos-b2", aliasA: "Rusty", aliasB: "Moth", rekt: 70, defend: 9, crown: 12, mins: 2100 },
  { key: "buffett-1", champ: "buffett", format: "quote", a: "buffett-q1", b: "", aliasA: "Paper", aliasB: "Ticket", rekt: 111, defend: 4, crown: 29, mins: 300 },
  { key: "buffett-2", champ: "buffett", format: "impact", a: "buffett-t2", b: "buffett-b2", aliasA: "Lucky", aliasB: "Goblin", rekt: 54, defend: 3, crown: 17, mins: 2600 },
  { key: "biden-1", champ: "biden", format: "impact", a: "biden-t2", b: "biden-b1", aliasA: "Velvet", aliasB: "Usher", rekt: 124, defend: 18, crown: 20, mins: 85 },
  { key: "biden-2", champ: "biden", format: "quote", a: "biden-q1", b: "", aliasA: "Quiet", aliasB: "Mascot", rekt: 66, defend: 10, crown: 14, mins: 1750 },
  { key: "swift-1", champ: "swift", format: "impact", a: "swift-t1", b: "swift-b1", aliasA: "Neon", aliasB: "Chorus", rekt: 198, defend: 15, crown: 46, mins: 34 },
  { key: "swift-2", champ: "swift", format: "quote", a: "swift-q1", b: "", aliasA: "Golden", aliasB: "Ribbon", rekt: 103, defend: 8, crown: 27, mins: 720 },
  { key: "beast-1", champ: "beast", format: "quote", a: "beast-q1", b: "", aliasA: "Rowdy", aliasB: "Banter", rekt: 146, defend: 13, crown: 24, mins: 150 },
  { key: "beast-2", champ: "beast", format: "impact", a: "beast-t2", b: "beast-b2", aliasA: "Lucky", aliasB: "Stamp", rekt: 91, defend: 7, crown: 11, mins: 1250 },
  { key: "rock-1", champ: "rock", format: "impact", a: "rock-t1", b: "rock-b1", aliasA: "Bold", aliasB: "Mascot", rekt: 118, defend: 6, crown: 19, mins: 210 },
  { key: "rock-2", champ: "rock", format: "quote", a: "rock-q2", b: "", aliasA: "Rusty", aliasB: "Badge", rekt: 58, defend: 4, crown: 9, mins: 2300 },
  { key: "oprah-1", champ: "oprah", format: "impact", a: "oprah-t1", b: "oprah-b1", aliasA: "Velvet", aliasB: "Ticket", rekt: 163, defend: 5, crown: 38, mins: 48 },
  { key: "oprah-2", champ: "oprah", format: "quote", a: "oprah-q1", b: "", aliasA: "Cosmic", aliasB: "Usher", rekt: 84, defend: 3, crown: 21, mins: 1500 },
  { key: "ronaldo-1", champ: "ronaldo", format: "impact", a: "ronaldo-t1", b: "ronaldo-b1", aliasA: "Rowdy", aliasB: "Gavel", rekt: 155, defend: 17, crown: 23, mins: 64 },
  { key: "ronaldo-2", champ: "ronaldo", format: "score", a: "ronaldo-s1", b: "", aliasA: "Neon", aliasB: "Pigeon", rekt: 49, defend: 8, crown: 6, mins: 2800 },
];

export type HouseLoop = {
  id: string;
  lane: Lane;
  champ: string;
  src: string;
  alt: string;
};

const giphy = (id: string) => `https://media.giphy.com/media/${id}/giphy.gif`;

export const CARD_MEMES: Record<string, { src: string; alt: string }> = {
  elon: { src: giphy("oImOwaZ34b8K70aQ6B"), alt: "Cybertruck window demo." },
  zuck: { src: giphy("1zKdb4WSHgY4QKAsjo"), alt: "Mark Zuckerberg at a microphone." },
  altman: { src: giphy("3oz8xQTEUmXNkJhbKE"), alt: "Sam Altman talking on a stage." },
  jensen: { src: giphy("prDgqjXzzOTevzYon7"), alt: "Jensen Huang in a leather jacket holding a graphics card." },
  gates: { src: giphy("l0K4mbH4lKBhAPFU4"), alt: "Bill Gates dabbing." },
  cook: { src: giphy("3oz8xLrKEjbAbaqUxO"), alt: "Tim Cook giving a thumbs up at an Apple event." },
  nadella: { src: giphy("l2YWkKM59tbkhIf9C"), alt: "Satya Nadella presenting." },
  trump: { src: giphy("lUAXivqATIe52"), alt: "Donald Trump pointing while he talks." },
  putin: { src: giphy("8m2ywIdT8EYAuP8YND"), alt: "Vladimir Putin seated at a very long table." },
  bezos: { src: giphy("3o84UaEllewTfnbNGo"), alt: "Jeff Bezos laughing." },
  buffett: { src: giphy("1guRIREY9aVoblYv5gA"), alt: "Warren Buffett riding in a car." },
  biden: { src: giphy("CJOwG4l6YselROC0UP"), alt: "Joe Biden with an ice cream cone." },
  swift: { src: giphy("3o6nUZAloQQ8vA2xhe"), alt: "Taylor Swift dancing in Shake It Off." },
  beast: { src: giphy("Ko261YbCdpOSVgOsaq"), alt: "MrBeast running." },
  rock: { src: giphy("rYVUEwrv3H5pC"), alt: "Dwayne Johnson raising an eyebrow." },
  oprah: { src: giphy("QXPdeQwJYXv6wKXy2G"), alt: "Oprah Winfrey saying you get a car." },
  ronaldo: { src: giphy("FKKT0Ro1ZuuYivPgEs"), alt: "Cristiano Ronaldo celebrating." },
};

export const HOUSE_LOOPS: HouseLoop[] = Object.entries(CARD_MEMES).map(([champ, meme]) => ({
  id: champ,
  lane: champBy(champ)?.lane ?? "culture",
  champ,
  src: meme.src,
  alt: meme.alt,
}));

export function champBy(slug: string): Champ | undefined {
  return CHAMPS.find((c) => c.slug === slug);
}

export function linesFor(slug: string, slot: Slot): Beat[] {
  return BEATS.filter((b) => b.champ === slug && b.slot === slot);
}

export function heat(meme: Pick<Meme, "rekt" | "crown" | "defend">): number {
  return meme.rekt * 2 + meme.crown * 3 - meme.defend;
}
