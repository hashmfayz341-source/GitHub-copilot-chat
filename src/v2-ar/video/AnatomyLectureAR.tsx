import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {renderableScenesAR} from './sceneRegistryAR';
import {sceneFramesAR} from '../timing/beats-ar';
import {colorAR} from '../design/theme-ar';

/**
 * The Arabic Saudi V2 episode.
 *
 * Only scenes whose audio is FINAL and whose component is implemented are
 * mounted — the episode grows as voice production completes, and never mounts a
 * scene whose timing would be guessed. V1's AnatomyLecture is untouched.
 *
 * Transitions are motivated by the visual world (a plane sweep, the midline
 * becoming the next axis, a gesture leading the camera) and are implemented per
 * scene at its edges rather than as a global default fade.
 */
export const totalFramesAR = () =>
  renderableScenesAR().reduce((a, s) => a + sceneFramesAR(s.scene), 0) || 90;

export const AnatomyLectureAR: React.FC = () => {
  const scenes = renderableScenesAR();
  if (scenes.length === 0) {
    return <AbsoluteFill style={{background: colorAR.bg0}} />;
  }
  return (
    <AbsoluteFill style={{background: colorAR.bg0}}>
      <Series>
        {scenes.map((s) => {
          const C = s.component!;
          return (
            <Series.Sequence key={s.id} durationInFrames={sceneFramesAR(s.scene)}>
              <C />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
