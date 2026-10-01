/**
 * OpenAI TTS provider.
 *
 * Credentials: OPENAI_API_KEY. Optional OPENAI_BASE_URL for a proxy or a
 * compatible endpoint.
 *
 * The neutral `generationInstructions`, `speed` and `style` from the cast
 * manifest are rendered into this vendor's own shape here and nowhere else.
 */
import fs from 'node:fs';
import path from 'node:path';

export const id = 'openai';
export const label = 'OpenAI TTS';
export const synthesizes = true;

const BASE = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

export const available = () =>
  process.env.OPENAI_API_KEY
    ? {ok: true, reason: 'OPENAI_API_KEY present'}
    : {ok: false, reason: 'OPENAI_API_KEY is not set'};

/** Neutral direction → this vendor's `instructions` field. */
const instructionsFor = (binding, line, pronunciation) => {
  const bits = [binding.generationInstructions];
  if (binding.style?.tone) bits.push(`Tone: ${binding.style.tone}.`);
  if (line.delivery === 'singing') bits.push('This line is sung briefly and informally, not performed.');
  const keep = pronunciation?.keepEnglish ?? [];
  if (keep.length) bits.push('Pronounce any English medical term in English; never Arabize or translate it.');
  for (const o of pronunciation?.overrides ?? []) {
    if (line.text.includes(o.term)) bits.push(`Pronounce "${o.term}" as ${o.say}.`);
  }
  return bits.filter(Boolean).join(' ');
};

export const synthesize = async ({line, binding, pronunciation, outDir}) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return {ok: false, reason: 'OPENAI_API_KEY is not set'};

  const fmt = binding.outputFormat?.container === 'wav' ? 'wav' : 'mp3';
  const body = {
    model: binding.model ?? 'gpt-4o-mini-tts',
    voice: binding.voiceId,
    input: line.text,
    instructions: instructionsFor(binding, line, pronunciation),
    speed: binding.speed ?? 1.0,
    response_format: fmt,
  };

  const res = await fetch(`${BASE}/audio/speech`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) return {ok: false, reason: `OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`};

  fs.mkdirSync(outDir, {recursive: true});
  const rawFile = path.join(outDir, `${line.lineId}.raw.${fmt}`);
  fs.writeFileSync(rawFile, Buffer.from(await res.arrayBuffer()));
  return {ok: true, rawFile, meta: {provider: id, model: body.model, voiceId: body.voice, speed: body.speed}};
};
