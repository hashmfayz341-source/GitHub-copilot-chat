import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from '../design-system/Background';
import {ChapterTag} from './ui';

/** Every narrated scene: stage background + its narration track + chapter tag. */
export const SceneShell: React.FC<{id: string; chapter?: number; sub?: string; tint?: string; children: React.ReactNode; hideTag?: boolean}> = ({
  id, chapter, sub, tint, children, hideTag,
}) => (
  <AbsoluteFill>
    <Background tint={tint} />
    {children}
    {chapter !== undefined && chapter > 0 && !hideTag ? <ChapterTag chapter={chapter} sub={sub} /> : null}
    <Audio src={staticFile(`audio/${id}.wav`)} />
  </AbsoluteFill>
);
