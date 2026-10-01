import React from 'react';
import {color} from '../design-system/theme';
import {useSvgId} from '../utils/useSvgId';
import {Pt, add, capsulePath, dirDown, len, lerpPt, mul, pt, smoothPath, sub} from '../utils/geometry';

/**
 * Poseable capsule-mannequin — the recurring "character" of the video.
 *
 * Coordinates: local units, origin on the ground between the feet, y grows downward,
 * full height ≈ 900 units. `rig()` exposes every joint so scenes can attach labels,
 * arrows and highlights to moving structures.
 *
 * Sides are always the PATIENT's sides: in the front view the patient's right is on the
 * viewer's left, in the back view it is on the viewer's right.
 */
export type View = 'front' | 'back' | 'side';

export type Pose = {
  rAbd: number; lAbd: number; // shoulder abduction, degrees from vertical
  rElbow: number; lElbow: number; // in-plane elbow bend (front/back view), + toward midline
  rPalm: number; lPalm: number; // 0 = palm forward, 90 = palm facing medially, 180 = palm backward
  rForeFwd: number; lForeFwd: number; // 0..1 blend to "elbow flexed 90°, forearm pointing forward"
  rRot: number; lRot: number; // humeral rotation in fore-forward mode, + = medial
  rShrug: number; lShrug: number; // shoulder elevation (units, + = up)
  legSpread: number; // degrees each leg away from midline
  toeOut: number; // degrees the feet are turned out
  slouch: number; // 0..1
  fingers: number; // 0 = straight & together, 1 = relaxed/curled apart
  // side view
  sFlex: number; // shoulder flexion, + forward
  eFlex: number; // elbow flexion
  hipFlex: number;
  kneeFlex: number;
  ankle: number; // + dorsiflexion, − plantar flexion
};

export const ANATOMICAL: Pose = {
  rAbd: 9, lAbd: 9, rElbow: 0, lElbow: 0, rPalm: 0, lPalm: 0, rForeFwd: 0, lForeFwd: 0, rRot: 0, lRot: 0,
  rShrug: 0, lShrug: 0, legSpread: 1.5, toeOut: 0, slouch: 0, fingers: 0,
  sFlex: 0, eFlex: 0, hipFlex: 0, kneeFlex: 0, ankle: 0,
};

export const RELAXED: Pose = {
  ...ANATOMICAL, rAbd: 6, lAbd: 6, rElbow: 6, lElbow: 6, rPalm: 95, lPalm: 95, legSpread: 5, toeOut: 22, slouch: 1, fingers: 1,
};

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
};

const L = {upper: 175, fore: 160, hand: 78, thigh: 222, shin: 212};

export type Rig = ReturnType<typeof rig>;

export const rig = (view: View, p: Pose) => {
  if (view === 'side') return sideRig(p);
  return frontRig(view, p);
};

const frontRig = (view: 'front' | 'back', p: Pose) => {
  const sR = view === 'front' ? -1 : 1; // lateral sign of patient's right side on screen
  const sL = -sR;
  const slouchDrop = p.slouch * 10;
  const arm = (s: number, abd: number, elbow: number, shrug: number, foreFwd: number, rot: number) => {
    const S = pt(s * (108 - p.slouch * 5), -722 + slouchDrop - shrug);
    const d1 = pt(s * Math.sin((abd * Math.PI) / 180), Math.cos((abd * Math.PI) / 180));
    const E = add(S, mul(d1, L.upper));
    const a2 = ((abd - elbow) * Math.PI) / 180;
    const d2 = pt(s * Math.sin(a2), Math.cos(a2));
    const Wn = add(E, mul(d2, L.fore));
    // forearm pointing at viewer, rotated about the humeral axis (+ medial)
    const r = (rot * Math.PI) / 180;
    const Wf = add(E, pt(-s * Math.sin(r) * L.fore, 16 + (1 - Math.cos(r)) * 6));
    const W = lerpPt(Wn, Wf, foreFwd);
    return {S, E, W, s};
  };
  const leg = (s: number) => {
    const H = pt(s * 52, -468);
    const d = dirDown(s * p.legSpread);
    const K = add(H, mul(d, L.thigh));
    const A = add(K, mul(d, L.shin));
    return {H, K, A, s};
  };
  return {
    view,
    head: pt(0, -842 + slouchDrop * 1.6),
    neck: pt(0, -760 + slouchDrop),
    navel: pt(0, -540),
    sternum: pt(0, -650),
    midTop: pt(0, -905),
    midBottom: pt(0, 0),
    r: {...arm(sR, p.rAbd, p.rElbow, p.rShrug, p.rForeFwd, p.rRot), ...prefix(leg(sR))},
    l: {...arm(sL, p.lAbd, p.lElbow, p.lShrug, p.lForeFwd, p.lRot), ...prefix(leg(sL))},
  };
};

const prefix = (lg: {H: Pt; K: Pt; A: Pt; s: number}) => ({H: lg.H, K: lg.K, A: lg.A});

const sideRig = (p: Pose) => {
  const S = pt(-6, -718 + p.slouch * 8);
  const d1 = dirDown(p.sFlex);
  const E = add(S, mul(d1, L.upper));
  const d2 = dirDown(p.sFlex + p.eFlex);
  const W = add(E, mul(d2, L.fore));
  const H = pt(-4, -470);
  const dt = dirDown(p.hipFlex);
  const K = add(H, mul(dt, L.thigh));
  const ds = dirDown(p.hipFlex - p.kneeFlex);
  const A = add(K, mul(ds, L.shin));
  const arm = {S, E, W, s: 1};
  const leg = {H, K, A};
  return {
    view: 'side' as const,
    head: pt(8 + p.slouch * 14, -842 + p.slouch * 12),
    neck: pt(0, -760),
    navel: pt(52, -540),
    sternum: pt(58, -650),
    midTop: pt(0, -905),
    midBottom: pt(0, 0),
    r: {...arm, ...leg},
    l: {...arm, ...leg},
  };
};

type Part = {key: string; d: string; fill: string; stroke?: string};

const SKIN = 'url(#mq-skin)';
const SHORTS = '#2E4152';
const HAIR = '#2A3946';

export const handPath = (W: Pt, dir: Pt, palm: number, lateral: number, fromBack: boolean, fingers: number, lengthK = 1) => {
  // local frame: u = along limb, v = across (toward lateral side)
  const u = mul(dir, 1 / (len(dir) || 1));
  // perpendicular that points to the lateral (thumb) side when the arm hangs down
  const latV = lateral > 0 ? pt(u.y, -u.x) : pt(-u.y, u.x);
  const a = (palm * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const w = 17 * Math.abs(ca) + 8 * Math.abs(sa) + 3;
  const hl = L.hand * lengthK;
  const P = (along: number, across: number) => add(W, add(mul(u, along), mul(latV, across)));
  const spread = fingers * 6;
  const outline = smoothPath(
    [P(2, -w + 2), P(hl * 0.55, -w - spread * 0.4), P(hl * 0.96, -w * 0.55 - spread), P(hl, 0), P(hl * 0.96, w * 0.55 + spread), P(hl * 0.55, w + spread * 0.4), P(2, w - 2)],
    true,
    0.5,
  );
  const palmVisible = fromBack ? ca < 0 : ca > 0;
  const thumbBase = P(14, w * 0.92 * ca);
  const thumbTip = P(44 + fingers * 4, (w + 12) * ca + fingers * 4 * Math.sign(ca || 1));
  const thumbInFront = fromBack ? sa < 0 : sa >= 0;
  const fingerLines = Math.abs(ca) > 0.45 ? [-0.5, 0, 0.5].map((k) => [P(hl * 0.52, k * w * 0.95), P(hl * 0.93, k * w * 0.8 + k * spread)]) : [];
  return {outline, palmVisible, thumb: capsulePath(thumbBase, 7.5, thumbTip, 6), thumbInFront, fingerLines};
};

export const Mannequin: React.FC<{
  view?: View;
  pose?: Partial<Pose>;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  ghost?: string; // render as outline only, in this colour
  highlight?: Record<string, string>; // part key → outline colour (rArm, lArm, rLeg, lLeg, torso, head, rHand, lHand)
  id?: string;
  shadow?: boolean;
  rotate?: number; // whole-figure rotation (deg) about the feet
  scaleX?: number; // horizontal squash for 2.5D turns
  children?: React.ReactNode; // overlays drawn in figure-local coordinates
}> = ({view = 'front', pose = {}, x = 960, y = 1000, scale = 1, opacity = 1, ghost, highlight = {}, id = 'mq', shadow = true, rotate = 0, scaleX = 1, children}) => {
  const gid = useSvgId('mq');
  const p = {...ANATOMICAL, ...pose};
  const R = rig(view, p);
  const parts: Part[] = [];
  const fromBack = view === 'back';

  if (view === 'side') {
    buildSide(parts, R as ReturnType<typeof sideRig>, p);
  } else {
    buildFront(parts, R as ReturnType<typeof frontRig>, p, fromBack);
  }

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale * scaleX} ${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id={`${gid}-skin`} x1="0" x2="1" y1="0" y2="0.25">
          <stop offset="0" stopColor={color.skinLight} />
          <stop offset="0.55" stopColor={color.skin} />
          <stop offset="1" stopColor={color.skinShade} />
        </linearGradient>
        <linearGradient id={`${gid}-palm`} x1="0" x2="1">
          <stop offset="0" stopColor="#F7E2D3" />
          <stop offset="1" stopColor="#E9C9B5" />
        </linearGradient>
      </defs>
      {!ghost && shadow ? <ellipse cx={0} cy={6} rx={150} ry={16} fill="rgba(0,0,0,0.28)" /> : null}
      {parts.map((pp, i) => (
        <path
          key={i}
          d={pp.d}
          fill={ghost ? 'none' : pp.fill.replace('#mq-', `#${gid}-`)}
          stroke={ghost ? ghost : pp.stroke ?? color.skinLine}
          strokeWidth={ghost ? 2.5 / scale : pp.stroke === 'none' ? 0 : 2.2}
          strokeDasharray={ghost ? `${8 / scale} ${7 / scale}` : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {Object.entries(highlight).map(([key, c]) =>
        parts
          .filter((pp) => pp.key === key || (key.endsWith('Arm') && pp.key === key.replace('Arm', 'Hand')))
          .map((pp, i) => (
            <path key={key + i} d={pp.d} fill={c} fillOpacity={0.18} stroke={c} strokeWidth={5 / scale} strokeLinejoin="round" />
          )),
      )}
      {children ? <g id={id}>{children}</g> : null}
    </g>
  );
};

const buildFront = (parts: Part[], R: ReturnType<typeof frontRig>, p: Pose, fromBack: boolean) => {
  const sides = [
    {k: 'r', j: R.r, palm: p.rPalm, foreFwd: p.rForeFwd},
    {k: 'l', j: R.l, palm: p.lPalm, foreFwd: p.lForeFwd},
  ];
  // legs
  for (const {k, j} of sides) {
    parts.push({key: k + 'Leg', d: capsulePath(j.H, 44, j.K, 27), fill: SKIN});
    parts.push({key: k + 'Leg', d: capsulePath(j.K, 27, j.A, 15), fill: SKIN});
    const s = j.H.x > 0 ? 1 : -1;
    const toe = p.toeOut;
    const fx = j.A.x + s * (3 + toe * 0.35);
    const rx = 20 + 15 * Math.sin((toe * Math.PI) / 180);
    parts.push({key: k + 'Foot', d: ellipsePath(pt(fx, j.A.y + 22), rx, 14, s * toe * 0.5), fill: SKIN});
  }
  // torso
  const half = [pt(22, -752), pt(72, -736), pt(104, -716), pt(90, -662), pt(84, -606), pt(68, -545), pt(80, -495), pt(94, -455), pt(62, -418)];
  const slDrop = p.slouch * 8;
  const torsoPts = [
    ...half.map((q) => pt(q.x, q.y + (q.y < -700 ? slDrop : 0))),
    pt(0, -412),
    ...[...half].reverse().map((q) => pt(-q.x, q.y + (q.y < -700 ? slDrop : 0))),
  ];
  // apply shrug to shoulder outline points
  const shrugR = p.rShrug, shrugL = p.lShrug;
  const adj = torsoPts.map((q) => {
    if (q.y > -700) return q;
    const isRightScreen = q.x > 0;
    const patientRightOnScreenRight = fromBack;
    const isPatientRight = patientRightOnScreenRight ? isRightScreen : !isRightScreen;
    const sh = isPatientRight ? shrugR : shrugL;
    const k = Math.min(1, Math.abs(q.x) / 104);
    return pt(q.x, q.y - sh * k);
  });
  parts.push({key: 'torso', d: smoothPath(adj, true, 0.45), fill: SKIN});
  // shorts (pelvis + two leg openings that follow the thighs)
  parts.push({key: 'shorts', d: smoothPath([pt(-82, -508), pt(82, -508), pt(96, -450), pt(60, -416), pt(0, -410), pt(-60, -416), pt(-96, -450)], true, 0.35), fill: SHORTS, stroke: '#1C2A36'});
  for (const {j} of sides) {
    const d = sub(j.K, j.H);
    const e = add(j.H, mul(d, 92 / len(d)));
    parts.push({key: 'shorts', d: capsulePath(j.H, 46, e, 36), fill: SHORTS, stroke: '#1C2A36'});
  }
  parts.push({key: 'shorts', d: smoothPath([pt(-84, -506), pt(84, -506), pt(92, -470), pt(-92, -470)], true, 0.2), fill: SHORTS, stroke: 'none'});
  // body landmarks
  if (!fromBack) {
    parts.push({key: 'detail', d: ellipsePath(R.navel, 3.5, 5, 0), fill: color.skinShade, stroke: 'none'});
    parts.push({key: 'detail', d: `M-34 ${-650} Q0 ${-628} 34 ${-650}`, fill: 'none', stroke: 'rgba(156,135,112,0.55)'});
  } else {
    parts.push({key: 'detail', d: `M0 -740 L0 -520`, fill: 'none', stroke: 'rgba(156,135,112,0.6)'});
    for (const s of [-1, 1]) {
      parts.push({key: 'detail', d: `M${s * 30} ${-700 - (s > 0 ? shrugL : shrugR) * 0.5 * (fromBack ? -1 : 1) * 0} Q${s * 62} ${-690} ${s * 52} ${-620}`, fill: 'none', stroke: 'rgba(156,135,112,0.5)'});
    }
  }
  // neck + head
  parts.push({key: 'neck', d: capsulePath(pt(0, -790 + p.slouch * 14), 23, R.neck, 26), fill: SKIN});
  const H = R.head;
  parts.push({key: 'head', d: ellipsePath(pt(-50, H.y + 6), 9, 15, 0), fill: SKIN});
  parts.push({key: 'head', d: ellipsePath(pt(50, H.y + 6), 9, 15, 0), fill: SKIN});
  parts.push({key: 'head', d: ellipsePath(H, 50, 62, 0), fill: SKIN});
  if (!fromBack) {
    parts.push({key: 'hair', d: `M${-51} ${H.y - 4} C${-58} ${H.y - 96} ${58} ${H.y - 96} ${51} ${H.y - 4} C${44} ${H.y - 34} ${20} ${H.y - 44} ${-4} ${H.y - 40} C${-26} ${H.y - 38} ${-44} ${H.y - 30} ${-51} ${H.y - 4}Z`, fill: HAIR, stroke: '#1C2731'});
    parts.push({key: 'face', d: ellipsePath(pt(-18, H.y + 2), 4.5, 6, 0), fill: '#2A3946', stroke: 'none'});
    parts.push({key: 'face', d: ellipsePath(pt(18, H.y + 2), 4.5, 6, 0), fill: '#2A3946', stroke: 'none'});
    parts.push({key: 'face', d: `M-3 ${H.y + 12} Q0 ${H.y + 26} 5 ${H.y + 26}`, fill: 'none', stroke: 'rgba(156,135,112,0.8)'});
    parts.push({key: 'face', d: `M-11 ${H.y + 40} Q0 ${H.y + 45} 11 ${H.y + 40}`, fill: 'none', stroke: 'rgba(156,135,112,0.8)'});
  } else {
    parts.push({key: 'hair', d: `M${-51} ${H.y + 18} C${-62} ${H.y - 98} ${62} ${H.y - 98} ${51} ${H.y + 18} C${30} ${H.y + 30} ${-30} ${H.y + 30} ${-51} ${H.y + 18}Z`, fill: HAIR, stroke: '#1C2731'});
  }
  // arms (after torso so they read in front of it)
  for (const {k, j, palm, foreFwd} of sides) {
    const s = j.S.x > 0 ? 1 : -1;
    const lateral = s;
    parts.push({key: k + 'Arm', d: capsulePath(j.S, 30, j.E, 19), fill: SKIN});
    const foreLen = len(sub(j.W, j.E));
    const foreDir = foreLen > 1 ? sub(j.W, j.E) : pt(0, 1);
    const hk = Math.max(0.3, Math.min(1, foreLen / L.fore));
    const hand = handPath(j.W, foreDir, foreFwd > 0.5 ? 90 : palm, lateral, fromBack, p.fingers, foreFwd > 0 ? 0.55 + 0.45 * hk : 1);
    if (!hand.thumbInFront) parts.push({key: k + 'Hand', d: hand.thumb, fill: SKIN});
    parts.push({key: k + 'Arm', d: capsulePath(j.E, 19.5, j.W, 14), fill: SKIN});
    parts.push({key: k + 'Hand', d: hand.outline, fill: hand.palmVisible ? 'url(#mq-palm)' : SKIN});
    hand.fingerLines.forEach(([a, b]) => parts.push({key: k + 'Hand', d: `M${a.x} ${a.y} L${b.x} ${b.y}`, fill: 'none', stroke: 'rgba(156,135,112,0.55)'}));
    if (hand.thumbInFront) parts.push({key: k + 'Hand', d: hand.thumb, fill: SKIN});
    // deltoid cap
    parts.push({key: k + 'Arm', d: ellipsePath(add(j.S, pt(s * 4, 4)), 30, 30, 0), fill: SKIN, stroke: 'none'});
  }
};

const buildSide = (parts: Part[], R: ReturnType<typeof sideRig>, p: Pose) => {
  const {H, K, A, S, E, W} = R.r;
  const footPts = (ax: Pt, ankle: number, dx = 0) => {
    const rot = (q: Pt) => {
      const a = (-ankle * Math.PI) / 180;
      const v = sub(q, ax);
      return add(ax, pt(v.x * Math.cos(a) - v.y * Math.sin(a), v.x * Math.sin(a) + v.y * Math.cos(a)));
    };
    return smoothPath(
      [pt(ax.x - 22 + dx, ax.y - 6), pt(ax.x - 26 + dx, ax.y + 18), pt(ax.x + 10 + dx, ax.y + 26), pt(ax.x + 70 + dx, ax.y + 26), pt(ax.x + 76 + dx, ax.y + 16), pt(ax.x + 30 + dx, ax.y + 2), pt(ax.x + 12 + dx, ax.y - 16)].map(rot),
      true,
      0.45,
    );
  };
  // far leg (depth cue)
  const fH = add(H, pt(10, 0)), fK = add(K, pt(10, 0)), fA = add(A, pt(10, 0));
  parts.push({key: 'farLeg', d: capsulePath(fH, 42, fK, 26), fill: color.skinShade});
  parts.push({key: 'farLeg', d: capsulePath(fK, 26, fA, 15), fill: color.skinShade});
  parts.push({key: 'farLeg', d: footPts(fA, 0), fill: color.skinShade});
  // torso
  parts.push({
    key: 'torso',
    d: smoothPath([pt(-18, -756), pt(22, -752), pt(48, -706), pt(60, -650), pt(50, -590), pt(46, -540), pt(52, -480), pt(40, -420), pt(-30, -420), pt(-64, -452), pt(-50, -520), pt(-40, -570), pt(-56, -650), pt(-46, -720)], true, 0.45),
    fill: SKIN,
  });
  parts.push({key: 'rLeg', d: capsulePath(H, 44, K, 27), fill: SKIN});
  parts.push({key: 'rLeg', d: capsulePath(K, 27, A, 15), fill: SKIN});
  parts.push({key: 'rFoot', d: footPts(A, p.ankle), fill: SKIN});
  const dTh = sub(K, H);
  parts.push({key: 'shorts', d: smoothPath([pt(-52, -510), pt(50, -510), pt(54, -460), pt(40, -420), pt(-30, -416), pt(-66, -452)], true, 0.35), fill: SHORTS, stroke: '#1C2A36'});
  parts.push({key: 'shorts', d: capsulePath(H, 47, add(H, mul(dTh, 90 / len(dTh))), 37), fill: SHORTS, stroke: '#1C2A36'});
  // neck & head (profile facing +x)
  const Hd = R.head;
  parts.push({key: 'neck', d: capsulePath(pt(4 + p.slouch * 8, -786), 23, pt(0, -748), 26), fill: SKIN});
  parts.push({
    key: 'head',
    d: smoothPath([pt(Hd.x - 50, Hd.y - 4), pt(Hd.x - 34, Hd.y - 52), pt(Hd.x + 8, Hd.y - 64), pt(Hd.x + 44, Hd.y - 38), pt(Hd.x + 50, Hd.y - 8), pt(Hd.x + 62, Hd.y + 8), pt(Hd.x + 50, Hd.y + 18), pt(Hd.x + 48, Hd.y + 40), pt(Hd.x + 30, Hd.y + 60), pt(Hd.x - 10, Hd.y + 56), pt(Hd.x - 42, Hd.y + 34)], true, 0.5),
    fill: SKIN,
  });
  parts.push({key: 'hair', d: `M${Hd.x - 50} ${Hd.y + 6} C${Hd.x - 54} ${Hd.y - 60} ${Hd.x + 10} ${Hd.y - 84} ${Hd.x + 44} ${Hd.y - 36} C${Hd.x + 20} ${Hd.y - 44} ${Hd.x - 4} ${Hd.y - 36} ${Hd.x - 14} ${Hd.y - 16} C${Hd.x - 24} ${Hd.y - 2} ${Hd.x - 36} ${Hd.y + 12} ${Hd.x - 50} ${Hd.y + 6}Z`, fill: HAIR, stroke: '#1C2731'});
  parts.push({key: 'head', d: ellipsePath(pt(Hd.x - 12, Hd.y + 6), 9, 14, 0), fill: SKIN});
  parts.push({key: 'face', d: ellipsePath(pt(Hd.x + 34, Hd.y - 4), 4, 5.5, 0), fill: '#2A3946', stroke: 'none'});
  // arm (near side)
  const dir2 = sub(W, E);
  const u = mul(dir2, 1 / (len(dir2) || 1));
  parts.push({key: 'rArm', d: capsulePath(S, 30, E, 19), fill: SKIN});
  parts.push({key: 'rArm', d: capsulePath(E, 19.5, W, 14), fill: SKIN});
  const n = pt(-u.y, u.x);
  const hp = (a: number, b: number) => add(W, add(mul(u, a), mul(n, b)));
  parts.push({key: 'rHand', d: smoothPath([hp(0, -12), hp(40, -14), hp(74, -8), hp(80, 2), hp(70, 9), hp(30, 12), hp(2, 11)], true, 0.5), fill: SKIN});
  parts.push({key: 'rHand', d: capsulePath(hp(12, 9), 7, hp(40, 16), 6), fill: SKIN});
  parts.push({key: 'rArm', d: ellipsePath(add(S, pt(2, 2)), 31, 31, 0), fill: SKIN, stroke: 'none'});
  void p;
};

export const ellipsePath = (c: Pt, rx: number, ry: number, rotDeg: number) => {
  const pts: Pt[] = [];
  const r = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2;
    const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
    pts.push(pt(c.x + x * Math.cos(r) - y * Math.sin(r), c.y + x * Math.sin(r) + y * Math.cos(r)));
  }
  return smoothPath(pts, true, 0.52);
};

/** Convert a figure-local point to stage coordinates for a mannequin placed at (x, y, scale). */
export const toStage = (q: Pt, x: number, y: number, scale: number): Pt => pt(x + q.x * scale, y + q.y * scale);
