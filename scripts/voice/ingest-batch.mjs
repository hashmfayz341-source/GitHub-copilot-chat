#!/usr/bin/env node
/**
 * Ingest generated audio: [{lineId, url}] → canonical master + delivery copy + ledger.
 *
 * The master is kept exactly as the provider returned it and is never rewritten.
 * The delivery copy under public/ is what Remotion plays, and is the only file
 * that balancing ever touches, so re-balancing can never degrade the canonical
 * asset through repeated lossy re-encodes.
 *
 * Takes land as RENDERED. Only QA promotes them to FINAL, and only FINAL
 * reaches timing-ar.json.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {measure, render, sanity} from './audio.mjs';

const TAKES = 'src/v2-ar/voice/takes-ar.json';
const MASTERS = 'audio-masters';
const DELIVERY = 'public/audio/v2-ar';

const batch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const doc = JSON.parse(fs.readFileSync(TAKES, 'utf8'));
const lines = JSON.parse(fs.readFileSync('src/v2-ar/voice/lines-ar.json', 'utf8')).lines;
const cast = JSON.parse(fs.readFileSync('src/v2-ar/voice/cast-ar.json', 'utf8'));
const byId = new Map(lines.map((l) => [l.lineId, l]));
const fmt = cast.defaults.outputFormat;

let ok = 0;
const bad = [];

for (const job of batch) {
  const line = byId.get(job.lineId);
  if (!line) {
    bad.push(`${job.lineId}: not in the script`);
    continue;
  }
  const sceneDir = `scene${String(line.scene).padStart(2, '0')}`;
  const take = (doc.takes[job.lineId]?.provenance?.take ?? 0) + 1;
  const master = path.join(MASTERS, sceneDir, `${job.lineId}_take${take}.mp3`);
  fs.mkdirSync(path.dirname(master), {recursive: true});

  try {
    if (job.file) fs.copyFileSync(job.file, master);
    else execFileSync('curl', ['-sS', '-fL', '-m', '180', '-o', master, job.url], {stdio: ['ignore', 'ignore', 'pipe']});
  } catch (e) {
    bad.push(`${job.lineId}: could not fetch audio`);
    continue;
  }

  const s = sanity(master);
  if (!s.ok) {
    bad.push(`${job.lineId}: ${s.issues.join('; ')}`);
    continue;
  }

  const char = cast.characters[line.speaker].characterId;
  const rel = `audio/v2-ar/${sceneDir}/${char}_${String(line.idx).padStart(3, '0')}_elevenlabs_take${take}.mp3`;
  const m = measure(master);
  render(master, path.join('public', rel), fmt, 0);

  doc.takes[job.lineId] = {
    lineId: job.lineId,
    status: 'RENDERED',
    audioFile: rel,
    master,
    provenance: {provider: 'elevenlabs', voiceId: job.voiceId, model: 'eleven_v3', delivery: line.delivery, take, producedAt: new Date().toISOString()},
    audio: {duration: Number(m.duration.toFixed(3)), lufs: m.lufs, truePeakDb: m.truePeakDb, gainAppliedDb: 0},
    qa: {method: null},
  };
  fs.writeFileSync(TAKES, JSON.stringify({schema: 'anatomy-v2-takes/1', takes: doc.takes}, null, 1));
  ok++;
  console.log(`  + ${job.lineId} ${line.speaker.padEnd(7)} ${m.duration.toFixed(2)}s  ${m.lufs} LUFS  ${m.truePeakDb} dBTP  [${line.delivery}]`);
}

console.log(`\ningested ${ok}, failed ${bad.length}`);
for (const b of bad) console.log(`  ! ${b}`);
