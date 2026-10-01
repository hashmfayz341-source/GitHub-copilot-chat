import React from 'react';
import narration from './narration.json';
import {Hook, Objectives, RoadmapScene, WhatIsAnatomy} from '../scenes/S01_Intro';
import {Position} from '../scenes/S02_Position';
import {Coronal, Sagittal, Transverse} from '../scenes/S03_Planes';
import {Directions} from '../scenes/S04_Directions';
import {Proximal} from '../scenes/S05_Proximal';
import {Depth} from '../scenes/S06_Depth';
import {Abduction, Flexion} from '../scenes/S07_Movements';
import {Circumduction} from '../scenes/S08_Circumduction';
import {Rotation, Pronation} from '../scenes/S09_Rotation';
import {Jaw} from '../scenes/S10_Jaw';
import {Foot} from '../scenes/S11_Foot';
import {Case, Quiz} from '../scenes/S12_Clinical';
import {Summary} from '../scenes/S13_Summary';

const components: Record<string, React.FC> = {
  hook: Hook,
  objectives: Objectives,
  whatIsAnatomy: WhatIsAnatomy,
  roadmap: RoadmapScene,
  position: Position,
  coronal: Coronal,
  sagittal: Sagittal,
  transverse: Transverse,
  directions: Directions,
  proximal: Proximal,
  depth: Depth,
  flexion: Flexion,
  abduction: Abduction,
  circumduction: Circumduction,
  rotation: Rotation,
  pronation: Pronation,
  jaw: Jaw,
  foot: Foot,
  case: Case,
  quiz: Quiz,
  summary: Summary,
};

export type SceneEntry = {id: string; chapter: number; component: React.FC};

export const SCENES: SceneEntry[] = (narration as {scenes: Array<{id: string; chapter: number}>}).scenes.map((s) => {
  const component = components[s.id];
  if (!component) throw new Error(`No component registered for scene "${s.id}"`);
  return {id: s.id, chapter: s.chapter, component};
});

/** Must match TRANSITION_FRAMES / CHAPTER_CARD_FRAMES in scripts/narrate.py (used for captions). */
export const TRANSITION_FRAMES = 20;
export const CHAPTER_CARD_FRAMES = 75;
