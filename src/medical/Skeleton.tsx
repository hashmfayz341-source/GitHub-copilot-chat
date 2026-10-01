/**
 * Stylised bones for x-ray views. Shapes are built from the same capsule primitive as the
 * mannequin so skin and skeleton line up.
 */
import React from 'react';
import {color} from '../design-system/theme';
import {Pt, capsulePath, pt, smoothPath} from '../utils/geometry';

const BoneFill: React.FC<{d: string; glow?: string; opacity?: number}> = ({d, glow, opacity = 1}) => (
  <path d={d} fill={color.bone} stroke={glow ?? color.boneLine} strokeWidth={glow ? 5 : 2.5} opacity={opacity} strokeLinejoin="round" />
);

/** Horizontal upper limb (abducted 90°, palm forward → thumb up), trunk on the left. */
export const LIMB = {
  shoulder: pt(450, 430),
  elbow: pt(880, 438),
  wrist: pt(1330, 440),
  hand: pt(1540, 432),
};

export const UpperLimbXray: React.FC<{skinOpacity?: number; boneOpacity?: number; glow?: Partial<Record<'humerus' | 'forearm' | 'hand', string>>}> = ({skinOpacity = 1, boneOpacity = 1, glow = {}}) => {
  const {shoulder: S, elbow: E, wrist: W} = LIMB;
  const fingers = [0, 1, 2, 3].map((i) => {
    const y0 = 418 + i * 15;
    return {mc: [pt(1408, y0), pt(1480, y0 - 2 + i * 2)] as [Pt, Pt], ph: [pt(1488, y0 - 2 + i * 2), pt(1585 - Math.abs(i - 1.2) * 14, y0 + i * 4)] as [Pt, Pt]};
  });
  return (
    <g>
      {/* trunk edge */}
      <path d={smoothPath([pt(120, 300), pt(330, 330), pt(430, 360), pt(470, 470), pt(420, 620), pt(400, 900), pt(120, 960)], false)} fill="none" stroke={color.skinLine} strokeWidth={3} opacity={skinOpacity} />
      <path d={`M120 300 ${smoothPath([pt(120, 300), pt(330, 330), pt(430, 360), pt(470, 470), pt(420, 620), pt(400, 900), pt(120, 960)], false).slice(1)} L60 960 L60 300Z`} fill={color.skin} opacity={0.22 * skinOpacity} />
      {/* skin silhouette */}
      <g opacity={skinOpacity}>
        <path d={capsulePath(S, 74, E, 54)} fill={color.skin} fillOpacity={0.24} stroke={color.skinLine} strokeWidth={3} />
        <path d={capsulePath(E, 54, W, 38)} fill={color.skin} fillOpacity={0.24} stroke={color.skinLine} strokeWidth={3} />
        <path d={smoothPath([pt(1335, 405), pt(1420, 392), pt(1450, 340), pt(1478, 344), pt(1470, 396), pt(1600, 410), pt(1606, 470), pt(1470, 482), pt(1335, 476)], true, 0.45)} fill={color.skin} fillOpacity={0.24} stroke={color.skinLine} strokeWidth={3} />
      </g>
      <g opacity={boneOpacity}>
        {/* humerus */}
        <BoneFill d={`${capsulePath(pt(478, 432), 19, pt(850, 438), 15)} ${capsulePath(pt(450, 428), 42, pt(462, 430), 40)} ${capsulePath(pt(866, 424), 20, pt(866, 456), 20)}`} glow={glow.humerus} />
        {/* radius (thumb side, superior here) and ulna */}
        <BoneFill d={capsulePath(pt(902, 420), 10, pt(1316, 416), 16)} glow={glow.forearm} />
        <BoneFill d={capsulePath(pt(890, 456), 16, pt(1318, 462), 9)} glow={glow.forearm} />
        {/* carpals */}
        {[[1346, 414], [1368, 412], [1346, 440], [1368, 438], [1346, 464], [1370, 462], [1390, 425], [1390, 452]].map(([x, y], i) => (
          <rect key={i} x={x - 10} y={y - 10} width={20} height={20} rx={7} fill={color.bone} stroke={glow.hand ?? color.boneLine} strokeWidth={glow.hand ? 4 : 2} />
        ))}
        {/* metacarpals & phalanges */}
        {fingers.map((f, i) => (
          <g key={i}>
            <BoneFill d={capsulePath(f.mc[0], 6.5, f.mc[1], 5.5)} glow={glow.hand} />
            <BoneFill d={capsulePath(f.ph[0], 5.5, f.ph[1], 4)} glow={glow.hand} />
          </g>
        ))}
        <BoneFill d={capsulePath(pt(1398, 404), 7, pt(1432, 372), 6)} glow={glow.hand} />
        <BoneFill d={capsulePath(pt(1438, 366), 5.5, pt(1460, 344), 4.5)} glow={glow.hand} />
      </g>
    </g>
  );
};
