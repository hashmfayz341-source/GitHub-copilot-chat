/**
 * Simplified thoracic/abdominal organs and microscopic views.
 * Organs are drawn in the mannequin's FRONT-view local coordinates (patient's left = +x).
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {smoothPath, pt} from '../utils/geometry';

const O = {
  lung: '#E9A3A0',
  lungLine: '#B86E6B',
  heart: '#D9534F',
  heartLine: '#8E2C2A',
  liver: '#9C4A3C',
  liverLine: '#6A2E24',
  stomach: '#E7A07A',
  stomachLine: '#A9643F',
  gut: '#EDB49A',
  gutLine: '#B27657',
};

export const HEART_CENTER = pt(16, -622);

export const Organs: React.FC<{opacity?: number; highlight?: 'heart'}> = ({opacity = 1, highlight}) => {
  const f = useCurrentFrame();
  const beat = 1 + Math.max(0, Math.sin((f % 26) / 26 * Math.PI * 2)) * 0.035;
  return (
    <g opacity={opacity}>
      {/* lungs */}
      <path d={smoothPath([pt(-14, -716), pt(-48, -700), pt(-78, -640), pt(-82, -585), pt(-46, -566), pt(-16, -600)], true, 0.5)} fill={O.lung} stroke={O.lungLine} strokeWidth={2.5} />
      <path d={smoothPath([pt(14, -716), pt(48, -700), pt(78, -640), pt(82, -585), pt(52, -570), pt(38, -598), pt(18, -620)], true, 0.5)} fill={O.lung} stroke={O.lungLine} strokeWidth={2.5} />
      {/* trachea */}
      <path d="M0 -760 L0 -712 M0 -712 L-16 -690 M0 -712 L16 -690" stroke="#D8C7B8" strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* liver (patient's right = −x) */}
      <path d={smoothPath([pt(-86, -566), pt(-20, -572), pt(22, -560), pt(4, -530), pt(-50, -508), pt(-86, -520)], true, 0.5)} fill={O.liver} stroke={O.liverLine} strokeWidth={2.5} />
      {/* stomach (patient's left = +x) */}
      <path d={smoothPath([pt(30, -566), pt(70, -560), pt(78, -528), pt(54, -506), pt(22, -512), pt(30, -536)], true, 0.5)} fill={O.stomach} stroke={O.stomachLine} strokeWidth={2.5} />
      {/* intestines */}
      <path d={smoothPath([pt(-72, -500), pt(72, -500), pt(78, -440), pt(-78, -440)], true, 0.3)} fill={O.gut} stroke={O.gutLine} strokeWidth={2.5} />
      <path d="M-56 -484 C-30 -500 -20 -470 0 -482 S30 -500 54 -480 M-60 -462 C-36 -476 -20 -446 6 -460 S40 -476 60 -456" stroke={O.gutLine} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* heart */}
      <g transform={`translate(${HEART_CENTER.x} ${HEART_CENTER.y}) scale(${beat}) rotate(-18)`}>
        <path d="M0 34 C-30 14 -40 -6 -32 -22 C-24 -36 -6 -34 0 -20 C6 -34 24 -36 32 -22 C40 -6 30 14 0 34Z" fill={O.heart} stroke={highlight === 'heart' ? '#FFB547' : O.heartLine} strokeWidth={highlight === 'heart' ? 5 : 2.5} />
        <path d="M-6 -24 C-6 -36 -2 -44 6 -46" stroke={O.heartLine} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Cardiac-muscle-like tissue (striated branching fibres with intercalated discs) in a 600×600 box. */
export const TissuePattern: React.FC<{size?: number}> = ({size = 600}) => {
  const rows = 7;
  const fibres: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * (size / rows);
    const wobble = (x: number) => Math.sin(x / 70 + r) * 10;
    const pts = Array.from({length: 9}, (_, i) => pt(-40 + i * ((size + 80) / 8), y + wobble(i * 80)));
    fibres.push(<path key={'f' + r} d={smoothPath(pts)} stroke="#C9554F" strokeWidth={size / rows - 14} fill="none" strokeLinecap="round" />);
    fibres.push(<path key={'s' + r} d={smoothPath(pts)} stroke="#E07A72" strokeWidth={size / rows - 14} fill="none" strokeDasharray="3 9" />);
    for (let k = 0; k < 3; k++) {
      const x = ((k + 0.3 + (r % 2) * 0.5) * size) / 3;
      fibres.push(<line key={`d${r}${k}`} x1={x} y1={y - 26} x2={x + 4} y2={y + 26} stroke="#F3D1C8" strokeWidth={5} />);
      fibres.push(<ellipse key={`n${r}${k}`} cx={x + 50} cy={y + wobble(x)} rx={16} ry={9} fill="#5B3D8F" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#F3C9C0" />
      {fibres}
    </svg>
  );
};

/** A single cell with nucleus, nucleolus and organelles in a 600×600 box. */
export const Cell: React.FC<{size?: number}> = ({size = 600}) => {
  const f = useCurrentFrame();
  const c = size / 2;
  const membrane = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const r = size * 0.36 + Math.sin(a * 3 + f / 30) * 8;
    return pt(c + Math.cos(a) * r, c + Math.sin(a) * r);
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#F6E3DC" />
      <path d={smoothPath(membrane, true)} fill="#F2B8B0" stroke="#B9524C" strokeWidth={6} />
      <circle cx={c + 10} cy={c - 6} r={size * 0.12} fill="#6E4BA8" stroke="#4A2F78" strokeWidth={5} />
      <circle cx={c + 24} cy={c - 14} r={size * 0.035} fill="#2E1C52" />
      {[[-120, 60], [100, 90], [-60, -110], [120, -70], [-140, -20]].map(([dx, dy], i) => (
        <ellipse key={i} cx={c + dx} cy={c + dy} rx={26} ry={12} fill="#E58A5A" stroke="#A85A30" strokeWidth={3} transform={`rotate(${i * 37} ${c + dx} ${c + dy})`} />
      ))}
    </svg>
  );
};
