import React from 'react';
import {Brows, Eyes, Mouth, Nose} from './Face';
import type {Expression, Gesture, Look, Pose, RigProps} from './rig';

/**
 * Shared body rig. Identity (head covering, outfit colours, beard) is injected
 * by each character so the three read as the same construction with different
 * people in it — one rig to maintain, three distinct silhouettes.
 *
 * Local coordinates: origin at the feet, character ≈ 600 units tall,
 * head centre at (0, -478).
 */

export const HEAD_Y = -478;

export type Identity = {
  skin: string;
  skinShade: string;
  hair: string;
  coat: string;
  coatShade: string;
  /** torso under the coat */
  inner: string;
  innerShade: string;
  /** legs: a thobe hem (one shape) or trousers (two) */
  legs: 'thobe' | 'trousers';
  legColor: string;
  legShade: string;
  shoe: string;
  /** drawn behind the face */
  headwearBack?: React.ReactNode;
  /** drawn in front of the face edges */
  headwearFront?: React.ReactNode;
  beard?: React.ReactNode;
  lash?: boolean;
  /** something held in the left hand (tablet, book, phone) */
  prop?: React.ReactNode;
  badge?: string;
};

/** Shoulder anchor points. */
const SHOULDER = {x: 52, y: -392};

type ArmSpec = {d: string; hand: {x: number; y: number; r: number}};

/** Right arm (character's right = screen left when not flipped). */
const armFor = (gesture: Gesture, side: 'L' | 'R'): ArmSpec => {
  const s = side === 'R' ? -1 : 1; // screen-x sign
  const sx = s * SHOULDER.x;
  const sy = SHOULDER.y;
  const mk = (ex: number, ey: number, cx: number, cy: number): ArmSpec => ({
    d: `M ${sx} ${sy} Q ${s * cx} ${cy} ${s * ex} ${ey}`,
    hand: {x: s * ex, y: ey, r: 15},
  });
  // the gesture always belongs to the character's LEFT arm (screen right)
  if (side === 'R') return mk(66, -232, 86, -316); // relaxed at side
  switch (gesture) {
    case 'teach': return mk(128, -330, 104, -392);
    case 'point': return mk(156, -366, 108, -384);
    case 'pointUp': return mk(104, -452, 96, -372);
    case 'phone': return mk(74, -352, 100, -372);
    case 'handOnHip': return mk(64, -300, 118, -344);
    case 'bothOpen': return mk(132, -300, 110, -364);
    case 'thinking': return mk(28, -430, 92, -352);
    default: return mk(66, -232, 86, -316);
  }
};

export const CharacterBase: React.FC<RigProps & {id: Identity}> = ({
  id,
  mouth = 0,
  blink = 0,
  expression = 'idle' as Expression,
  look = 'center' as Look,
  gesture = 'none' as Gesture,
  pose = 'stand' as Pose,
  flip = false,
  scale = 1,
  x = 0,
  y = 0,
  breath = 0,
}) => {
  const lean = pose === 'leanIn' ? 4 : pose === 'leanBack' ? -3 : 0;
  const step = pose === 'stepForward' ? 10 : 0;
  const armL = armFor(gesture, 'L');
  const armR = armFor(gesture, 'R');

  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -scale : scale)} ${scale})`}>
      <g transform={`translate(${step} ${breath})`}>
        {/* ground contact shadow keeps the character in the room */}
        <ellipse cx={0} cy={6} rx={92} ry={14} fill="#000" opacity={0.26} />

        {/* ---- legs ---- */}
        {id.legs === 'thobe' ? (
          <path d="M -72 -250 Q -84 -90 -78 -8 L 78 -8 Q 84 -90 72 -250 Z" fill={id.legColor} stroke={id.legShade} strokeWidth={2} />
        ) : (
          <>
            <path d="M -56 -250 Q -62 -120 -54 -10 L -14 -10 Q -12 -130 -14 -250 Z" fill={id.legColor} stroke={id.legShade} strokeWidth={2} />
            <path d="M 14 -250 Q 12 -130 14 -10 L 54 -10 Q 62 -120 56 -250 Z" fill={id.legColor} stroke={id.legShade} strokeWidth={2} />
          </>
        )}
        <ellipse cx={-42} cy={-4} rx={34} ry={11} fill={id.shoe} />
        <ellipse cx={42} cy={-4} rx={34} ry={11} fill={id.shoe} />

        <g transform={`rotate(${lean} 0 -250)`}>
          {/* ---- torso under the coat ---- */}
          <path d="M -58 -392 Q -70 -300 -62 -236 L 62 -236 Q 70 -300 58 -392 Z" fill={id.inner} stroke={id.innerShade} strokeWidth={2} />

          {/* ---- arms (behind the coat front) ---- */}
          {[armR, armL].map((a, i) => (
            <g key={i}>
              <path d={a.d} stroke={id.coat} strokeWidth={30} fill="none" strokeLinecap="round" />
              <path d={a.d} stroke={id.coatShade} strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.25} />
              <circle cx={a.hand.x} cy={a.hand.y} r={a.hand.r} fill={id.skin} stroke={id.skinShade} strokeWidth={2} />
            </g>
          ))}
          {/* pointing index finger reads better as an explicit shape */}
          {gesture === 'point' ? (
            <rect x={armL.hand.x + 6} y={armL.hand.y - 5} width={26} height={9} rx={4.5} fill={id.skin} stroke={id.skinShade} strokeWidth={1.6} />
          ) : null}
          {gesture === 'pointUp' ? (
            <rect x={armL.hand.x - 4.5} y={armL.hand.y - 34} width={9} height={28} rx={4.5} fill={id.skin} stroke={id.skinShade} strokeWidth={1.6} />
          ) : null}

          {/* ---- open lab coat ---- */}
          <path d="M -58 -392 Q -96 -300 -88 -232 L -34 -232 Q -40 -320 -30 -392 Z" fill={id.coat} stroke={id.coatShade} strokeWidth={2} />
          <path d="M 58 -392 Q 96 -300 88 -232 L 34 -232 Q 40 -320 30 -392 Z" fill={id.coat} stroke={id.coatShade} strokeWidth={2} />
          {id.badge ? <rect x={34} y={-352} width={20} height={28} rx={4} fill={id.badge} /> : null}

          {/* ---- neck + head ---- */}
          <rect x={-16} y={-424} width={32} height={34} rx={12} fill={id.skinShade} />
          <g transform={`translate(0 ${HEAD_Y})`}>
            {id.headwearBack}
            <ellipse rx={58} ry={66} fill={id.skin} />
            <ellipse rx={58} ry={66} fill="none" stroke={id.skinShade} strokeWidth={2} />
            {id.beard}
            <Brows expression={expression} color={id.hair} />
            <Eyes look={look} blink={blink} expression={expression} hair={id.hair} lash={id.lash} />
            <Nose shade={id.skinShade} />
            <Mouth open={mouth} expression={expression} />
            {id.headwearFront}
          </g>
        </g>
        {id.prop}
      </g>
    </g>
  );
};
