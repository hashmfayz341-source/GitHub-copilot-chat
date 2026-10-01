import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from '../design-system/Background';
import {Mannequin, RELAXED} from '../medical/Mannequin';

/** Development sandbox for checking components in isolation (not part of the lecture). */
export const Lab: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <Mannequin view="front" x={300} y={1000} scale={1} pose={RELAXED} />
      <Mannequin view="front" x={720} y={1000} scale={1} />
      <Mannequin view="back" x={1120} y={1000} scale={1} pose={{rAbd: 80, lShrug: 30, lPalm: 180}} />
      <Mannequin view="side" x={1560} y={1000} scale={1} pose={{sFlex: 30, eFlex: 90, ankle: 20}} />
    </svg>
  </AbsoluteFill>
);
