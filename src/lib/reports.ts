export const REPORT_REASONS = [
  { id: "minor", label: "A minor is in this" },
  { id: "explicit", label: "Explicit or sexual" },
  { id: "private", label: "A private person" },
  { id: "harassment", label: "Harassment, not a joke" },
  { id: "copyright", label: "Copyright" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export function isReportReason(value: unknown): value is ReportReason {
  return REPORT_REASONS.some((item) => item.id === value);
}
