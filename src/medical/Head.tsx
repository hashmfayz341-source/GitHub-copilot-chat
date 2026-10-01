/**
 * Large head profile (facing right) in the mannequin style, with a separate mandible
 * that can glide (protraction/retraction) or rotate about the TMJ (elevation/depression),
 * plus an optional x-ray layer showing skull and brain.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {color} from '../design-system/theme';
import {capsulePath, pt, smoothPath} from '../utils/geometry';
import {useSvgId} from '../utils/useSvgId';

export const TMJ = pt(-14, 48);
export const HEAD_POINTS = {chin: pt(184, 172), brain: pt(-30, -70), skull: pt(-60, -170), skinFace: pt(190, -40), cheek: pt(120, 40)};

const UPPER = smoothPath(
  [pt(-30, 112), pt(-150, 150), pt(-200, 10), pt(-170, -130), pt(-70, -205), pt(60, -200), pt(140, -140), pt(166, -62), pt(160, -24), pt(226, 34), pt(186, 62), pt(196, 86), pt(174, 102), pt(60, 104)],
  true,
  0.5,
);
const MANDIBLE = smoothPath([pt(172, 100), pt(194, 114), pt(188, 160), pt(160, 204), pt(60, 210), pt(-22, 166), pt(-26, 60), pt(20, 92)], true, 0.45);
const SKULL = smoothPath([pt(-176, 0), pt(-150, -120), pt(-60, -186), pt(56, -182), pt(124, -128), pt(146, -60), pt(140, -20), pt(196, 36), pt(170, 58), pt(170, 84), pt(70, 92), pt(-10, 100), pt(-80, 120), pt(-150, 90)], true, 0.5);
const BRAIN = smoothPath([pt(-150, -10), pt(-130, -110), pt(-50, -165), pt(50, -160), pt(112, -110), pt(126, -50), pt(70, -6), pt(-20, 10), pt(-110, 20)], true, 0.55);
const JAWBONE = smoothPath([pt(166, 108), pt(178, 120), pt(174, 156), pt(150, 190), pt(64, 194), pt(-6, 160), pt(-10, 70), pt(10, 96)], true, 0.45);

export const HeadProfile: React.FC<{x: number; y: number; scale?: number; protrude?: number; open?: number; xray?: number; brainGlow?: number; skullGlow?: number; opacity?: number}> = ({
  x, y, scale = 1, protrude = 0, open = 0, xray = 0, brainGlow = 0, skullGlow = 0, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const gid = useSvgId('hd');
  const jaw = `translate(${protrude} 0) rotate(${open} ${TMJ.x} ${TMJ.y})`;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id={`${gid}-skin`} x1="0" x2="1" y1="0" y2="0.3">
          <stop offset="0" stopColor={color.skinShade} />
          <stop offset="0.6" stopColor={color.skin} />
          <stop offset="1" stopColor={color.skinLight} />
        </linearGradient>
      </defs>
      {/* neck */}
      <path d={capsulePath(pt(-70, 170), 78, pt(-60, 340), 82)} fill={`url(#${gid}-skin)`} stroke={color.skinLine} strokeWidth={3} />
      {/* mandible (behind the upper head so the seam stays hidden) */}
      <g transform={jaw}>
        <path d={MANDIBLE} fill={`url(#${gid}-skin)`} stroke={color.skinLine} strokeWidth={3} opacity={1 - xray * 0.75} />
        {xray > 0 ? <path d={JAWBONE} fill={color.bone} stroke={color.boneLine} strokeWidth={3} opacity={xray} /> : null}
      </g>
      <path d={UPPER} fill={`url(#${gid}-skin)`} stroke={color.skinLine} strokeWidth={3} opacity={1 - xray * 0.72} />
      {/* hair, ear, eye */}
      <path d={smoothPath([pt(-196, 10), pt(-172, -128), pt(-70, -210), pt(64, -204), pt(138, -146), pt(90, -150), pt(10, -140), pt(-60, -100), pt(-110, -40), pt(-150, 30)], true, 0.5)} fill="#2A3946" stroke="#1C2731" strokeWidth={3} opacity={1 - xray * 0.8} />
      <ellipse cx={-30} cy={10} rx={24} ry={36} fill={color.skin} stroke={color.skinLine} strokeWidth={3} opacity={1 - xray * 0.8} />
      <ellipse cx={118} cy={-42} rx={9} ry={12} fill="#2A3946" opacity={1 - xray * 0.8} />
      {/* x-ray: skull and brain */}
      {xray > 0 ? (
        <g opacity={xray}>
          <path d={SKULL} fill={color.bone} stroke={skullGlow > 0 ? color.accent : color.boneLine} strokeWidth={3 + skullGlow * 4} />
          <path d={BRAIN} fill={color.layerBrain} stroke={brainGlow > 0 ? color.accent : '#B66E6B'} strokeWidth={3 + brainGlow * 4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${-120 + i * 50} ${-130 + (i % 2) * 20} q 18 30 0 60 q -16 26 6 52`} stroke="#B66E6B" strokeWidth={3} fill="none" opacity={0.7} />
          ))}
          <ellipse cx={110} cy={-40} rx={26} ry={22} fill={color.bg1} opacity={0.6} />
          {brainGlow > 0 ? <path d={BRAIN} fill={color.accent} opacity={0.12 + 0.1 * Math.sin(f / 6) * brainGlow} /> : null}
        </g>
      ) : null}
    </g>
  );
};
