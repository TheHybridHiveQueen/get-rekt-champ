import { TRAINED_BAN, TRAINED_ON, TRAINED_REVIEW } from "@/lib/automod-trained";

export { TRAINED_ON };

/** Stable key for a GIF so a banned file cannot be submitted again under the same link. */
export function gifKey(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const id = trimmed.match(/\/media\/([A-Za-z0-9]{6,})/i)?.[1];
  if (id) return id;
  return trimmed.slice(0, 200);
}

export const BAN_REASONS = ["minor", "explicit", "private", "harassment"] as const;
export type BanReason = (typeof BAN_REASONS)[number];

export function isBanReason(value: unknown): value is BanReason {
  return BAN_REASONS.some((item) => item === value);
}

export type NudityScores = {
  porn: number;
  hentai: number;
  sexy: number;
  drawing: number;
  neutral: number;
};

export function worstNudity(frames: NudityScores[]): NudityScores {
  const blank: NudityScores = { porn: 0, hentai: 0, sexy: 0, drawing: 0, neutral: 0 };
  for (const frame of frames) {
    blank.porn = Math.max(blank.porn, frame.porn);
    blank.hentai = Math.max(blank.hentai, frame.hentai);
    blank.sexy = Math.max(blank.sexy, frame.sexy);
    blank.drawing = Math.max(blank.drawing, frame.drawing);
    blank.neutral = Math.max(blank.neutral, frame.neutral);
  }
  return blank;
}

export type AutomodVerdict = "block" | "review" | "pass";

function over(scores: NudityScores, line: { porn: number; hentai: number; sexy: number }): boolean {
  return scores.porn >= line.porn || scores.hentai >= line.hentai || scores.sexy >= line.sexy;
}

/**
 * Two models. Blocking a file is not a ban.
 * A block needs both models uneasy, or one of them almost certain.
 * A medium hit is only held for a person.
 */
export function nudityVerdict(first: NudityScores, second: NudityScores): AutomodVerdict {
  const keys = ["porn", "hentai", "sexy"] as const;
  for (const key of keys) {
    const hi = Math.max(first[key], second[key]);
    const lo = Math.min(first[key], second[key]);
    if (hi >= 0.9) return "block";
    if (hi >= TRAINED_BAN[key] && lo >= TRAINED_REVIEW[key]) return "block";
  }
  if (over(first, TRAINED_REVIEW) || over(second, TRAINED_REVIEW)) return "review";
  return "pass";
}

/** Which rule a blocked frame broke, and a plain reason the booth can read. */
export function blockWhy(scores: NudityScores): { rule: string; why: string } {
  const ranked = [
    { rule: "No explicit nudity", score: scores.porn },
    { rule: "No sexual drawings", score: scores.hentai },
    { rule: "No R-rated sexual content", score: scores.sexy },
  ].sort((a, b) => b.score - a.score);
  const top = ranked[0] ?? { rule: "No explicit or sexual content", score: 0 };
  const pct = Math.round(top.score * 100);
  return {
    rule: top.rule,
    why: `A frame scored ${pct}% toward that rule.`,
  };
}

export const MOD_RULES: Record<BanReason, { rule: string; why: string }> = {
  minor: { rule: "No minors", why: "A moderator marked this because a minor is in it." },
  explicit: { rule: "No explicit or sexual content", why: "A moderator marked this as explicit or sexual." },
  private: { rule: "No private people", why: "A moderator marked this because a private person is in it." },
  harassment: { rule: "No harassment", why: "A moderator marked this as harassment, not a joke." },
};
