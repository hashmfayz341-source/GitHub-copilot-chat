import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, lerp, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {HEAD_POINTS, HeadProfile} from '../medical/Head';
import {Bracket, DrawnArrow, DrawnPath, SvgText} from '../components/svg';
import {Stage, TermReveal} from '../components/ui';
import {pt, smoothPath} from '../utils/geometry';

const LAYERS = [
  {name: 'Skull', two: '', c: color.layerBone, beat: 'skull'},
  {name: 'Neuro-', two: 'vascular', c: color.layerNV, beat: 'nv'},
  {name: 'Facial', two: 'muscles', c: color.layerMuscle, beat: 'muscle'},
  {name: 'SMAS', two: 'fascia', c: color.layerFascia, beat: 'smas'},
  {name: 'Subcut.', two: 'fat', c: color.layerFat, beat: 'fat'},
  {name: 'Skin', two: '', c: color.layerSkin, beat: 'skin'},
];

const SLAB_Y = 560;
const slabPath = (x: number, w: number) => {
  const L = [pt(x, SLAB_Y - 220), pt(x - 18, SLAB_Y - 80), pt(x - 12, SLAB_Y + 60), pt(x + 8, SLAB_Y + 210)];
  const R = [...L].reverse().map((p) => pt(p.x + w, p.y));
  return smoothPath([...L, ...R], true, 0.5);
};

const Texture: React.FC<{i: number; x: number; w: number}> = ({i, x, w}) => {
  const items: React.ReactNode[] = [];
  if (i === 4) for (let k = 0; k < 12; k++) items.push(<circle key={k} cx={x + w / 2 - 6 + (k % 2) * 12 - (k * 2) % 7} cy={SLAB_Y - 180 + k * 33} r={9} fill="#E2B43F" opacity={0.8} />);
  if (i === 2) for (let k = 0; k < 18; k++) items.push(<line key={k} x1={x - 8} y1={SLAB_Y - 190 + k * 22} x2={x + w + 4} y2={SLAB_Y - 196 + k * 22} stroke="#A2342E" strokeWidth={3} />);
  if (i === 1)
    items.push(
      <path key="a" d={`M${x + w * 0.3} ${SLAB_Y - 210} C${x - 10} ${SLAB_Y - 60} ${x + w} ${SLAB_Y + 40} ${x + w * 0.4} ${SLAB_Y + 200}`} stroke="#E0464A" strokeWidth={6} fill="none" />,
      <path key="v" d={`M${x + w * 0.7} ${SLAB_Y - 210} C${x + w} ${SLAB_Y - 40} ${x} ${SLAB_Y + 60} ${x + w * 0.6} ${SLAB_Y + 200}`} stroke="#4C7BE0" strokeWidth={6} fill="none" />,
      <path key="n" d={`M${x + w * 0.5} ${SLAB_Y - 210} C${x + w * 0.2} ${SLAB_Y - 20} ${x + w * 0.9} ${SLAB_Y + 20} ${x + w * 0.5} ${SLAB_Y + 200}`} stroke="#F5D547" strokeWidth={4} fill="none" />,
    );
  if (i === 0) for (let k = 0; k < 8; k++) items.push(<circle key={k} cx={x + 14 + (k % 3) * 14} cy={SLAB_Y - 170 + k * 48} r={4} fill="#CBBF9F" />);
  return <g>{items}</g>;
};

export const Depth: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('depth');
  const W = 44;
  const ex2 = progress(frame, b('ex2', -0.2), 34, ease.inOut);
  const headX = lerp(360, 760, ex2), headY = lerp(560, 590, ex2), headS = lerp(1.25, 1.8, ex2);
  const stackA = appear(frame, b('intro', 0.2), {out: b('ex2', -0.4)});
  const cheek = pt(headX + HEAD_POINTS.cheek.x * headS, headY + HEAD_POINTS.cheek.y * headS);
  return (
    <SceneShell id="depth" chapter={3} sub="Depth">
      <Stage>
        <HeadProfile x={headX} y={headY} scale={headS} xray={progress(frame, b('ex2', 0.2), 30)} brainGlow={progress(frame, b.at('ex2', 0.55), 20)} skullGlow={progress(frame, b.at('ex2', 0.3), 16)} />
        {/* callout from the cheek to the layer stack */}
        <g opacity={stackA.opacity}>
          <circle cx={cheek.x} cy={cheek.y} r={34} fill="none" stroke={color.accent} strokeWidth={4} opacity={appear(frame, b('peel'), {}).opacity} />
          <DrawnPath d={`M${cheek.x + 30} ${cheek.y - 20} L1010 ${SLAB_Y - 240}`} start={b('peel', 0.2)} dur={20} stroke={color.accent} width={2.5} dash={8} />
          <DrawnPath d={`M${cheek.x + 30} ${cheek.y + 20} L1010 ${SLAB_Y + 230}`} start={b('peel', 0.2)} dur={20} stroke={color.accent} width={2.5} dash={8} />
          {LAYERS.map((l, i) => {
            const x0 = 1000 + i * W;
            const x1 = 980 + i * 138;
            const pMove = l.beat === 'skull' ? 0 : progress(frame, b(l.beat, 0.1), 26, ease.out);
            const x = lerp(x0, x1, pMove);
            const lit = frame >= b(l.beat) ? 1 : 0;
            const ex1Hi = frame >= b('ex1') && (i === 0 || i === 5);
            const labA = appear(frame, b(l.beat, 0.2), {dy: 14});
            return (
              <g key={l.name}>
                <path d={slabPath(x, W)} fill={l.c} stroke={ex1Hi ? color.accent : 'rgba(0,0,0,0.35)'} strokeWidth={ex1Hi ? 6 : 2} opacity={0.55 + 0.45 * lit} />
                <Texture i={i} x={x} w={W} />
                <g opacity={labA.opacity} transform={`translate(0 ${labA.y})`}>
                  <text x={x + W / 2} y={SLAB_Y + 270} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={30} fill={color.text}>
                    {l.name}
                  </text>
                  {l.two ? (
                    <text x={x + W / 2} y={SLAB_Y + 306} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={26} fill={color.textDim}>
                      {l.two}
                    </text>
                  ) : null}
                </g>
              </g>
            );
          })}
          {/* depth axis */}
          <DrawnArrow d={`M1720 ${SLAB_Y - 300} L1000 ${SLAB_Y - 300}`} start={b('sup', 0.4)} dur={28} stroke={color.accent} width={6} head={24} />
          <SvgText x={1720} y={SLAB_Y - 345} text="SUPERFICIAL" start={b('sup', 0.3)} size={36} fill={color.accent} anchor="end" />
          <SvgText x={1720} y={SLAB_Y - 385} text="closer to the surface" start={b('sup', 0.8)} size={24} fill={color.textDim} anchor="end" family="Inter" weight={600} />
          <SvgText x={1000} y={SLAB_Y - 345} text="DEEP" start={b.at('sup', 0.55)} size={36} fill={color.accent} anchor="start" />
          <SvgText x={1000} y={SLAB_Y - 385} text="farther from the surface" start={b.at('sup', 0.65)} size={24} fill={color.textDim} anchor="start" family="Inter" weight={600} />
          <Bracket a={pt(1000 + 22, SLAB_Y + 340)} b={pt(980 + 5 * 138 + 22, SLAB_Y + 340)} side={40} start={b('ex1', 0.2)} out={b('ex2', -0.4)} stroke={color.accent} />
        </g>
        <SvgText x={1340} y={SLAB_Y + 440} text="skin is SUPERFICIAL to the bones" start={b('ex1', 0.5)} out={b('ex2', -0.4)} size={40} fill={color.text} />
        {/* brain deep to skull */}
        <SvgText x={1360} y={420} text="brain" start={b.at('ex2', 0.5)} size={56} fill={color.layerBrain} anchor="start" />
        <SvgText x={1360} y={490} text="is DEEP to" start={b.at('ex2', 0.6)} size={44} fill={color.text} anchor="start" />
        <SvgText x={1360} y={560} text="the skull" start={b.at('ex2', 0.7)} size={56} fill={color.layerBone} anchor="start" />
      </Stage>
      <TermReveal term="Superficial ↔ Deep" start={b('sup', 0.1)} out={b('peel', -0.2)} x={1360} y={830} align="center" size={60} width={900} />
    </SceneShell>
  );
};
