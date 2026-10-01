import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, keyframes, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin, rig, toStage} from '../medical/Mannequin';
import {FOREARM, ForearmXray} from '../medical/Forearm';
import {DrawnArrow, DrawnPath, SvgText} from '../components/svg';
import {Kicker, Panel, Stage, TermReveal} from '../components/ui';
import {pt} from '../utils/geometry';

/** Elliptical rotation arrow drawn around an axis (cx, cy); dir +1 = clockwise on screen. */
const RotationArrow: React.FC<{cx: number; cy: number; rx: number; ry: number; dir: number; start: number; out?: number; stroke?: string}> = ({cx, cy, rx, ry, dir, start, out, stroke = color.axis}) => {
  const a0 = dir > 0 ? 200 : -20, a1 = dir > 0 ? 500 : -320;
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = ((a0 + ((a1 - a0) * i) / 40) * Math.PI) / 180;
    pts.push(`${i ? 'L' : 'M'}${cx + Math.cos(t) * rx} ${cy + Math.sin(t) * ry}`);
  }
  return <DrawnArrow d={pts.join(' ')} start={start} dur={22} out={out} stroke={stroke} width={6} head={22} />;
};

/* ───────── Medial / lateral rotation ───────── */
export const Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('rotation');
  const FX = 640, FY = 1010, FS = 0.95;
  const fwd = keyframes(frame, [[b('intro', 2.0), 0], [b('intro', 3.4), 1]]);
  const rot = keyframes(frame, [
    [b('med', 0.2), 0],
    [b.end('med'), 72],
    [b('lat', 0.1), 72],
    [b.end('lat'), -62],
    [b('spin', 0.2), -62],
    [b.at('spin', 0.5), 40],
    [b.end('spin', 0.4), 0],
  ]);
  const pose = {...ANATOMICAL, rForeFwd: fwd, rRot: rot};
  const R = rig('front', pose);
  const S = toStage(R.r.S, FX, FY, FS), E = toStage(R.r.E, FX, FY, FS), W = toStage(R.r.W, FX, FY, FS);
  const axisA = appear(frame, b('axis', 0.1), {}).opacity;
  const dx = E.x - S.x, dy = E.y - S.y;
  const ax0 = pt(S.x - dx * 0.35, S.y - dy * 0.35), ax1 = pt(E.x + dx * 0.25, E.y + dy * 0.25);
  const mid = pt((S.x + E.x) / 2, (S.y + E.y) / 2);
  // top-down inset
  const IX = 1290, IY = 560, IW = 520, IH = 420;
  const icx = IX + IW / 2, icy = IY + 150;
  const sh = pt(icx - 120, icy), r = (rot * Math.PI) / 180;
  const foreEnd = pt(sh.x + Math.sin(r) * 150, sh.y + Math.cos(r) * 150);
  const insetOn = frame >= b('axis');
  return (
    <SceneShell id="rotation" chapter={4} sub="Rotation">
      <Stage>
        <Mannequin view="front" x={FX} y={FY} scale={FS} pose={pose} highlight={frame > b('intro', 2) ? {rArm: color.accent} : {}} />
        <g opacity={axisA}>
          <line x1={ax0.x} y1={ax0.y} x2={ax1.x} y2={ax1.y} stroke={color.axis} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />
          <SvgText x={ax0.x - 20} y={ax0.y - 30} text="axis" start={b('axis', 0.3)} size={32} fill={color.axis} anchor="end" />
        </g>
        <RotationArrow cx={mid.x} cy={mid.y} rx={58} ry={18} dir={1} start={b('med', 0.2)} out={b('lat')} />
        <RotationArrow cx={mid.x} cy={mid.y} rx={58} ry={18} dir={-1} start={b('lat', 0.1)} out={b('spin')} />
        <RotationArrow cx={mid.x} cy={mid.y} rx={58} ry={18} dir={1} start={b('spin', 0.2)} />
        {/* anterior surface marker + its direction */}
        {fwd > 0.95 ? <circle cx={W.x} cy={W.y} r={10} fill={color.sagittal} stroke={color.bg0} strokeWidth={3} /> : null}
        <DrawnArrow d={`M${W.x + 20} ${W.y + 70} L${FX - 30} ${W.y + 70}`} start={b.at('med', 0.6)} dur={14} out={b('lat')} stroke={color.sagittal} width={6} head={22} />
        <SvgText x={(W.x + FX) / 2 + 60} y={W.y + 120} text="toward the midline" start={b.at('med', 0.65)} out={b('lat')} size={30} fill={color.sagittal} />
        <DrawnArrow d={`M${W.x - 20} ${W.y + 70} L${W.x - 230} ${W.y + 70}`} start={b.at('lat', 0.6)} dur={14} out={b('spin')} stroke={color.sagittal} width={6} head={22} />
        <SvgText x={W.x - 130} y={W.y + 120} text="away from the midline" start={b.at('lat', 0.65)} out={b('spin')} size={30} fill={color.sagittal} />
        <DrawnPath d={`M${FX} ${FY - 900 * FS} L${FX} ${FY}`} start={b('med')} dur={20} stroke={color.sagittal} width={3} dash={12} opacity={0.6} />
      </Stage>
      {/* superior view inset */}
      <Panel x={IX} y={IY} w={IW} h={IH} start={b('axis', 0.4)}>
        <div style={{position: 'absolute', left: 24, top: 18, ...type.kicker, fontSize: 20, color: color.textDim}}>Seen from above</div>
      </Panel>
      {insetOn ? (
        <Stage style={{opacity: appear(frame, b('axis', 0.6)).opacity}}>
          <ellipse cx={icx} cy={icy} rx={150} ry={70} fill={color.skin} stroke={color.skinLine} strokeWidth={3} />
          <circle cx={icx} cy={icy - 4} r={44} fill="#2A3946" />
          <line x1={icx} y1={icy - 110} x2={icx} y2={icy + 230} stroke={color.sagittal} strokeWidth={3} strokeDasharray="10 8" />
          <path d={`M${sh.x} ${sh.y} L${foreEnd.x} ${foreEnd.y}`} stroke={color.accent} strokeWidth={30} strokeLinecap="round" />
          <circle cx={foreEnd.x} cy={foreEnd.y} r={9} fill={color.sagittal} />
          <circle cx={sh.x} cy={sh.y} r={20} fill={color.axis} stroke={color.bg0} strokeWidth={4} />
          <text x={icx + 170} y={icy + 210} fill={color.textDim} fontFamily="Inter" fontWeight={700} fontSize={22} textAnchor="end">anterior ↓</text>
          <text x={sh.x - 30} y={sh.y - 34} fill={color.axis} fontFamily="Inter" fontWeight={800} fontSize={22} textAnchor="middle">axis</text>
        </Stage>
      ) : null}
      <div style={{position: 'absolute', left: 1240, top: 220, opacity: appear(frame, b('intro', 0.4), {out: b('medName', -0.1)}).opacity}}>
        <Kicker color={color.axis}>Rotation</Kicker>
        <div style={{...type.h2, color: color.text, marginTop: 10}}>around a long axis</div>
      </div>
      <TermReveal term="MEDIAL ROTATION" def="anterior surface → toward the midline" start={b('medName', 0.05)} out={b('lat', 0.1)} x={1240} y={230} size={66} width={640} accent={color.axis} />
      <TermReveal term="LATERAL ROTATION" def="anterior surface → away from the midline" start={b('latName', 0.05)} out={b('spin', 0.1)} x={1240} y={230} size={66} width={640} accent={color.axis} />
      <TermReveal term="The axis stays still" def="the limb turns around it" start={b('spin', 0.3)} x={1240} y={230} size={58} width={640} accent={color.axis} />
      {void progress}
    </SceneShell>
  );
};

/* ───────── Pronation / supination ───────── */
export const Pronation: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('pronation');
  const palm = keyframes(frame, [
    [b('pro', 0.6), 0],
    [b.end('pro', 0.2), 180],
    [b('sup', 0.2), 180],
    [b.end('sup', 0.1), 0],
  ]);
  const crossed = palm > 120;
  const showForearm = appear(frame, b('intro', 0.2), {out: b('note', -0.2)});
  const noteA = appear(frame, b('note', 0.0));
  const OX = -100, OY = 40;
  const {cx, wristY, elbowY} = FOREARM;
  return (
    <SceneShell id="pronation" chapter={4} sub="Pronation & supination">
      <Stage>
        <g opacity={showForearm.opacity}>
          <ForearmXray palm={palm} x={OX} y={OY} radiusGlow={frame > b('parallel', 1.0)} ulnaGlow={frame > b('parallel', 1.8) && frame < b('pro')} boneOpacity={appear(frame, b('parallel', 0.2)).opacity * 0.85 + 0.15} />
          {/* bone labels */}
          <SvgText x={OX + cx - 150} y={OY + (elbowY + wristY) / 2 - 40} text="radius" start={b('parallel', 1.2)} size={38} fill={color.accent} anchor="end" />
          <SvgText x={OX + cx + 150} y={OY + (elbowY + wristY) / 2 - 40} text="ulna" start={b('parallel', 1.8)} size={38} fill={color.text} anchor="start" />
          <SvgText x={OX + cx} y={OY + 130} text={crossed ? 'bones CROSSED' : 'bones PARALLEL'} start={b('parallel', 2.6)} size={34} fill={crossed ? color.accent : color.transverse} />
          {/* rotation arrow around the forearm's long axis */}
          <DrawnArrow d={`M${OX + cx - 110} ${OY + wristY + 40} C${OX + cx - 60} ${OY + wristY + 90} ${OX + cx + 60} ${OY + wristY + 90} ${OX + cx + 110} ${OY + wristY + 40}`} start={b('pro', 0.4)} dur={30} out={b('proName', 1.0)} stroke={color.accent} width={6} head={22} />
          <DrawnArrow d={`M${OX + cx + 110} ${OY + wristY + 40} C${OX + cx + 60} ${OY + wristY + 90} ${OX + cx - 60} ${OY + wristY + 90} ${OX + cx - 110} ${OY + wristY + 40}`} start={b('sup', 0.2)} dur={30} out={b('supName', 1.0)} stroke={color.transverse} width={6} head={22} />
          <SvgText x={OX + cx + 300} y={OY + wristY + 160} text={palm > 90 ? 'palm faces POSTERIORLY' : 'palm faces ANTERIORLY'} start={b('intro', 1.6)} size={30} fill={palm > 90 ? color.accent : color.transverse} />
        </g>
        {noteA.opacity > 0 ? (
          <g opacity={noteA.opacity}>
            <Mannequin view="front" x={620} y={1010} scale={0.95} highlight={{rHand: color.transverse, lHand: color.transverse}} />
            <SvgText x={360} y={720} text="supinated" start={b('note', 0.6)} size={34} fill={color.transverse} />
            <SvgText x={880} y={720} text="supinated" start={b('note', 0.8)} size={34} fill={color.transverse} />
          </g>
        ) : null}
      </Stage>
      <TermReveal term="SUPINATION" def="palm forward · radius ∥ ulna" start={b('parallel', 2.2)} out={b('pro', 0.1)} x={1220} y={300} size={92} width={640} accent={color.transverse} />
      <TermReveal term="PRONATION" def="turns the palm posteriorly" start={b('proName', 0.05)} out={b('sup', 0.1)} x={1220} y={300} size={92} width={640} />
      <TermReveal term="SUPINATION" def="turns the palm anteriorly" start={b('supName', 0.05)} out={b('note', -0.2)} x={1220} y={300} size={92} width={640} accent={color.transverse} />
      <TermReveal term="Anatomical position" def="= the forearm is supinated" start={b('note', 0.3)} x={1180} y={360} size={70} width={680} accent={color.transverse} />
    </SceneShell>
  );
};
