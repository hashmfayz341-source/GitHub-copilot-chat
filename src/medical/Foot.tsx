/**
 * Foot models.
 *  FootSide  – lateral view of the leg and foot; `ankle` + = dorsiflexion, − = plantar flexion.
 *  FeetFront – anterior view of both feet (2.5D: each foot has a visible sole band);
 *              `tilt` + = inversion (sole turns toward the midline), − = eversion.
 */
import React from 'react';
import {color} from '../design-system/theme';
import {Pt, add, capsulePath, pt, smoothPath, sub} from '../utils/geometry';

const rotAbout = (q: Pt, c: Pt, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const v = sub(q, c);
  return add(c, pt(v.x * Math.cos(a) - v.y * Math.sin(a), v.x * Math.sin(a) + v.y * Math.cos(a)));
};

export const FootSide: React.FC<{x: number; y: number; scale?: number; ankle: number; dorsumGlow?: number; soleGlow?: number}> = ({x, y, scale = 1, ankle, dorsumGlow = 0, soleGlow = 0}) => {
  const A = pt(0, 0);
  const R = (q: Pt) => rotAbout(q, A, -ankle);
  const outline = [pt(-34, -26), pt(-48, 26), pt(-30, 56), pt(60, 60), pt(170, 58), pt(196, 46), pt(184, 26), pt(120, 10), pt(60, -8), pt(22, -40)].map(R);
  const dorsum = [pt(22, -38), pt(60, -6), pt(120, 12), pt(184, 28)].map(R);
  const sole = [pt(-30, 58), pt(60, 62), pt(170, 60)].map(R);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={capsulePath(pt(-6, -420), 52, pt(-4, -20), 32)} fill={color.skin} stroke={color.skinLine} strokeWidth={3} />
      <path d={smoothPath(outline, true, 0.5)} fill={color.skin} stroke={color.skinLine} strokeWidth={3} />
      <circle cx={-4} cy={-14} r={15} fill={color.skinShade} opacity={0.7} />
      {dorsumGlow > 0 ? <path d={smoothPath(dorsum)} stroke={color.accent} strokeWidth={12} fill="none" strokeLinecap="round" opacity={dorsumGlow} /> : null}
      {soleGlow > 0 ? <path d={smoothPath(sole)} stroke={color.sagittal} strokeWidth={12} fill="none" strokeLinecap="round" opacity={soleGlow} /> : null}
      <circle cx={0} cy={0} r={7} fill={color.axis} />
    </g>
  );
};

/** One foot seen from the front, pivoting about the ankle. side −1 = patient's right (screen-left). */
const FrontFoot: React.FC<{cx: number; ankleY: number; tilt: number; side: number; soleArrow: number; highlightLateral?: number}> = ({cx, ankleY, tilt, side, soleArrow, highlightLateral = 0}) => {
  // inversion turns the sole normal (initially straight down) toward the midline: for the screen-left foot (medial = +x) that is a negative SVG rotation
  const deg = tilt * (side < 0 ? -1 : 1);
  const A = pt(cx, ankleY);
  const R = (q: Pt) => rotAbout(q, A, deg);
  const top = [pt(cx - 64, ankleY + 40), pt(cx - 40, ankleY + 6), pt(cx + 40, ankleY + 6), pt(cx + 64, ankleY + 40), pt(cx + 70, ankleY + 70), pt(cx - 70, ankleY + 70)].map(R);
  const soleBand = [pt(cx - 72, ankleY + 70), pt(cx + 72, ankleY + 70), pt(cx + 66, ankleY + 92), pt(cx - 66, ankleY + 92)].map(R);
  const toes = [-48, -24, 0, 24, 48].map((dx, i) => R(pt(cx + dx, ankleY + 66 - (i === 2 ? 2 : 0))));
  const sc = R(pt(cx, ankleY + 92));
  const n = R(pt(cx, ankleY + 200));
  const lat = R(pt(cx + side * 60, ankleY + 10));
  return (
    <g>
      <path d={capsulePath(pt(cx, ankleY - 330), 44, pt(cx, ankleY - 4), 30)} fill={color.skin} stroke={color.skinLine} strokeWidth={3} />
      {highlightLateral > 0 ? <circle cx={lat.x} cy={lat.y - 14} r={34} fill={color.danger} opacity={0.35 * highlightLateral} stroke={color.danger} strokeWidth={4} /> : null}
      <path d={smoothPath(soleBand, true, 0.2)} fill={color.sagittal} stroke="#B74437" strokeWidth={2} />
      <path d={smoothPath(top, true, 0.35)} fill={color.skin} stroke={color.skinLine} strokeWidth={3} />
      {toes.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={i === (side < 0 ? 4 : 0) ? 13 : 10} fill={color.skinLight} stroke={color.skinLine} strokeWidth={2} />
      ))}
      <circle cx={cx} cy={ankleY} r={7} fill={color.axis} />
      {soleArrow > 0 ? (
        <g opacity={soleArrow}>
          <line x1={sc.x} y1={sc.y} x2={n.x} y2={n.y} stroke={color.sagittal} strokeWidth={6} strokeLinecap="round" />
          <circle cx={n.x} cy={n.y} r={9} fill={color.sagittal} />
        </g>
      ) : null}
    </g>
  );
};

export const FeetFront: React.FC<{x: number; y: number; scale?: number; tilt: number; soleArrow?: number; midline?: number; onlyRight?: boolean; lateralGlow?: number}> = ({
  x, y, scale = 1, tilt, soleArrow = 0, midline = 0, onlyRight, lateralGlow = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {midline > 0 ? <line x1={0} y1={-420} x2={0} y2={230} stroke={color.sagittal} strokeWidth={4} strokeDasharray="14 10" opacity={midline} /> : null}
    <FrontFoot cx={-150} ankleY={0} tilt={tilt} side={-1} soleArrow={soleArrow} highlightLateral={lateralGlow} />
    {!onlyRight ? <FrontFoot cx={150} ankleY={0} tilt={tilt} side={1} soleArrow={soleArrow} /> : null}
  </g>
);
