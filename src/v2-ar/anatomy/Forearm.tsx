import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * Pronation / Supination of the forearm, anterior view of a RIGHT arm.
 *
 * The anatomy this component exists to get right: the ulna is effectively
 * fixed, and the RADIUS rotates about it. In supination the two bones lie
 * PARALLEL; in pronation the radius crosses over the ulna, so the two make an X.
 * The hand follows the radius, which is why the palm turns with it.
 *
 * Drawing the hand turning without the bones crossing would teach the movement
 * as a wrist action, which is the common student error. The crossing IS the
 * mechanism, so it is drawn, not implied.
 *
 * `t` = 0 is full supination (anatomical position, palm anterior),
 * `t` = 1 is full pronation (palm posterior).
 *
 * Screen convention here: +x is MEDIAL (toward the midline), −x is LATERAL.
 * For a right arm in anterior view the thumb therefore starts on the left.
 */
export const Forearm: React.FC<{
  t?: number;
  showBones?: boolean;
  labels?: boolean;
  scale?: number;
  x?: number;
  y?: number;
}> = ({t = 0, showBones = true, labels = false, scale = 1, x = 0, y = 0}) => {
  const ELBOW = -230;
  const WRIST = 150;

  // the ulna barely moves: it is the axis the radius turns around
  const ulnaTop = 30;
  const ulnaBot = 24;

  // the radius head stays put at the elbow; its DISTAL end swings across
  const radTop = -30;
  const radBot = -28 + t * 58; // lateral -> medial, crossing the ulna

  // the hand is carried by the radius
  const handX = radBot;
  // palm faces us at t=0 and away at t=1; the foreshortening between is the turn
  const palmOpen = Math.cos(t * Math.PI);

  const bone = (x1: number, x2: number, tint: string, w: number) => (
    <path d={`M ${x1} ${ELBOW} L ${x2} ${WRIST}`} stroke={tint} strokeWidth={w} strokeLinecap="round" fill="none" />
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* upper arm stub, so the elbow reads as a joint */}
      <path d={`M -6 ${ELBOW - 150} L 0 ${ELBOW}`} stroke={colorAR.skin} strokeWidth={54} strokeLinecap="round" fill="none" />

      {/* soft tissue of the forearm, following the bones */}
      <path
        d={`M ${radTop - 22} ${ELBOW} L ${radBot - 20} ${WRIST} L ${ulnaBot + 20} ${WRIST} L ${ulnaTop + 22} ${ELBOW} Z`}
        fill={colorAR.skin}
        stroke={colorAR.skinLine}
        strokeWidth={2.5}
        strokeLinejoin="round"
        opacity={0.34}
      />

      {showBones ? (
        <g>
          {/* The ulna is drawn first, so in pronation the radius passes visibly
              IN FRONT of it — which is what actually happens. The radius also
              carries the accent tint because it is the bone that moves; colour
              here is a teaching aid, not decoration, and without it the crossing
              is lost against the soft tissue. */}
          {bone(ulnaTop, ulnaBot, colorAR.skinLine, 20)}
          {bone(ulnaTop, ulnaBot, '#E8E0D0', 14)}
          {bone(radTop, radBot, '#1A1108', 22)}
          {bone(radTop, radBot, colorAR.accent, 15)}
          {/* the radial head, which spins in place rather than translating */}
          <circle cx={radTop} cy={ELBOW} r={13} fill={colorAR.accent} stroke="#1A1108" strokeWidth={3} />
        </g>
      ) : null}

      {/* the hand, carried by the radius */}
      <g transform={`translate(${handX} ${WRIST})`}>
        <ellipse rx={34 * Math.max(0.42, Math.abs(palmOpen)) + 10} ry={46} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2.5} />
        {palmOpen > 0 ? (
          <g opacity={Math.min(1, palmOpen * 1.6)} stroke={colorAR.skinLine} strokeWidth={2.4} fill="none" strokeLinecap="round">
            <path d="M -16 -8 Q 0 2 15 -10" />
            <path d="M -16 8 Q 0 20 15 6" />
          </g>
        ) : (
          <g opacity={Math.min(1, -palmOpen * 1.6)}>
            {[-14, 0, 14].map((dx) => (
              <circle key={dx} cx={dx} cy={-14} r={5.5} fill={colorAR.skinLine} opacity={0.55} />
            ))}
          </g>
        )}
        {/* the thumb marks which way the hand is facing, independent of shading */}
        <ellipse
          cx={(palmOpen >= 0 ? -1 : 1) * (30 * Math.max(0.42, Math.abs(palmOpen)) + 6)}
          cy={-16}
          rx={9}
          ry={15}
          fill={colorAR.skin}
          stroke={colorAR.skinLine}
          strokeWidth={2}
        />
      </g>

      {labels && showBones ? (
        <g style={{font: '700 22px Manrope, sans-serif'}}>
          <text x={radTop - 52} y={ELBOW - 22} textAnchor="middle" fill={colorAR.accent}>
            Radius
          </text>
          <text x={ulnaTop + 52} y={ELBOW - 22} textAnchor="middle" fill="#E8E0D0">
            Ulna
          </text>
        </g>
      ) : null}
    </g>
  );
};
