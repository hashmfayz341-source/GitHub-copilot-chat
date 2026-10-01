import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {Camera} from '../animation/Camera';
import {useBeats} from '../animation/beats';
import {appear, ease, lerp, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin, Pose, RELAXED, mixPose, rig, toStage} from '../medical/Mannequin';
import {ArcArrow, DrawnArrow, DrawnPath, SvgText} from '../components/svg';
import {Checklist, Kicker, TermReveal} from '../components/ui';
import {pt} from '../utils/geometry';

const FX = 640, FY = 1000, FS = 0.95;

export const Position: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('position');

  // progressive correction of the posture, one feature per beat
  const pUp = progress(frame, b('upright', 1.0), 30);
  const pFeet = progress(frame, b('feet', 0.4), 36);
  const pLimbs = progress(frame, b('limbs', 0.3), 30);
  const pPalm = progress(frame, b('palms', 2.6), 40);
  const pose: Pose = {
    ...RELAXED,
    slouch: lerp(RELAXED.slouch, 0, pUp),
    legSpread: lerp(RELAXED.legSpread, ANATOMICAL.legSpread, pFeet),
    toeOut: lerp(RELAXED.toeOut, 0, pFeet),
    rAbd: lerp(RELAXED.rAbd, ANATOMICAL.rAbd, pLimbs), lAbd: lerp(RELAXED.lAbd, ANATOMICAL.lAbd, pLimbs),
    rElbow: lerp(RELAXED.rElbow, 0, pLimbs), lElbow: lerp(RELAXED.lElbow, 0, pLimbs),
    rPalm: lerp(RELAXED.rPalm, 0, pPalm), lPalm: lerp(RELAXED.lPalm, 0, pPalm),
    fingers: lerp(1, 0, pPalm),
  };
  const R = rig('front', pose);
  const handR = toStage(R.r.W, FX, FY, FS);

  // views: figure slides left, a twin turns to show the posterior view
  const pViews = progress(frame, b('views', 0.2), 34);
  const pTurn = progress(frame, b.at('views', 0.55), 30);
  const pRule = progress(frame, b('rule', 0.1), 20);
  const pRef = progress(frame, b('reference', -0.2), 30);
  const mainX = lerp(FX, 520, pViews);
  const twinX = lerp(520, 1400, pTurn);
  const twinSX = Math.max(0.04, Math.abs(Math.cos(pTurn * Math.PI)));
  const twinView = pTurn < 0.5 ? 'front' : 'back';
  const viewsFade = 1 - pRule;

  const listOut = b('views', 0.1);
  const checks = [
    {text: 'Standing upright', at: b('upright', 1.6)},
    {text: 'Feet together, toes forward', at: b('feet', 1.4)},
    {text: 'Upper limbs at the sides', at: b('limbs', 1.0)},
    {text: 'Palms forward, fingers together', at: b('palms', 3.6)},
  ];

  return (
    <SceneShell id="position" chapter={1}>
      <Camera
        keys={[
          {f: 0, x: 960, y: 560, zoom: 1},
          {f: b('palms', 0.6), x: 960, y: 560, zoom: 1},
          {f: b('palms', 1.8), x: 760, y: handR.y - 10, zoom: 1.6},
          {f: b('palms', 5.4), x: 760, y: handR.y - 10, zoom: 1.6},
          {f: b('views'), x: 960, y: 560, zoom: 1},
        ]}
      >
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          {/* main figure + twin (views) */}
          <g opacity={viewsFade}>
            {pTurn > 0 ? <Mannequin view={twinView} x={twinX} y={FY} scale={FS} scaleX={twinSX} pose={ANATOMICAL} /> : null}
            <Mannequin
              view="front"
              x={mainX}
              y={FY}
              scale={FS}
              pose={pose}
              highlight={{
                ...(frame > b('feet') && frame < b('limbs') ? {rFoot: color.accent, lFoot: color.accent} : {}),
                ...(frame > b('limbs') && frame < b('palms') ? {rArm: color.accent, lArm: color.accent} : {}),
                ...(frame > b('palms', 1.5) && frame < b('views') ? {rHand: color.accent, lHand: color.accent} : {}),
              }}
            />
          </g>
          {/* upright: plumb line */}
          <DrawnPath d={`M${FX} ${FY - 900 * FS - 30} L${FX} ${FY + 10}`} start={b('upright', 0.6)} dur={30} out={b('feet')} stroke={color.transverse} width={4} dash={12} />
          <DrawnArrow d={`M${FX + 190} ${FY - 360} L${FX + 190} ${FY - 640}`} start={b('upright', 0.8)} dur={22} out={b('feet')} stroke={color.transverse} />
          {/* feet: come together, toes forward */}
          <DrawnArrow d={`M${FX - 160} ${FY - 20} L${FX - 90} ${FY - 20}`} start={b('feet', 0.3)} dur={16} out={b('limbs')} />
          <DrawnArrow d={`M${FX + 160} ${FY - 20} L${FX + 90} ${FY - 20}`} start={b('feet', 0.3)} dur={16} out={b('limbs')} />
          <SvgText x={FX} y={FY + 50} text="toes point forward" start={b('feet', 1.2)} out={b('limbs')} size={30} fill={color.accent} family="Inter" weight={700} />
          {/* palms: rotation arrows at the wrists */}
          {[R.r, R.l].map((j, i) => {
            const w = toStage(j.W, mainX, FY, FS);
            return <ArcArrow key={i} c={pt(w.x, w.y + 30)} r={52} a0={i === 0 ? 200 : -20} a1={i === 0 ? 340 : -160} start={b('palms', 2.2)} dur={26} out={b('palms', 5.2)} stroke={color.accent} width={6} head={20} />;
          })}
          <SvgText x={handR.x - 70} y={handR.y + 125} text="palm forward" start={b('palms', 3.6)} out={b('views')} size={22} fill={color.accent} family="Inter" weight={800} />
          <SvgText x={handR.x - 120} y={handR.y + 30} text="thumb lateral" start={b('palms', 4.2)} out={b('views')} size={18} fill={color.textDim} family="Inter" weight={700} anchor="end" />
          {/* views labels */}
          <g opacity={viewsFade}>
            <SvgText x={520} y={FY + 44} text="ANTERIOR VIEW" start={b.at('views', 0.3)} size={32} fill={color.coronal} family="Inter" weight={800} />
            <SvgText x={1400} y={FY + 44} text="POSTERIOR VIEW" start={b.at('views', 0.85)} size={32} fill={color.coronal} family="Inter" weight={800} />
          </g>
          {/* rule: any real posture is described as if in anatomical position */}
          <RuleScenarios start={b('rule', 0.2)} beats={[b.at('rule', 0.2), b.at('rule', 0.32), b.at('rule', 0.45)]} ghostAt={b.at('rule', 0.62)} out={b('reference', -0.2)} />
          {/* reference */}
          {pRef > 0 ? (
            <g opacity={pRef}>
              <Mannequin view="front" x={960} y={FY} scale={FS * (0.92 + 0.08 * pop(frame, b('reference', -0.2)))} />
            </g>
          ) : null}
        </svg>
      </Camera>
      <div style={{position: 'absolute', left: 1080, top: 220, opacity: appear(frame, b('intro', 0.5), {out: listOut}).opacity}}>
        <Kicker>Build the reference</Kicker>
        <div style={{...type.h2, color: color.text, marginTop: 10}}>The anatomical position</div>
      </div>
      <Checklist items={checks} x={1080} y={420} start={b('upright')} out={listOut} width={760} />
      <TermReveal term="Anatomical position" def="the standard reference posture" start={b('views', 0.1)} out={b('rule', -0.4)} x={960} y={430} align="center" size={50} width={560} />
      <TermReveal term="Describe as if…" def="…the body were in the anatomical position" start={b('rule', 0.5)} out={b('reference', -0.3)} x={960} y={70} align="center" size={72} width={1400} accent={color.coronal} />
      <TermReveal term="Standard reference" def="for every description that follows" start={b('reference', 0.3)} x={1200} y={430} size={72} width={640} />
    </SceneShell>
  );
};

/** Lying, sitting and turned-away figures, each overlaid with a ghost of the reference posture. */
const RuleScenarios: React.FC<{start: number; beats: number[]; ghostAt: number; out: number}> = ({start, beats, ghostAt, out}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dy: 30});
  if (a.opacity <= 0) return null;
  const S = 0.5;
  const g = progress(frame, ghostAt, 24, ease.out);
  const items = [
    {label: 'lying down', x: 430, at: beats[0], el: <Mannequin view="side" x={430 + 225} y={720} scale={S} rotate={-90} shadow={false} />},
    {label: 'sitting', x: 960, at: beats[1], el: <Mannequin view="side" x={960 - 50} y={880 + 258 * S} scale={S} pose={{hipFlex: 90, kneeFlex: 90, sFlex: 10, eFlex: 30}} shadow={false} />},
    {label: 'turned away', x: 1490, at: beats[2], el: <Mannequin view="back" x={1490} y={880} scale={S} />},
  ];
  return (
    <g opacity={a.opacity}>
      {items.map((it, i) => {
        const ai = appear(frame, it.at, {dy: 20});
        return (
          <g key={i} opacity={ai.opacity} transform={`translate(0 ${ai.y})`}>
            {i === 1 ? <rect x={it.x - 120} y={880 - 212 * S + 22 * S} width={110} height={212 * S - 22 * S} rx={10} fill="#2F4656" stroke="#45657A" strokeWidth={3} /> : null}
            {i === 0 ? <rect x={it.x - 260} y={740} width={520} height={20} rx={10} fill="#2F4656" stroke="#45657A" strokeWidth={3} /> : null}
            {it.el}
            {i === 0 ? (
              <Mannequin view="front" x={lerp(655, it.x, g)} y={lerp(720, 880, g)} rotate={lerp(-90, 0, g)} scale={S} ghost={color.accent} opacity={Math.min(1, g * 3)} />
            ) : (
              <Mannequin view="front" x={it.x} y={880} scale={S} ghost={color.accent} opacity={g} scaleX={i === 2 ? Math.max(0.05, g) : 1} />
            )}
            <text x={it.x} y={960} fill={color.textDim} fontFamily="Inter" fontWeight={700} fontSize={32} textAnchor="middle">
              {it.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
