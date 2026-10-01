export type Pt = {x: number; y: number};

export const pt = (x: number, y: number): Pt => ({x, y});
export const add = (a: Pt, b: Pt): Pt => ({x: a.x + b.x, y: a.y + b.y});
export const sub = (a: Pt, b: Pt): Pt => ({x: a.x - b.x, y: a.y - b.y});
export const mul = (a: Pt, k: number): Pt => ({x: a.x * k, y: a.y * k});
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
export const rad = (deg: number) => (deg * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;

/** Unit vector for an angle measured from "straight down" (0°), positive toward +x. */
export const dirDown = (angleDeg: number): Pt => ({x: Math.sin(rad(angleDeg)), y: Math.cos(rad(angleDeg))});

export const polar = (c: Pt, r: number, angleDeg: number): Pt => ({x: c.x + r * Math.cos(rad(angleDeg)), y: c.y + r * Math.sin(rad(angleDeg))});

const f = (n: number) => n.toFixed(2);

/**
 * Tapered capsule: the convex hull of two circles. This single primitive builds every
 * limb of the mannequin and matches the 3D capsule mannequin, keeping 2D and 3D scenes
 * in one visual language.
 */
export const capsulePath = (c1: Pt, r1: number, c2: Pt, r2: number): string => {
  const d = Math.max(0.001, len(sub(c2, c1)));
  if (d <= Math.abs(r1 - r2) + 0.01) {
    const big = r1 >= r2 ? {c: c1, r: r1} : {c: c2, r: r2};
    return circlePath(big.c, big.r);
  }
  const a = Math.atan2(c2.y - c1.y, c2.x - c1.x);
  const b = Math.acos((r1 - r2) / d);
  const p = (c: Pt, r: number, ang: number) => ({x: c.x + r * Math.cos(ang), y: c.y + r * Math.sin(ang)});
  const p1a = p(c1, r1, a + b);
  const p2a = p(c2, r2, a + b);
  const p2b = p(c2, r2, a - b);
  const p1b = p(c1, r1, a - b);
  const large2 = 2 * b > Math.PI ? 1 : 0;
  const large1 = 2 * Math.PI - 2 * b > Math.PI ? 1 : 0;
  return [
    `M${f(p1a.x)} ${f(p1a.y)}`,
    `L${f(p2a.x)} ${f(p2a.y)}`,
    `A${f(r2)} ${f(r2)} 0 ${large2} 0 ${f(p2b.x)} ${f(p2b.y)}`,
    `L${f(p1b.x)} ${f(p1b.y)}`,
    `A${f(r1)} ${f(r1)} 0 ${large1} 0 ${f(p1a.x)} ${f(p1a.y)}`,
    'Z',
  ].join(' ');
};

export const circlePath = (c: Pt, r: number) =>
  `M${f(c.x - r)} ${f(c.y)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;

/** Arc path (SVG) around centre c from angle a0 to a1 (degrees, screen space: 0 = +x, 90 = +y). */
export const arcPath = (c: Pt, r: number, a0: number, a1: number) => {
  const p0 = polar(c, r, a0);
  const p1 = polar(c, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${f(p0.x)} ${f(p0.y)} A${f(r)} ${f(r)} 0 ${large} ${sweep} ${f(p1.x)} ${f(p1.y)}`;
};

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
export const smoothPath = (pts: Pt[], closed = false, tension = 0.5) => {
  if (pts.length < 2) return '';
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f(P[1].x)} ${f(P[1].y)}`;
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const c1 = {x: p1.x + ((p2.x - p0.x) / 6) * tension * 2, y: p1.y + ((p2.y - p0.y) / 6) * tension * 2};
    const c2 = {x: p2.x - ((p3.x - p1.x) / 6) * tension * 2, y: p2.y - ((p3.y - p1.y) / 6) * tension * 2};
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? d + 'Z' : d;
};

/** Angle (deg) between two direction vectors. */
export const angleBetween = (a: Pt, b: Pt) => {
  const c = (a.x * b.x + a.y * b.y) / (len(a) * len(b) || 1);
  return deg(Math.acos(Math.max(-1, Math.min(1, c))));
};
