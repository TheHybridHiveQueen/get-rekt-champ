import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [id, name, passphrase, flag] = process.argv.slice(2);
if (!id || !name || !passphrase || passphrase.length < 16 || !/^[a-z0-9-]{2,32}$/.test(id)) {
  console.error('usage: node scripts/moderator-hash.mjs <id> "<Name>" "<passphrase of 16+>" [--write]');
  process.exit(1);
}
if (name.length > 60 || name.includes('"') || name.includes("\n")) {
  console.error("name must be one short line without quotes");
  process.exit(1);
}

const passHash = createHash("sha256").update(`grc-mod-v1:${id}:${passphrase}`).digest("hex");
const line = `  { id: "${id}", name: "${name}", passHash: "${passHash}" },`;
const path = new URL("../src/lib/moderator-allowlist.ts", import.meta.url);

if (flag === "--write") {
  const text = readFileSync(path, "utf8");
  if (text.includes(`id: "${id}"`)) {
    console.error("that id is already on the list");
    process.exit(1);
  }
  const next = text.replace(
    "export const MODERATORS: Moderator[] = [",
    `export const MODERATORS: Moderator[] = [\n${line}`,
  );
  if (next === text) {
    console.error("could not find the allowlist");
    process.exit(1);
  }
  writeFileSync(path, next);
  console.log(`added ${id} to the allowlist`);
} else {
  console.log(line);
}
