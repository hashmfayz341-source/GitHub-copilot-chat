import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, keyframes, lerp, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {Canvas3D, Cam, Ground, PLANE_COLOR, PlaneKind, PlaneSheet, SectionedBody, Split, project} from '../medical/three/Stage3D';
import {Kicker, TermReveal} from '../components/ui';

/** Floating label pinned to a projected 3D point. */
const Pin: React.FC<{p: [number, number, number]; cam: Cam; text: string; sub?: string; start: number; out?: number; tone?: string; dx?: number; dy?: number}> = ({
  p, cam, text, sub, start, out, tone = color.text, dx = 0, dy = 0,
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dy: 16});
  if (a.opacity <= 0) return null;
  const s = project(p, cam);
  return (
    <div style={{position: 'absolute', left: s.x + dx, top: s.y + dy + a.y, transform: 'translate(-50%, -50%)', opacity: a.opacity, textAlign: 'center', whiteSpace: 'nowrap'}}>
      <div style={{...type.h3, fontSize: 46, color: tone, textShadow: '0 3px 14px rgba(0,0,0,0.75)'}}>{text}</div>
      {sub ? <div style={{...type.small, color: color.textDim, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{sub}</div> : null}
    </div>
  );
};

const track = (frame: number, keys: Array<[number, Cam]>): Cam => {
  const pick = (k: keyof Cam, d: number) => keyframes(frame, keys.map(([f, c]) => [f, (c[k] as number | undefined) ?? d]), ease.inOut);
  return {az: pick('az', 0), el: pick('el', 10), dist: pick('dist', 9.5), ty: pick('ty', 1.8), tx: pick('tx', 0)};
};

const SidePanel: React.FC<{kicker: string; title: string; facts: Array<{text: string; at: number}>; start: number; tone: string; out?: number}> = ({kicker, title, facts, start, tone, out}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 1180, top: 250, width: 640, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
      <Kicker color={tone}>{kicker}</Kicker>
      <div style={{...type.h1, fontSize: 76, color: color.text, marginTop: 12}}>{title}</div>
      <div style={{height: 7, width: 140, background: tone, borderRadius: 4, margin: '22px 0 34px'}} />
      {facts.map((f, i) => {
        const fa = appear(frame, f.at, {dy: 18});
        return (
          <div key={i} style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22, opacity: fa.opacity, transform: `translateY(${fa.y}px)`}}>
            <div style={{width: 14, height: 14, borderRadius: 7, background: tone, flexShrink: 0}} />
            <div style={{...type.body, color: color.text}}>{f.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ───────── Coronal ───────── */
export const Coronal: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('coronal');
  const cam = track(frame, [
    [0, {az: -30, el: 8, dist: 9.4, ty: 1.85, tx: 0.9}],
    [b('plane'), {az: 30, el: 12, dist: 8.6, ty: 1.85, tx: 0.9}],
    [b('divide', 0.4), {az: 62, el: 10, dist: 8.6, ty: 1.85, tx: 1.0}],
    [b.end('posterior'), {az: 78, el: 12, dist: 8.9, ty: 1.85, tx: 1.0}],
    [b.duration, {az: 84, el: 12, dist: 8.9, ty: 1.85, tx: 1.0}],
  ]);
  const intro3 = appear(frame, b.at('intro', 0.55), {out: b('plane', -0.2), dur: 12}).opacity;
  const z = lerp(1.7, 0, progress(frame, b('plane', 0.4), 50, ease.inOut));
  const planeOp = progress(frame, b('plane', 0.2), 14);
  const sep = 0.42 * progress(frame, b('divide', 1.0), 40, ease.inOut);
  const split: Split | null = sep > 0.001 ? {kind: 'coronal', offset: 0, sep} : null;
  return (
    <SceneShell id="coronal" chapter={2} sub="Coronal">
      <Canvas3D cam={cam}>
        <Ground />
        <SectionedBody split={split} />
        <PlaneSheet kind="coronal" offset={z} opacity={Math.max(planeOp, intro3)} />
        <PlaneSheet kind="sagittal" offset={0} opacity={intro3} />
        <PlaneSheet kind="transverse" offset={2.15} opacity={intro3} />
      </Canvas3D>
      <Pin p={[0, 3.05, 0.75 + sep]} cam={cam} text="ANTERIOR" sub="in front" start={b('divide', 1.6)} tone={color.coronal} dx={-60} />
      <Pin p={[0, 3.05, -0.75 - sep]} cam={cam} text="POSTERIOR" sub="behind" start={b('posterior', 0.2)} tone={color.coronal} dx={60} />
      <SidePanel
        kicker="Plane 1 of 3"
        title="Coronal plane"
        tone={color.coronal}
        start={b('plane', 0.3)}
        facts={[
          {text: 'also called the frontal plane', at: b.at('plane', 0.4)},
          {text: 'oriented vertically', at: b.at('plane', 0.65)},
          {text: 'anterior | posterior parts', at: b('divide', 1.6)},
        ]}
      />
      <Text3 start={b.at('intro', 0.5)} out={b('plane')} />
    </SceneShell>
  );
};

const Text3: React.FC<{start: number; out: number}> = ({start, out}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 1180, top: 380, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
      <Kicker>Anatomical planes</Kicker>
      <div style={{...type.h1, color: color.text, marginTop: 12}}>Three major planes</div>
      <div style={{display: 'flex', gap: 18, marginTop: 30}}>
        {(['coronal', 'sagittal', 'transverse'] as PlaneKind[]).map((k) => (
          <div key={k} style={{...type.label, fontSize: 30, color: PLANE_COLOR[k], border: `3px solid ${PLANE_COLOR[k]}`, borderRadius: 14, padding: '8px 16px'}}>{k}</div>
        ))}
      </div>
    </div>
  );
};

/* ───────── Sagittal / midsagittal ───────── */
export const Sagittal: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('sagittal');
  const cam = track(frame, [
    [0, {az: 40, el: 10, dist: 8.9, ty: 1.85, tx: 0.9}],
    [b('divide'), {az: 18, el: 14, dist: 8.6, ty: 1.85, tx: 0.95}],
    [b('many'), {az: 12, el: 14, dist: 8.6, ty: 1.85, tx: 0.95}],
    [b('equal', 0.5), {az: 4, el: 12, dist: 8.8, ty: 1.85, tx: 0.95}],
    [b.duration, {az: -4, el: 12, dist: 8.8, ty: 1.85, tx: 0.95}],
  ]);
  // plane position over time
  const xKeys: Array<[number, number]> = [
    [0, 1.4],
    [b('plane', 0.6), 1.4],
    [b('plane', 2.6), 0.28],
    [b('many', 0.2), 0.28],
    [b.at('many', 0.45), -0.3],
    [b.at('many', 0.85), 0.16],
    [b('mid', 0.6), 0],
  ];
  const x = keyframes(frame, xKeys);
  const planeOp = progress(frame, b('plane'), 14);
  const sep1 = 0.36 * progress(frame, b('divide', 0.3), 30) * (1 - progress(frame, b('many', -0.4), 20));
  const sep2 = 0.36 * progress(frame, b('equal', 0.0), 34);
  const split: Split | null = sep1 > 0.001 ? {kind: 'sagittal', offset: 0.28, sep: sep1} : sep2 > 0.001 ? {kind: 'sagittal', offset: 0, sep: sep2} : null;
  const ghosts = appear(frame, b('many', 0.3), {out: b('mid', 0.4)}).opacity;
  const midGlow = progress(frame, b('mid', 0.6), 16);
  return (
    <SceneShell id="sagittal" chapter={2} sub="Sagittal">
      <Canvas3D cam={cam}>
        <Ground />
        <SectionedBody split={split} />
        {[-0.3, -0.15, 0.15, 0.3].map((gx) => (
          <PlaneSheet key={gx} kind="sagittal" offset={gx} opacity={ghosts * 0.35} />
        ))}
        <PlaneSheet kind="sagittal" offset={x + (split ? 0 : 0)} opacity={planeOp * (1 + midGlow * 0.4)} />
      </Canvas3D>
      <Pin p={[-0.85 - sep1, 2.9, 0]} cam={cam} text="RIGHT" sub="larger part" start={b('divide', 1.0)} out={b('many', -0.3)} tone={color.sagittal} dx={-40} />
      <Pin p={[0.85 + sep1, 2.9, 0]} cam={cam} text="LEFT" sub="smaller part" start={b('divide', 1.3)} out={b('many', -0.3)} tone={color.sagittal} dx={40} />
      <Pin p={[0, 0.2, 0.3]} cam={cam} text="unequal parts" start={b.at('many', 0.55)} out={b('mid', 0.3)} tone={color.textDim} dy={60} />
      <Pin p={[-0.85 - sep2, 2.9, 0]} cam={cam} text="RIGHT" sub="half" start={b('equal', 0.8)} tone={color.sagittal} dx={-40} />
      <Pin p={[0.85 + sep2, 2.9, 0]} cam={cam} text="LEFT" sub="half" start={b('equal', 1.0)} tone={color.sagittal} dx={40} />
      <Pin p={[0, 0.25, 0.4]} cam={cam} text="equal halves" start={b('equal', 1.4)} tone={color.text} dy={40} />
      <SidePanel
        kicker="Plane 2 of 3"
        title="Sagittal plane"
        tone={color.sagittal}
        start={b('plane', 0.3)}
        out={b('mid', 0.2)}
        facts={[
          {text: 'oriented vertically', at: b.at('plane', 0.35)},
          {text: 'runs front to back', at: b.at('plane', 0.75)},
          {text: 'right | left parts', at: b('divide', 1.2)},
        ]}
      />
      <TermReveal term="Midsagittal plane" def="through the centre → equal right & left halves" start={b('mid', 0.8)} x={1180} y={340} size={70} width={680} accent={color.sagittal} />
    </SceneShell>
  );
};

/* ───────── Transverse + recap ───────── */
export const Transverse: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('transverse');
  const cam = track(frame, [
    [0, {az: -10, el: 8, dist: 8.9, ty: 1.85, tx: 0.9}],
    [b('horizontal'), {az: 28, el: 20, dist: 8.6, ty: 1.85, tx: 0.95}],
    [b('divide', 1.5), {az: 38, el: 14, dist: 8.8, ty: 1.95, tx: 0.95}],
    [b('recap'), {az: 36, el: 18, dist: 9.4, ty: 1.85, tx: 0.95}],
    [b.duration, {az: 60, el: 18, dist: 9.4, ty: 1.85, tx: 0.95}],
  ]);
  const y = lerp(4.15, 2.15, progress(frame, b('plane', 0.8), 60, ease.inOut));
  const planeOp = progress(frame, b('plane', 0.2), 14);
  const sep = 0.38 * progress(frame, b('divide', 0.4), 34) * (1 - progress(frame, b('recap', -0.3), 24));
  const split: Split | null = sep > 0.001 ? {kind: 'transverse', offset: 2.15, sep} : null;
  const all = progress(frame, b('recap', 0.0), 20);
  const focus = (k: PlaneKind, beat: string) => (frame < b(beat) ? 0.55 : 1) * (frame >= b(beat) && k !== current(frame, b) ? 0.35 : 1);
  const legend: Array<{k: PlaneKind; a: string; c: string; beat: string}> = [
    {k: 'coronal', a: 'anterior', c: 'posterior', beat: 'r1'},
    {k: 'sagittal', a: 'right', c: 'left', beat: 'r2'},
    {k: 'transverse', a: 'superior', c: 'inferior', beat: 'r3'},
  ];
  const cur = current(frame, b);
  return (
    <SceneShell id="transverse" chapter={2} sub="Transverse">
      <Canvas3D cam={cam}>
        <Ground />
        <SectionedBody split={split} />
        <PlaneSheet kind="transverse" offset={y} opacity={planeOp * (all > 0 ? (cur && cur !== 'transverse' ? 0.35 : 1) : 1)} size={[1.9, 1.5]} />
        <PlaneSheet kind="coronal" offset={0} opacity={all * (cur && cur !== 'coronal' ? 0.3 : 1)} />
        <PlaneSheet kind="sagittal" offset={0} opacity={all * (cur && cur !== 'sagittal' ? 0.3 : 1)} />
      </Canvas3D>
      <Pin p={[0, 3.1 + sep, 0.2]} cam={cam} text="SUPERIOR" sub="above" start={b('divide', 0.9)} out={b('recap', -0.3)} tone={color.transverse} dx={-360} />
      <Pin p={[0, 1.1 - sep, 0.2]} cam={cam} text="INFERIOR" sub="below" start={b('divide', 1.8)} out={b('recap', -0.3)} tone={color.transverse} dx={-360} />
      <Pin p={[0, 0.0, 0.0]} cam={cam} text="∥ parallel to the ground" start={b('horizontal', 0.6)} out={b('divide')} tone={color.transverse} dy={50} />
      <SidePanel
        kicker="Plane 3 of 3"
        title="Transverse plane"
        tone={color.transverse}
        start={b('plane', 0.3)}
        out={b('recap', -0.2)}
        facts={[
          {text: 'also horizontal or axial', at: b.at('plane', 0.55)},
          {text: 'runs horizontally', at: b('horizontal', 0.3)},
          {text: 'superior | inferior parts', at: b('divide', 1.5)},
        ]}
      />
      <div style={{position: 'absolute', left: 1180, top: 260, opacity: appear(frame, b('recap', 0.2)).opacity}}>
        <Kicker>Three planes</Kicker>
        {legend.map((l) => {
          const a = appear(frame, b(l.beat), {dy: 20});
          return (
            <div key={l.k} style={{marginTop: 34, padding: '22px 30px', borderRadius: 22, background: color.panel, border: `3px solid ${PLANE_COLOR[l.k]}`, opacity: Math.max(0.25, a.opacity) * focus(l.k, l.beat), transform: `translateY(${a.y}px)`, width: 560}}>
              <div style={{...type.h3, color: PLANE_COLOR[l.k], textTransform: 'capitalize'}}>{l.k}</div>
              <div style={{...type.body, color: color.text, marginTop: 4, opacity: a.opacity}}>
                {l.a} <span style={{color: color.textFaint}}>|</span> {l.c}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

const current = (frame: number, b: ReturnType<typeof useBeats>): PlaneKind | null =>
  frame >= b('r3') ? 'transverse' : frame >= b('r2') ? 'sagittal' : frame >= b('r1') ? 'coronal' : null;

void THREE;
