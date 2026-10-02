import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * Dorsiflexion / Plantar flexion — the foot seen from the SIDE.
 *
 * These are sagittal-plane movements, so they are shown in the sagittal view.
 * Inversion and eversion live in Feet.tsx and are shown from the front, because
 * that is where the sole's direction is readable. Putting all four foot
 * movements in one view is how they get confused with each other.
 *
 * Anterior is to the right. Dorsiflexion brings the dorsum toward the shin and
 * the ankle angle SHRINKS; plantar flexion points the foot and it opens.
 */
export const SagittalFoot: React.FC<{
  /** -1 = full plantar flexion, 0 = neutral, +1 = full dorsiflexion */
  t?: number;
  showAngle?: boolean;
  scale?: number;
  x?: number;
  y?: number;
}> = ({t = 0, showAngle = true, scale = 1, x = 0, y = 0}) => {
  /**
   * Dorsiflexion has roughly 25 degrees of range, plantar flexion roughly 45.
   * Negative rotation lifts the toes toward the shin. An earlier form of this
   * added two terms that cancelled for t < 0, so the readout said 135 degrees
   * while the foot had barely moved — the number and the picture must come from
   * the same quantity.
   */
  const deg = t >= 0 ? -t * 25 : -t * 45;
  // Derived from the SAME quantity as the rotation, not computed separately:
  // neutral is 90, and the foot's rotation from neutral is the whole change.
  // Two independent formulas is exactly how the readout and the picture
  // disagreed before.
  const ankleAngle = 90 + deg;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shin, fixed: the movement is at the ankle */}
      <path d="M -10 -300 L -6 -20" stroke={colorAR.skin} strokeWidth={54} strokeLinecap="round" fill="none" />
      <circle cx={-4} cy={-14} r={26} fill={colorAR.skinLight} stroke={colorAR.skinLine} strokeWidth={3} />

      <g transform={`rotate(${deg} -4 -14)`}>
        {/* the foot: heel at the left, toes to the right (anterior) */}
        <path
          d="M -46 -16 Q -58 26 -34 36 L 104 34 Q 130 30 128 14 Q 120 -2 86 -2 L 30 -8 Z"
          fill={colorAR.skin}
          stroke={colorAR.skinLine}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* the sole, so this foot and the anterior-view one read as the same foot */}
        <path d="M -34 36 L 104 34" stroke={colorAR.soleDark} strokeWidth={11} strokeLinecap="round" />
      </g>

      {showAngle ? (
        <text x={96} y={-96} textAnchor="middle" fill={colorAR.accent} style={{font: '800 30px Manrope, sans-serif'}}>
          {Math.round(ankleAngle)}°
        </text>
      ) : null}
      <g opacity={0.5}>
        <text x={150} y={92} textAnchor="middle" fill={colorAR.textDim} style={{font: '700 20px Manrope, sans-serif'}}>
          ANTERIOR
        </text>
      </g>
    </g>
  );
};

/**
 * Protraction / Retraction at the jaw, seen from the side.
 *
 * A translation, not a rotation: the mandible slides anteriorly and back.
 * Drawing it as a hinge would make it indistinguishable from depression, which
 * is the movement it is most often confused with.
 */
export const Jaw: React.FC<{
  /** 0 = retracted, 1 = protracted */
  t?: number;
  /** 0 = closed, 1 = depressed (opened) */
  open?: number;
  scale?: number;
  x?: number;
  y?: number;
}> = ({t = 0, open = 0, scale = 1, x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* cranium and upper jaw, fixed */}
    <path
      d="M -120 -120 Q -130 -10 -70 20 L 70 20 Q 118 12 122 -40 Q 126 -118 40 -150 Q -70 -170 -120 -120 Z"
      fill={colorAR.skinLight}
      stroke={colorAR.skinLine}
      strokeWidth={3}
    />
    <line x1={-64} y1={22} x2={78} y2={22} stroke={colorAR.skinLine} strokeWidth={3} />

    {/* mandible: slides forward, and hinges open independently */}
    {/* where the mandible sits when retracted, so the slide is measurable */}
    {t > 0.02 ? (
      <path
        d="M -78 30 Q -86 92 -24 104 L 56 100 Q 104 92 100 52 L 96 32 Z"
        fill="none"
        stroke={colorAR.textDim}
        strokeWidth={2.5}
        strokeDasharray="8 7"
        opacity={0.6}
      />
    ) : null}
    <g transform={`translate(${t * 56} ${open * 8}) rotate(${open * 15} -72 26)`}>
      <path
        d="M -78 30 Q -86 92 -24 104 L 56 100 Q 104 92 100 52 L 96 32 Z"
        fill={colorAR.accent}
        stroke="#1A1108"
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.92}
      />
    </g>
    <g opacity={0.5}>
      <text x={150} y={-130} textAnchor="middle" fill={colorAR.textDim} style={{font: '700 20px Manrope, sans-serif'}}>
        ANTERIOR
      </text>
    </g>
  </g>
);
