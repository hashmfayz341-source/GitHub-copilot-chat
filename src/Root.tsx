import React from 'react';
import {Composition, Folder} from 'remotion';
import {AnatomyLecture, buildTimeline, totalFrames} from './video/AnatomyLecture';
import {Lab} from './video/Lab';
import {Sheet} from './video/Sheet';
import {loadFonts} from './design-system/fonts';
import {loadFontsAR} from './v2-ar/design/fonts-ar';
import {CastLab} from './v2-ar/video/CastLab';
import {MotionLab} from './v2-ar/video/MotionLab';
import {AnatomyLectureAR, totalFramesAR} from './v2-ar/video/AnatomyLectureAR';
import {SheetAR} from './v2-ar/video/SheetAR';
import {renderableScenesAR} from './v2-ar/video/sceneRegistryAR';
import {sceneFramesAR} from './v2-ar/timing/beats-ar';
import {FPS} from './design-system/theme';

loadFonts();
loadFontsAR();

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
    <Folder name="V2-AR">
      <Composition id="AnatomyLectureAR" component={AnatomyLectureAR} durationInFrames={totalFramesAR()} fps={FPS} width={1920} height={1080} />
      <Composition id="ar-CastLab" component={CastLab} durationInFrames={300} fps={FPS} width={1920} height={1080} />
      <Composition id="ar-MotionLab" component={MotionLab} durationInFrames={300} fps={FPS} width={1920} height={1080} />
      {renderableScenesAR().map((s) => {
        const C = s.component!;
        return (
          <Composition key={s.id} id={`ar-${s.id}`} component={C} durationInFrames={sceneFramesAR(s.scene)} fps={FPS} width={1920} height={1080} />
        );
      })}
      {renderableScenesAR().map((s) => (
        <Composition
          key={`sheet-${s.id}`}
          id={`ar-sheet-${String(s.scene).padStart(2, '0')}`}
          component={SheetAR as React.FC<Record<string, unknown>>}
          durationInFrames={30000}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{scene: s.scene}}
        />
      ))}
    </Folder>
  </>
);
