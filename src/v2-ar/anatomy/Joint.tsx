import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * Flexion / Extension at a hinge joint.
 *
 * The scene this serves has to carry one counterexample: flexion is a DECREASE
 * in the angle at a joint, not "a movement toward the front". At the elbow the
 * flexing segment swings anteriorly; at the knee it swings POSTERIORLY. Students
 * who learn flexion as "forwards" get the knee wrong every time, so the two are
 * built from one component with opposite swing directions and the angle itself
 * is drawn, since the angle is the actual definition.
 */
export const Joint: React.FC<{
  /** which joint, which decides the direction the distal segment swings */
  kind: 'elbow' | 'knee';
  /** 0 = fully extended, 1 = fully flexed */
  t?: number;
  showAngle?: boolean;
  scale?: number;
  x?: number;
  y?: number;
}> = ({kind, t = 0, showAngle = true, scale = 1, x = 0, y = 0}) => {
  const PROX = 190; // proximal segment length
  const DIST = 185; // distal segment length
  // anterior is +x here. The elbow flexes anteriorly, the knee posteriorly:
  // the single sign flip that is the whole lesson.
  const dir = kind === 'elbow' ? 1 : -1;
  const maxDeg = kind === 'elbow' ? 140 : 135;
  const deg = t * maxDeg;
  const rad = (deg * Math.PI) / 180;

  // joint at origin; proximal segment runs straight up
  const jx = 0;
  const jy = 0;
  const px = 0;
  const py = -PROX;
  // distal segment hangs down when extended, swings by `deg` toward `dir`
  const dx = jx + dir * DIST * Math.sin(rad);
  const dy = jy + DIST * Math.cos(rad);

  const tint = colorAR.accent;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M ${px} ${py} L ${jx} ${jy}`} stroke={colorAR.skin} strokeWidth={46} strokeLinecap="round" fill="none" />
      <path d={`M ${jx} ${jy} L ${dx} ${dy}`} stroke={colorAR.skin} strokeWidth={42} strokeLinecap="round" fill="none" />
      <circle cx={jx} cy={jy} r={26} fill={colorAR.skinLight} stroke={colorAR.skinLine} strokeWidth={3} />

      {showAngle ? (
        <g>
          {/* the angle at the joint — flexion is this number getting smaller */}
          <path
            d={`M ${px * 0.42} ${py * 0.42} A ${PROX * 0.42} ${PROX * 0.42} 0 0 ${dir > 0 ? 0 : 1} ${dir * DIST * 0.42 * Math.sin(rad)} ${DIST * 0.42 * Math.cos(rad)}`}
            stroke={tint}
            strokeWidth={4}
            fill="none"
            opacity={0.9}
          />
          <text
            x={dir * 104}
            y={-28}
            textAnchor="middle"
            fill={tint}
            style={{font: '800 34px Manrope, sans-serif'}}
          >
            {Math.round(180 - deg)}°
          </text>
        </g>
      ) : null}

      {/* a fixed anterior reference, so "which way did it swing" is answerable */}
      <g opacity={0.5}>
        <line x1={0} y1={-PROX - 40} x2={0} y2={DIST + 30} stroke={colorAR.panelLine} strokeWidth={2} strokeDasharray="8 8" />
        <text x={96} y={DIST + 54} textAnchor="middle" fill={colorAR.textDim} style={{font: '700 22px Manrope, sans-serif'}}>
          ANTERIOR
        </text>
      </g>
    </g>
  );
};
