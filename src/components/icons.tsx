/** Small looping concept icons (used in objectives, roadmap, summary). Drawn in a 120×120 box. */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {color} from '../design-system/theme';
import {capsulePath, pt} from '../utils/geometry';

export type IconKind = 'figure' | 'planes' | 'arrows' | 'move' | 'case' | 'language' | 'microscope';

const MiniFigure: React.FC<{arm?: number; stroke?: string}> = ({arm = 8, stroke = color.skin}) => {
  const s = (a: number, side: number) => {
    const r = (a * Math.PI) / 180;
    return pt(60 + side * (14 + Math.sin(r) * 34), 44 + Math.cos(r) * 34);
  };
  return (
    <g fill={stroke}>
      <circle cx={60} cy={20} r={10} />
      <path d={capsulePath(pt(60, 38), 13, pt(60, 66), 10)} />
      <path d={capsulePath(pt(46, 40), 5, s(arm, -1), 4)} />
      <path d={capsulePath(pt(74, 40), 5, s(8, 1), 4)} />
      <path d={capsulePath(pt(54, 72), 6, pt(52, 108), 4)} />
      <path d={capsulePath(pt(66, 72), 6, pt(68, 108), 4)} />
    </g>
  );
};

export const Icon: React.FC<{kind: IconKind; size?: number; tint?: string}> = ({kind, size = 120, tint = color.accent}) => {
  const f = useCurrentFrame();
  const t = (f % 90) / 90;
  const wave = Math.sin(t * Math.PI * 2);
  let body: React.ReactNode = null;
  switch (kind) {
    case 'figure':
      body = (
        <>
          <MiniFigure />
          <rect x={20} y={6} width={80} height={108} rx={10} fill="none" stroke={tint} strokeWidth={3} strokeDasharray="6 6" strokeDashoffset={-f * 0.6} />
        </>
      );
      break;
    case 'planes':
      body = (
        <>
          <MiniFigure stroke={color.skinShade} />
          <line x1={60} y1={2} x2={60} y2={118} stroke={color.sagittal} strokeWidth={4} />
          <line x1={14} y1={60 + wave * 24} x2={106} y2={60 + wave * 24} stroke={color.transverse} strokeWidth={4} />
          <path d="M28 18 L92 6 L92 108 L28 118Z" fill={color.coronal} fillOpacity={0.18} stroke={color.coronal} strokeWidth={3} />
        </>
      );
      break;
    case 'arrows':
      body = (
        <g stroke={tint} strokeWidth={6} strokeLinecap="round" fill="none">
          <circle cx={60} cy={60} r={8} fill={tint} stroke="none" />
          {[0, 90, 180, 270].map((a) => {
            const r = (a * Math.PI) / 180;
            const L = 34 + wave * 6;
            const x = 60 + Math.cos(r) * L, y = 60 + Math.sin(r) * L;
            return (
              <g key={a}>
                <line x1={60 + Math.cos(r) * 16} y1={60 + Math.sin(r) * 16} x2={x} y2={y} />
                <path d={`M${x + Math.cos(r) * 10} ${y + Math.sin(r) * 10} L${x + Math.cos(r + 2.4) * 12} ${y + Math.sin(r + 2.4) * 12} L${x + Math.cos(r - 2.4) * 12} ${y + Math.sin(r - 2.4) * 12}Z`} fill={tint} stroke="none" />
              </g>
            );
          })}
        </g>
      );
      break;
    case 'move':
      body = (
        <>
          <MiniFigure arm={10 + (wave * 0.5 + 0.5) * 75} />
          <path d="M30 94 A50 50 0 0 1 10 46" fill="none" stroke={tint} strokeWidth={4} strokeDasharray="5 6" />
        </>
      );
      break;
    case 'case':
      body = (
        <g>
          <rect x={22} y={14} width={76} height={96} rx={10} fill="none" stroke={tint} strokeWidth={4} />
          <rect x={42} y={6} width={36} height={16} rx={5} fill={tint} />
          <path d="M60 46 v30 M45 61 h30" stroke={color.sagittal} strokeWidth={8} strokeLinecap="round" />
          <line x1={36} y1={94} x2={84} y2={94} stroke={color.textFaint} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
      break;
    case 'language':
      body = (
        <g fill="none" strokeWidth={4} strokeLinejoin="round">
          <path d="M14 22 h56 a8 8 0 0 1 8 8 v26 a8 8 0 0 1 -8 8 h-30 l-14 12 v-12 h-12 a8 8 0 0 1 -8 -8 v-26 a8 8 0 0 1 8 -8z" stroke={tint} />
          <path d="M106 50 h-44 a8 8 0 0 0 -8 8 v24 a8 8 0 0 0 8 8 h26 l14 12 v-12 h4 a8 8 0 0 0 8 -8 v-24 a8 8 0 0 0 -8 -8z" stroke={color.coronal} fill={color.bg1} />
          <circle cx={74} cy={70} r={3.5} fill={color.coronal} stroke="none" opacity={t < 0.33 ? 1 : 0.3} />
          <circle cx={84} cy={70} r={3.5} fill={color.coronal} stroke="none" opacity={t >= 0.33 && t < 0.66 ? 1 : 0.3} />
          <circle cx={94} cy={70} r={3.5} fill={color.coronal} stroke="none" opacity={t >= 0.66 ? 1 : 0.3} />
        </g>
      );
      break;
    case 'microscope':
      body = (
        <g fill="none" stroke={tint} strokeWidth={5} strokeLinecap="round">
          <circle cx={50} cy={50} r={28} />
          <line x1={71} y1={71} x2={100} y2={100} strokeWidth={9} />
          <circle cx={44} cy={46} r={5} fill={tint} stroke="none" />
          <circle cx={58} cy={58} r={4} fill={tint} stroke="none" />
        </g>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: 'visible'}}>
      {body}
    </svg>
  );
};
