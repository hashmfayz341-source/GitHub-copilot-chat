import React from 'react';
import {Composition, Folder} from 'remotion';
import {AnatomyLecture, buildTimeline, totalFrames} from './video/AnatomyLecture';
import {Lab} from './video/Lab';
import {Sheet} from './video/Sheet';
import {loadFonts} from './design-system/fonts';
import {FPS} from './design-system/theme';

loadFonts();

/** Root: the full lecture plus one preview composition per scene (for fast iteration). */
export const Root: React.FC = () => (
  <>
    <Composition id="AnatomyLecture" component={AnatomyLecture} durationInFrames={totalFrames()} fps={FPS} width={1920} height={1080} defaultProps={{music: true}} />
    <Folder name="Scenes">
      {buildTimeline().map((it) => (
        <Composition key={it.key} id={`scene-${it.key}`} component={() => <>{it.render()}</>} durationInFrames={it.frames} fps={FPS} width={1920} height={1080} />
      ))}
    </Folder>
    <Composition id="Sheet" component={Sheet as React.FC<Record<string, unknown>>} durationInFrames={30000} fps={FPS} width={1920} height={1080} defaultProps={{scene: 'hook'}} />
    <Composition id="Lab" component={Lab} durationInFrames={300} fps={FPS} width={1920} height={1080} />
  </>
);
