import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {Camera} from '../animation/Camera';
import {useBeats} from '../animation/beats';
import {appear, ease, keyframes, lerp, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin, rig, toStage} from '../medical/Mannequin';
import {AngleArc, ArcArrow, DrawnArrow, Midline, Pulse, SvgText} from '../components/svg';
import {Kicker, TermReveal} from '../components/ui';
import {arcPath, pt} from '../utils/geometry';

/* ───────── Flexion / extension ───────── */
export const Flexion: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('flexion');
  const FX = 700, FY = 1010, FS = 1.0;
  const eFlex = keyframes(frame, [
    [b('flex', 0.2), 0],
    [b.end('flex', -0.2), 140],
    [b('ext', 0.4), 140],
    [b.end('ext', -0.1), 0],
  ]);
  const pose = {...ANATOMICAL, eFlex};
  const R = rig('side', pose);
  const S = toStage(R.r.S, FX, FY, FS), E = toStage(R.r.E, FX, FY, FS), W = toStage(R.r.W, FX, FY, FS);
  const arcA = appear(frame, b('flex', 0.1), {}).opacity;
  const inExt = frame >= b('ext', 0.3);
  const reach = 160 * FS;
  const wristAngle = 90 - eFlex; // screen angle of the forearm
  return (
    <SceneShell id="flexion" chapter={4} sub="Flexion & extension">
      <Camera
        keys={[
          {f: 0, x: 960, y: 540, zoom: 1},
          {f: b('watch', -0.2), x: 960, y: 540, zoom: 1},
          {f: b('watch', 1.0), x: E.x + 120, y: E.y - 20, zoom: 1.75},
          {f: b.end('extName', 0.2), x: E.x + 140, y: E.y - 20, zoom: 1.8},
        ]}
      >
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          {frame > b('flex') ? <Mannequin view="side" x={FX} y={FY} scale={FS} ghost={color.textFaint} opacity={0.6} pose={{...ANATOMICAL, eFlex: inExt ? 140 : 0}} /> : null}
          <Mannequin view="side" x={FX} y={FY} scale={FS} pose={pose} highlight={frame > b('watch') ? {rArm: color.accent} : {}} />
          <Pulse c={E} r={30} start={b('watch', 0.1)} out={b('flex', 0.2)} />
          <g opacity={arcA}>
            <AngleArc v={E} a={S} b={W} r={78} stroke={color.accent} fontSize={44} labelAt={pt(E.x - 120, E.y + 10)} />
          </g>
          {/* trajectory of the hand */}
          {!inExt ? (
            <DrawnArrow d={arcPath(E, reach + 70, 90, -50)} start={b('flex', 0.3)} dur={b.len('flex') - 10} out={b('ext', 0.2)} stroke={color.accent} width={5} head={20} dashed />
          ) : (
            <DrawnArrow d={arcPath(E, reach + 70, -50, 90)} start={b('ext', 0.4)} dur={b.len('ext') - 14} stroke={color.coronal} width={5} head={20} dashed />
          )}
          <SvgText x={E.x - 50} y={E.y - 60} text="elbow" start={b('watch', 0.3)} out={b('flex')} size={26} fill={color.accent} anchor="end" />
        </svg>
      </Camera>
      <div style={{position: 'absolute', left: 1200, top: 280, opacity: appear(frame, b('intro', 0.6), {out: b('watch', 0.6)}).opacity}}>
        <Kicker>Terms of movement</Kicker>
        <div style={{...type.h1, color: color.text, marginTop: 12}}>
          Movement
          <br />
          happens at joints
        </div>
        <div style={{...type.body, color: color.textDim, marginTop: 20}}>most terms come in opposing pairs</div>
      </div>
      <TermReveal term="FLEXION" def="decreases the angle between two bones — bending" start={b('flexName', 0.1)} out={b('ext', 0.2)} x={1240} y={300} size={100} width={600} />
      <AngleBadge x={1240} y={560} text="angle ↓" tone={color.accent} start={b('flexName', 0.8)} out={b('ext', 0.2)} />
      <TermReveal term="EXTENSION" def="increases the angle between two bones — straightening" start={b('extName', 0.1)} x={1240} y={300} size={100} width={620} accent={color.coronal} />
      <AngleBadge x={1240} y={560} text="angle ↑" tone={color.coronal} start={b('extName', 0.8)} />
    </SceneShell>
  );
};

const AngleBadge: React.FC<{x: number; y: number; text: string; tone: string; start: number; out?: number}> = ({x, y, text, tone, start, out}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y + 30, opacity: a.opacity, transform: `translateY(${a.y}px)`, ...type.h3, color: tone, border: `3px solid ${tone}`, borderRadius: 16, padding: '10px 22px'}}>
      {text}
    </div>
  );
};

/* ───────── Abduction / adduction ───────── */
export const Abduction: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('abduction');
  const FX = 900, FY = 1010, FS = 0.95;
  const abd = keyframes(frame, [
    [b('abd', 0.1), 9],
    [b.end('abd', 0.1), 90],
    [b('add', 0.1), 90],
    [b.end('add', 0.1), 9],
    [b('trick', 1.4), 9],
    [b('trick', 2.4), 45],
    [b('trick', 3.6), 9],
  ]);
  const pose = {...ANATOMICAL, rAbd: abd};
  const R = rig('front', pose);
  const S = toStage(R.r.S, FX, FY, FS);
  const hand = toStage(pt(R.r.W.x + (R.r.W.x - R.r.E.x) * 0.3, R.r.W.y + (R.r.W.y - R.r.E.y) * 0.3), FX, FY, FS);
  const armLen = (175 + 160 + 48) * FS;
  const distA = appear(frame, b('abd', 0.4), {out: b('add', 1.2)}).opacity;
  const inAdd = frame >= b('add');
  return (
    <SceneShell id="abduction" chapter={4} sub="Abduction & adduction">
      <Camera keys={[{f: 0, x: 960, y: 540, zoom: 1}, {f: b('abd'), x: 900, y: 520, zoom: 1.05}]}>
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          <Midline x={FX} y0={FY - 900 * FS - 20} y1={FY + 10} start={b('intro', 0.4)} />
          {frame > b('abd') ? <Mannequin view="front" x={FX} y={FY} scale={FS} ghost={color.textFaint} opacity={0.55} pose={{...ANATOMICAL, rAbd: inAdd ? 90 : 9}} /> : null}
          <Mannequin view="front" x={FX} y={FY} scale={FS} pose={pose} highlight={frame > b('abd') ? {rArm: color.accent} : {}} />
          {!inAdd ? (
            <ArcArrow c={S} r={armLen + 60} a0={100} a1={178} start={b('abd', 0.2)} dur={b.len('abd')} out={b('add')} stroke={color.accent} width={6} head={24} />
          ) : (
            <ArcArrow c={S} r={armLen + 60} a0={178} a1={102} start={b('add', 0.2)} dur={b.len('add')} out={b('trick', 1.2)} stroke={color.coronal} width={6} head={24} />
          )}
          {/* distance from the midline */}
          <g opacity={distA}>
            <line x1={FX} y1={hand.y} x2={hand.x} y2={hand.y} stroke={color.sagittal} strokeWidth={4} strokeDasharray="10 8" />
            <circle cx={hand.x} cy={hand.y} r={8} fill={color.sagittal} />
            <text x={(FX + hand.x) / 2} y={hand.y + 46} fill={color.sagittal} fontFamily="Inter" fontWeight={800} fontSize={28} textAnchor="middle" stroke={color.bg0} strokeWidth={6} style={{paintOrder: 'stroke'}}>
              distance from midline
            </text>
          </g>
          <SvgText x={S.x - armLen + 40} y={S.y - 150} text="away from the midline" start={b('abd', 1.0)} out={b('add')} size={34} fill={color.accent} />
          <SvgText x={S.x - armLen + 40} y={S.y - 150} text="toward the midline" start={b('add', 0.6)} out={b('trick', 1.2)} size={34} fill={color.coronal} />
        </svg>
      </Camera>
      <div style={{position: 'absolute', left: 1260, top: 240, opacity: appear(frame, b('intro', 0.3), {out: b('abd', 0.6)}).opacity}}>
        <Kicker color={color.sagittal}>Reference</Kicker>
        <div style={{...type.h2, color: color.text, marginTop: 10}}>the midline</div>
      </div>
      <TermReveal term="ABDUCTION" def="moving a limb away from the midline" start={b('abdName', 0.1)} out={b('add', 0.2)} x={1260} y={300} size={92} width={600} />
      <TermReveal term="ADDUCTION" def="moving a limb toward the midline" start={b('addName', 0.1)} out={b('trick', -0.1)} x={1260} y={300} size={92} width={600} accent={color.coronal} />
      {frame >= b('trick') ? (
        <div style={{position: 'absolute', left: 1260, top: 300, width: 600, opacity: appear(frame, b('trick')).opacity}}>
          <div style={{...type.h1, fontSize: 92, color: color.text}}>
            <span style={{color: color.coronal, borderBottom: `7px solid ${color.coronal}`}}>ADD</span>uction
          </div>
          <div style={{...type.body, color: color.textDim, marginTop: 24, opacity: appear(frame, b('trick', 1.0)).opacity}}>
            <b style={{color: color.text}}>add</b> the limb back to the body
          </div>
        </div>
      ) : null}
      {void lerp}
      {void progress}
      {void ease}
      {void DrawnArrow}
    </SceneShell>
  );
};
