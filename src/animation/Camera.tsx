import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, keyframes} from './motion';

export type CameraKey = {f: number; x?: number; y?: number; zoom?: number; rot?: number};

/**
 * Virtual 2D camera over a 1920×1080 stage.
 * (x, y) is the stage point the camera centres on; zoom > 1 pushes in.
 * Keys are interpolated with the house in-out curve, so pans/zooms feel like a dolly move.
 */
export const Camera: React.FC<{keys: CameraKey[]; children: React.ReactNode; drift?: boolean}> = ({keys, children, drift = true}) => {
  const frame = useCurrentFrame();
  const track = (prop: 'x' | 'y' | 'zoom' | 'rot', def: number) => {
    let last = def;
    const kf: Array<[number, number]> = keys.map((k) => {
      const v = k[prop];
      if (v !== undefined) last = v;
      return [k.f, last];
    });
    return keyframes(frame, kf, ease.inOut);
  };
  const x = track('x', 960);
  const y = track('y', 540);
  const zoom = track('zoom', 1);
  const rot = track('rot', 0);
  // a barely-perceptible handheld drift keeps "still" moments alive
  const dx = drift ? Math.sin(frame / 97) * 4 : 0;
  const dy = drift ? Math.cos(frame / 83) * 3 : 0;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: '0 0',
        transform: `translate(960px, 540px) scale(${zoom}) rotate(${rot}deg) translate(${-x + dx}px, ${-y + dy}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
