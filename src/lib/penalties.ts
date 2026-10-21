export function formatMute(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function muteDeadline(from = new Date()): Date {
  const until = new Date(from.getTime());
  until.setUTCDate(until.getUTCDate() + 30);
  return until;
}

/** What the booth sees. Strike 1 is a warning. Strike 2 mutes uploads for 30 days. Strike 3 is permanent. */
export function offenseMessage(input: { hits: number; rule: string; why: string; until?: Date | null }): string {
  const detail = `Rule: ${input.rule}. Why: ${input.why}`;
  if (input.hits <= 1) {
    return `Warning 1 of 3. ${detail} The file was blocked and is not on the wall. You can still upload. A second violation mutes uploads for 30 days. A third violation is a permanent ban.`;
  }
  if (input.hits === 2) {
    const until = input.until ? formatMute(input.until) : "30 days from now";
    return `Uploads are muted for 30 days, until ${until}. This is violation 2 of 3. ${detail} A third violation is a permanent ban.`;
  }
  return `Uploads are permanently banned. This is violation ${input.hits}. ${detail}`;
}

export function activeBanMessage(input: { reason: string; until: Date | null }): string {
  if (!input.until) return `Uploads are permanently banned. ${input.reason}`;
  return `Uploads are muted until ${formatMute(input.until)}. ${input.reason} A third violation is a permanent ban.`;
}
