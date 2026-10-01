import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {CHAPTER_CARD_FRAMES, SCENES, TRANSITION_FRAMES} from './sceneRegistry';
import {sceneDurationFrames} from '../animation/beats';
import {ChapterCard} from '../components/Roadmap';

type Item = {key: string; frames: number; render: () => React.ReactNode};

/** Ordered timeline: narrated scenes with silent chapter cards between chapters. */
export const buildTimeline = (): Item[] => {
  const items: Item[] = [];
  let prev: number | null = null;
  for (const s of SCENES) {
    if (prev !== null && s.chapter !== prev && s.chapter !== 0) {
      const ch = s.chapter;
      items.push({key: `chapter-${ch}`, frames: CHAPTER_CARD_FRAMES, render: () => <ChapterCard chapter={ch} />});
    }
    prev = s.chapter;
    const C = s.component;
    items.push({key: s.id, frames: sceneDurationFrames(s.id), render: () => <C />});
  }
  return items;
};

export const totalFrames = () => {
  const items = buildTimeline();
  return items.reduce((a, i) => a + i.frames, 0) - TRANSITION_FRAMES * (items.length - 1);
};

/** Start frame of a timeline item (useful for previews). */
export const startFrameOf = (key: string) => {
  let t = 0;
  for (const it of buildTimeline()) {
    if (it.key === key) return t;
    t += it.frames - TRANSITION_FRAMES;
  }
  return -1;
};

export const AnatomyLecture: React.FC<{music?: boolean}> = ({music = true}) => {
  const items = buildTimeline();
  const total = totalFrames();
  return (
    <AbsoluteFill style={{background: '#0A131B'}}>
      <TransitionSeries>
        {items.flatMap((it, i) => {
          const seq = (
            <TransitionSeries.Sequence key={it.key} durationInFrames={it.frames}>
              {it.render()}
            </TransitionSeries.Sequence>
          );
          if (i === items.length - 1) return [seq];
          return [seq, <TransitionSeries.Transition key={it.key + '-t'} presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />];
        })}
      </TransitionSeries>
      {music ? (
        <Audio
          src={staticFile('audio/music.wav')}
          loop
          volume={(f) => interpolate(f, [0, 60, total - 120, total], [0, 0.11, 0.11, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      ) : null}
    </AbsoluteFill>
  );
};
