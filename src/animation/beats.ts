import timing from '../video/timing.json';
import {FPS} from '../design-system/theme';

type BeatTiming = {start: number; end: number};
type SceneTiming = {duration: number; beats: Record<string, BeatTiming>};

const scenes = (timing as unknown as {scenes: Record<string, SceneTiming>}).scenes;

export const sceneDurationFrames = (sceneId: string) => {
  const s = scenes[sceneId];
  if (!s) throw new Error(`No timing for scene "${sceneId}" — run "npm run narrate"`);
  return Math.ceil(s.duration * FPS);
};

/**
 * Narration-synchronised cue points for a scene.
 *   const b = useBeats('coronal');
 *   b('divide')        → frame the narrator starts the "divide" beat
 *   b.end('divide')    → frame the beat finishes
 *   b('divide', 0.4)   → 0.4 s after the beat starts (offset in seconds)
 *   b.at('divide', 0.5)→ halfway through the beat
 */
export const useBeats = (sceneId: string) => {
  const s = scenes[sceneId];
  if (!s) throw new Error(`No timing for scene "${sceneId}"`);
  const get = (id: string): BeatTiming => {
    const t = s.beats[id];
    if (!t) throw new Error(`Unknown beat "${sceneId}.${id}"`);
    return t;
  };
  const fn = (id: string, offsetSec = 0) => Math.round((get(id).start + offsetSec) * FPS);
  fn.end = (id: string, offsetSec = 0) => Math.round((get(id).end + offsetSec) * FPS);
  fn.at = (id: string, fraction: number) => {
    const t = get(id);
    return Math.round((t.start + (t.end - t.start) * fraction) * FPS);
  };
  fn.len = (id: string) => Math.round((get(id).end - get(id).start) * FPS);
  fn.duration = Math.ceil(s.duration * FPS);
  return fn;
};

export type Beats = ReturnType<typeof useBeats>;
