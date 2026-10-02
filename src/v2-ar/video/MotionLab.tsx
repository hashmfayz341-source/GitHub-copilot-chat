import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Feet} from '../anatomy/Feet';
import {Forearm} from '../anatomy/Forearm';
import {Joint} from '../anatomy/Joint';
import {StageAR} from '../components/SceneShellAR';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * Dev-only correctness probe for the movement primitives. Not part of the film.
 *
 * Laid out on a fixed grid so a REVERSED movement is visible in a single still,
 * without trusting a label:
 *
 *   inversion / eversion  the two soles converge / diverge about the midline
 *   supination / pronation the radius is PARALLEL to the ulna / CROSSES it
 *   flexion                the elbow and the knee swing to OPPOSITE sides of
 *                          the same anterior reference, at the same angle
 */

const CELL_W = 640;
const CELL_H = 528;

const Cell: React.FC<{col: number; row: number; title: string; note: string; scale: number; children: React.ReactNode}> = ({
  col,
  row,
  title,
  note,
  scale,
  children,
}) => {
  const cx = col * CELL_W + CELL_W / 2;
  const cy = row * CELL_H;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <text y={54} textAnchor="middle" fill={colorAR.text} style={{font: '800 28px Manrope, sans-serif'}}>
        {title}
      </text>
      <text y={88} textAnchor="middle" fill={colorAR.textDim} style={{font: `600 22px ${fontAR.ar}`, direction: 'rtl'}}>
        {note}
      </text>
      <g transform={`translate(0 ${CELL_H * 0.62}) scale(${scale})`}>{children}</g>
    </g>
  );
};

export const MotionLab: React.FC = () => (
  <AbsoluteFill>
    <StageAR />
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {/* row 0 — the foot movement V1 once shipped reversed */}
        <Cell col={0} row={0} title="Neutral" note="القدم بوضع محايد" scale={0.52}>
          <Feet mode="neutral" showMidline labels />
        </Cell>
        <Cell col={1} row={0} title="Inversion" note="الأخمص يتجه للداخل" scale={0.52}>
          <Feet mode="inversion" amount={1} showMidline labels />
        </Cell>
        <Cell col={2} row={0} title="Eversion" note="الأخمص يتجه للخارج" scale={0.52}>
          <Feet mode="eversion" amount={1} showMidline labels />
        </Cell>

        {/* row 1 — the radius must cross the ulna, and flexion must flip at the knee */}
        <Cell col={0} row={1} title="Supination" note="الـradius والـulna متوازيان" scale={0.46}>
          <Forearm t={0} labels />
        </Cell>
        <Cell col={1} row={1} title="Pronation" note="الـradius يتقاطع فوق الـulna" scale={0.46}>
          <Forearm t={1} labels />
        </Cell>
        <Cell col={2} row={1} title="Flexion: elbow vs knee" note="نفس التعريف، اتجاهان متعاكسان" scale={0.42}>
          <g transform="translate(-230 -150)">
            <Joint kind="elbow" t={0.75} />
          </g>
          <g transform="translate(230 -150)">
            <Joint kind="knee" t={0.75} />
          </g>
        </Cell>
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);
