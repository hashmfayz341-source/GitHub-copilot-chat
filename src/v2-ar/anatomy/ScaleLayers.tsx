import React from 'react';
import {colorAR} from '../design/theme-ar';

/**
 * The four levels of looking that Scene 02 travels through:
 * whole body → organ → tissue → cell.
 *
 * Each layer is drawn at its own natural size and the scene scales the whole
 * stack, so the journey is one continuous dive rather than four cuts. That
 * continuity is the teaching: it is the SAME body at every level, only the
 * level of looking changes — which is exactly what the retrieval question at
 * the end of the scene asks the viewer to notice.
 */

/** A brain, seen from the side. Gyri drawn as a folded ribbon, not noise. */
export const Brain: React.FC<{opacity?: number; scale?: number}> = ({opacity = 1, scale = 1}) => (
  <g opacity={opacity} transform={`scale(${scale})`}>
    <ellipse rx={196} ry={150} fill="#D9A3A0" stroke="#8E5F5E" strokeWidth={4} />
    {/* cerebellum */}
    <ellipse cx={128} cy={96} rx={70} ry={48} fill="#C48D8A" stroke="#8E5F5E" strokeWidth={3.5} />
    {/* brain stem */}
    <path d="M 74 120 Q 70 168 52 196" stroke="#B37F7C" strokeWidth={30} fill="none" strokeLinecap="round" />
    {/* the central sulcus and the folds — a few deliberate ones read as a brain,
        where many random ones read as texture */}
    <g stroke="#8E5F5E" strokeWidth={3.5} fill="none" strokeLinecap="round">
      <path d="M -30 -140 Q -8 -60 -44 10" />
      <path d="M -150 -70 Q -92 -40 -120 24" />
      <path d="M 40 -128 Q 76 -62 44 2" />
      <path d="M 110 -96 Q 150 -50 122 -6" />
      <path d="M -176 20 Q -120 44 -150 92" />
      <path d="M -70 60 Q -20 80 -56 120" />
      <path d="M 20 70 Q 64 92 30 126" />
    </g>
  </g>
);

/** A sheet of tissue: cells in an ordered arrangement, which is the point. */
export const Tissue: React.FC<{opacity?: number; scale?: number; jitterSeed?: number}> = ({opacity = 1, scale = 1}) => {
  const cells: React.ReactNode[] = [];
  for (let r = -3; r <= 3; r++) {
    for (let c = -4; c <= 4; c++) {
      const x = c * 118 + (r % 2 ? 59 : 0);
      const y = r * 104;
      cells.push(
        <g key={`${r},${c}`} transform={`translate(${x} ${y})`}>
          <ellipse rx={52} ry={44} fill="#C9DCC8" stroke="#6F8E72" strokeWidth={3} />
          <circle r={16} fill="#5E7F8E" opacity={0.85} />
        </g>,
      );
    }
  }
  return (
    <g opacity={opacity} transform={`scale(${scale})`}>
      {cells}
    </g>
  );
};

/** One cell, close enough that its nucleus is the subject. */
export const Cell: React.FC<{opacity?: number; scale?: number}> = ({opacity = 1, scale = 1}) => (
  <g opacity={opacity} transform={`scale(${scale})`}>
    <ellipse rx={260} ry={212} fill="#C9DCC8" stroke="#6F8E72" strokeWidth={7} />
    {/* cytoplasm detail, kept quiet so the nucleus stays the subject */}
    <g opacity={0.5}>
      <ellipse cx={-130} cy={-70} rx={34} ry={20} fill="#A8C4A8" transform="rotate(-20 -130 -70)" />
      <ellipse cx={120} cy={82} rx={40} ry={22} fill="#A8C4A8" transform="rotate(14 120 82)" />
      <ellipse cx={92} cy={-112} rx={28} ry={18} fill="#A8C4A8" transform="rotate(40 92 -112)" />
    </g>
    <circle r={86} fill="#5E7F8E" stroke="#3E5B68" strokeWidth={5} />
    <circle r={30} fill="#32505E" opacity={0.9} />
  </g>
);
