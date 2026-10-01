# Introduction to Anatomy — Motion-Graphics Lecture

A ~12-minute, 1920×1080 / 30 fps educational motion-graphics video built with **React + Remotion + SVG + Three.js**,
transforming *Lecture 1 — Introduction to Anatomy (Anatomy & Embryology)* into a narrated visual story.

- **Final video:** `output/introduction-to-anatomy.mp4`
- **Captions:** `output/introduction-to-anatomy.srt`
- **Narration script:** [`docs/NARRATION.md`](docs/NARRATION.md) (source of truth: `src/video/narration.json`)
- **Storyboard:** [`docs/STORYBOARD.md`](docs/STORYBOARD.md)

## Render it again

```bash
npm install
npm run render          # → output/introduction-to-anatomy.mp4
```

Re-generate narration after editing `src/video/narration.json` (needs Python 3 + `pip install kokoro-onnx soundfile`
and the two Kokoro model files — see the header of `scripts/narrate.py`):

```bash
npm run narrate         # TTS → public/audio/*.wav, src/video/timing.json, captions, docs/NARRATION.md
python3 scripts/music.py   # optional: regenerate the procedural music bed
npm run render
```

Preview / iterate:

```bash
npm run studio                                         # Remotion Studio, every scene is its own composition
npx remotion still src/index.ts scene-coronal out.png --frame=300
npx remotion still src/index.ts Sheet sheet.png --props='{"scene":"foot"}'   # 3×3 contact sheet of a scene
```

## How narration and animation stay in sync

1. `src/video/narration.json` holds the script as **scenes → beats** (one sentence or phrase each).
2. `scripts/narrate.py` synthesises each beat (Kokoro neural TTS, offline), lays the beats out with gaps/pauses,
   writes one WAV per scene and **`timing.json`** with every beat's start/end.
3. Scenes call `useBeats('sceneId')` and key every animation to the spoken word:
   `b('divide')` (beat start), `b('divide', 0.4)` (+0.4 s), `b.at('divide', 0.5)` (halfway), `b.end('divide')`.
   Scene length = narration length, so editing a sentence re-times the whole video automatically.

## Project structure

```
src/
  video/          AnatomyLecture (timeline + transitions), sceneRegistry, narration.json, timing.json, Sheet/Lab dev tools
  scenes/         S01_Intro … S13_Summary — one file per chapter, scenes are pure functions of frame + beats
  components/     motion UI kit: Label, DrawnArrow, DrawnPath, ArcArrow, AngleArc, Pulse, Midline, Bracket,
                  TermReveal, Checklist, Panel, QuizOption, Countdown, ChapterTag, Roadmap/ChapterCard, icons
  medical/        anatomical assets: Mannequin (2D rig), Head (profile + mandible + x-ray), Skeleton (upper-limb x-ray),
                  Forearm (radius/ulna pronation), Foot (side + front), Organs (organs, tissue, cell)
  medical/three/  Mannequin3D (capsule body, clipping + capped sections), Stage3D (camera, planes, projection)
  animation/      useBeats, Camera (virtual 2D dolly/zoom), motion helpers (easing, appear, keyframes)
  design-system/  theme tokens (colour code, type scale, layout), fonts, Background
  utils/          geometry (capsules, arcs, smooth paths), useSvgId
scripts/          narrate.py (TTS + timing + captions), music.py (procedural ambient bed)
public/           audio/ (narration + music), fonts/ (bundled Inter + Manrope)
docs/             STORYBOARD.md, NARRATION.md
output/           rendered MP4 + SRT
assets/           reserved for raster/vector assets; all visuals here are programmatic SVG/3D so they animate cleanly
```

## Medical Motion Design System

**Colour code (always semantic):** blue = coronal / anterior–posterior · coral = sagittal / medial–lateral / right–left ·
green = transverse / superior–inferior · amber = movement & attention · violet = rotation axis.

**Character:** one capsule-mannequin used everywhere. The 2D rig (`<Mannequin view="front|back|side" pose={…}>`) and the
3D body (`<Mannequin3D>`) share proportions and palette. Poses are plain objects (`ANATOMICAL`, `RELAXED`, `mixPose`), and
`rig(view, pose)` returns every joint so labels/arrows stay attached to moving anatomy. Sides are always the
**patient's** sides.

**Reusable building blocks for other lectures**

| Need | Use |
|---|---|
| Show a movement and its path | `Mannequin` pose keyframes + `ArcArrow` / `DrawnArrow` + ghost pose (`ghost` prop) |
| Name a concept after showing it | `TermReveal` |
| Point at a moving structure | `Label` (pass a live anchor) |
| Angle change (flexion etc.) | `AngleArc` |
| Section / plane / 3D spatial idea | `Canvas3D` + `SectionedBody` + `PlaneSheet` + `project()` for pinned labels |
| Depth / layers | `Depth` scene pattern (exploded layer stack), `HeadProfile xray` |
| Clinical vignette & MCQ | `QuizOption`, `Countdown`, `Panel` |
| Chapter structure | `Roadmap`, `ChapterCard`, `ChapterTag` |
| Camera moves | `<Camera keys={[{f, x, y, zoom}]}>` |

## Credits

Content: Lecture 1 — Introduction to Anatomy (Anatomy & Embryology). References: Gray's Anatomy for Students, 5th ed.
(Elsevier, 2023); Last's Anatomy: Regional and Applied, 12th ed. (Elsevier, 2011); AMBOSS.
Narration voice: Kokoro-82M (Apache-2.0). Fonts: Inter & Manrope (SIL OFL). Music: procedurally generated (`scripts/music.py`).
