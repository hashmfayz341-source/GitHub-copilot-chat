import React from 'react';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * A camera viewfinder framing the body.
 *
 * Scene 03's own dialogue calls the pose "اللقطة" — the shot — so the reference
 * position is literally composed through a lens rather than asserted on a card.
 * The status strip gives the scene its correction mechanism: the frame stays
 * amber while the pose is wrong and only locks green once it is right, which
 * means the viewer can see that something is off before being told what.
 */
export const Viewfinder: React.FC<{
  /** 0..1 presence of the viewfinder chrome */
  on?: number;
  /** false while the pose is still wrong */
  locked?: boolean;
  /** 0..1 pulse used while waiting on the viewer to answer */
  attention?: number;
  label?: string;
  w?: number;
  h?: number;
  x?: number;
  y?: number;
}> = ({on = 1, locked = false, attention = 0, label, w = 760, h = 760, x = 0, y = 0}) => {
  const tint = locked ? '#5BD6A0' : colorAR.patientRight;
  const C = 86;
  const corner = (sx: number, sy: number) => (
    <path
      key={`${sx},${sy}`}
      d={`M ${sx * (w / 2)} ${sy * (h / 2) - sy * C} L ${sx * (w / 2)} ${sy * (h / 2)} L ${sx * (w / 2) - sx * C} ${sy * (h / 2)}`}
      stroke={tint}
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
    />
  );
  return (
    <g transform={`translate(${x} ${y})`} opacity={on}>
      {attention > 0 ? (
        <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={18} fill="none" stroke={tint} strokeWidth={3} opacity={0.22 * attention} />
      ) : null}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy]) => corner(sx, sy))}
      {/* a level line, because the reference pose is about alignment */}
      <line x1={-54} y1={0} x2={-18} y2={0} stroke={tint} strokeWidth={3} opacity={0.6} />
      <line x1={18} y1={0} x2={54} y2={0} stroke={tint} strokeWidth={3} opacity={0.6} />
      <g transform={`translate(${-w / 2} ${-h / 2 - 30})`}>
        <circle cx={14} cy={-6} r={8} fill={tint} opacity={locked ? 1 : 0.45 + 0.55 * attention} />
        {label ? (
          <text x={36} y={1} fill={tint} style={{font: `700 26px ${fontAR.term}`, letterSpacing: 1}}>
            {label}
          </text>
        ) : null}
      </g>
    </g>
  );
};
