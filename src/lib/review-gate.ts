export type ReviewGate = {
  mode: "house" | "mod";
  id: string;
  secret: string;
  adult: boolean;
  modTerms: boolean;
};

const REFUSED = "House review refused that.";

export function parseGate(data: unknown): ReviewGate {
  if (!data || typeof data !== "object") throw new Error(REFUSED);
  const d = data as Record<string, unknown>;
  const mode = d.mode === "mod" ? "mod" : d.mode === "house" ? "house" : null;
  if (!mode) throw new Error(REFUSED);
  const id = typeof d.id === "string" ? d.id : "";
  const secret = typeof d.secret === "string" ? d.secret : "";
  if (d.adult !== true) throw new Error("Confirm you are 21 or older.");
  if (d.modTerms !== true) throw new Error("Accept the moderator terms before the queue opens.");
  if (secret.length < 16 || secret.length > 200) throw new Error(REFUSED);
  if (mode === "mod" && !/^[a-z0-9-]{2,32}$/.test(id)) throw new Error(REFUSED);
  return { mode, id, secret, adult: true, modTerms: true };
}
