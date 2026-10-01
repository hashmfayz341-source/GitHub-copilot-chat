/**
 * Builds src/v2-ar/timing/timing-ar.json from the FINAL approved audio.
 *
 * This script knows nothing about any TTS vendor, and must stay that way. It
 * reads three things:
 *
 *   lines-ar.json   the script      — who says what, in what order, with what pause
 *   takes-ar.json   the ledger      — which audio file is approved for each line
 *   the audio files themselves      — measured with ffprobe
 *
 * It deliberately does not read `provenance` from the ledger. A line voiced by
 * ElevenLabs, by OpenAI, or by a person in a room produces byte-identical timing
 * output, because the only thing that reaches the animation is a path and a
 * duration:
 *
 *   FINAL AUDIO → ffprobe duration → timing-ar.json → useLinesAR() → animation
 *
 * Lines with no approved take are emitted with status "pending" and no timing,
 * so a scene shows an explicit gap instead of silently mistiming.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VOICE_DIR = 'src/v2-ar/voice';
const PUBLIC_ROOT = 'public';
const OUT = 'src/v2-ar/timing/timing-ar.json';
const FPS = 30;

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const script = readJson(`${VOICE_DIR}/lines-ar.json`);
const ledger = readJson(`${VOICE_DIR}/takes-ar.json`).takes;
const cast = readJson(`${VOICE_DIR}/cast-ar.json`);
const gaps = readJson('src/v2-ar/timing/gaps-ar.json');

/** a scripted retrieval pause always wins over the directed conversational gap */
const gapAfter = (l) => (l.pauseAfter > 0 ? l.pauseAfter : (gaps.byLine[String(l.idx)] ?? gaps.default));

const duration = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const scenes = {};
const missing = [];

for (const l of script.lines) {
  const sc = String(l.scene);
  scenes[sc] ??= {scene: l.scene, lines: [], duration: 0, status: 'pending'};

  const entry = {
    lineId: l.lineId,
    idx: l.idx,
    speaker: l.speaker,
    text: l.text,
    pauseAfter: l.pauseAfter,
    gapAfter: gapAfter(l),
    gapSource: l.pauseAfter > 0 ? 'script-retrieval-pause' : 'directed-conversational',
    status: 'PENDING',
  };

  const take = ledger[l.lineId];
  if (take?.status === 'FINAL' && take.audioFile) {
    const onDisk = path.join(PUBLIC_ROOT, take.audioFile);
    if (!fs.existsSync(onDisk)) {
      missing.push(`${l.lineId} → ${take.audioFile}`);
    } else {
      entry.status = 'FINAL';
      entry.audioFile = take.audioFile;
      entry.duration = Number(duration(onDisk).toFixed(3));
    }
  }
  scenes[sc].lines.push(entry);
}

if (missing.length) {
  console.error(`\nledger points at ${missing.length} audio file(s) that are not on disk:`);
  for (const m of missing) console.error(`  ${m}`);
  console.error('\nRefusing to emit timing that claims audio it does not have.');
  process.exit(1);
}

// lay each scene out on its own clock, from the measured durations
for (const s of Object.values(scenes)) {
  s.linesFinal = s.lines.filter((l) => l.status === 'FINAL').length;
  s.linesTotal = s.lines.length;
  if (s.linesFinal !== s.linesTotal) continue;

  let t = 0;
  for (const l of s.lines) {
    l.start = Number(t.toFixed(3));
    l.end = Number((t + l.duration).toFixed(3));
    l.startFrame = Math.round(l.start * FPS);
    l.endFrame = Math.round(l.end * FPS);
    t = l.end + l.gapAfter;
  }
  s.duration = Number(t.toFixed(3));
  s.durationInFrames = Math.ceil(s.duration * FPS);
  s.status = 'ready';
}

fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      fps: FPS,
      /** provider-neutral by construction: display identity only, no vendor fields */
      cast: Object.fromEntries(
        Object.entries(cast.characters).map(([k, v]) => [k, {characterId: v.characterId, displayNameAr: v.displayNameAr}]),
      ),
      generatedFrom: 'final approved audio measured with ffprobe (vendor-independent)',
      scenes,
    },
    null,
    1,
  ),
);

const ready = Object.values(scenes).filter((s) => s.status === 'ready');
console.log(`timing-ar.json: ${Object.keys(scenes).length} scenes, ${ready.length} ready`);
for (const s of ready) console.log(`  scene ${s.scene}: ${s.duration}s / ${s.durationInFrames}f / ${s.linesFinal} lines`);
const pend = Object.values(scenes).filter((s) => s.status !== 'ready');
if (pend.length) console.log(`  pending: ${pend.map((s) => `${s.scene}(${s.linesFinal}/${s.linesTotal})`).join(' ')}`);
