import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorAR, fontAR, typeAR} from '../design/theme-ar';

/**
 * The English medical term card.
 *
 * V2 production rule: PHENOMENON → REACTION → UNDERSTANDING → TERM.
 * This component only ever renders after `at`, which scenes are expected to set
 * to a frame *after* the movement has been seen and reacted to. It deliberately
 * takes no definition text — the understanding has already happened on screen.
 */
export const TermReveal: React.FC<{
  term: string;
  at: number;
  until?: number;
  x?: number;
  y?: number;
  tint?: string;
  /** small variant for secondary labels sitting next to anatomy */
  small?: boolean;
  align?: 'center' | 'start';
}> = ({term, at, until, x = 960, y = 180, tint = colorAR.accent, small, align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;

  const s = spring({frame: frame - at, fps, config: {damping: 18, mass: 0.5}});
  const out = until === undefined ? 1 : interpolate(frame, [until - 8, until], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (out <= 0) return null;

  const style = small ? typeAR.termSmall : typeAR.term;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%) scale(${0.92 + s * 0.08})`,
        opacity: s * out,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        pointerEvents: 'none',
      }}
    >
      {/* the rule grows out of the term, so the reveal reads as "this is its name" */}
      <div style={{width: interpolate(s, [0, 1], [0, small ? 26 : 44]), height: 5, background: tint, borderRadius: 3}} />
      <div
        style={{
          ...style,
          color: colorAR.text,
          fontFamily: fontAR.term,
          background: 'rgba(8,13,18,0.78)',
          border: `2px solid ${tint}66`,
          borderRadius: 14,
          padding: small ? '6px 16px' : '10px 26px',
          whiteSpace: 'nowrap',
        }}
      >
        {term}
      </div>
    </div>
  );
};
