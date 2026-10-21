import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as tf from "@tensorflow/tfjs";
import { GifReader } from "omggif";

const require = createRequire(import.meta.url);
const nsfwjs = require("nsfwjs");

const text = readFileSync(new URL("../src/lib/now-pack.ts", import.meta.url), "utf8");
const urls = [...text.matchAll(/https:\/\/media\.giphy\.com\/media\/[^"']+\.gif/g)].map((m) => m[0]);
const step = Math.max(1, Math.floor(urls.length / 24));
const sample = urls.filter((_, i) => i % step === 0).slice(0, 24);

await tf.setBackend("cpu");
await tf.ready();
const model = await nsfwjs.load("MobileNetV2");

function shrink(rgb, width, height) {
  const edge = Math.max(width, height);
  if (edge <= 320) return { rgb, width, height };
  const scale = 320 / edge;
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

const rows = [];
for (const url of sample) {
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const reader = new GifReader(buf);
    const last = reader.numFrames() - 1;
    const picks = [...new Set([0, Math.floor(last / 2), last])];
    const worst = { porn: 0, hentai: 0, sexy: 0 };
    for (const index of picks) {
      const rgba = new Uint8Array(reader.width * reader.height * 4);
      reader.decodeAndBlitFrameRGBA(index, rgba);
      const rgb = new Uint8Array(reader.width * reader.height * 3);
      for (let p = 0, q = 0; p < rgba.length; p += 4, q += 3) {
        rgb[q] = rgba[p];
        rgb[q + 1] = rgba[p + 1];
        rgb[q + 2] = rgba[p + 2];
      }
      const frame = shrink(rgb, reader.width, reader.height);
      const tensor = tf.tensor3d(frame.rgb, [frame.height, frame.width, 3]);
      const preds = await model.classify(tensor);
      tensor.dispose();
      for (const pred of preds) {
        const name = pred.className.toLowerCase();
        if (name in worst) worst[name] = Math.max(worst[name], pred.probability);
      }
    }
    rows.push({ url: url.slice(-28), ...worst });
    console.log(worst.porn.toFixed(3), worst.hentai.toFixed(3), worst.sexy.toFixed(3), url.slice(-40));
  } catch (err) {
    console.log("skip", url.slice(-40), err instanceof Error ? err.message : err);
  }
}

const max = { porn: 0, hentai: 0, sexy: 0 };
for (const row of rows) {
  max.porn = Math.max(max.porn, row.porn);
  max.hentai = Math.max(max.hentai, row.hentai);
  max.sexy = Math.max(max.sexy, row.sexy);
}
console.log("HOUSE_MAX", max, "n", rows.length);
