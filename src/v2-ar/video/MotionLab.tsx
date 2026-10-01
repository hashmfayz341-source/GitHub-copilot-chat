import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Feet} from '../anatomy/Feet';
import {StageAR} from '../components/SceneShellAR';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * Dev-only correctness probe for the movement primitives. Not part of the film.
 *
 * The inversion/eversion row is the one that matters: V1 once shipped this
 * movement reversed, so the panel is laid out to make a reversal obvious in a
 * single still — soles facing each other is inversion, soles facing apart is
 * eversion, and nothing else in the frame asserts a direction.
 */
const Panel: React.FC<{title: string; note: string; x: number; children: React.ReactNode}> = ({title, note, x, children}) => (
  <g transform={`translate(${x} 0)`}>
    <text y={-250} textAnchor="middle" fill={colorAR.text} style={{font: '800 34px Manrope, sans-serif'}}>
      {title}
    </text>
    <text y={-208} textAnchor="middle" fill={colorAR.textDim} style={{font: `600 26px ${fontAR.ar}`, direction: 'rtl'}}>
      {note}
    </text>
    {children}
  </g>
);

export const MotionLab: React.FC = () => (
  <AbsoluteFill>
    <StageAR />
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform="translate(0 560)">
          <Panel x={340} title="Neutral" note="القدم بوضع محايد">
            <Feet mode="neutral" showMidline labels scale={0.92} />
          </Panel>
          <Panel x={960} title="Inversion" note="الأخمص يتجه للداخل — نحو المنتصف">
            <Feet mode="inversion" amount={1} showMidline labels scale={0.92} />
          </Panel>
          <Panel x={1580} title="Eversion" note="الأخمص يتجه للخارج — بعيدًا عن المنتصف">
            <Feet mode="eversion" amount={1} showMidline labels scale={0.92} />
          </Panel>
        </g>
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);
