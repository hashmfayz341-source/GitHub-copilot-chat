/**
 * Shared rigging vocabulary for the three V2 characters.
 *
 * Deliberately limited animation: a small set of named states driven by props,
 * not a raster frame per pose. Timing, eye direction, reaction and gesture carry
 * the performance — not phoneme-accurate mouth shapes.
 */

export type Expression =
  | 'idle'
  | 'talk'
  | 'smileSmall'
  | 'concern'
  | 'deadpan'
  | 'confused'
  | 'surprised'
  | 'smirk'
  | 'dramatic'
  | 'dry'
  | 'sing';

export type Look = 'center' | 'left' | 'right' | 'up' | 'down' | 'partner';

export type Gesture =
  | 'none'
  | 'teach'        // open palm, explaining
  | 'point'        // index finger at the model
  | 'pointUp'      // correction finger (Noura's signature)
  | 'phone'        // holding / showing the phone
  | 'handOnHip'
  | 'bothOpen'     // "what do you want from me"
  | 'thinking';

export type Pose = 'stand' | 'leanIn' | 'leanBack' | 'stepForward';

export type RigProps = {
  /** 0..1 — how open the mouth is this frame. */
  mouth?: number;
  /** 0..1 — 1 is fully shut (a blink). */
  blink?: number;
  expression?: Expression;
  look?: Look;
  gesture?: Gesture;
  pose?: Pose;
  /** Mirror the whole character (so two characters can face each other). */
  flip?: boolean;
  /** Uniform scale applied around the character's feet. */
  scale?: number;
  x?: number;
  y?: number;
  /** Subtle idle breathing offset, usually derived from the frame. */
  breath?: number;
};

/** Deterministic blink: a short shut around every `period` frames. */
export const blinkAt = (frame: number, period = 112, phase = 0, len = 5) => {
  const t = (frame + phase) % period;
  if (t >= len) return 0;
  // 0 → 1 → 0 over `len` frames
  return Math.sin((t / len) * Math.PI);
};

/**
 * Limited-animation mouth. When speaking, it opens on a couple of
 * incommensurate sine waves so it never visibly loops; when silent it rests shut.
 */
export const mouthAt = (frame: number, speaking: boolean, phase = 0) => {
  if (!speaking) return 0;
  const a = Math.sin((frame + phase) * 0.55);
  const b = Math.sin((frame + phase) * 0.91 + 1.3);
  return Math.max(0, Math.min(1, 0.45 + 0.34 * a + 0.2 * b));
};

/** Gentle idle breathing, in px. */
export const breathAt = (frame: number, phase = 0, amp = 3) =>
  Math.sin((frame + phase) * 0.045) * amp;

/** Eye offset in px for a look direction. */
export const lookOffset = (look: Look): {x: number; y: number} => {
  switch (look) {
    case 'left': return {x: -5, y: 0};
    case 'right': return {x: 5, y: 0};
    case 'up': return {x: 0, y: -4};
    case 'down': return {x: 0, y: 4};
    case 'partner': return {x: 4, y: 1};
    default: return {x: 0, y: 0};
  }
};

/** Brow shape per expression: [innerY, outerY, angle] offsets. */
export const browFor = (e: Expression) => {
  switch (e) {
    case 'surprised': return {inner: -7, outer: -7, tilt: 0};
    case 'confused': return {inner: -5, outer: 3, tilt: -8};
    case 'concern': return {inner: -4, outer: 2, tilt: -5};
    case 'deadpan': return {inner: 1, outer: 1, tilt: 0};
    case 'dry': return {inner: 2, outer: -2, tilt: 4};
    case 'smirk': return {inner: 0, outer: -3, tilt: 3};
    case 'dramatic': return {inner: -8, outer: 1, tilt: -10};
    case 'smileSmall': return {inner: -1, outer: -2, tilt: 0};
    case 'sing': return {inner: -6, outer: -4, tilt: -2};
    default: return {inner: 0, outer: 0, tilt: 0};
  }
};

/** Mouth curve (positive = smile, negative = frown) per expression. */
export const mouthCurveFor = (e: Expression) => {
  switch (e) {
    case 'smileSmall': return 5;
    case 'smirk': return 6;
    case 'surprised': return 0;
    case 'confused': return -3;
    case 'concern': return -4;
    case 'deadpan': return 0;
    case 'dry': return 2;
    case 'dramatic': return -2;
    case 'sing': return 3;
    default: return 2;
  }
};
