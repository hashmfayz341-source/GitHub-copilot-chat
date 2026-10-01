/**
 * Manual provider — human recordings.
 *
 * Always available, needs no network and no credentials. This is the floor the
 * project stands on: if every TTS vendor is unreachable or refuses, a person can
 * record the lines and the animation pipeline does not change by one line.
 *
 * It does not synthesize. It picks up a file a human already recorded from the
 * drop directory, matching on line id (L042.wav, L042.mp3, l042-take2.wav ...).
 */
import fs from 'node:fs';
import path from 'node:path';

export const id = 'manual';
export const label = 'Manual human recording';
export const synthesizes = false;

export const DROP_DIR = process.env.V2_VOICE_DROP ?? 'voice-drop';

export const available = () => ({ok: true, reason: `drop directory: ${DROP_DIR}`});

/** Find a recording for a line. Later takes win, so re-recording is just a new file. */
export const findDrop = (lineId, dir = DROP_DIR) => {
  if (!fs.existsSync(dir)) return null;
  const want = lineId.toLowerCase();
  const hits = fs
    .readdirSync(dir)
    .filter((f) => /\.(wav|mp3|m4a|flac|ogg|aac)$/i.test(f))
    .filter((f) => path.basename(f).toLowerCase().startsWith(want))
    .sort();
  return hits.length ? path.join(dir, hits[hits.length - 1]) : null;
};

export const synthesize = async ({line}) => {
  const src = findDrop(line.lineId);
  if (!src) return {ok: false, reason: `no recording for ${line.lineId} in ${DROP_DIR}/`};
  return {ok: true, rawFile: src, meta: {provider: id, source: src, recordedByHuman: true}};
};
