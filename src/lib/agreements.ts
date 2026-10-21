/** Bump this when the rules page changes. A stamp stores the version the person clicked. */
export const TERMS_VERSION = "2026-10-21";

export type StampChecks = {
  age13: boolean;
  terms: boolean;
  ladder: boolean;
};

/** Null when every required box was clicked. Anything other than true is a no. */
export function stampCheckError(input: StampChecks): string | null {
  if (input.age13 !== true) return "Click the box that says you are 13 or older.";
  if (input.terms !== true) return "Click the box to agree to the rules and terms.";
  if (input.ladder !== true) return "Click the box to agree to the warning, the 30-day mute, and the permanent ban.";
  return null;
}
