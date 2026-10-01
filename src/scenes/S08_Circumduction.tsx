import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, keyframes, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {Canvas3D, Cam, Ground, project} from '../medical/three/Stage3D';
import {ARM_LENGTH, Mannequin3D, R_SHOULDER} from '../medical/three/Mannequin3D';
import {Kicker, TermReveal} from '../components/ui';

const AXIS = new THREE.Vector3(-0.24, -0.97, 0).normalize();
const U = new THREE.Vector3(0, 0, 1); // anterior
const W = new THREE.Vector3().crossVectors(AXIS, U).normalize(); // lateral

/** Arm direction on a cone of half-angle `alpha` around AXIS; phi 0 = forward, 90 = lateral, 180 = back, 270 = medial. */
const armDir = (phiDeg: number, alphaDeg: number) => {
  const p = (phiDeg * Math.PI) / 180, a = (alphaDeg * Math.PI) / 180;
  return AXIS.clone().multiplyScalar(Math.cos(a)).add(U.clone().multiplyScalar(Math.cos(p) * Math.sin(a))).add(W.clone().multiplyScalar(Math.sin(p) * Math.sin(a))).normalize();
};
const handAt = (phi: number, alpha: number) => R_SHOULDER.clone().add(armDir(phi, alpha).multiplyScalar(ARM_LENGTH));

const Trail: React.FC<{from: number; to: number; alpha: number}> = ({from, to, alpha}) => {
  const geo = useMemo(() => {
    if (to - from < 2) return null;
    const pts: THREE.Vector3[] = [];
    for (let p = from; p <= to; p += 3) pts.push(handAt(p, alpha));
    pts.push(handAt(to, alpha));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 2), 0.022, 8, false);
  }, [from, to, alpha]);
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color.accent} />
    </mesh>
  );
};

const Cone: React.FC<{alpha: number; opacity: number}> = ({alpha, opacity}) => {
  const a = (alpha * Math.PI) / 180;
  const h = ARM_LENGTH * Math.cos(a), r = ARM_LENGTH * Math.sin(a);
  const geo = useMemo(() => new THREE.ConeGeometry(r, h, 64, 1, true), [r, h]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), AXIS.clone().negate()), []);
  const pos = R_SHOULDER.clone().add(AXIS.clone().multiplyScalar(h / 2));
  if (opacity <= 0.001) return null;
  return (
    <mesh geometry={geo} position={pos} quaternion={q} renderOrder={5}>
      <meshBasicMaterial color={color.accent} transparent opacity={0.16 * opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const PHASES = [
  {name: 'Flexion', dir: 'forward', beat: 'flex'},
  {name: 'Abduction', dir: 'out to the side', beat: 'abd'},
  {name: 'Extension', dir: 'backward', beat: 'ext'},
  {name: 'Adduction', dir: 'toward the midline', beat: 'add'},
];

export const Circumduction: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('circumduction');
  const ALPHA = 42;
  const alpha = ALPHA * progress(frame, b('flex', 0.0), 26, ease.inOut);
  const phi = keyframes(frame, [
    [b('abd', -0.1), 0],
    [b.end('abd', 0.1), 90],
    [b('ext', -0.1), 90],
    [b.end('ext', 0.1), 180],
    [b('add', -0.1), 180],
    [b.end('add', 0.2), 360],
    [b('cone', 0.1), 360],
    [b.end('cone'), 360 + 400],
    [b.duration, 360 + 400 + (b.duration - b.end('cone')) * 4.2],
  ]);
  const cam: Cam = {az: -38, el: 10, dist: 7.2, ty: 2.3, tx: 0.55};
  const coneOp = progress(frame, b('cone', 1.2), 30);
  const hand = handAt(phi, alpha);
  const hs = project(hand, cam);
  const phaseIdx = frame < b('abd', -0.1) ? 0 : frame < b('ext', -0.1) ? 1 : frame < b('add', -0.1) ? 2 : 3;
  const phaseOn = frame >= b('flex') && frame < b('cone');
  return (
    <SceneShell id="circumduction" chapter={4} sub="Circumduction">
      <Canvas3D cam={cam}>
        <Ground />
        <Mannequin3D rArmDir={armDir(phi, alpha)} />
        <Trail from={Math.max(0, phi - (frame > b('cone') ? 360 : 360))} to={phi} alpha={alpha < ALPHA - 0.5 ? alpha : ALPHA} />
        <Cone alpha={ALPHA} opacity={coneOp} />
      </Canvas3D>
      {/* phase label riding the hand */}
      {phaseOn ? (
        <div style={{position: 'absolute', left: hs.x, top: hs.y - 70, transform: 'translate(-50%, -50%)', ...type.h3, fontSize: 40, color: color.accent, textShadow: '0 3px 12px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', opacity: appear(frame, b(PHASES[phaseIdx].beat, -0.1), {dur: 10}).opacity}}>
          {PHASES[phaseIdx].name}
        </div>
      ) : null}
      {/* sequence list */}
      <div style={{position: 'absolute', left: 1240, top: 230, opacity: appear(frame, b('intro', 0.3), {out: b('name', -0.2)}).opacity}}>
        <Kicker>A sequence</Kicker>
        {PHASES.map((p, i) => {
          const on = frame >= b(p.beat, -0.1);
          const cur = phaseOn && i === phaseIdx;
          return (
            <div key={p.name} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 26, opacity: on ? (cur ? 1 : 0.6) : 0.25}}>
              <div style={{width: 54, height: 54, borderRadius: 27, border: `3px solid ${on ? color.accent : color.textFaint}`, background: cur ? color.accent : 'transparent', color: cur ? color.bg0 : color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.label, fontSize: 28}}>{i + 1}</div>
              <div>
                <div style={{...type.h3, fontSize: 44, color: color.text}}>{p.name}</div>
                <div style={{...type.small, color: color.textDim}}>{p.dir}</div>
              </div>
            </div>
          );
        })}
        <div style={{...type.h3, color: color.accent, marginTop: 34, opacity: appear(frame, b('cone', 0.6)).opacity}}>↻ continuous → a cone</div>
      </div>
      <TermReveal term="CIRCUMDUCTION" def="flexion → abduction → extension → adduction, in sequence" start={b('name', 0.1)} x={1200} y={330} size={84} width={700} />
    </SceneShell>
  );
};
