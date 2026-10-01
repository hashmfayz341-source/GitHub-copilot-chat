/**
 * SVG motion primitives — drawn in stage (or figure-local) coordinates so they can be
 * attached to moving anatomy. All take explicit frame cues, usually from useBeats().
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {color, font} from '../design-system/theme';
import {appear, ease, pop, progress} from '../animation/motion';
import {Pt, arcPath, polar} from '../utils/geometry';
import {useSvgId} from '../utils/useSvgId';

const arrowHead = (tip: Pt, dir: Pt, size: number) => {
  const l = Math.hypot(dir.x, dir.y) || 1;
  const u = {x: dir.x / l, y: dir.y / l};
  const n = {x: -u.y, y: u.x};
  const b = {x: tip.x - u.x * size, y: tip.y - u.y * size};
  return `M${tip.x} ${tip.y} L${b.x + n.x * size * 0.55} ${b.y + n.y * size * 0.55} L${b.x - n.x * size * 0.55} ${b.y - n.y * size * 0.55}Z`;
};

/** Path drawn progressively from start, with an arrowhead riding the tip. */
export const DrawnArrow: React.FC<{
  d: string;
  start: number;
  dur?: number;
  out?: number;
  stroke?: string;
  width?: number;
  head?: number;
  dashed?: boolean;
  bothEnds?: boolean;
  opacity?: number;
}> = ({d, start, dur = 20, out, stroke = color.accent, width = 7, head = 26, dashed = false, bothEnds = false, opacity = 1}) => {
  const frame = useCurrentFrame();
  const id = useSvgId('da');
  const p = progress(frame, start, dur, ease.out);
  const fadeOut = out === undefined ? 1 : 1 - progress(frame, out, 12);
  if (p <= 0 || fadeOut <= 0) return null;
  const total = getLength(d);
  const L = Math.max(0.01, total * p);
  const tip = getPointAtLength(d, L) ?? {x: 0, y: 0};
  const tan = getTangentAtLength(d, L) ?? {x: 1, y: 0};
  const t0 = getTangentAtLength(d, 0.01) ?? {x: 1, y: 0};
  const p0 = getPointAtLength(d, 0) ?? {x: 0, y: 0};
  return (
    <g opacity={fadeOut * opacity}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={10000} height={10000}>
          <path d={d} fill="none" stroke="white" strokeWidth={width + 6} strokeLinecap="butt" strokeDasharray={`${L} ${total + 10}`} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? `${width * 1.6} ${width * 1.6}` : undefined} mask={`url(#${id})`} />
      <path d={arrowHead({x: tip.x + tan.x * head * 0.35, y: tip.y + tan.y * head * 0.35}, tan, head)} fill={stroke} />
      {bothEnds ? <path d={arrowHead({x: p0.x - t0.x * head * 0.35, y: p0.y - t0.y * head * 0.35}, {x: -t0.x, y: -t0.y}, head)} fill={stroke} /> : null}
    </g>
  );
};

/** Dashed path that draws on (used for trajectories, incisions, midlines). */
export const DrawnPath: React.FC<{d: string; start: number; dur?: number; out?: number; stroke?: string; width?: number; dash?: number; opacity?: number}> = ({
  d, start, dur = 24, out, stroke = color.text, width = 4, dash = 0, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const id = useSvgId('dp');
  const p = progress(frame, start, dur, ease.out);
  const o = out === undefined ? 1 : 1 - progress(frame, out, 12);
  if (p <= 0 || o <= 0) return null;
  const total = getLength(d);
  return (
    <g opacity={o * opacity}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={10000} height={10000}>
          <path d={d} fill="none" stroke="white" strokeWidth={width + 6} strokeLinecap="round" strokeDasharray={`${total * p} ${total + 10}`} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash ? `${dash} ${dash}` : undefined} mask={`url(#${id})`} />
    </g>
  );
};

/** Curved movement arrow around a pivot (angles in screen degrees: 0 = +x, 90 = down). */
export const ArcArrow: React.FC<{c: Pt; r: number; a0: number; a1: number; start: number; dur?: number; out?: number; stroke?: string; width?: number; head?: number}> = ({
  c, r, a0, a1, start, dur = 24, out, stroke = color.accent, width = 7, head = 26,
}) => <DrawnArrow d={arcPath(c, r, a0, a1)} start={start} dur={dur} out={out} stroke={stroke} width={width} head={head} />;

/** Angle arc between two rays from a vertex, with live degree read-out. */
export const AngleArc: React.FC<{v: Pt; a: Pt; b: Pt; r?: number; opacity?: number; stroke?: string; showValue?: boolean; labelR?: number; fontSize?: number; labelAt?: Pt}> = ({
  v, a, b, r = 70, opacity = 1, stroke = color.accent, showValue = true, labelR, fontSize = 40, labelAt,
}) => {
  const angA = (Math.atan2(a.y - v.y, a.x - v.x) * 180) / Math.PI;
  let angB = (Math.atan2(b.y - v.y, b.x - v.x) * 180) / Math.PI;
  let diff = angB - angA;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  angB = angA + diff;
  const mid = angA + diff / 2;
  const lp = labelAt ?? polar(v, labelR ?? r + 46, mid);
  const sector = `M${v.x} ${v.y} L${polar(v, r, angA).x} ${polar(v, r, angA).y} ${arcPath(v, r, angA, angB).replace(/^M[^A]+/, '')} Z`;
  return (
    <g opacity={opacity}>
      <path d={sector} fill={stroke} fillOpacity={0.16} />
      <path d={arcPath(v, r, angA, angB)} fill="none" stroke={stroke} strokeWidth={5} strokeLinecap="round" />
      {showValue ? (
        <text x={lp.x} y={lp.y} fill={stroke} fontFamily={font.display} fontWeight={800} fontSize={fontSize} textAnchor="middle" dominantBaseline="middle">
          {Math.round(Math.abs(diff))}°
        </text>
      ) : null}
    </g>
  );
};

/** Pulsing attention ring. */
export const Pulse: React.FC<{c: Pt; r?: number; start: number; out?: number; stroke?: string}> = ({c, r = 34, start, out, stroke = color.accent}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dur: 10});
  if (a.opacity <= 0) return null;
  const t = ((frame - start) % 36) / 36;
  return (
    <g opacity={a.opacity}>
      <circle cx={c.x} cy={c.y} r={r * (0.9 + pop(frame, start) * 0.1)} fill={stroke} fillOpacity={0.18} stroke={stroke} strokeWidth={4} />
      <circle cx={c.x} cy={c.y} r={r * (1 + t * 0.9)} fill="none" stroke={stroke} strokeWidth={3} opacity={1 - t} />
    </g>
  );
};

/**
 * Label attached to a point: dot on the structure, leader line, then text.
 * Pass a live anchor each frame to keep it attached to moving anatomy.
 */
export const Label: React.FC<{
  anchor: Pt;
  at: Pt;
  text: string;
  sub?: string;
  start: number;
  out?: number;
  stroke?: string;
  align?: 'start' | 'middle' | 'end';
  size?: number;
  dot?: boolean;
}> = ({anchor, at, text, sub, start, out, stroke = color.text, align, size = 38, dot = true}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dur: 16, dy: 0});
  if (a.opacity <= 0) return null;
  const lineP = progress(frame, start, 12, ease.out);
  const end = {x: anchor.x + (at.x - anchor.x) * lineP, y: anchor.y + (at.y - anchor.y) * lineP};
  const anchorSide = align ?? (at.x >= anchor.x ? 'start' : 'end');
  const tx = at.x + (anchorSide === 'start' ? 14 : anchorSide === 'end' ? -14 : 0);
  const textP = progress(frame, start + 8, 14, ease.out);
  return (
    <g opacity={a.opacity}>
      {dot ? <circle cx={anchor.x} cy={anchor.y} r={7} fill={stroke} stroke={color.bg0} strokeWidth={3} /> : null}
      <line x1={anchor.x} y1={anchor.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth={3} opacity={0.85} />
      <g opacity={textP} transform={`translate(${(1 - textP) * (anchorSide === 'end' ? 16 : -16)} 0)`}>
        <text x={tx} y={at.y + (sub ? -6 : 0)} fill={stroke} fontFamily={font.display} fontWeight={800} fontSize={size} textAnchor={anchorSide} dominantBaseline="middle" style={{paintOrder: 'stroke'}} stroke={color.bg0} strokeWidth={8} strokeLinejoin="round">
          {text}
        </text>
        {sub ? (
          <text x={tx} y={at.y + size * 0.85} fill={color.textDim} fontFamily={font.body} fontWeight={600} fontSize={size * 0.68} textAnchor={anchorSide} dominantBaseline="middle" style={{paintOrder: 'stroke'}} stroke={color.bg0} strokeWidth={7} strokeLinejoin="round">
            {sub}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** Plain animated SVG text (for labels that float without leader lines). */
export const SvgText: React.FC<{x: number; y: number; text: string; start: number; out?: number; size?: number; fill?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; family?: string; outline?: boolean}> = ({
  x, y, text, start, out, size = 40, fill = color.text, weight = 800, anchor = 'middle', family = font.display, outline = true,
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dy: 14});
  if (a.opacity <= 0) return null;
  return (
    <text x={x} y={y + a.y} fill={fill} opacity={a.opacity} fontFamily={family} fontWeight={weight} fontSize={size} textAnchor={anchor} dominantBaseline="middle" style={{paintOrder: 'stroke'}} stroke={outline ? color.bg0 : 'none'} strokeWidth={outline ? size * 0.2 : 0} strokeLinejoin="round">
      {text}
    </text>
  );
};

/** Dashed vertical midline that draws from top to bottom. */
export const Midline: React.FC<{x: number; y0: number; y1: number; start: number; out?: number; stroke?: string; label?: boolean}> = ({x, y0, y1, start, out, stroke = color.sagittal, label = true}) => (
  <g>
    <DrawnPath d={`M${x} ${y0} L${x} ${y1}`} start={start} dur={26} out={out} stroke={stroke} width={4} dash={14} />
    {label ? <SvgText x={x} y={y0 - 34} text="MIDLINE" start={start + 10} out={out} size={28} fill={stroke} family={font.body} weight={800} /> : null}
  </g>
);

/** Square bracket spanning two points with a caption — for "A is ___ to B" comparisons. */
export const Bracket: React.FC<{a: Pt; b: Pt; side?: number; start: number; out?: number; stroke?: string; text?: string; size?: number}> = ({a, b, side = 40, start, out, stroke = color.accent, text, size = 34}) => {
  const frame = useCurrentFrame();
  const p = appear(frame, start, {out, dy: 0});
  if (p.opacity <= 0) return null;
  const dx = b.x - a.x, dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  const n = {x: (-dy / l) * side, y: (dx / l) * side};
  const d = `M${a.x} ${a.y} L${a.x + n.x} ${a.y + n.y} L${b.x + n.x} ${b.y + n.y} L${b.x} ${b.y}`;
  const m = {x: (a.x + b.x) / 2 + n.x * 1.6, y: (a.y + b.y) / 2 + n.y * 1.6};
  return (
    <g opacity={p.opacity}>
      <DrawnPath d={d} start={start} dur={18} stroke={stroke} width={4} />
      {text ? <SvgText x={m.x} y={m.y} text={text} start={start + 10} size={size} fill={stroke} /> : null}
    </g>
  );
};
