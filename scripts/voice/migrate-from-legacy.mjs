/**
 * One-shot: lift the legacy ElevenLabs-shaped manifest into the provider-neutral
 * data layer that now lives in the repo.
 *
 * Kept for provenance and reproducibility only. Nothing in the pipeline calls
 * it: after this has run, src/v2-ar/voice/*.json is the source of truth and the
 * legacy manifest outside the repo is no longer read by anything.
 */
import fs from 'node:fs';

const LEGACY = '/home/user/anatomy_voice/manifest.json';
const OUT = 'src/v2-ar/voice';

const legacy = JSON.parse(fs.readFileSync(LEGACY, 'utf8'));
const rows = Object.values(legacy.lines).sort((a, b) => a.idx - b.idx);
const lineId = (i) => `L${String(i).padStart(3, '0')}`;

/** vendor audio tags collapse to a neutral delivery word each adapter renders itself */
const DELIVERY = {'[calm]': 'calm', '[casually]': 'casual', '[dryly]': 'dry', '[singing]': 'singing'};

const lines = rows.map((r) => ({
  lineId: lineId(r.idx),
  idx: r.idx,
  scene: r.scene,
  speaker: r.speaker,
  text: r.dialogue,
  /** scripted retrieval pause from the Actor Script, in seconds */
  pauseAfter: r.pause_after ?? 0,
  /** neutral delivery; a provider adapter turns this into whatever it needs */
  delivery: DELIVERY[r.tag] ?? 'calm',
}));

const takes = {};
for (const r of rows) {
  if (r.status !== 'FINAL' || !r.audio) continue;
  takes[lineId(r.idx)] = {
    lineId: lineId(r.idx),
    status: 'FINAL',
    audioFile: `audio/v2-ar/scene${String(r.scene).padStart(2, '0')}/${r.audio.split('/').pop()}`,
    provenance: {
      provider: 'elevenlabs',
      voiceId: r.voice_id,
      model: legacy.voice_config?.model_id ?? null,
      take: r.take ?? 1,
    },
    qa: {method: r.asr ? 'asr-per-line' : 'asr-scene-level', note: r.asr_scope ?? null},
  };
}

fs.writeFileSync(`${OUT}/lines-ar.json`, JSON.stringify({schema: 'anatomy-v2-lines/1', total: lines.length, lines}, null, 1));
fs.writeFileSync(`${OUT}/takes-ar.json`, JSON.stringify({schema: 'anatomy-v2-takes/1', takes}, null, 1));
console.log(`lines-ar.json: ${lines.length} lines`);
console.log(`takes-ar.json: ${Object.keys(takes).length} approved takes`);
