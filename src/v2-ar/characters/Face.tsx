import React from 'react';
import {browFor, lookOffset, mouthCurveFor, type Expression, type Look} from './rig';

/**
 * Shared face primitives. All three characters use the same eye/brow/mouth rig
 * so performance reads consistently; identity comes from the head covering,
 * hair/beard and palette supplied by each character component.
 */

export type FaceSkin = {skin: string; shade: string; hair: string};

export const Eyes: React.FC<{
  look: Look;
  blink: number;
  expression: Expression;
  /** distance between pupils */
  spread?: number;
  /** eye vertical centre in local coords */
  cy?: number;
  lash?: boolean;
  hair: string;
}> = ({look, blink, expression, spread = 26, cy = 0, lash, hair}) => {
  const o = lookOffset(look);
  const open = 1 - Math.min(1, blink);
  const ry = Math.max(0.6, 9 * open);
  const wide = expression === 'surprised' || expression === 'dramatic';
  const sq = expression === 'dry' || expression === 'smirk' ? 0.72 : 1;
  const ryy = ry * (wide ? 1.2 : 1) * sq;
  return (
    <g>
      {[-spread / 2, spread / 2].map((dx, i) => (
        <g key={i} transform={`translate(${dx} ${cy})`}>
          {/* sclera */}
          <ellipse rx={11} ry={ryy} fill="#FFFDF8" />
          {/* iris + pupil travel together so the gaze is unambiguous */}
          <g transform={`translate(${o.x} ${o.y})`} clipPath="none">
            <ellipse rx={Math.min(6.2, 6.2 * (ryy / 9))} ry={Math.min(6.2, ryy * 0.72)} fill="#3B2A1E" />
            <ellipse rx={2.6} ry={Math.min(2.6, ryy * 0.32)} fill="#120C08" />
            <circle cx={-2} cy={-2.4} r={1.5} fill="#FFFFFF" opacity={0.9 * open} />
          </g>
          {/* upper lid */}
          <path d={`M -11.5 ${-ryy - 0.5} Q 0 ${-ryy - 5} 11.5 ${-ryy - 0.5}`} stroke={hair} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.85} />
          {lash ? (
            <path d={`M -11.5 ${-ryy - 1.2} Q 0 ${-ryy - 6.2} 11.5 ${-ryy - 1.2}`} stroke={hair} strokeWidth={3.6} fill="none" strokeLinecap="round" />
          ) : null}
        </g>
      ))}
    </g>
  );
};

export const Brows: React.FC<{expression: Expression; spread?: number; y?: number; color: string}> = ({
  expression, spread = 26, y = -19, color,
}) => {
  const b = browFor(expression);
  return (
    <g>
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M ${s * (spread / 2 - 11)} ${y + b.inner} Q ${s * (spread / 2)} ${y - 3 + (b.inner + b.outer) / 2} ${s * (spread / 2 + 11)} ${y + b.outer}`}
          transform={`rotate(${s * b.tilt} ${s * (spread / 2)} ${y})`}
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </g>
  );
};

export const Mouth: React.FC<{
  open: number;
  expression: Expression;
  y?: number;
  width?: number;
  lip?: string;
  inner?: string;
}> = ({open, expression, y = 30, width = 26, lip = '#8A4B3C', inner = '#55221C'}) => {
  const curve = mouthCurveFor(expression);
  const o = Math.max(0, Math.min(1, open));
  const h = 2 + o * 15;
  const w = width * (expression === 'surprised' ? 0.72 : 1) * (0.86 + o * 0.18);
  if (o < 0.08) {
    // closed: a single curved line reads cleaner than a flat slot
    return <path d={`M ${-w / 2} ${y} Q 0 ${y + curve} ${w / 2} ${y}`} stroke={lip} strokeWidth={4} fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      <path
        d={`M ${-w / 2} ${y} Q 0 ${y + curve - h * 0.25} ${w / 2} ${y} Q 0 ${y + h} ${-w / 2} ${y} Z`}
        fill={inner}
        stroke={lip}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* teeth hint keeps the open mouth from reading as a hole */}
      {o > 0.45 ? <path d={`M ${-w / 2 + 3} ${y + 1} Q 0 ${y + curve - h * 0.1} ${w / 2 - 3} ${y + 1}`} stroke="#FBF6EE" strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
    </g>
  );
};

/** Short beard + moustache (Rashid and Salem). */
export const Beard: React.FC<{color: string; w?: number; h?: number; y?: number}> = ({color, w = 62, h = 54, y = 8}) => (
  <g>
    <path
      d={`M ${-w / 2} ${y - 16} Q ${-w / 2 - 2} ${y + h * 0.62} 0 ${y + h * 0.78} Q ${w / 2 + 2} ${y + h * 0.62} ${w / 2} ${y - 16} Q ${w / 2 - 6} ${y + 10} 0 ${y + 12} Q ${-w / 2 + 6} ${y + 10} ${-w / 2} ${y - 16} Z`}
      fill={color}
      opacity={0.95}
    />
    <path d={`M -15 ${y + 14} Q 0 ${y + 9} 15 ${y + 14}`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" />
  </g>
);

/** Nose: a simple, consistent wedge. */
export const Nose: React.FC<{shade: string; y?: number}> = ({shade, y = 12}) => (
  <path d={`M 0 ${y - 12} Q 5 ${y + 2} 0 ${y + 4} Q -4 ${y + 4} -4 ${y + 2}`} stroke={shade} strokeWidth={3} fill="none" strokeLinecap="round" />
);
