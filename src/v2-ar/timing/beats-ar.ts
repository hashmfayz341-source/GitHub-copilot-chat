import timing from './timing-ar.json';
import {FPS_AR} from '../design/theme-ar';

export type LineTiming = {
  lineId: string;
  idx: number;
  speaker: 'Rashid' | 'Salem' | 'Noura';
  text: string;
  pauseAfter: number;
  gapAfter: number;
  gapSource: string;
  status: string;
  audioFile?: string;
  duration?: number;
  start?: number;
  end?: number;
  startFrame?: number;
  endFrame?: number;
};

export type SceneTimingAR = {
  scene: number;
  lines: LineTiming[];
  duration: number;
  durationInFrames?: number;
  status: 'ready' | 'pending';
  linesFinal: number;
  linesTotal: number;
};

/**
 * The animation's entire view of the voice track: a path, a duration, and the
 * frames derived from them. Which provider produced the audio — ElevenLabs,
 * OpenAI, or a person at a microphone — is deliberately not represented here
 * and must never be added, so re-sourcing a voice cannot reach the animation.
 */
const data = timing as unknown as {
  fps: number;
  cast: Record<string, {characterId: string; displayNameAr: string}>;
  scenes: Record<string, SceneTimingAR>;
};

export const sceneAR = (n: number): SceneTimingAR => {
  const s = data.scenes[String(n)];
  if (!s) throw new Error(`No V2 timing for scene ${n}`);
  return s;
};

export const sceneReadyAR = (n: number) => sceneAR(n).status === 'ready';

export const sceneFramesAR = (n: number) => {
  const s = sceneAR(n);
  // A scene whose audio is not final yet still needs a non-zero length so the
  // composition can mount and show an explicit "awaiting audio" state rather
  // than collapsing to zero frames.
  return s.durationInFrames ?? 90;
};

/**
 * Line-level cue points for a scene, driven entirely by the real audio.
 *
 *   const L = useLinesAR(1);
 *   L.at('L003')        → frame that line starts
 *   L.end('L003')       → frame it finishes
 *   L.at('L003', 0.4)   → 0.4 s after it starts
 *   L.mid('L003')       → halfway through
 *   L.after('L003')     → frame the following line starts (start + gap)
 */
export const useLinesAR = (sceneNo: number) => {
  const s = sceneAR(sceneNo);
  const byId = new Map(s.lines.map((l) => [l.lineId, l]));
  const get = (id: string) => {
    const l = byId.get(id);
    if (!l) throw new Error(`Unknown line "${id}" in scene ${sceneNo}`);
    if (l.start === undefined) throw new Error(`Line "${id}" has no audio yet`);
    return l;
  };
  const fn = (id: string, offsetSec = 0) => Math.round((get(id).start! + offsetSec) * FPS_AR);
  fn.at = fn;
  fn.end = (id: string, offsetSec = 0) => Math.round((get(id).end! + offsetSec) * FPS_AR);
  fn.mid = (id: string) => {
    const l = get(id);
    return Math.round(((l.start! + l.end!) / 2) * FPS_AR);
  };
  fn.after = (id: string) => Math.round((get(id).end! + get(id).gapAfter) * FPS_AR);
  fn.len = (id: string) => Math.round((get(id).end! - get(id).start!) * FPS_AR);
  fn.line = (id: string) => get(id);
  fn.lines = s.lines;
  fn.duration = sceneFramesAR(sceneNo);
  fn.ready = s.status === 'ready';
  return fn;
};

export type LinesAR = ReturnType<typeof useLinesAR>;
export const timingDataAR = data;
