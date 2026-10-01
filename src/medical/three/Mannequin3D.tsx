/**
 * 3D capsule-mannequin — same proportions and palette as the 2D <Mannequin/>
 * (2D units / 250; feet on y = 0, facing +z, patient's left = +x).
 *
 * Supports clipping planes for sectioning. Cut surfaces are "capped" with a classic trick:
 * every mesh also renders its back faces in a flat section colour, so looking into a cut
 * shows a solid face instead of a hollow shell.
 */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {color} from '../../design-system/theme';

export type V3 = [number, number, number];

const U = 1 / 250;
const v = (x: number, y: number, z = 0) => new THREE.Vector3(x * U, -y * U, z * U);

type Mats = {skin: THREE.Material[]; shorts: THREE.Material[]; hair: THREE.Material[]; eye: THREE.Material[]};

const makeMats = (clip: THREE.Plane[] | undefined, capColor: string, opacity: number): Mats => {
  const mk = (c: string, rough = 0.78) => {
    const front = new THREE.MeshStandardMaterial({color: c, roughness: rough, metalness: 0, clippingPlanes: clip ?? null, side: THREE.FrontSide, transparent: opacity < 1, opacity});
    const back = new THREE.MeshBasicMaterial({color: capColor, clippingPlanes: clip ?? null, side: THREE.BackSide, transparent: opacity < 1, opacity});
    return clip && clip.length ? [front, back] : [front];
  };
  return {skin: mk(color.skin), shorts: mk('#2E4152', 0.9), hair: mk('#2A3946', 0.9), eye: mk('#2A3946', 0.5)};
};

const Multi: React.FC<{mats: THREE.Material[]; geometry: THREE.BufferGeometry; position?: THREE.Vector3; quaternion?: THREE.Quaternion; scale?: V3}> = ({mats, geometry, position, quaternion, scale}) => (
  <group position={position} quaternion={quaternion} scale={scale}>
    {mats.map((m, i) => (
      <mesh key={i} geometry={geometry} material={m} renderOrder={i} />
    ))}
  </group>
);

const sphereGeo = new THREE.SphereGeometry(1, 40, 28);

// torso radius profile (2D units): [y, halfWidth]
const lathe = (prof: Array<[number, number]>) =>
  new THREE.LatheGeometry(prof.map(([y, r]) => new THREE.Vector2(r * U, -y * U)), 64);
const TORSO_SKIN = lathe([[-770, 0], [-768, 26], [-750, 40], [-738, 82], [-724, 104], [-700, 110], [-660, 102], [-610, 92], [-560, 78], [-530, 76], [-505, 82], [-488, 85], [-486, 0]]);
const TORSO_SHORTS = lathe([[-512, 0], [-511, 86], [-492, 92], [-460, 96], [-430, 86], [-412, 50], [-408, 0]]);
const UP = new THREE.Vector3(0, 1, 0);

/** Tapered capsule between two points (radius r1 at a, r2 at b). */
const Capsule: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r1: number; r2: number; mats: THREE.Material[]}> = ({a, b, r1, r2, mats}) => {
  const {geo, pos, quat} = useMemo(() => {
    const d = new THREE.Vector3().subVectors(b, a);
    const L = Math.max(0.0001, d.length());
    const g = new THREE.CylinderGeometry(r2, r1, L, 36, 1, true);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
    return {geo: g, pos: new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), quat: q};
  }, [a.x, a.y, a.z, b.x, b.y, b.z, r1, r2]);
  return (
    <>
      <Multi mats={mats} geometry={geo} position={pos} quaternion={quat} />
      <Multi mats={mats} geometry={sphereGeo} position={a} scale={[r1, r1, r1]} />
      <Multi mats={mats} geometry={sphereGeo} position={b} scale={[r2, r2, r2]} />
    </>
  );
};

const Ellipsoid: React.FC<{c: THREE.Vector3; r: V3; mats: THREE.Material[]; rot?: V3}> = ({c, r, mats, rot}) => (
  <group position={c} rotation={rot ? new THREE.Euler(...rot) : undefined}>
    <Multi mats={mats} geometry={sphereGeo} scale={r} />
  </group>
);

export type Arm3D = {dir?: THREE.Vector3}; // unit direction shoulder→hand

/**
 * @param clip      clipping planes (world space) for sectioning
 * @param capColor  colour of cut surfaces
 * @param rArmDir   optional direction of the patient's RIGHT arm (straight elbow), for circumduction
 */
export const Mannequin3D: React.FC<{clip?: THREE.Plane[]; capColor?: string; opacity?: number; rArmDir?: THREE.Vector3; position?: V3}> = ({
  clip, capColor = '#8a7a66', opacity = 1, rArmDir, position = [0, 0, 0],
}) => {
  const mats = useMemo(() => makeMats(clip, capColor, opacity), [clip, capColor, opacity]);
  const sR = -1; // patient's right is −x
  const arm = (s: number, dirOverride?: THREE.Vector3) => {
    const S = v(s * 108, -722, 0);
    const abd = (9 * Math.PI) / 180;
    const dir = dirOverride ? dirOverride.clone().normalize() : new THREE.Vector3(s * Math.sin(abd), -Math.cos(abd), 0);
    const E = S.clone().add(dir.clone().multiplyScalar(175 * U));
    const W = E.clone().add(dir.clone().multiplyScalar(160 * U));
    const H = W.clone().add(dir.clone().multiplyScalar(40 * U));
    return {S, E, W, H, dir};
  };
  const R = arm(sR, rArmDir);
  const Lf = arm(-sR);
  const leg = (s: number) => ({H: v(s * 52, -468), K: v(s * 54, -246), A: v(s * 54, -36)});
  const lr = leg(sR), ll = leg(-sR);
  return (
    <group position={position}>
      {/* head */}
      <Ellipsoid c={v(0, -842, 4)} r={[50 * U, 62 * U, 56 * U]} mats={mats.skin} />
      <Ellipsoid c={v(0, -858, -6)} r={[53 * U, 58 * U, 56 * U]} mats={mats.hair} />
      <Ellipsoid c={v(-50, -836, 0)} r={[9 * U, 15 * U, 9 * U]} mats={mats.skin} />
      <Ellipsoid c={v(50, -836, 0)} r={[9 * U, 15 * U, 9 * U]} mats={mats.skin} />
      <Ellipsoid c={v(0, -838, 58)} r={[8 * U, 12 * U, 8 * U]} mats={mats.skin} />
      <Ellipsoid c={v(-18, -846, 50)} r={[5 * U, 6.5 * U, 3 * U]} mats={mats.eye} />
      <Ellipsoid c={v(18, -846, 50)} r={[5 * U, 6.5 * U, 3 * U]} mats={mats.eye} />
      <Capsule a={v(0, -790)} b={v(0, -748)} r1={23 * U} r2={27 * U} mats={mats.skin} />
      {/* trunk: smooth lathe profile, flattened front-to-back */}
      <group scale={[1, 1, 0.56]}>
        <Multi mats={mats.skin} geometry={TORSO_SKIN} />
        <Multi mats={mats.shorts} geometry={TORSO_SHORTS} />
      </group>
      {/* arms */}
      {[R, Lf].map((a, i) => (
        <group key={i}>
          <Ellipsoid c={a.S} r={[31 * U, 31 * U, 31 * U]} mats={mats.skin} />
          <Capsule a={a.S} b={a.E} r1={27 * U} r2={19 * U} mats={mats.skin} />
          <Capsule a={a.E} b={a.W} r1={19.5 * U} r2={14 * U} mats={mats.skin} />
          <Capsule a={a.W} b={a.H} r1={15 * U} r2={13 * U} mats={mats.skin} />
        </group>
      ))}
      {/* legs */}
      {[lr, ll].map((l, i) => (
        <group key={i}>
          <Capsule a={l.H} b={l.K} r1={44 * U} r2={27 * U} mats={mats.skin} />
          <Capsule a={l.H} b={l.H.clone().lerp(l.K, 0.42)} r1={47 * U} r2={38 * U} mats={mats.shorts} />
          <Capsule a={l.K} b={l.A} r1={27 * U} r2={15 * U} mats={mats.skin} />
          <Ellipsoid c={l.A.clone().add(new THREE.Vector3(0, -20 * U, 26 * U))} r={[20 * U, 14 * U, 46 * U]} mats={mats.skin} />
        </group>
      ))}
    </group>
  );
};

/** Shoulder pivot of the patient's right arm in world space (for circumduction overlays). */
export const R_SHOULDER = v(-108, -722, 0);
export const ARM_LENGTH = (175 + 160 + 40) * U;
export const u3 = v;
