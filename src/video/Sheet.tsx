import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {buildTimeline} from './AnatomyLecture';

/** Dev tool: 3×3 contact sheet of one scene at chosen frames (or evenly spaced). */
export const Sheet: React.FC<{scene: string; frames?: number[]}> = ({scene, frames}) => {
  const item = buildTimeline().find((i) => i.key === scene);
  if (!item) return null;
  const fs = frames ?? Array.from({length: 9}, (_, i) => Math.round(((i + 0.5) / 9) * item.frames));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {fs.slice(0, 9).map((f, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 3) * 640, top: Math.floor(i / 3) * 360, width: 1920, height: 1080, transform: 'scale(0.3333)', transformOrigin: '0 0', overflow: 'hidden', outline: '4px solid #000'}}>
          <Freeze frame={f}>{item.render()}</Freeze>
          <div style={{position: 'absolute', right: 20, bottom: 10, color: '#ff0', font: '700 54px Inter', textShadow: '0 0 8px #000'}}>{(f / 30).toFixed(1)}s</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
