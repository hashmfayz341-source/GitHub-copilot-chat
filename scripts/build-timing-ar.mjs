/**
 * Builds src/v2-ar/timing/timing-ar.json from the REAL generated Arabic audio.
 *
 * The audio is the timing authority: every start/end comes from ffprobe on the
 * actual take, never from a script estimate. Lines that have no final take yet
 * are emitted with status "pending" and no timing, so the composition can show
 * an explicit gap instead of silently mistiming.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VOICE = '/home/user/anatomy_voice';
const OUT = 'src/v2-ar/timing/timing-ar.json';
const PUBLIC_REL = 'audio/v2-ar';
const FPS = 30;

const manifest = JSON.parse(fs.readFileSync(`${VOICE}/manifest.json`, 'utf8'));
const gaps = JSON.parse(fs.readFileSync('src/v2-ar/timing/gaps-ar.json', 'utf8'));
/** scripted retrieval pause wins; otherwise the directed conversational gap */
const gapAfter = (L) => L.pause_after > 0 ? L.pause_after : (gaps.byLine[String(L.idx)] ?? gaps.default);
const dur = (f) => Number(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0', f]).toString().trim());

const lines = Object.values(manifest.lines).sort((a, b) => a.idx - b.idx);
const scenes = {};

for (const L of lines) {
  const sc = String(L.scene);
  scenes[sc] ??= {scene: L.scene, lines: [], duration: 0, status: 'pending'};
  const entry = {
    lineId: `L${String(L.idx).padStart(3, '0')}`,
    idx: L.idx,
    speaker: L.speaker,
    text: L.dialogue,
    pauseAfter: L.pause_after,
    gapAfter: gapAfter(L),
    gapSource: L.pause_after > 0 ? 'script-retrieval-pause' : 'directed-conversational',
    status: L.status,
  };
  if (L.status === 'FINAL' && L.audio) {
    const src = path.join(VOICE, L.audio);
    const destDir = path.join('public', PUBLIC_REL, `scene${String(L.scene).padStart(2,'0')}`);
    fs.mkdirSync(destDir, {recursive: true});
    const base = path.basename(L.audio);
    fs.copyFileSync(src, path.join(destDir, base));
    entry.audioFile = `${PUBLIC_REL}/scene${String(L.scene).padStart(2,'0')}/${base}`;
    entry.duration = Number(dur(src).toFixed(3));
  }
  scenes[sc].lines.push(entry);
}

// lay each scene out on its own local clock from the real durations
for (const s of Object.values(scenes)) {
  const ready = s.lines.every((l) => l.status === 'FINAL');
  let t = 0;
  if (ready) {
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
  s.linesFinal = s.lines.filter((l) => l.status === 'FINAL').length;
  s.linesTotal = s.lines.length;
}

fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, JSON.stringify({
  fps: FPS,
  voiceConfig: manifest.voice_config,
  generatedFrom: 'anatomy_voice/manifest.json (real audio durations via ffprobe)',
  scenes,
}, null, 1));

const ready = Object.values(scenes).filter((s) => s.status === 'ready');
console.log(`timing-ar.json: ${Object.keys(scenes).length} scenes, ${ready.length} ready`);
for (const s of ready) console.log(`  scene ${s.scene}: ${s.duration}s / ${s.durationInFrames}f / ${s.linesFinal} lines`);
console.log(`  pending: ${Object.values(scenes).filter(s=>s.status!=='ready').map(s=>`${s.scene}(${s.linesFinal}/${s.linesTotal})`).join(' ')}`);
