import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * Inversion / Eversion, anterior view of both feet.
 *
 * V1 shipped an inversion arrow pointing the wrong way during development. The
 * guard against that returning is structural, not a comment: nothing here draws
 * a movement arrow at all. The SOLE is the reference, exactly as directed —
 * a tilting plate under each foot — and both feet are always drawn together, so
 * the frame is self-checking:
 *
 *     INVERSION  → the two soles turn to FACE EACH OTHER  (medially)
 *     EVERSION   → the two soles turn AWAY from each other (laterally)
 *
 * Nothing in here may ever gain an arrow, a chevron or a direction tick: the
 * tilt of the sole plate is the whole statement. An arrow is a second claim
 * about direction that can disagree with the anatomy, which is exactly how V1
 * went wrong.
 *
 * If that ever reads backwards on screen, the error is visible at a glance in a
 * single still, with no need to trust a label.
 *
 * Both feet share one roll expression mirrored by `medial`, so the two sides
 * cannot disagree, and the sole's facing tick is derived from the same rotation
 * as the plate it sits on — it cannot contradict it.
 */

export type FootMode = 'neutral' | 'inversion' | 'eversion';

const FOOT_X = 150;
const MAX_ROLL = 28; // degrees at full movement

const Foot: React.FC<{side: 'right' | 'left'; mode: FootMode; amount: number; label?: boolean}> = ({
  side,
  mode,
  amount,
  label,
}) => {
  const sx = side === 'right' ? -FOOT_X : FOOT_X;
  // which screen direction is medial for this foot (the midline sits at x = 0)
  const medial = side === 'right' ? 1 : -1;
  // inversion turns the sole to face medially, eversion laterally
  const faceDir = mode === 'neutral' ? 0 : mode === 'inversion' ? medial : -medial;
  // SVG rotation is clockwise-positive, and a clockwise roll swings the sole's
  // downward normal toward screen-left — so facing screen-right needs a
  // negative angle. Hence the sign flip.
  const deg = -faceDir * MAX_ROLL * amount;

  return (
    <g transform={`translate(${sx} 0)`}>
      {/* shin stays put: the movement happens at the ankle, below it */}
      <path d={`M -26 -170 L -22 -14 L 22 -14 L 26 -170 Z`} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2.5} />
      <g transform={`rotate(${deg})`}>
        {/* dorsum — what you see of the foot from the front */}
        <path
          d="M -54 4 Q -60 54 -46 74 L 46 74 Q 60 54 54 4 Z"
          fill={colorAR.skinLight}
          stroke={colorAR.skinLine}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* toes */}
        {[-36, -18, 0, 18, 36].map((tx) => (
          <ellipse key={tx} cx={tx} cy={62} rx={7.5} ry={9} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={1.6} />
        ))}
        {/* THE SOLE — the only direction reference in this component */}
        <g>
          <rect x={-50} y={76} width={100} height={17} rx={7} fill={colorAR.soleDark} stroke={colorAR.skinLine} strokeWidth={2} />
          {[-34, -17, 0, 17, 34].map((tx) => (
            <line key={tx} x1={tx} y1={79} x2={tx} y2={90} stroke={colorAR.soleTread} strokeWidth={2.4} strokeLinecap="round" />
          ))}
        </g>
      </g>
      {/* the ankle caps the joint, so the foot never visibly detaches as it rolls */}
      <ellipse cy={-8} rx={25} ry={22} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2.5} />
      {label ? (
        <text y={176} textAnchor="middle" fill={colorAR.textDim} style={{font: '600 24px Manrope, sans-serif'}}>
          {side === 'right' ? 'R' : 'L'}
        </text>
      ) : null}
    </g>
  );
};

export const Feet: React.FC<{
  mode?: FootMode;
  /** 0..1 through the movement */
  amount?: number;
  /** the midline the soles turn toward or away from */
  showMidline?: boolean;
  labels?: boolean;
  scale?: number;
  x?: number;
  y?: number;
}> = ({mode = 'neutral', amount = 1, showMidline = false, labels = false, scale = 1, x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {showMidline ? (
      <line x1={0} y1={-200} x2={0} y2={150} stroke={colorAR.sagittal} strokeWidth={3} strokeDasharray="9 8" opacity={0.75} />
    ) : null}
    <Foot side="right" mode={mode} amount={amount} label={labels} />
    <Foot side="left" mode={mode} amount={amount} label={labels} />
  </g>
);
