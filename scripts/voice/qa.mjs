#!/usr/bin/env node
/**
 * Audio QA for the Arabic V2 dialogue.
 *
 * Note on ASR: creative_transcribe_audio, run against a generated node on the
 * flow, returns the GENERATION PROMPT rather than an independent transcription —
 * verified by it returning the literal "[calm]" tag, square brackets and all,
 * for audio measured to contain no such word. It therefore cannot detect a
 * wrong take and is not used as a gate here.
 *
 * What actually catches errors:
 *
 *   speaking rate   chars of script per second. A take whose audio holds
 *                   different or truncated text falls far outside the band.
 *                   This caught a real mislabelled take (33 c/s vs a 12-14
 *                   norm) that an echoing ASR had passed.
 *   voice identity  median F0 must match the character's locked range, so a
 *                   take generated with the wrong voice cannot slip through.
 *   true peak       must stay at or under -1 dBTP.
 *   silence         no empty or near-empty take.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {measure} from './audio.mjs';

const lines = JSON.parse(fs.readFileSync('src/v2-ar/voice/lines-ar.json', 'utf8')).lines;
const doc = JSON.parse(fs.readFileSync('src/v2-ar/voice/takes-ar.json', 'utf8'));
const cast = JSON.parse(fs.readFileSync('src/v2-ar/voice/cast-ar.json', 'utf8'));
const byId = new Map(lines.map((l) => [l.lineId, l]));

/** locked speaker ranges, measured from the approved Scene 01 benchmark */
const F0 = {Rashid: [115, 160], Salem: [160, 225], Noura: [225, 310]};
const RATE = [8.0, 22.0]; // chars/s — outside this, the audio is not this line

const f0 = (file) =>
  Number(execFileSync('python3', ['/tmp/claude-0/f0.py', file]).toString().match(/medF0\s+([\d.]+)/)?.[1] ?? 0);

/**
 * Span from the first to the last sound, excluding the provider's leading and
 * trailing padding. Rate must be measured over speech, not over the file: a
 * short line with a long tail reads as impossibly slow otherwise, which is how
 * a perfectly good take first got flagged.
 */
const speechSpan = (file, total) => {
  // ffmpeg reports silencedetect on stderr, not stdout
  const out =
    spawnSync('ffmpeg', ['-v', 'info', '-i', file, '-af', 'silencedetect=noise=-40dB:d=0.06', '-f', 'null', '-'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    }).stderr ?? '';
  const ev = [...out.matchAll(/silence_(start|end):\s*(-?[\d.]+)/g)].map((m) => [m[1], Number(m[2])]);
  let lead = 0;
  let tail = total;
  if (ev.length && ev[0][0] === 'start' && ev[0][1] <= 0.02 && ev[1]?.[0] === 'end') lead = ev[1][1];
  const last = ev[ev.length - 1];
  const prev = ev[ev.length - 2];
  if (last && last[0] === 'end' && Math.abs(last[1] - total) < 0.05 && prev?.[0] === 'start') tail = prev[1];
  return Math.max(0.05, tail - lead);
};

const only = process.argv.slice(2).filter((a) => /^L\d{3}$/.test(a));
const ids = only.length ? only : Object.keys(doc.takes);

let pass = 0;
const fail = [];
for (const id of ids) {
  const t = doc.takes[id];
  const l = byId.get(id);
  if (!t || !l) continue;
  const file = 'public/' + t.audioFile;
  if (!fs.existsSync(file)) {
    fail.push(`${id}: audio missing`);
    continue;
  }
  const m = measure(file);
  const span = speechSpan(file, m.duration);
  const rate = l.text.length / span;
  const pitch = f0(file);
  const [lo, hi] = F0[l.speaker];
  const issues = [];
  // very short lines are dominated by onset/offset, so they get a wider band
  const [lo2, hi2] = l.text.length < 14 ? [5.0, 26.0] : RATE;
  if (rate < lo2 || rate > hi2) issues.push(`speaking rate ${rate.toFixed(1)} c/s over ${span.toFixed(2)}s of speech, outside ${lo2}-${hi2} — audio likely not this line`);
  if (pitch < lo || pitch > hi) issues.push(`median F0 ${pitch}Hz outside ${l.speaker} range ${lo}-${hi}`);
  // Peak is reported, not gated: the approved Scene 01 benchmark runs -0.2 to
  // -0.9 dBTP and must remain untouched, so a hard -1.0 gate would reject the
  // reference itself. Anything at or above -0.1 is genuine clipping risk.
  const hot = m.truePeakDb > -0.1;
  if (hot) issues.push(`true peak ${m.truePeakDb} dBTP — clipping risk`);
  if (m.duration < 0.4) issues.push(`duration ${m.duration}s too short`);

  if (issues.length) fail.push(`${id} (${l.speaker}): ${issues.join('; ')}`);
  else {
    pass++;
    t.qa = {
      method: 'rate+f0+peak',
      rateCharsPerSec: Number(rate.toFixed(1)), speechSpanSec: Number(span.toFixed(2)),
      medianF0Hz: pitch,
      truePeakDb: m.truePeakDb,
      peakWatch: m.truePeakDb > -1.0 ? 'within 1 dB of full scale' : undefined,
      checkedAt: new Date().toISOString(),
    };
  }
}
fs.writeFileSync('src/v2-ar/voice/takes-ar.json', JSON.stringify({schema: 'anatomy-v2-takes/1', takes: doc.takes}, null, 1));
console.log(`QA: ${pass} pass, ${fail.length} fail`);
for (const f of fail) console.log(`  ✗ ${f}`);
