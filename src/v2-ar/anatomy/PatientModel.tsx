import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * The anatomical model Salem is trying to command.
 *
 * The educational contract of Scene 01 lives here: R and L are placed in BODY
 * coordinates, so when `yaw` turns the model the markers travel WITH the body.
 * Turn the model all the way around and patient-right ends up on screen right —
 * which is the whole lesson: the body defines the side, the screen never does.
 *
 * Geometry is a light 3D: every landmark has a body-space (bx, bz), is yawed
 * about the body's own vertical axis, then divided by depth. That asymmetry is
 * what makes a turn read as a turn — a bare cos() scale is mirror-symmetric and
 * a body rotating left looks identical to one rotating right.
 *
 * Cross-sections are ellipses (a torso is wider than it is deep), so edge-on the
 * body narrows to its true depth instead of collapsing to nothing.
 */

export type Side = 'patientRight' | 'patientLeft';

/** body-space half-widths / half-depths, in model units */
const TORSO_W = 62;
const TORSO_D = 34;
const HEAD_W = 46;
const HEAD_D = 44;
const SHOULDER_X = 58;
const MARKER_X = 156;
const CAM = 1400;

export const PatientModel: React.FC<{
  /** degrees; 0 = facing camera, ±180 = facing away. Full range supported. */
  yaw?: number;
  /** which hand is raised (in patient terms) */
  raised?: Side | null;
  /** draw the little R / L markers */
  showMarkers?: boolean;
  showLeftMarker?: boolean;
  /** hands glance at each other — silent personification, no fourth voice */
  handsGlance?: number;
  /** 0..1 pulse on a hand the characters are arguing about */
  highlight?: Side | null;
  highlightPulse?: number;
  /** vertical midline reference */
  showMidline?: boolean;
  /**
   * Palm orientation. Anatomical position requires palms facing FORWARD
   * (forearms supinated); 'medial' is the natural standing pose the scene
   * corrects away from. null keeps the plain hand used elsewhere.
   */
  palms?: 'forward' | 'medial' | null;
  scale?: number;
  x?: number;
  y?: number;
}> = ({
  yaw = 0,
  raised = null,
  showMarkers = false,
  showLeftMarker = false,
  handsGlance = 0,
  highlight = null,
  highlightPulse = 0,
  showMidline = false,
  palms = null,
  scale = 1,
  x = 0,
  y = 0,
}) => {
  const rad = (yaw * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  /** yaw about the body axis, then perspective divide */
  const prj = (bx: number, bz = 0) => {
    const X = bx * c + bz * s;
    const Z = -bx * s + bz * c;
    const k = CAM / (CAM - Z);
    return {x: X * k, z: Z, k};
  };
  const px = (bx: number, bz = 0) => prj(bx, bz).x;
  /** screen half-width of an elliptical cross-section seen at this yaw */
  const ellW = (halfW: number, halfD: number) => Math.hypot(halfW * c, halfD * s);

  // how much of the front / the back is turned toward us
  const ramp = (v: number) => Math.max(0, Math.min(1, (v - 0.04) / 0.26));
  const front = ramp(c);
  const back = ramp(-c);

  const tw = ellW(TORSO_W, TORSO_D);
  const hw = ellW(HEAD_W, HEAD_D);

  const arm = (side: Side) => {
    const isRight = side === 'patientRight';
    const sign = isRight ? -1 : 1;
    const up = raised === side;
    const shoulderY = -250;
    const handY = up ? -400 : -150;
    // the hand sits a little lateral and slightly anterior to the shoulder
    const sh = prj(sign * SHOULDER_X, 0);
    const hd = prj(sign * (SHOULDER_X + (up ? 42 : 30)), 12);
    const el = prj(sign * (SHOULDER_X + (up ? 34 : 38)), 8);
    const hot = highlight === side ? highlightPulse : 0;
    // a limb is round in cross-section, so only perspective changes its width
    return (
      <g key={side}>
        {/* drawn twice: an outline first, so a limb hanging against the torso
            still separates from it — flat skin on skin reads as no arm at all */}
        <path
          d={`M ${sh.x} ${shoulderY} Q ${el.x} ${(shoulderY + handY) / 2} ${hd.x} ${handY}`}
          stroke={colorAR.skinLine}
          strokeWidth={26 * hd.k + 5}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${sh.x} ${shoulderY} Q ${el.x} ${(shoulderY + handY) / 2} ${hd.x} ${handY}`}
          stroke={colorAR.skin}
          strokeWidth={26 * hd.k}
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(${hd.x} ${handY})`}>
          {hot > 0 ? <circle r={34} fill={colorAR.accent} opacity={0.22 * hot} /> : null}
          <ellipse rx={20 * hd.k} ry={23} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={2} />
          {/* Which face of the hand we see. Palm forward is the anatomical
              position; the creases read as palm, the knuckles as the back. */}
          {palms === 'forward' ? (
            <g opacity={0.9}>
              <ellipse rx={13 * hd.k} ry={16} fill={colorAR.skinLight} opacity={0.85} />
              <g stroke={colorAR.skinLine} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.75}>
                <path d={`M ${-7 * hd.k} -6 Q 0 -1 ${6 * hd.k} -7`} />
                <path d={`M ${-7 * hd.k} 1 Q 0 6 ${6 * hd.k} 0`} />
              </g>
            </g>
          ) : palms === 'medial' ? (
            <g opacity={0.8}>
              {[-6, 0, 6].map((dx) => (
                <circle key={dx} cx={dx * hd.k} cy={-7} r={2.6} fill={colorAR.skinLine} opacity={0.6} />
              ))}
            </g>
          ) : null}
          {/* silent reaction only — body parts never speak, and never from behind */}
          {handsGlance * front > 0.02 ? (
            <g opacity={handsGlance * front}>
              {[-6, 6].map((dx) => (
                <g key={dx} transform={`translate(${dx * hd.k} -3)`}>
                  <ellipse rx={4.4} ry={5} fill="#FFFDF8" />
                  {/* both hands look toward the midline — at each other */}
                  <circle cx={isRight ? 1.8 : -1.8} r={2.3} fill="#2A1C12" />
                </g>
              ))}
              <path
                d={`M -5 7 Q 0 ${9 + 2 * handsGlance} 5 7`}
                stroke={colorAR.skinLine}
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </g>
      </g>
    );
  };

  const leg = (sign: number) => {
    const hip = prj(sign * 25, 0);
    const foot = prj(sign * 20, 0);
    const w = ellW(16, 17);
    return (
      <path
        key={sign}
        d={`M ${hip.x - w} -150 L ${foot.x - w * 0.86} -6 L ${foot.x + w * 0.86} -6 L ${hip.x + w} -150 Z`}
        fill={colorAR.skin}
        stroke={colorAR.skinLine}
        strokeWidth={2}
      />
    );
  };

  const marker = (side: Side, label: string, tint: string) => {
    const p = prj(side === 'patientRight' ? -MARKER_X : MARKER_X, 0);
    // a marker turned away from us dims, but never leaves the body
    const near = Math.max(0.46, Math.min(1, 0.73 + p.z / 320));
    return (
      <g transform={`translate(${p.x} -286) scale(${0.88 + 0.12 * p.k})`} opacity={near}>
        <circle r={25} fill="rgba(8,13,18,0.86)" stroke={tint} strokeWidth={3.5} />
        <text textAnchor="middle" y={10} fill={tint} style={{font: '800 28px Manrope, sans-serif'}}>
          {label}
        </text>
      </g>
    );
  };

  // patient right is near the camera while it is rotated toward us
  const rightNear = prj(-SHOULDER_X).z > 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* the stand does not turn — a fixed floor reference the body rotates on */}
      <ellipse cy={8} rx={120} ry={18} fill="#000" opacity={0.3} />
      <ellipse cy={0} rx={104} ry={16} fill={colorAR.bg2} stroke={colorAR.panelLine} strokeWidth={2} />

      {leg(-1)}
      {leg(1)}

      {/* far arm first so depth ordering reads correctly through the turn */}
      {rightNear ? arm('patientLeft') : arm('patientRight')}

      {/* torso */}
      <path
        d={`M ${-tw} -392 Q ${-tw * 1.29} -270 ${-tw * 0.9} -150 L ${tw * 0.9} -150 Q ${tw * 1.29} -270 ${tw} -392 Z`}
        fill={colorAR.skinLight}
        stroke={colorAR.skinLine}
        strokeWidth={2.5}
      />

      {/* spine, visible only from behind: tells the viewer this is the back */}
      {back > 0.02 ? (
        <g opacity={back * 0.8}>
          {[-370, -332, -294, -256, -218, -180].map((yy) => (
            <circle key={yy} cx={px(0)} cy={yy} r={4.6} fill={colorAR.skinLine} />
          ))}
        </g>
      ) : null}

      {/* midline: the stubborn fixed reference, drawn ON the body */}
      {showMidline ? (
        <line x1={px(0)} y1={-400} x2={px(0)} y2={-150} stroke={colorAR.sagittal} strokeWidth={4} strokeDasharray="10 8" opacity={0.95} />
      ) : null}

      {/* head */}
      <g transform="translate(0 -440)">
        <ellipse cx={px(0)} rx={hw} ry={52} fill={colorAR.skinLight} stroke={colorAR.skinLine} strokeWidth={2.5} />
        {/* the face points where the model faces, so "facing you" is unambiguous */}
        <g opacity={front}>
          {[-15, 15].map((dx) => (
            <circle key={dx} cx={px(dx)} cy={-6} r={4.6} fill="#2A1C12" />
          ))}
          <path d={`M ${px(-12)} 20 Q ${px(0)} 26 ${px(12)} 20`} stroke={colorAR.skinLine} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>
        {/* back of the head — a plain occiput, no face */}
        <g opacity={back}>
          <path
            d={`M ${px(0) - hw * 0.72} 12 Q ${px(0)} 46 ${px(0) + hw * 0.72} 12`}
            stroke={colorAR.skinLine}
            strokeWidth={2.4}
            fill="none"
            opacity={0.55}
          />
        </g>
      </g>

      {/* near arm */}
      {rightNear ? arm('patientRight') : arm('patientLeft')}

      {showMarkers ? marker('patientRight', 'R', colorAR.patientRight) : null}
      {showMarkers && showLeftMarker ? marker('patientLeft', 'L', colorAR.patientLeft) : null}
    </g>
  );
};
