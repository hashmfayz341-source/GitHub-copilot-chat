/**
 * Print the next pending lines as generation jobs.
 *
 * The ElevenLabs MCP connector is driven from the conversation, not from a
 * script, so this prepares the exact prompts and voice ids and the ingest side
 * takes over again once the audio exists.
 */
import fs from 'node:fs';
import {TAG} from './providers/elevenlabs.mjs';

const lines = JSON.parse(fs.readFileSync('src/v2-ar/voice/lines-ar.json', 'utf8')).lines;
const takes = JSON.parse(fs.readFileSync('src/v2-ar/voice/takes-ar.json', 'utf8')).takes;
const cast = JSON.parse(fs.readFileSync('src/v2-ar/voice/cast-ar.json', 'utf8'));

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const n = Number(arg('next', 8));
const scene = arg('scene', null);

let pending = lines.filter((l) => !takes[l.lineId] || takes[l.lineId].status === 'PENDING');
if (scene) pending = pending.filter((l) => l.scene === Number(scene));

const jobs = pending.slice(0, n).map((l) => ({
  lineId: l.lineId,
  scene: l.scene,
  speaker: l.speaker,
  delivery: l.delivery,
  voiceId: cast.characters[l.speaker].voice.voiceId,
  prompt: `${TAG[l.delivery] ?? '[calm]'} ${l.text}`,
}));

console.log(JSON.stringify(jobs, null, 1));
console.error(`\n${jobs.length} job(s); ${pending.length} pending overall`);
