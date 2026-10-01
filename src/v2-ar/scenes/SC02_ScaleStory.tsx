import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Brain, Cell, Tissue} from '../anatomy/ScaleLayers';
import {PatientModel} from '../anatomy/PatientModel';
import {Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt} from '../characters/rig';
import {PhoneGroup} from '../components/PhoneGroup';
import {SceneShellAR} from '../components/SceneShellAR';
import {TermReveal} from '../components/TermReveal';
import {colorAR, fontAR} from '../design/theme-ar';
import {useLinesAR} from '../timing/beats-ar';

/**
 * المشهد 02 — مستوى النظر: من الجسم إلى الخلية
 *
 * Full Script direction: Anatomy is defined by what you are looking at, not by
 * cutting. The scene is therefore built as ONE uninterrupted dive —
 * body → brain → tissue → cell — because the lesson is that it is the same body
 * throughout and only the level of looking changes. Four cuts would teach four
 * separate things; one continuous scale teaches the relationship.
 *
 * Terms arrive only after their level has been seen:
 *   Gross / Macroscopic anatomy  after the brain is already on screen
 *   Histology / Cytology         after the tissue and the cell are already on screen
 *
 * The retrieval question (L014) pulls back to tissue and holds. Nothing on
 * screen answers it during the scripted pause — the answer only appears once
 * Salem has said it.
 */
export const SC02_ScaleStory: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLinesAR(2);

  const defineAnatomy = L.at('L009');
  const brainLine = L.at('L010');
  const zoomAsk = L.at('L011');
  const tissueLine = L.at('L012');
  const joke = L.at('L013');
  const question = L.at('L014');
  const answer = L.at('L015');

  /**
   * One monotonic scale axis for the whole scene.
   *   0 = whole body   1 = organ   2 = tissue   3 = cell
   * It only ever moves forward until the retrieval pull-back, so the journey
   * reads as depth rather than as cutting about.
   */
  const level = interpolate(
    f,
    [
      0, 270,      // the whole body, held while Anatomy is defined
      330,         // dive to the organ
      540,         // brain held: Gross / Macroscopic land here
      600,         // dive to tissue
      780,         // tissue held: Histology lands here
      840,         // dive to the cell
      930,         // cell held: Cytology lands here
      985,         // pull back to tissue for the retrieval question
      1265,
    ],
    [0, 0, 1, 1, 2, 2, 3, 3, 2, 2],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  /** each layer fades in around its own level, so the dive crossfades smoothly */
  const near = (at: number, width = 0.56) =>
    interpolate(Math.abs(level - at), [0, width], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /**
   * Each layer has its own depth, so the dive is a flight THROUGH the levels
   * rather than a cross-fade between them. The outgoing layer keeps growing and
   * passes the camera; the incoming one comes up from behind it. Fading two
   * layers at a single shared scale drew the cell grid flat over the brain and
   * read as a rash instead of as a change of magnification.
   */
  const STEP = 2.6;
  const depth = (idx: number) => Math.pow(STEP, level - idx);

  const bodyOp = near(0, 0.85);
  const brainOp = near(1);
  const tissueOp = near(2);
  const cellOp = near(3);

  // the characters stand back once the dive starts, and return for the question
  const roomBack = interpolate(
    f,
    [300, 370, 930, 975],
    [1, 0.34, 0.34, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // the group-chat callback: tissue and cells trying to join قروب الجسم
  const phoneIn = interpolate(f, [joke - 10, joke + 16, L.end('L013') + 18, L.end('L013') + 40], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const speaking = (id: string) => f >= L.at(id) && f <= L.end(id);
  const rashidTalk = speaking('L009') || speaking('L010') || speaking('L012') || speaking('L014');
  const salemTalk = speaking('L011') || speaking('L013') || speaking('L015');

  // The scripted 2 s pause after the question: hold, and show nothing that
  // could answer it. The viewer must be able to try.
  const thinking = f > L.end('L014') && f < answer;

  return (
    <SceneShellAR lines={L}>
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {/* ---------- the dive ---------- */}
          <g transform="translate(960 470)">
            {bodyOp > 0.002 ? (
              <g opacity={bodyOp} transform={`scale(${depth(0) * 1.24}) translate(0 270)`}>
                <PatientModel yaw={0} scale={1} />
              </g>
            ) : null}
            {brainOp > 0.002 ? (
              <g opacity={brainOp} transform={`scale(${depth(1) * 1.4})`}>
                <Brain />
              </g>
            ) : null}
            {tissueOp > 0.002 ? (
              <g opacity={tissueOp} transform={`scale(${depth(2) * 0.85})`}>
                <Tissue />
              </g>
            ) : null}
            {cellOp > 0.002 ? (
              <g opacity={cellOp} transform={`scale(${depth(3) * 1.2})`}>
                <Cell />
              </g>
            ) : null}
          </g>

          {/* a quiet depth vignette so the dive reads as going INTO something */}
          <radialGradient id="sc02-v" cx="50%" cy="44%" r="62%">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <rect width={1920} height={1080} fill="url(#sc02-v)" pointerEvents="none" />

          {/* ---------- the two of them, watching ---------- */}
          <g opacity={roomBack}>
            <g transform="translate(300 906)">
              <Salem
                scale={0.92}
                expression={speaking('L013') ? 'smirk' : salemTalk ? 'talk' : 'idle'}
                gesture={speaking('L011') ? 'point' : 'none'}
                look="right"
                blink={blinkAt(f, 118, 0)}
                mouth={mouthAt(f, salemTalk, 0)}
                breath={breathAt(f, 0)}
              />
            </g>
            <g transform="translate(1630 906)">
              <Rashid
                flip
                scale={0.94}
                expression={speaking('L014') ? 'deadpan' : rashidTalk ? 'talk' : 'idle'}
                gesture={speaking('L009') || speaking('L010') ? 'teach' : 'none'}
                look="left"
                blink={blinkAt(f, 104, 37)}
                mouth={mouthAt(f, rashidTalk, 23)}
                breath={breathAt(f, 24)}
              />
            </g>
          </g>

          {/* ---------- Salem's group-chat callback ---------- */}
          {phoneIn > 0.002 ? (
            <g opacity={phoneIn} transform="translate(468 560)">
              <PhoneGroup scale={0.62} members={1} message={1} rotate={-7} />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>

      {/* The scripted retrieval pause. A quiet prompt, never the answer. */}
      {thinking ? (
        <div
          style={{
            position: 'absolute',
            left: 960,
            top: 150,
            transform: 'translateX(-50%)',
            color: colorAR.textDim,
            font: `600 34px ${fontAR.ar}`,
            direction: 'rtl',
            opacity: interpolate(f, [L.end('L014'), L.end('L014') + 14], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          أي فرع؟
        </div>
      ) : null}

      {/* Terms, each held over the level it names, never over a different one. */}
      <TermReveal term="Gross anatomy" at={436} until={556} x={600} y={176} small />
      <TermReveal term="Macroscopic anatomy" at={462} until={556} x={1330} y={176} small />
      <TermReveal term="Histology" at={700} until={950} x={600} y={176} small />
      <TermReveal term="Cytology" at={866} until={985} x={1330} y={176} small />
      {/* the umbrella term last, in the upper band so it never fouls the subtitles */}
      <TermReveal term="Microscopic anatomy" at={1207} x={960} y={196} />
    </SceneShellAR>
  );
};
