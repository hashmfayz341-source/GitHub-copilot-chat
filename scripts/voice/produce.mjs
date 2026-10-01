#!/usr/bin/env node
/**
 * Produce approved audio for the V2 Arabic episode.
 *
 * One code path for every provider. The only provider-specific step is the call
 * to `synthesize`; the sanity check, the loudness/format finalize, the output
 * naming, the ledger entry and the timing rebuild are identical whether the
 * bytes came from ElevenLabs, from OpenAI, or from a person at a microphone.
 *
 *   node scripts/voice/produce.mjs --providers         what is reachable right now
 *   node scripts/voice/produce.mjs --status            what is done and what is missing
 *   node scripts/voice/produce.mjs --scene 2           produce scene 2 with the best provider
 *   node scripts/voice/produce.mjs --all --provider openai
 *   node scripts/voice/produce.mjs --line L042 --provider manual
 *
 * Approved takes are never regenerated. Pass --redo to replace one deliberately.
 */
import fs from 'node:fs';
import path from 'node:path';
import {finalize, sanity} from './audio.mjs';
import {bindingFor, choose, get, survey} from './providers/index.mjs';

const VOICE_DIR = 'src/v2-ar/voice';
const PUBLIC_ROOT = 'public';
const AUDIO_REL = 'audio/v2-ar';
const TMP = '.voice-tmp';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const cast = readJson(`${VOICE_DIR}/cast-ar.json`);
const script = readJson(`${VOICE_DIR}/lines-ar.json`);
const takesDoc = readJson(`${VOICE_DIR}/takes-ar.json`);

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const saveTakes = () =>
  fs.writeFileSync(`${VOICE_DIR}/takes-ar.json`, JSON.stringify({schema: 'anatomy-v2-takes/1', takes: takesDoc.takes}, null, 1));

// ---------------------------------------------------------------- reporting
if (flag('providers')) {
  console.log('Voice providers, in cast priority order:\n');
  for (const s of survey(cast.providerPriority)) {
    console.log(`  ${s.ok ? '✓' : '·'} ${s.id.padEnd(12)} ${s.label.padEnd(26)} ${s.ok ? 'available' : 'unavailable'} — ${s.reason}`);
  }
  console.log(`\n  → would use: ${choose(cast.providerPriority).id}`);
  console.log('  manual is always available, so production is never hard-blocked on a vendor.');
  process.exit(0);
}

if (flag('status')) {
  const byScene = new Map();
  for (const l of script.lines) {
    const s = byScene.get(l.scene) ?? {done: 0, awaiting: 0, total: 0, providers: new Set()};
    s.total++;
    const t = takesDoc.takes[l.lineId];
    if (t?.status === 'FINAL') {
      s.done++;
      s.providers.add(t.provenance?.provider ?? '?');
    } else if (t?.status === 'RENDERED') {
      s.awaiting++;
      s.providers.add(t.provenance?.provider ?? '?');
    }
    byScene.set(l.scene, s);
  }
  let done = 0;
  let awaiting = 0;
  for (const [, s] of byScene) {
    done += s.done;
    awaiting += s.awaiting;
  }
  console.log(`Approved audio:      ${done}/${script.lines.length} lines`);
  console.log(`Produced, unapproved: ${awaiting} (run --approve <lineId...> once checked)\n`);
  for (const k of [...byScene.keys()].sort((a, b) => a - b)) {
    const s = byScene.get(k);
    const mark = s.done === s.total ? '✓' : s.done || s.awaiting ? '~' : '·';
    const aw = s.awaiting ? ` +${s.awaiting} awaiting QA` : '';
    console.log(`  ${mark} scene ${String(k).padStart(2)}  ${String(s.done).padStart(3)}/${String(s.total).padEnd(3)} ${[...s.providers].join(',')}${aw}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------- approval
if (flag('approve')) {
  const ids = argv.slice(argv.indexOf('--approve') + 1).filter((a) => /^L\d{3}$/.test(a));
  if (!ids.length) {
    console.error('--approve needs one or more line ids, e.g. --approve L009 L010');
    process.exit(1);
  }
  for (const id of ids) {
    const t = takesDoc.takes[id];
    if (!t) {
      console.log(`  · ${id} has no take to approve`);
      continue;
    }
    if (t.status === 'FINAL') {
      console.log(`  · ${id} already approved`);
      continue;
    }
    t.status = 'FINAL';
    t.qa = {...(t.qa ?? {}), approvedAt: new Date().toISOString()};
    console.log(`  ✓ ${id} approved → ${t.audioFile}`);
  }
  saveTakes();
  console.log('\nNow run: node scripts/build-timing-ar.mjs');
  process.exit(0);
}

// ---------------------------------------------------------------- selection
let wanted = script.lines;
if (opt('scene')) wanted = wanted.filter((l) => l.scene === Number(opt('scene')));
if (opt('line')) wanted = wanted.filter((l) => l.lineId === opt('line'));
// A take that exists but is not yet approved is a QA job, not a generation job:
// regenerating it would spend a provider call and throw away a usable recording.
const heldBack = [];
if (!flag('redo')) {
  wanted = wanted.filter((l) => {
    const st = takesDoc.takes[l.lineId]?.status;
    if (st === 'FINAL') return false;
    if (st === 'RENDERED') {
      heldBack.push(l.lineId);
      return false;
    }
    return true;
  });
}
const limit = opt('limit') ? Number(opt('limit')) : null;
if (limit) wanted = wanted.slice(0, limit);

if (heldBack.length) {
  console.log(`${heldBack.length} line(s) already have an unapproved take and were not regenerated:`);
  console.log(`  ${heldBack.join(' ')}`);
  console.log(`  check them, then: node scripts/voice/produce.mjs --approve ${heldBack.join(' ')}\n`);
}

if (!wanted.length) {
  console.log('Nothing to produce: every selected line already has a take.');
  process.exit(0);
}

const provider = choose(cast.providerPriority, opt('provider'));
console.log(`provider: ${provider.id} (${provider.label})`);
console.log(`lines to produce: ${wanted.length}\n`);

// ---------------------------------------------------------------- production
let ok = 0;
const failures = [];

for (const line of wanted) {
  const binding = bindingFor(cast, line.speaker, provider.id);
  const fmt = {...cast.defaults.outputFormat, ...(binding.outputFormat ?? {})};
  // delivery format is the project's, not the provider's: a human WAV and an
  // ElevenLabs MP3 both land as the same container downstream
  const outFmt = {...cast.defaults.outputFormat};

  let res;
  try {
    res = await provider.synthesize({line, binding, pronunciation: cast.pronunciation, outDir: TMP, format: fmt});
  } catch (e) {
    res = {ok: false, reason: String(e.message ?? e)};
  }
  if (!res.ok) {
    failures.push({lineId: line.lineId, reason: res.reason});
    console.log(`  ✗ ${line.lineId} ${line.speaker.padEnd(7)} ${res.reason}`);
    continue;
  }

  const check = sanity(res.rawFile);
  if (!check.ok) {
    failures.push({lineId: line.lineId, reason: check.issues.join('; ')});
    console.log(`  ✗ ${line.lineId} ${line.speaker.padEnd(7)} rejected: ${check.issues.join('; ')}`);
    continue;
  }

  const sceneDir = `scene${String(line.scene).padStart(2, '0')}`;
  const take = (takesDoc.takes[line.lineId]?.provenance?.take ?? 0) + 1;
  const name = `${cast.characters[line.speaker].characterId}_${String(line.idx).padStart(3, '0')}_${provider.id}_take${take}.${outFmt.container}`;
  const rel = `${AUDIO_REL}/${sceneDir}/${name}`;
  const dest = path.join(PUBLIC_ROOT, rel);

  const fin = finalize(res.rawFile, dest, outFmt, cast.defaults.loudnessTargetLufs);

  takesDoc.takes[line.lineId] = {
    lineId: line.lineId,
    status: 'FINAL',
    audioFile: rel,
    provenance: {...res.meta, take, producedAt: new Date().toISOString()},
    audio: {duration: Number(fin.duration.toFixed(3)), lufs: fin.finalLufs, gainAppliedDb: fin.gainDb},
  };
  saveTakes();
  ok++;
  console.log(`  ✓ ${line.lineId} ${line.speaker.padEnd(7)} ${fin.duration.toFixed(2)}s  ${rel}`);
}

fs.rmSync(TMP, {recursive: true, force: true});

console.log(`\nproduced ${ok}, failed ${failures.length}`);
if (failures.length) {
  console.log('\nnot produced:');
  for (const f of failures.slice(0, 20)) console.log(`  ${f.lineId}: ${f.reason}`);
  if (provider.id === 'manual') {
    console.log(`\nDrop recordings named after the line id (L042.wav) into ${process.env.V2_VOICE_DROP ?? 'voice-drop'}/ and run again.`);
  }
}
if (ok) console.log('\nNow run: node scripts/build-timing-ar.mjs');
