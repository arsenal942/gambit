/**
 * Sound generation script for Gambit.
 * Generates placeholder sound effects as WAV files using raw PCM synthesis.
 * Run with: npx tsx apps/web/scripts/generate-sounds.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SAMPLE_RATE = 44100;
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/sounds");

// --- WAV file writer ---

function createWav(samples: Float32Array): Buffer {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2; // 16-bit mono
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  return buffer;
}

// --- DSP Primitives ---

function sine(freq: number, duration: number, amplitude = 1): Float32Array {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
  }
  return out;
}

function noise(duration: number, amplitude = 1): Float32Array {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = amplitude * (Math.random() * 2 - 1);
  }
  return out;
}

function envelope(
  samples: Float32Array,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
): Float32Array {
  const out = new Float32Array(samples.length);
  const aN = Math.floor(attack * SAMPLE_RATE);
  const dN = Math.floor(decay * SAMPLE_RATE);
  const rN = Math.floor(release * SAMPLE_RATE);
  const rStart = samples.length - rN;

  for (let i = 0; i < samples.length; i++) {
    let gain: number;
    if (i < aN) {
      gain = i / aN;
    } else if (i < aN + dN) {
      gain = 1 - ((1 - sustain) * (i - aN)) / dN;
    } else if (i >= rStart) {
      gain = sustain * (1 - (i - rStart) / rN);
    } else {
      gain = sustain;
    }
    out[i] = samples[i] * Math.max(0, gain);
  }
  return out;
}

function fadeOut(samples: Float32Array, fadeDuration: number): Float32Array {
  const out = new Float32Array(samples);
  const fadeN = Math.floor(fadeDuration * SAMPLE_RATE);
  const start = samples.length - fadeN;
  for (let i = start; i < samples.length; i++) {
    out[i] *= 1 - (i - start) / fadeN;
  }
  return out;
}

function fadeIn(samples: Float32Array, fadeDuration: number): Float32Array {
  const out = new Float32Array(samples);
  const fadeN = Math.floor(fadeDuration * SAMPLE_RATE);
  for (let i = 0; i < fadeN && i < samples.length; i++) {
    out[i] *= i / fadeN;
  }
  return out;
}

function lowPass(samples: Float32Array, cutoff: number): Float32Array {
  const out = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  out[0] = alpha * samples[0];
  for (let i = 1; i < samples.length; i++) {
    out[i] = out[i - 1] + alpha * (samples[i] - out[i - 1]);
  }
  return out;
}

function mix(...arrays: Float32Array[]): Float32Array {
  const maxLen = Math.max(...arrays.map((a) => a.length));
  const out = new Float32Array(maxLen);
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      out[i] += arr[i];
    }
  }
  return out;
}

function concat(...arrays: Float32Array[]): Float32Array {
  const totalLen = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Float32Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function gain(samples: Float32Array, vol: number): Float32Array {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = samples[i] * vol;
  }
  return out;
}

function silence(duration: number): Float32Array {
  return new Float32Array(Math.floor(SAMPLE_RATE * duration));
}

function freqSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  amplitude = 1,
): Float32Array {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = startFreq + (endFreq - startFreq) * t;
    out[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
  }
  return out;
}

// --- Sound Generators ---

function genFootmanMove(): Float32Array {
  // Grounded thud - low noise burst
  const n = noise(0.2, 0.6);
  const filtered = lowPass(n, 300);
  return envelope(filtered, 0.005, 0.05, 0.3, 0.1);
}

function genArcherMove(): Float32Array {
  // Light quick step
  const n = noise(0.15, 0.4);
  const filtered = lowPass(n, 500);
  return envelope(filtered, 0.003, 0.03, 0.2, 0.08);
}

function genKnightMove(): Float32Array {
  // Heavy armored step - clip-clop
  const thud1 = envelope(lowPass(noise(0.12, 0.7), 250), 0.005, 0.03, 0.4, 0.06);
  const thud2 = envelope(lowPass(noise(0.12, 0.5), 200), 0.005, 0.03, 0.3, 0.06);
  return concat(thud1, silence(0.01), thud2);
}

function genSelect(): Float32Array {
  // Clean UI click - short sine ping
  const s = sine(1200, 0.1, 0.5);
  return envelope(s, 0.002, 0.02, 0.3, 0.05);
}

function genDeselect(): Float32Array {
  // Softer descending click
  const s = freqSweep(900, 600, 0.08, 0.35);
  return envelope(s, 0.002, 0.02, 0.2, 0.04);
}

function genFootmanCapture(): Float32Array {
  // Sword clash - noise burst + metallic ring
  const impact = envelope(lowPass(noise(0.15, 0.6), 800), 0.002, 0.04, 0.3, 0.08);
  const ring = envelope(sine(2400, 0.25, 0.3), 0.001, 0.05, 0.15, 0.15);
  return mix(impact, ring);
}

function genKnightCapture(): Float32Array {
  // Heavy impact - lance hit
  const impact = envelope(lowPass(noise(0.2, 0.8), 600), 0.003, 0.05, 0.35, 0.1);
  const ring = envelope(sine(1800, 0.3, 0.25), 0.002, 0.08, 0.1, 0.15);
  const bass = envelope(sine(80, 0.15, 0.4), 0.002, 0.04, 0.2, 0.08);
  return mix(impact, ring, bass);
}

function genLongshot(): Float32Array {
  // Bow twang + distant impact
  const twang = envelope(freqSweep(1500, 400, 0.2, 0.5), 0.001, 0.03, 0.3, 0.12);
  const whoosh = envelope(
    lowPass(noise(0.15, 0.15), 2000),
    0.05,
    0.05,
    0.1,
    0.05,
  );
  const impact = envelope(lowPass(noise(0.15, 0.5), 400), 0.002, 0.04, 0.2, 0.08);
  return concat(twang, whoosh, impact);
}

function genPushback(): Float32Array {
  // Shield bash - heavy shove
  const impact = envelope(lowPass(noise(0.2, 0.7), 500), 0.003, 0.05, 0.3, 0.1);
  const bass = envelope(sine(60, 0.15, 0.4), 0.002, 0.04, 0.25, 0.07);
  return mix(impact, bass);
}

function genPromotion(): Float32Array {
  // Ascending chime flourish
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const parts: Float32Array[] = [];
  for (let i = 0; i < notes.length; i++) {
    const note = envelope(sine(notes[i], 0.2, 0.4), 0.005, 0.03, 0.5, 0.1);
    parts.push(concat(silence(i * 0.12), note));
  }
  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    result = mix(result, parts[i]);
  }
  return fadeOut(result, 0.15);
}

function genRansom(): Float32Array {
  // Coin/chain sound - high metallic pings
  const ping1 = envelope(sine(3000, 0.1, 0.35), 0.001, 0.02, 0.2, 0.06);
  const ping2 = envelope(sine(3500, 0.08, 0.3), 0.001, 0.015, 0.15, 0.05);
  const ping3 = envelope(sine(4000, 0.12, 0.35), 0.001, 0.02, 0.25, 0.07);
  const chain = envelope(lowPass(noise(0.15, 0.3), 3000), 0.005, 0.04, 0.15, 0.06);
  return concat(
    mix(ping1, chain),
    silence(0.05),
    ping2,
    silence(0.05),
    ping3,
  );
}

function genCheck(): Float32Array {
  // Warning horn - single short blast
  const horn = envelope(
    mix(sine(440, 0.8, 0.4), sine(880, 0.8, 0.2), sine(660, 0.8, 0.15)),
    0.02,
    0.1,
    0.6,
    0.3,
  );
  return horn;
}

function genCheckmate(): Float32Array {
  // Victory fanfare - ascending 3-note horn
  const note1 = envelope(
    mix(sine(392, 0.5, 0.4), sine(784, 0.5, 0.2)),
    0.02,
    0.05,
    0.7,
    0.15,
  ); // G4
  const note2 = envelope(
    mix(sine(494, 0.5, 0.4), sine(988, 0.5, 0.2)),
    0.02,
    0.05,
    0.7,
    0.15,
  ); // B4
  const note3 = envelope(
    mix(sine(587, 0.8, 0.5), sine(1175, 0.8, 0.25)),
    0.03,
    0.1,
    0.7,
    0.3,
  ); // D5

  return concat(note1, silence(0.05), note2, silence(0.05), note3);
}

function genAnnihilation(): Float32Array {
  // War drum + decisive horn
  const drum = envelope(
    mix(sine(60, 0.3, 0.6), lowPass(noise(0.3, 0.4), 200)),
    0.005,
    0.05,
    0.4,
    0.2,
  );
  const horn = envelope(
    mix(sine(349, 0.8, 0.35), sine(523, 0.8, 0.2), sine(698, 0.8, 0.15)),
    0.03,
    0.1,
    0.6,
    0.3,
  );
  return concat(drum, silence(0.1), horn);
}

function genDefeat(): Float32Array {
  // Low somber descending tone
  const note1 = envelope(
    mix(sine(330, 0.5, 0.35), sine(165, 0.5, 0.2)),
    0.03,
    0.1,
    0.5,
    0.15,
  );
  const note2 = envelope(
    mix(sine(262, 0.6, 0.35), sine(131, 0.6, 0.2)),
    0.03,
    0.1,
    0.5,
    0.25,
  );
  return concat(note1, silence(0.05), note2);
}

function genTurnChange(): Float32Array {
  // Subtle bell tick
  const bell = envelope(sine(1500, 0.15, 0.3), 0.001, 0.02, 0.2, 0.1);
  return bell;
}

function genGameStart(): Float32Array {
  // Brief medieval horn flourish
  const horn1 = envelope(
    mix(sine(349, 0.3, 0.3), sine(698, 0.3, 0.15)),
    0.02,
    0.05,
    0.6,
    0.1,
  );
  const horn2 = envelope(
    mix(sine(440, 0.3, 0.35), sine(880, 0.3, 0.18)),
    0.02,
    0.05,
    0.6,
    0.1,
  );
  const horn3 = envelope(
    mix(sine(523, 0.5, 0.4), sine(1047, 0.5, 0.2)),
    0.03,
    0.08,
    0.6,
    0.2,
  );
  return concat(horn1, silence(0.02), horn2, silence(0.02), horn3);
}

function genDrawOffer(): Float32Array {
  // Neutral questioning tone
  const note1 = envelope(sine(600, 0.15, 0.3), 0.005, 0.03, 0.3, 0.07);
  const note2 = envelope(sine(700, 0.15, 0.3), 0.005, 0.03, 0.3, 0.07);
  return concat(note1, silence(0.02), note2);
}

function genUIClick(): Float32Array {
  // Clean click
  const s = envelope(sine(1000, 0.08, 0.4), 0.001, 0.015, 0.25, 0.04);
  return s;
}

function genError(): Float32Array {
  // Soft buzz/bonk
  const buzz = envelope(sine(200, 0.15, 0.3), 0.005, 0.03, 0.3, 0.08);
  const noiseBurst = envelope(lowPass(noise(0.1, 0.2), 400), 0.002, 0.02, 0.15, 0.05);
  return mix(buzz, noiseBurst);
}

function genMatchFound(): Float32Array {
  // Positive ping chime
  const ping1 = envelope(sine(800, 0.15, 0.35), 0.002, 0.03, 0.3, 0.08);
  const ping2 = envelope(sine(1200, 0.2, 0.4), 0.002, 0.03, 0.35, 0.1);
  return concat(ping1, silence(0.03), ping2);
}

function genCopy(): Float32Array {
  // Quick confirmation blip
  return envelope(sine(1400, 0.08, 0.3), 0.001, 0.015, 0.2, 0.04);
}

function genVictoryTheme(): Float32Array {
  // Short celebratory medieval piece - 5 seconds
  const melody = [
    { freq: 523, dur: 0.3 }, // C5
    { freq: 587, dur: 0.3 }, // D5
    { freq: 659, dur: 0.3 }, // E5
    { freq: 784, dur: 0.5 }, // G5
    { freq: 659, dur: 0.2 }, // E5
    { freq: 784, dur: 0.8 }, // G5
    { freq: 1047, dur: 1.0 }, // C6
  ];
  const parts: Float32Array[] = [];
  for (const note of melody) {
    const s = envelope(
      mix(sine(note.freq, note.dur, 0.3), sine(note.freq * 2, note.dur, 0.1)),
      0.02,
      0.05,
      0.6,
      note.dur * 0.3,
    );
    parts.push(s);
    parts.push(silence(0.05));
  }
  return concat(...parts);
}

function genAmbientMenu(): Float32Array {
  // 30 seconds of gentle ambient - soft pad with slow arpeggios
  const duration = 30;
  const pad = envelope(
    mix(
      sine(220, duration, 0.08),
      sine(330, duration, 0.05),
      sine(440, duration, 0.04),
    ),
    2.0,
    1.0,
    0.8,
    3.0,
  );

  // Gentle arpeggiated notes (pentatonic: A, C, D, E, G)
  const arpNotes = [440, 523, 587, 659, 784, 659, 587, 523];
  const arpInterval = duration / arpNotes.length;
  const arps: Float32Array[] = [];
  for (let i = 0; i < arpNotes.length; i++) {
    const noteArr = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const start = Math.floor(i * arpInterval * SAMPLE_RATE);
    const note = envelope(sine(arpNotes[i], 1.5, 0.06), 0.1, 0.3, 0.3, 0.8);
    for (let j = 0; j < note.length && start + j < noteArr.length; j++) {
      noteArr[start + j] = note[j];
    }
    arps.push(noteArr);
  }

  let result = pad;
  for (const arp of arps) {
    result = mix(result, arp);
  }

  // Ensure smooth loop: fade out end, fade in start
  result = fadeIn(result, 1.0);
  result = fadeOut(result, 2.0);

  return result;
}

function genAmbientGame(): Float32Array {
  // 30 seconds of subtle tension ambient
  const duration = 30;
  // Low drone
  const drone = envelope(
    mix(sine(110, duration, 0.06), sine(165, duration, 0.03)),
    2.0,
    1.0,
    0.8,
    3.0,
  );

  // Very subtle filtered noise for atmosphere
  const atmo = gain(
    envelope(lowPass(noise(duration, 0.02), 200), 2.0, 1.0, 0.8, 3.0),
    0.5,
  );

  let result = mix(drone, atmo);
  result = fadeIn(result, 1.5);
  result = fadeOut(result, 2.0);

  return result;
}

// --- Sprite sheet builder ---

interface SpriteEntry {
  name: string;
  samples: Float32Array;
}

interface SpriteMap {
  [key: string]: [number, number]; // [offset_ms, duration_ms]
}

function buildSprite(entries: SpriteEntry[]): {
  samples: Float32Array;
  sprite: SpriteMap;
} {
  const gap = Math.floor(SAMPLE_RATE * 0.05); // 50ms gap between sounds
  const parts: Float32Array[] = [];
  const sprite: SpriteMap = {};
  let offset = 0;

  for (const entry of entries) {
    const offsetMs = Math.round((offset / SAMPLE_RATE) * 1000);
    const durationMs = Math.round((entry.samples.length / SAMPLE_RATE) * 1000);
    sprite[entry.name] = [offsetMs, durationMs];
    parts.push(entry.samples);
    parts.push(new Float32Array(gap));
    offset += entry.samples.length + gap;
  }

  return { samples: concat(...parts), sprite };
}

// --- Main ---

function main() {
  mkdirSync(join(OUT_DIR, "sprites"), { recursive: true });

  console.log("Generating sound sprites...");

  // UI sprites
  const uiSprite = buildSprite([
    { name: "select", samples: genSelect() },
    { name: "deselect", samples: genDeselect() },
    { name: "ui-click", samples: genUIClick() },
    { name: "error", samples: genError() },
    { name: "copy", samples: genCopy() },
  ]);
  writeFileSync(
    join(OUT_DIR, "sprites", "ui-sprites.wav"),
    createWav(uiSprite.samples),
  );
  writeFileSync(
    join(OUT_DIR, "sprites", "ui-sprites.json"),
    JSON.stringify(uiSprite.sprite, null, 2),
  );

  // Move sprites
  const moveSprite = buildSprite([
    { name: "footman-move", samples: genFootmanMove() },
    { name: "archer-move", samples: genArcherMove() },
    { name: "knight-move", samples: genKnightMove() },
  ]);
  writeFileSync(
    join(OUT_DIR, "sprites", "move-sprites.wav"),
    createWav(moveSprite.samples),
  );
  writeFileSync(
    join(OUT_DIR, "sprites", "move-sprites.json"),
    JSON.stringify(moveSprite.sprite, null, 2),
  );

  // Capture sprites
  const captureSprite = buildSprite([
    { name: "footman-capture", samples: genFootmanCapture() },
    { name: "knight-capture", samples: genKnightCapture() },
    { name: "pushback", samples: genPushback() },
  ]);
  writeFileSync(
    join(OUT_DIR, "sprites", "capture-sprites.wav"),
    createWav(captureSprite.samples),
  );
  writeFileSync(
    join(OUT_DIR, "sprites", "capture-sprites.json"),
    JSON.stringify(captureSprite.sprite, null, 2),
  );

  // Event sprites
  const eventSprite = buildSprite([
    { name: "turn-change", samples: genTurnChange() },
    { name: "check", samples: genCheck() },
    { name: "draw-offer", samples: genDrawOffer() },
    { name: "match-found", samples: genMatchFound() },
  ]);
  writeFileSync(
    join(OUT_DIR, "sprites", "event-sprites.wav"),
    createWav(eventSprite.samples),
  );
  writeFileSync(
    join(OUT_DIR, "sprites", "event-sprites.json"),
    JSON.stringify(eventSprite.sprite, null, 2),
  );

  console.log("Generating standalone sounds...");

  // Standalone sounds (longer / more distinctive)
  const standalone: { name: string; samples: Float32Array }[] = [
    { name: "longshot", samples: genLongshot() },
    { name: "checkmate", samples: genCheckmate() },
    { name: "annihilation", samples: genAnnihilation() },
    { name: "defeat", samples: genDefeat() },
    { name: "promotion", samples: genPromotion() },
    { name: "ransom", samples: genRansom() },
    { name: "game-start", samples: genGameStart() },
    { name: "victory-theme", samples: genVictoryTheme() },
    { name: "ambient-menu", samples: genAmbientMenu() },
    { name: "ambient-game", samples: genAmbientGame() },
  ];

  for (const s of standalone) {
    writeFileSync(join(OUT_DIR, `${s.name}.wav`), createWav(s.samples));
    console.log(`  ${s.name}.wav`);
  }

  console.log("Done! All sounds generated in", OUT_DIR);
}

main();
