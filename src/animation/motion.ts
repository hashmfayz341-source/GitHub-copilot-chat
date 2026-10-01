import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../design-system/theme';

/** House easing curves — every animation uses one of these, so motion feels like one system. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.4, 0, 0.2, 1),
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 progress between frame `start` and `start + dur` with easing. */
export const progress = (frame: number, start: number, dur: number, easing = ease.inOut) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {...clamp, easing});

/** Map frame through keyframes [[frame, value], ...] with easing between each pair. */
export const keyframes = (frame: number, kf: Array<[number, number]>, easing = ease.inOut) => {
  if (kf.length === 1) return kf[0][1];
  const sorted = [...kf].sort((a, b) => a[0] - b[0]);
  if (frame <= sorted[0][0]) return sorted[0][1];
  for (let i = 0; i < sorted.length - 1; i++) {
    const [f0, v0] = sorted[i];
    const [f1, v1] = sorted[i + 1];
    if (frame <= f1) {
      if (f1 === f0) return v1;
      return interpolate(frame, [f0, f1], [v0, v1], {...clamp, easing});
    }
  }
  return sorted[sorted.length - 1][1];
};

/** Fade/slide-in followed by optional fade-out. Returns {opacity, y}. */
export const appear = (frame: number, start: number, opts: {dur?: number; out?: number; outDur?: number; dy?: number} = {}) => {
  const {dur = 18, out, outDur = 14, dy = 24} = opts;
  const pIn = progress(frame, start, dur, ease.out);
  const pOut = out === undefined ? 0 : progress(frame, out, outDur, ease.in);
  return {opacity: pIn * (1 - pOut), y: (1 - pIn) * dy - pOut * dy * 0.5, p: pIn * (1 - pOut)};
};

export const pop = (frame: number, start: number, fps = FPS) =>
  spring({frame: frame - start, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});

export const sec = (s: number) => Math.round(s * FPS);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
