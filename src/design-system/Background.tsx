import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {color} from './theme';

/**
 * The stage: deep slate gradient, a faint measurement grid that drifts slowly
 * (parallax depth without distraction), and a soft vignette to focus the centre.
 */
export const Background: React.FC<{tint?: string; grid?: boolean}> = ({tint, grid = true}) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.25) % 80;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 42%, ${color.bg2} 0%, ${color.bg1} 45%, ${color.bg0} 100%)`}}>
      {tint ? (
        <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${tint}22 0%, transparent 70%)`}} />
      ) : null}
      {grid ? (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <defs>
            <pattern id="bg-grid" width={80} height={80} patternUnits="userSpaceOnUse" x={off} y={off * 0.6}>
              <path d="M80 0H0V80" fill="none" stroke={color.grid} strokeWidth={1} />
              <circle cx={0} cy={0} r={1.6} fill="rgba(170,205,230,0.12)" />
            </pattern>
            <radialGradient id="bg-grid-mask-g" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity={1} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </radialGradient>
            <mask id="bg-grid-mask">
              <rect width={1920} height={1080} fill="url(#bg-grid-mask-g)" />
            </mask>
          </defs>
          <rect width={1920} height={1080} fill="url(#bg-grid)" mask="url(#bg-grid-mask)" />
        </svg>
      ) : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};
