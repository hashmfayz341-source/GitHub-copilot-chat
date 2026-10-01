import React from 'react';
import {interpolate} from 'remotion';
import {colorAR, fontAR} from '../design/theme-ar';

/**
 * Salem's fictional group chat — "قروب الجسم".
 *
 * The episode's framing metaphor: an organising group whose first instruction is
 * anatomically ambiguous. Deliberately icons + one message, never a definitions
 * list (the Full Script forbids leading with vocabulary).
 */

const PART_ICONS = ['✋', '🦶', '🦵', '💪', '🫀', '🧠'];

export const PhoneGroup: React.FC<{
  /** 0..1 reveal of the phone itself */
  reveal?: number;
  /** 0..1 how far the first message has been typed/sent */
  message?: number;
  /** member icons appear one by one */
  members?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
}> = ({reveal = 1, message = 0, members = 0, x = 0, y = 0, scale = 1, rotate = 0}) => {
  const W = 300;
  const H = 600;
  const msgIn = interpolate(message, [0, 1], [26, 0]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={reveal}>
      {/* body */}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={34} fill={colorAR.chat.frame} stroke="#2E4252" strokeWidth={3} />
      <rect x={-W / 2 + 10} y={-H / 2 + 14} width={W - 20} height={H - 28} rx={26} fill={colorAR.chat.screen} />
      {/* notch */}
      <rect x={-34} y={-H / 2 + 18} width={68} height={10} rx={5} fill="#0A1118" />

      {/* group header */}
      <g transform={`translate(0 ${-H / 2 + 62})`}>
        <circle cx={-96} r={20} fill={colorAR.chat.bubbleOut} opacity={0.9} />
        <text x={-96} y={7} textAnchor="middle" style={{font: '700 20px sans-serif'}}>👥</text>
        <text
          x={84}
          y={2}
          textAnchor="end"
          fill={colorAR.chat.text}
          style={{font: `700 26px ${fontAR.ar}`, direction: 'rtl'}}
        >
          قروب الجسم
        </text>
        <text x={84} y={26} textAnchor="end" fill="#6E8597" style={{font: `500 17px ${fontAR.ar}`, direction: 'rtl'}}>
          {Math.round(interpolate(members, [0, 1], [0, 12]))} عضو
        </text>
        <line x1={-W / 2 + 18} y1={44} x2={W / 2 - 18} y2={44} stroke="#223240" strokeWidth={2} />
      </g>

      {/* members joining — body parts as group members, no vocabulary list */}
      <g transform={`translate(0 ${-H / 2 + 150})`}>
        {PART_ICONS.map((ic, i) => {
          const t = interpolate(members, [i / PART_ICONS.length, (i + 1) / PART_ICONS.length], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={i} transform={`translate(${(1 - col) * 86} ${row * 76})`} opacity={t}>
              <circle r={30} fill="#1A2A36" stroke="#2B4150" strokeWidth={2} />
              <text y={11} textAnchor="middle" style={{font: '30px sans-serif'}}>{ic}</text>
            </g>
          );
        })}
      </g>

      {/* the ambiguous first instruction */}
      <g transform={`translate(0 ${H / 2 - 150})`} opacity={message}>
        <g transform={`translate(0 ${msgIn})`}>
          <rect x={-W / 2 + 26} y={-44} width={W - 52} height={86} rx={18} fill={colorAR.chat.bubbleOut} />
          <text
            x={W / 2 - 44}
            y={-10}
            textAnchor="end"
            fill={colorAR.chat.text}
            style={{font: `600 23px ${fontAR.ar}`, direction: 'rtl'}}
          >
            اليد اليمين
          </text>
          <text
            x={W / 2 - 44}
            y={22}
            textAnchor="end"
            fill={colorAR.chat.text}
            style={{font: `600 23px ${fontAR.ar}`, direction: 'rtl'}}
          >
            ارفعها
          </text>
          <text x={-W / 2 + 44} y={34} fill={colorAR.chat.tick} style={{font: '600 20px sans-serif'}}>✓✓</text>
        </g>
      </g>
    </g>
  );
};
