/**
 * Provider registry.
 *
 * Adding a provider is one file exporting { id, label, synthesizes, available,
 * synthesize } and one line here. Nothing outside scripts/voice/ changes, and
 * nothing in src/ changes at all.
 */
import * as elevenlabs from './elevenlabs.mjs';
import * as manual from './manual.mjs';
import * as openai from './openai.mjs';

export const PROVIDERS = {elevenlabs, openai, manual};

export const get = (id) => {
  const p = PROVIDERS[id];
  if (!p) throw new Error(`Unknown provider "${id}". Known: ${Object.keys(PROVIDERS).join(', ')}`);
  return p;
};

/** Every provider's current availability, in the cast manifest's priority order. */
export const survey = (priority) =>
  (priority ?? Object.keys(PROVIDERS)).map((id) => {
    const p = get(id);
    return {id, label: p.label, synthesizes: p.synthesizes, ...p.available()};
  });

/**
 * Pick the provider to use: an explicit choice if given, otherwise the first
 * available one in priority order. `manual` is always available, so this never
 * returns nothing — there is no state in which the project is stuck.
 */
export const choose = (priority, explicit) => {
  if (explicit) {
    const p = get(explicit);
    const a = p.available();
    if (!a.ok) throw new Error(`Provider "${explicit}" is not available: ${a.reason}`);
    return p;
  }
  for (const s of survey(priority)) if (s.ok) return get(s.id);
  return get('manual');
};

/** The cast binding for a character under a given provider. */
export const bindingFor = (cast, speaker, providerId) => {
  const ch = cast.characters[speaker];
  if (!ch) throw new Error(`No cast entry for "${speaker}"`);
  if (ch.voice.provider === providerId) return {...ch.voice, characterId: ch.characterId};
  const alt = (ch.voiceAlternates ?? []).find((b) => b.provider === providerId);
  if (!alt) throw new Error(`Character "${speaker}" has no binding for provider "${providerId}"`);
  return {...alt, characterId: ch.characterId};
};
