import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import * as tf from "@tensorflow/tfjs";
import { GifReader } from "omggif";
import { nudityVerdict, worstNudity, type AutomodVerdict, type NudityScores } from "@/lib/automod";

const require = createRequire(import.meta.url);
const nsfwjs = require("nsfwjs") as {
  load: (name: string) => Promise<{
    classify: (img: tf.Tensor3D) => Promise<Array<{ className: string; probability: number }>>;
  }>;
};

const MAX_BYTES = 4_000_000;
const MAX_EDGE = 299;

type Loaded = Awaited<ReturnType<typeof nsfwjs.load>>;

let modelsPromise: Promise<[Loaded, Loaded]> | null = null;

function models() {
  modelsPromise ??= (async () => {
    await tf.setBackend("cpu");
    await tf.ready();
    return Promise.all([nsfwjs.load("MobileNetV2"), nsfwjs.load("MobileNetV2Mid")]);
  })();
  return modelsPromise;
}

function shrink(rgb: Uint8Array, width: number, height: number): { rgb: Uint8Array; width: number; height: number } {
  const edge = Math.max(width, height);
  if (edge <= MAX_EDGE) return { rgb, width, height };
  const scale = MAX_EDGE / edge;
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const out = new Uint8Array(w * h * 3);
  for (let y = 0; y < h; y += 1) {
    const sy = Math.min(height - 1, Math.floor((y * height) / h));
    for (let x = 0; x < w; x += 1) {
      const sx = Math.min(width - 1, Math.floor((x * width) / w));
      const from = (sy * width + sx) * 3;
      const to = (y * w + x) * 3;
      out[to] = rgb[from];
      out[to + 1] = rgb[from + 1];
      out[to + 2] = rgb[from + 2];
    }
  }
  return { rgb: out, width: w, height: h };
}

function readFrames(bytes: Buffer): Array<{ rgb: Uint8Array; width: number; height: number }> {
  if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    throw new Error("That GIF could not be checked, so it was refused.");
  }
  let reader: GifReader;
  try {
    reader = new GifReader(bytes);
  } catch {
    throw new Error("That GIF could not be checked, so it was refused.");
  }
  if (reader.width < 2 || reader.height < 2 || reader.numFrames() < 1) {
    throw new Error("That GIF could not be checked, so it was refused.");
  }
  const last = reader.numFrames() - 1;
  const picks = [...new Set([0, Math.floor(last / 2), last])];
  const frames = [];
  for (const index of picks) {
    const rgba = new Uint8Array(reader.width * reader.height * 4);
    try {
      reader.decodeAndBlitFrameRGBA(index, rgba);
    } catch {
      continue;
    }
    const rgb = new Uint8Array(reader.width * reader.height * 3);
    for (let p = 0, q = 0; p < rgba.length; p += 4, q += 3) {
      rgb[q] = rgba[p];
      rgb[q + 1] = rgba[p + 1];
      rgb[q + 2] = rgba[p + 2];
    }
    frames.push(shrink(rgb, reader.width, reader.height));
  }
  if (frames.length === 0) throw new Error("That GIF could not be checked, so it was refused.");
  return frames;
}

function asScores(preds: Array<{ className: string; probability: number }>): NudityScores {
  const scores: NudityScores = { porn: 0, hentai: 0, sexy: 0, drawing: 0, neutral: 0 };
  for (const pred of preds) {
    const name = pred.className.toLowerCase();
    if (name === "porn" || name === "hentai" || name === "sexy" || name === "drawing" || name === "neutral") {
      scores[name] = pred.probability;
    }
  }
  return scores;
}

async function scoreFrames(frames: Array<{ rgb: Uint8Array; width: number; height: number }>, model: Loaded): Promise<NudityScores> {
  const scored: NudityScores[] = [];
  for (const frame of frames) {
    const tensor = tf.tensor3d(frame.rgb, [frame.height, frame.width, 3]);
    try {
      scored.push(asScores(await model.classify(tensor)));
    } finally {
      tensor.dispose();
    }
  }
  return worstNudity(scored);
}

/** Fetch a GIF and score it with both models. Throws if the file cannot be checked. */
export async function scanGifUrl(url: string): Promise<{ verdict: AutomodVerdict; scores: NudityScores; fileHash: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  let bytes: Buffer;
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) throw new Error("That GIF could not be checked, so it was refused.");
    if (!res.ok) throw new Error("That GIF could not be checked, so it was refused.");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 16 || buf.length > MAX_BYTES) throw new Error("That GIF could not be checked, so it was refused.");
    bytes = buf;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("That GIF")) throw err;
    throw new Error("That GIF could not be checked, so it was refused.");
  } finally {
    clearTimeout(timer);
  }
  const frames = readFrames(bytes);
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const [fast, mid] = await models();
  const [first, second] = await Promise.all([scoreFrames(frames, fast), scoreFrames(frames, mid)]);
  const scores = worstNudity([first, second]);
  return { verdict: nudityVerdict(first, second), scores, fileHash };
}
