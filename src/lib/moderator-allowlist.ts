import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Repo-locked community moderators. Someone gets on this list only by a commit.
 * Generate a line with:
 *   node scripts/moderator-hash.mjs <id> "<Name>" "<passphrase of 16+>" --write
 * Never commit the passphrase. Each person on this list must be 21 or older.
 */
export type Moderator = {
  id: string;
  name: string;
  passHash: string;
};

export const MODERATORS: Moderator[] = [];

export function communityModOk(id: string, passphrase: string): boolean {
  if (!/^[a-z0-9-]{2,32}$/.test(id) || passphrase.length < 16 || passphrase.length > 200) return false;
  const mod = MODERATORS.find((item) => item.id === id);
  if (!mod || mod.passHash.length !== 64) return false;
  const got = createHash("sha256").update(`grc-mod-v1:${id}:${passphrase}`).digest();
  const expected = Buffer.from(mod.passHash, "hex");
  if (expected.length !== got.length) return false;
  return timingSafeEqual(got, expected);
}
