/**
 * 3D stage: orbit camera, lighting, anatomical planes and sectioned mannequin halves.
 */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {color} from '../../design-system/theme';
import {Mannequin3D} from './Mannequin3D';

export type Cam = {az: number; el: number; dist: number; ty: number; tx?: number; fov?: number};
export type PlaneKind = 'coronal' | 'sagittal' | 'transverse';

export const PLANE_COLOR: Record<PlaneKind, string> = {coronal: color.coronal, sagittal: color.sagittal, transverse: color.transverse};
const CAP_COLOR: Record<PlaneKind, string> = {coronal: '#3D7FC4', sagittal: '#D45A4F', transverse: '#2FAE78'};
export const PLANE_NORMAL: Record<PlaneKind, THREE.Vector3> = {
  coronal: new THREE.Vector3(0, 0, 1),
  sagittal: new THREE.Vector3(1, 0, 0),
  transverse: new THREE.Vector3(0, 1, 0),
};

export const camPosition = (c: Cam) => {
  const az = (c.az * Math.PI) / 180, el = (c.el * Math.PI) / 180;
  return new THREE.Vector3((c.tx ?? 0) + Math.sin(az) * Math.cos(el) * c.dist, c.ty + Math.sin(el) * c.dist, Math.cos(az) * Math.cos(el) * c.dist);
};

/** Project a world point to stage pixels for HTML/SVG labels. */
export const project = (p: THREE.Vector3 | [number, number, number], c: Cam, w = 1920, h = 1080) => {
  const cam = new THREE.PerspectiveCamera(c.fov ?? 32, w / h, 0.1, 100);
  cam.position.copy(camPosition(c));
  cam.lookAt(c.tx ?? 0, c.ty, 0);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = (Array.isArray(p) ? new THREE.Vector3(...p) : p.clone()).project(cam);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera, gl} = useThree();
  gl.localClippingEnabled = true;
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov ?? 32;
  pc.position.copy(camPosition(cam));
  pc.lookAt(cam.tx ?? 0, cam.ty, 0);
  pc.updateProjectionMatrix();
  return null;
};

export const Lights: React.FC = () => (
  <>
    <hemisphereLight args={['#E6EEF5', '#1B2833', 1.0]} />
    <directionalLight position={[3, 6, 5]} intensity={1.7} />
    <directionalLight position={[-4, 3, -4]} intensity={0.8} color="#86B8FF" />
    <ambientLight intensity={0.15} />
  </>
);

/** Translucent anatomical plane with bright edges. */
export const PlaneSheet: React.FC<{kind: PlaneKind; offset: number; opacity: number; size?: [number, number]; centerY?: number}> = ({kind, offset, opacity, size, centerY = 1.93}) => {
  const c = PLANE_COLOR[kind];
  const [w, h] = size ?? (kind === 'coronal' ? [1.9, 3.95] : kind === 'sagittal' ? [1.4, 3.95] : [1.9, 1.4]);
  const geo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const pos: [number, number, number] = kind === 'coronal' ? [0, centerY, offset] : kind === 'sagittal' ? [offset, centerY, 0] : [0, offset, 0];
  const rot: [number, number, number] = kind === 'coronal' ? [0, 0, 0] : kind === 'sagittal' ? [0, Math.PI / 2, 0] : [-Math.PI / 2, 0, 0];
  if (opacity <= 0.001) return null;
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} renderOrder={10}>
        <meshBasicMaterial color={c} transparent opacity={0.2 * opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges} renderOrder={11}>
        <lineBasicMaterial color={c} transparent opacity={0.95 * opacity} />
      </lineSegments>
    </group>
  );
};

export type Split = {kind: PlaneKind; offset: number; sep: number};

/** Mannequin, optionally cut into two halves along a plane and pulled apart by `sep`. */
export const SectionedBody: React.FC<{split?: Split | null}> = ({split}) => {
  const planes = useMemo(() => [new THREE.Plane(), new THREE.Plane()], []);
  const clipA = useMemo(() => [planes[0]], [planes]);
  const clipB = useMemo(() => [planes[1]], [planes]);
  if (!split) return <Mannequin3D />;
  const n = PLANE_NORMAL[split.kind];
  const c0 = split.offset;
  planes[0].set(n.clone(), -(c0 + split.sep));
  planes[1].set(n.clone().negate(), c0 - split.sep);
  const dA = n.clone().multiplyScalar(split.sep);
  const dB = n.clone().multiplyScalar(-split.sep);
  const cap = CAP_COLOR[split.kind];
  return (
    <>
      <Mannequin3D clip={clipA} capColor={cap} position={[dA.x, dA.y, dA.z]} />
      <Mannequin3D clip={clipB} capColor={cap} position={[dB.x, dB.y, dB.z]} />
    </>
  );
};

export const Ground: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
    <circleGeometry args={[0.9, 48]} />
    <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
  </mesh>
);

export const Canvas3D: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <ThreeCanvas width={1920} height={1080} style={{position: 'absolute', inset: 0}} gl={{antialias: true, alpha: true}} camera={{fov: cam.fov ?? 32, near: 0.1, far: 100}}>
    <CameraRig cam={cam} />
    <Lights />
    {children}
  </ThreeCanvas>
);
