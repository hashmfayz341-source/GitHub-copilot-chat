import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {sceneMetaAR} from './sceneRegistryAR';
import {sceneFramesAR} from '../timing/beats-ar';

/** Contact sheet for one V2 scene — the V1 QA habit, kept. */
export const SheetAR: React.FC<{scene: number; frames?: number[]}> = ({scene, frames}) => {
  const meta = sceneMetaAR(scene);
  const C = meta.component;
  if (!C) return <AbsoluteFill style={{background: '#000'}} />;
  const total = sceneFramesAR(scene);
  const fs = frames ?? Array.from({length: 9}, (_, i) => Math.round(((i + 0.5) / 9) * total));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {fs.slice(0, 9).map((f, i) => (
        <div
          key={i}
          style={{position: 'absolute', left: (i % 3) * 640, top: Math.floor(i / 3) * 360, width: 1920, height: 1080,
                  transform: 'scale(0.3333)', transformOrigin: '0 0', overflow: 'hidden', outline: '3px solid #000'}}
        >
          <Freeze frame={f}><C /></Freeze>
          <div style={{position: 'absolute', right: 18, bottom: 8, color: '#ff0', font: '700 50px Inter', textShadow: '0 0 8px #000'}}>
            {(f / 30).toFixed(1)}s
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
