/**
 * ElevenLabs provider.
 *
 * Credentials: ELEVENLABS_API_KEY. The MCP connector in a chat session is NOT a
 * scriptable path, so without an API key this adapter reports unavailable and
 * the runner moves to the next provider. That is the whole point: an ElevenLabs
 * outage, tier block or missing key must never stop the project.
 */
import fs from 'node:fs';
import path from 'node:path';

export const id = 'elevenlabs';
export const label = 'ElevenLabs';
export const synthesizes = true;

const BASE = process.env.ELEVENLABS_BASE_URL ?? 'https://api.elevenlabs.io/v1';

export const available = () =>
  process.env.ELEVENLABS_API_KEY
    ? {ok: true, reason: 'ELEVENLABS_API_KEY present'}
    : {ok: false, reason: 'ELEVENLABS_API_KEY is not set (the chat MCP connector is not scriptable)'};

/** Neutral delivery → this vendor's inline audio tag. */
const TAG = {calm: '[calm]', casual: '[casually]', dry: '[dryly]', singing: '[singing]'};

export const synthesize = async ({line, binding, outDir}) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return {ok: false, reason: 'ELEVENLABS_API_KEY is not set'};

  const model = binding.model ?? 'eleven_v3';
  // v3 takes direction as an inline tag; older models have no such channel.
  const prompt = model.startsWith('eleven_v3') ? `${TAG[line.delivery] ?? ''} ${line.text}`.trim() : line.text;

  const res = await fetch(`${BASE}/text-to-speech/${binding.voiceId}`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({text: prompt, model_id: model}),
  });
  if (!res.ok) return {ok: false, reason: `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`};

  fs.mkdirSync(outDir, {recursive: true});
  const rawFile = path.join(outDir, `${line.lineId}.raw.mp3`);
  fs.writeFileSync(rawFile, Buffer.from(await res.arrayBuffer()));
  return {ok: true, rawFile, meta: {provider: id, model, voiceId: binding.voiceId}};
};
