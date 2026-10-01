import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {Camera} from '../animation/Camera';
import {useBeats} from '../animation/beats';
import {appear, ease, lerp, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {LIMB, UpperLimbXray} from '../medical/Skeleton';
import {ANATOMICAL, Mannequin, rig, toStage} from '../medical/Mannequin';
import {Bracket, DrawnArrow, Pulse, SvgText} from '../components/svg';
import {TermReveal} from '../components/ui';
import {pt} from '../utils/geometry';

const GAUGE_Y = 640;

export const Proximal: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('proximal');
  const limbA = appear(frame, b('intro', 0.1), {out: b('limbs', -0.1), dur: 24});
  const boneP = progress(frame, b('intro', 0.6), 30);
  const marks: Array<{name: string; p: {x: number; y: number}; at: number}> = [
    {name: 'shoulder', p: LIMB.shoulder, at: b.at('walk', 0.18)},
    {name: 'elbow', p: LIMB.elbow, at: b.at('walk', 0.3)},
    {name: 'wrist', p: LIMB.wrist, at: b.at('walk', 0.42)},
    {name: 'hand', p: LIMB.hand, at: b.at('walk', 0.54)},
  ];
  const reached = marks.reduce((acc, m) => (frame >= m.at ? m.p.x : acc), LIMB.shoulder.x);
  const gaugeX = lerp(LIMB.shoulder.x, reached, 1);
  const ex = frame >= b('example') && frame < b('limbs');
  const exSwap = frame >= b.at('example', 0.55);

  // phase B: whole body — limbs, then the cranial–caudal axis
  const bodyA = appear(frame, b('limbs', 0.1), {dur: 24});
  const FX = 820, FY = 1010, FS = 0.92;
  const R = rig('front', ANATOMICAL);
  const sh = toStage(R.r.S, FX, FY, FS), hd = toStage(R.r.W, FX, FY, FS);
  const hip = toStage(R.l.H, FX, FY, FS), ft = toStage(R.l.A, FX, FY, FS);
  return (
    <SceneShell id="proximal" chapter={3} sub="Proximal & distal">
      <Camera keys={[{f: 0, x: 900, y: 450, zoom: 1.0}, {f: b('walk'), x: 920, y: 470, zoom: 1.0}, {f: b('limbs', -0.2), x: 920, y: 470, zoom: 1.0}, {f: b('limbs', 0.6), x: 960, y: 540, zoom: 1.0}]}>
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          <g opacity={limbA.opacity}>
            <UpperLimbXray
              skinOpacity={1}
              boneOpacity={boneP}
              glow={ex ? {humerus: undefined, forearm: exSwap ? color.accent : undefined, hand: color.accent} : {}}
            />
            <Pulse c={LIMB.shoulder} r={60} start={b('prox', 0.2)} out={b('walk')} stroke={color.accent} />
            <SvgText x={LIMB.shoulder.x + 40} y={LIMB.shoulder.y + 130} text="attachment to trunk" start={b('prox', 0.5)} out={b('walk')} size={34} fill={color.accent} />
            {/* proximal / distal arrows */}
            <DrawnArrow d={`M760 300 L520 300`} start={b.at('prox', 0.35)} dur={18} out={b('walk')} stroke={color.accent} width={8} />
            <SvgText x={640} y={250} text="PROXIMAL" start={b.at('prox', 0.4)} out={b('walk')} size={50} fill={color.accent} />
            <SvgText x={640} y={345} text="nearer the trunk" start={b.at('prox', 0.55)} out={b('walk')} size={28} fill={color.textDim} family="Inter" weight={600} />
            <DrawnArrow d={`M1180 300 L1480 300`} start={b('dist', 0.2)} dur={18} out={b('walk')} stroke={color.coronal} width={8} />
            <SvgText x={1330} y={250} text="DISTAL" start={b('dist', 0.3)} out={b('walk')} size={50} fill={color.coronal} />
            <SvgText x={1330} y={345} text="farther from it" start={b('dist', 0.5)} out={b('walk')} size={28} fill={color.textDim} family="Inter" weight={600} />
            {/* walk outward: markers + distance gauge */}
            {frame >= b('walk') ? (
              <g opacity={appear(frame, b('walk'), {out: b('example', -0.2)}).opacity}>
                <line x1={LIMB.shoulder.x} y1={GAUGE_Y} x2={1560} y2={GAUGE_Y} stroke="rgba(255,255,255,0.12)" strokeWidth={14} strokeLinecap="round" />
                <line x1={LIMB.shoulder.x} y1={GAUGE_Y} x2={lerp(LIMB.shoulder.x, gaugeX, progress(frame, b('walk'), 12))} y2={GAUGE_Y} stroke="url(#gauge)" strokeWidth={14} strokeLinecap="round" />
                <defs>
                  <linearGradient id="gauge" x1={LIMB.shoulder.x} x2={1560} gradientUnits="userSpaceOnUse">
                    <stop offset={0} stopColor={color.accent} />
                    <stop offset={1} stopColor={color.coronal} />
                  </linearGradient>
                </defs>
                <text x={LIMB.shoulder.x} y={GAUGE_Y + 60} fill={color.textDim} fontFamily="Inter" fontWeight={700} fontSize={26}>distance from the trunk →</text>
              </g>
            ) : null}
            {marks.map((m, i) => {
              const s = pop(frame, m.at);
              const a = appear(frame, m.at, {out: b('limbs', -0.3)});
              if (a.opacity <= 0) return null;
              const tone = i === 0 ? color.accent : color.coronal;
              return (
                <g key={m.name} opacity={a.opacity}>
                  <circle cx={m.p.x} cy={m.p.y} r={16 * s} fill={tone} stroke={color.bg0} strokeWidth={4} />
                  <line x1={m.p.x} y1={m.p.y + 20} x2={m.p.x} y2={GAUGE_Y - 14} stroke={tone} strokeWidth={3} strokeDasharray="6 6" opacity={0.7} />
                  <text x={m.p.x} y={m.p.y + 110} fill={color.text} fontFamily="Manrope" fontWeight={800} fontSize={34} textAnchor="middle" stroke={color.bg0} strokeWidth={8} style={{paintOrder: 'stroke'}}>
                    {m.name}
                  </text>
                </g>
              );
            })}
            {/* example comparison */}
            <Bracket a={pt(LIMB.elbow.x, 330)} b={pt(LIMB.hand.x, 330)} side={-40} start={b('example', 0.2)} out={b('limbs', -0.4)} stroke={color.accent} />
            <SvgText x={(LIMB.elbow.x + LIMB.hand.x) / 2} y={220} text={exSwap ? 'elbow is PROXIMAL to hand' : 'hand is DISTAL to elbow'} start={b('example', 0.4)} out={b('limbs', -0.4)} size={46} fill={exSwap ? color.accent : color.coronal} />
          </g>

          {/* phase B — whole body */}
          {bodyA.opacity > 0 ? (
            <g opacity={bodyA.opacity}>
              <Mannequin view="front" x={FX} y={FY} scale={FS} />
              <DrawnArrow d={`M${sh.x - 70} ${sh.y + 10} L${hd.x - 70} ${hd.y + 40}`} start={b('limbs', 0.6)} dur={24} out={b('cranial', -0.3)} stroke={color.coronal} width={7} />
              <SvgText x={sh.x - 120} y={sh.y + 10} text="proximal" start={b('limbs', 0.6)} out={b('cranial', -0.3)} size={30} fill={color.accent} anchor="end" />
              <SvgText x={hd.x - 120} y={hd.y + 40} text="distal" start={b('limbs', 1.2)} out={b('cranial', -0.3)} size={30} fill={color.coronal} anchor="end" />
              <DrawnArrow d={`M${hip.x + 150} ${hip.y + 40} L${ft.x + 120} ${ft.y - 10}`} start={b('limbs', 0.9)} dur={24} out={b('cranial', -0.3)} stroke={color.coronal} width={7} />
              <SvgText x={hip.x + 185} y={hip.y + 40} text="proximal" start={b('limbs', 0.9)} out={b('cranial', -0.3)} size={30} fill={color.accent} anchor="start" />
              <SvgText x={ft.x + 155} y={ft.y - 20} text="distal" start={b('limbs', 1.5)} out={b('cranial', -0.3)} size={30} fill={color.coronal} anchor="start" />
              {/* cranial / caudal axis */}
              <DrawnArrow d={`M${FX + 260} ${FY - 470} L${FX + 260} ${FY - 880}`} start={b('cranial', 0.6)} dur={22} stroke={color.transverse} width={9} head={30} />
              <SvgText x={FX + 300} y={FY - 860} text="CRANIAL" start={b.at('cranial', 0.35)} size={48} fill={color.transverse} anchor="start" />
              <SvgText x={FX + 300} y={FY - 810} text="toward the head  ≈ superior" start={b.at('cranial', 0.55)} size={28} fill={color.textDim} anchor="start" family="Inter" weight={600} />
              <DrawnArrow d={`M${FX + 260} ${FY - 400} L${FX + 260} ${FY - 30}`} start={b('caudal', 0.2)} dur={22} stroke={color.transverse} width={9} head={30} />
              <SvgText x={FX + 300} y={FY - 100} text="CAUDAL" start={b('caudal', 0.3)} size={48} fill={color.transverse} anchor="start" />
              <SvgText x={FX + 300} y={FY - 50} text="toward the feet  ≈ inferior" start={b('caudal', 0.6)} size={28} fill={color.textDim} anchor="start" family="Inter" weight={600} />
            </g>
          ) : null}
        </svg>
      </Camera>
      <TermReveal term="Proximal · Distal" def="used mainly for the limbs" start={b('limbs', 0.4)} out={b('cranial', -0.3)} x={1180} y={420} size={70} width={680} />
    </SceneShell>
  );
};
