import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BodyPlane} from '../anatomy/BodyPlane';
import {PatientModel} from '../anatomy/PatientModel';
import {Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt} from '../characters/rig';
import {SceneShellAR} from '../components/SceneShellAR';
import {TermReveal} from '../components/TermReveal';
import {colorAR, fontAR} from '../design/theme-ar';
import {useLinesAR} from '../timing/beats-ar';

/**
 * المشهد 05 — Coronal و Transverse
 *
 * Salem's complaint ("another wall?") is the scene's structure: the planes
 * arrive one at a time and each is introduced by WHAT IT SEPARATES, named on
 * either side of it, before it is itself named. Two of them are vertical and
 * look alike, so the pair is held on screen together — the only way to show
 * that "both vertical" and "same division" are different claims.
 *
 * The three-names beat is the one place a card is allowed to move: Transverse,
 * Horizontal and Axial all slide onto the SAME plane, because they are one
 * plane with three names, not three planes. Listing them in a column would
 * teach the opposite.
 *
 * The scene closes with the orthogonal set standing together — the reference
 * frame the whole directional-terms chapter then depends on.
 */

const YAW = 48;

/** What a plane separates, named on either side of it, before the plane is named. */
const Separates: React.FC<{a: string; b: string; ax: number; ay: number; bx: number; by: number; op: number}> = ({
  a,
  b,
  ax,
  ay,
  bx,
  by,
  op,
}) => (
  <g opacity={op}>
    <text x={ax} y={ay} textAnchor="middle" fill={colorAR.textDim} style={{font: `700 32px ${fontAR.ar}`, direction: 'rtl'}}>
      {a}
    </text>
    <text x={bx} y={by} textAnchor="middle" fill={colorAR.textDim} style={{font: `700 32px ${fontAR.ar}`, direction: 'rtl'}}>
      {b}
    </text>
  </g>
);

export const SC05_CoronalTransverse: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLinesAR(5);

  const anotherWall = L.at('L034');
  const coronal = L.at('L035');
  const compare = L.at('L036');
  const transverse = L.at('L037');
  const joke = L.at('L038');
  const quiz = L.at('L039');
  const answer = L.at('L040');
  const bridge = L.at('L041');

  const band = (a: number, b: number, c: number, d: number) =>
    interpolate(f, [a, b, c, d], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // the sagittal pane carries over from Scene 04 and steps back, but never leaves:
  // the midline stays the fixed reference for the whole episode
  const sagOp = interpolate(f, [0, 30, coronal + 30, coronal + 80], [0.95, 0.95, 0.95, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const corOp = interpolate(f, [coronal + 30, coronal + 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const traOp = interpolate(f, [transverse + 20, transverse + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // which plane the retrieval question is pointing at, left deliberately unnamed
  const quizGlow = f > quiz && f < answer + 30 ? 0.5 + 0.5 * Math.sin((f / 8) * Math.PI) : 0;

  // the three synonyms converge onto the one transverse plane
  const converge = interpolate(f, [transverse + 120, transverse + 190], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const speaking = (id: string) => f >= L.at(id) && f <= L.end(id);
  const rashidTalk = speaking('L035') || speaking('L037') || speaking('L039') || speaking('L041');
  const salemTalk = speaking('L034') || speaking('L036') || speaking('L038') || speaking('L040');

  return (
    <SceneShellAR lines={L}>
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          <g transform="translate(930 870)">
            <PatientModel yaw={YAW} scale={1.0} />

            <BodyPlane yaw={YAW} axis="sagittal" offset={0} tint={colorAR.sagittal} opacity={sagOp} />
            {corOp > 0.01 ? (
              <g opacity={quizGlow > 0 ? 0.55 + 0.45 * quizGlow : 1}>
                <BodyPlane yaw={YAW} axis="coronal" offset={0} tint={colorAR.coronal} opacity={corOp} />
              </g>
            ) : null}
            {traOp > 0.01 ? <BodyPlane yaw={YAW} axis="transverse" offset={-262} tint={colorAR.transverse} opacity={traOp} /> : null}
          </g>

          {/* each plane says what it separates before it is given a name */}
          <Separates a="قدام" b="ورا" ax={700} ay={400} bx={1210} by={400} op={band(coronal + 40, coronal + 80, coronal + 170, coronal + 210)} />
          <Separates a="فوق" b="تحت" ax={1430} ay={468} bx={1430} by={700} op={band(transverse + 26, transverse + 66, transverse + 150, transverse + 190)} />

          {/* the two vertical planes, held together: alike, and not the same */}
          {band(compare + 20, compare + 50, compare + 110, compare + 150) > 0.01 ? (
            <g opacity={band(compare + 20, compare + 50, compare + 110, compare + 150)}>
              <text x={520} y={210} textAnchor="middle" fill={colorAR.sagittal} style={{font: `700 28px ${fontAR.ar}`, direction: 'rtl'}}>
                عمودي · يمين ويسار
              </text>
              <text x={1400} y={210} textAnchor="middle" fill={colorAR.coronal} style={{font: `700 28px ${fontAR.ar}`, direction: 'rtl'}}>
                عمودي · قدام وورا
              </text>
            </g>
          ) : null}

          <g transform="translate(250 930)">
            <Salem
              scale={0.86}
              expression={speaking('L038') ? 'smirk' : salemTalk ? 'talk' : 'idle'}
              gesture={speaking('L034') ? 'bothOpen' : 'none'}
              look="right"
              blink={blinkAt(f, 118, 0)}
              mouth={mouthAt(f, salemTalk, 0)}
              breath={breathAt(f, 0)}
            />
          </g>
          <g transform="translate(1740 930)">
            <Rashid
              flip
              scale={0.88}
              expression={speaking('L039') ? 'deadpan' : rashidTalk ? 'talk' : 'idle'}
              gesture={speaking('L035') || speaking('L037') ? 'teach' : 'none'}
              look="left"
              blink={blinkAt(f, 104, 37)}
              mouth={mouthAt(f, rashidTalk, 23)}
              breath={breathAt(f, 24)}
            />
          </g>
        </svg>
      </AbsoluteFill>

      {/* Coronal, named after its division has been seen, and again after the quiz */}
      <TermReveal term="Coronal" at={coronal + 186} until={transverse} x={660} y={146} tint={colorAR.coronal} small />
      <TermReveal term="Frontal" at={coronal + 214} until={transverse} x={1120} y={146} tint={colorAR.coronal} small />

      {/* three names converging on one plane: they slide toward the same point */}
      {converge > 0.01 && f < quiz - 20 ? (
        <>
          <TermReveal term="Transverse" at={transverse + 120} until={quiz - 20} x={interpolate(converge, [0, 1], [480, 900])} y={146} tint={colorAR.transverse} small />
          <TermReveal term="Horizontal" at={transverse + 140} until={quiz - 20} x={interpolate(converge, [0, 1], [960, 960])} y={206} tint={colorAR.transverse} small />
          <TermReveal term="Axial" at={transverse + 160} until={quiz - 20} x={interpolate(converge, [0, 1], [1440, 1020])} y={266} tint={colorAR.transverse} small />
        </>
      ) : null}

      <TermReveal term="Coronal" at={answer + 24} x={660} y={146} tint={colorAR.coronal} small />
      <TermReveal term="Frontal" at={answer + 48} x={1120} y={146} tint={colorAR.coronal} small />
    </SceneShellAR>
  );
};
