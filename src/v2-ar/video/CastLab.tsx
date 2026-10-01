import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Noura, Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt, type Expression, type Gesture} from '../characters/rig';
import {colorAR, fontAR} from '../design/theme-ar';

/** Dev probe: the three rigs across their required states. */
export const CastLab: React.FC = () => {
  const f = useCurrentFrame();
  const row = (label: string, C: React.FC<any>, states: Array<{e: Expression; g: Gesture; l?: any}>, y: number, phase: number) => (
    <g>
      <text x={60} y={y - 320} fill={colorAR.textDim} style={{font: `700 26px ${fontAR.ar}`}}>{label}</text>
      {states.map((s, i) => (
        <g key={i} transform={`translate(${260 + i * 290} ${y})`}>
          <C
            scale={0.46}
            expression={s.e}
            gesture={s.g}
            look={s.l ?? 'center'}
            blink={blinkAt(f, 112, phase + i * 17)}
            mouth={mouthAt(f, s.e === 'talk', phase + i * 11)}
            breath={breathAt(f, phase + i * 9)}
          />
          <text x={0} y={30} textAnchor="middle" fill={colorAR.textFaint} style={{font: `600 20px ${fontAR.term}`}}>{s.e}/{s.g}</text>
        </g>
      ))}
    </g>
  );
  return (
    <AbsoluteFill style={{background: colorAR.bg0}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {row('راشد — Rashid', Rashid, [
          {e: 'idle', g: 'none'}, {e: 'talk', g: 'teach'}, {e: 'smileSmall', g: 'point'},
          {e: 'deadpan', g: 'none', l: 'right'}, {e: 'concern', g: 'bothOpen'}, {e: 'talk', g: 'phone'},
        ], 300, 0)}
        {row('سالم — Salem', Salem, [
          {e: 'idle', g: 'phone'}, {e: 'talk', g: 'point'}, {e: 'confused', g: 'bothOpen'},
          {e: 'surprised', g: 'none'}, {e: 'smirk', g: 'handOnHip'}, {e: 'sing', g: 'dramatic' as Gesture},
        ], 650, 40)}
        {row('نورة — Noura', Noura, [
          {e: 'idle', g: 'none'}, {e: 'talk', g: 'pointUp'}, {e: 'dry', g: 'none', l: 'left'},
          {e: 'smileSmall', g: 'point'}, {e: 'surprised', g: 'none'}, {e: 'deadpan', g: 'thinking'},
        ], 1000, 80)}
      </svg>
    </AbsoluteFill>
  );
};
