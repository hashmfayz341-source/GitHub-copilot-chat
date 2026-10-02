import React from 'react';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * Shoulder movements, anterior view, measured against the midline.
 *
 * Abduction and adduction are defined BY the midline, so the midline is drawn
 * and the angle is measured from the body's own vertical axis — never from the
 * screen edge. Salem's "فراق" joke only works because the limb is visibly
 * leaving something; that something has to be on screen.
 *
 * Rotation is shown the way it is actually examined: elbow flexed to 90 so the
 * forearm becomes a pointer. Without that the humerus turning about its own
 * axis is invisible, and students conclude rotation means swinging the arm.
 *
 * Circumduction traces the path of the distal end, because the definition is
 * the CONE it sweeps — a sequence of flexion, abduction, extension and
 * adduction, not a fifth independent movement.
 */
export const LimbMovement: React.FC<{
  mode: 'abduction' | 'rotation' | 'circumduction';
  /**
   * abduction:     0 = at the side, 1 = fully abducted
   * rotation:      0 = lateral rotation, 0.5 = neutral, 1 = medial rotation
   * circumduction: 0..1 travels once around the cone
   */
  t?: number;
  showMidline?: boolean;
  showAngle?: boolean;
  scale?: number;
  x?: number;
  y?: number;
}> = ({mode, t = 0, showMidline = true, showAngle = true, scale = 1, x = 0, y = 0}) => {
  const SHOULDER_X = -92;
  const SHOULDER_Y = -300;
  const UPPER = 180;
  const FORE = 160;

  /** torso and head, enough to anchor the midline and the shoulder */
  const Body = () => (
    <g>
      <ellipse cx={0} cy={-430} rx={52} ry={58} fill={colorAR.skinLight} stroke={colorAR.skinLine} strokeWidth={2.5} />
      <path
        d="M -74 -366 Q -92 -240 -68 -120 L 68 -120 Q 92 -240 74 -366 Z"
        fill={colorAR.skinLight}
        stroke={colorAR.skinLine}
        strokeWidth={2.5}
      />
      <path d="M -46 -120 L -40 60 L -12 60 L -16 -120 Z" fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
      <path d="M 46 -120 L 40 60 L 12 60 L 16 -120 Z" fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
    </g>
  );

  let content: React.ReactNode = null;

  if (mode === 'abduction') {
    const deg = t * 95; // away from the body's vertical axis, in the coronal plane
    const rad = (deg * Math.PI) / 180;
    const ex = SHOULDER_X - (UPPER + FORE) * Math.sin(rad);
    const ey = SHOULDER_Y + (UPPER + FORE) * Math.cos(rad);
    content = (
      <g>
        <path
          d={`M ${SHOULDER_X} ${SHOULDER_Y} L ${ex} ${ey}`}
          stroke={colorAR.skin}
          strokeWidth={30}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={ex} cy={ey} rx={22} ry={25} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
        {showAngle ? (
          <g>
            <path
              d={`M ${SHOULDER_X} ${SHOULDER_Y + 120} A 120 120 0 0 1 ${SHOULDER_X - 120 * Math.sin(rad)} ${SHOULDER_Y + 120 * Math.cos(rad)}`}
              stroke={colorAR.accent}
              strokeWidth={4}
              fill="none"
              opacity={0.9}
            />
            <text x={SHOULDER_X - 104} y={SHOULDER_Y + 72} textAnchor="middle" fill={colorAR.accent} style={{font: '800 32px Manrope, sans-serif'}}>
              {Math.round(deg)}°
            </text>
          </g>
        ) : null}
      </g>
    );
  } else if (mode === 'rotation') {
    // elbow at 90: the forearm is the pointer that makes rotation visible
    const swing = (t - 0.5) * 2; // -1 lateral, +1 medial
    const fx = SHOULDER_X + swing * FORE * 0.92;
    const fy = SHOULDER_Y + UPPER - Math.abs(swing) * 14;
    content = (
      <g>
        <path
          d={`M ${SHOULDER_X} ${SHOULDER_Y} L ${SHOULDER_X} ${SHOULDER_Y + UPPER}`}
          stroke={colorAR.skin}
          strokeWidth={30}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${SHOULDER_X} ${SHOULDER_Y + UPPER} L ${fx} ${fy}`}
          stroke={colorAR.skin}
          strokeWidth={26}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={fx} cy={fy} rx={20} ry={23} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
        <circle cx={SHOULDER_X} cy={SHOULDER_Y + UPPER} r={16} fill={colorAR.skinLight} stroke={colorAR.skinLine} strokeWidth={2.5} />
        <text
          x={SHOULDER_X}
          y={SHOULDER_Y + UPPER + 64}
          textAnchor="middle"
          fill={colorAR.textDim}
          style={{font: `700 26px ${fontAR.ar}`, direction: 'rtl'}}
        >
          {swing > 0.15 ? 'للداخل · نحو المنتصف' : swing < -0.15 ? 'للخارج · بعيدًا' : 'محايد'}
        </text>
      </g>
    );
  } else {
    // the cone: the distal end travels a circle, the shoulder stays put
    const a = t * Math.PI * 2 - Math.PI / 2;
    const R = 150;
    const cxp = SHOULDER_X - 190;
    const cyp = SHOULDER_Y + 120;
    const ex = cxp + R * Math.cos(a);
    const ey = cyp + R * Math.sin(a) * 0.62;
    content = (
      <g>
        <ellipse cx={cxp} cy={cyp} rx={R} ry={R * 0.62} fill="none" stroke={colorAR.accent} strokeWidth={3} strokeDasharray="10 9" opacity={0.75} />
        <path d={`M ${SHOULDER_X} ${SHOULDER_Y} L ${ex} ${ey}`} stroke={colorAR.skin} strokeWidth={30} strokeLinecap="round" fill="none" />
        <ellipse cx={ex} cy={ey} rx={22} ry={25} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {showMidline ? (
        <line x1={0} y1={-520} x2={0} y2={120} stroke={colorAR.sagittal} strokeWidth={3} strokeDasharray="9 8" opacity={0.8} />
      ) : null}
      <Body />
      {content}
    </g>
  );
};
