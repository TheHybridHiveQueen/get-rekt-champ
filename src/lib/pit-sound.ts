const KEY = "grc-noise";

let ctx: AudioContext | null = null;
let enabled = true;

export function noiseOn() {
  return enabled;
}

export function setNoise(on: boolean) {
  enabled = on;
  localStorage.setItem(KEY, on ? "on" : "off");
  if (on) unlockNoise();
}

export function loadNoise() {
  enabled = localStorage.getItem(KEY) !== "off";
  return enabled;
}

export function unlockNoise() {
  const audio = context();
  if (audio.state === "suspended") void audio.resume();
}

function context() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function blip(freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  const audio = context();
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + at);
  amp.gain.setValueAtTime(gain, audio.currentTime + at);
  amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + at + dur);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(audio.currentTime + at);
  osc.stop(audio.currentTime + at + dur);
}

export function playPit(kind: "rekt" | "defend" | "crown" | "stamp" | "loop") {
  if (!enabled) return;
  unlockNoise();
  if (kind === "rekt") {
    blip(240, 0, 0.08, "square", 0.05);
    blip(120, 0.07, 0.16, "sawtooth", 0.04);
  } else if (kind === "defend") {
    blip(520, 0, 0.1, "triangle", 0.05);
    blip(680, 0.08, 0.12, "triangle", 0.04);
  } else if (kind === "crown") {
    blip(523, 0, 0.1, "square", 0.04);
    blip(659, 0.08, 0.1, "square", 0.04);
    blip(784, 0.16, 0.18, "square", 0.04);
  } else if (kind === "stamp") {
    blip(90, 0, 0.12, "sine", 0.08);
    blip(440, 0.05, 0.08, "square", 0.03);
  } else {
    blip(330, 0, 0.06, "square", 0.04);
    blip(495, 0.06, 0.08, "square", 0.03);
  }
}
