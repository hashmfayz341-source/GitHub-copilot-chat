import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Jaw, SagittalFoot} from '../anatomy/SagittalFoot';
import {LimbMovement} from '../anatomy/LimbMovement';
import {StageAR} from '../components/SceneShellAR';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * Second correctness probe, for the movements that act at a joint rather than
 * on a plane. Dev-only. Each panel is readable as right or wrong in one still:
 *
 *   abduction      the limb leaves the drawn midline, and the angle is measured
 *                  from the body's vertical axis
 *   rotation       the flexed forearm points toward or away from the midline
 *   circumduction  the distal end travels the drawn cone
 *   dorsi/plantar  the ankle angle shrinks / opens against a fixed shin
 *   protraction    the mandible translates anteriorly without hinging
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
}) => (
  <g transform={`translate(${col * CELL_W + CELL_W / 2} ${row * CELL_H})`}>
    <text y={50} textAnchor="middle" fill={colorAR.text} style={{font: '800 27px Manrope, sans-serif'}}>
      {title}
    </text>
    <text y={84} textAnchor="middle" fill={colorAR.textDim} style={{font: `600 22px ${fontAR.ar}`, direction: 'rtl'}}>
      {note}
    </text>
    <g transform={`translate(0 ${CELL_H * 0.66}) scale(${scale})`}>{children}</g>
  </g>
);

export const MotionLab2: React.FC = () => (
  <AbsoluteFill>
    <StageAR />
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Cell col={0} row={0} title="Adduction (at the side)" note="الذراع عند الخط" scale={0.46}>
          <LimbMovement mode="abduction" t={0} />
        </Cell>
        <Cell col={1} row={0} title="Abduction" note="ابتعد عن المنتصف" scale={0.46}>
          <LimbMovement mode="abduction" t={1} />
        </Cell>
        <Cell col={2} row={0} title="Circumduction" note="الطرف يرسم دائرة" scale={0.46}>
          <LimbMovement mode="circumduction" t={0.18} />
        </Cell>

        <Cell col={0} row={1} title="Medial / Lateral rotation" note="الساعد يشير للداخل أو للخارج" scale={0.4}>
          <g transform="translate(-200 -40)">
            <LimbMovement mode="rotation" t={1} />
          </g>
          <g transform="translate(290 -40)">
            <LimbMovement mode="rotation" t={0} />
          </g>
        </Cell>
        <Cell col={1} row={1} title="Dorsiflexion / Plantar flexion" note="الزاوية تصغر أو تنفتح" scale={0.42}>
          <g transform="translate(-150 60)">
            <SagittalFoot t={1} />
          </g>
          <g transform="translate(190 60)">
            <SagittalFoot t={-1} />
          </g>
        </Cell>
        <Cell col={2} row={1} title="Protraction / Retraction" note="الفك ينزلق للأمام" scale={0.52}>
          <g transform="translate(-130 40)">
            <Jaw t={0} />
          </g>
          <g transform="translate(180 40)">
            <Jaw t={1} />
          </g>
        </Cell>
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);
