import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PatientModel} from '../anatomy/PatientModel';
import {Noura, Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt} from '../characters/rig';
import {PhoneGroup} from '../components/PhoneGroup';
import {SceneShellAR} from '../components/SceneShellAR';
import {TermReveal} from '../components/TermReveal';
import {colorAR} from '../design/theme-ar';
import {useLinesAR} from '../timing/beats-ar';

/**
 * المشهد 01 — قروب الجسم: يمين مين؟
 *
 * Full Script direction implemented here:
 *   phone with "قروب الجسم" and part icons, no definitions list
 *   → Salem commands a model facing him; he raises his own right hand but
 *     points at the model's other side
 *   → the model's two hands glance at each other, waiting; the wrong hand never
 *     moves, so no wrong side is ever taught
 *   → a small R appears on patient right, then the body is turned right around:
 *     the marker stays attached to the BODY, so it ends up on screen RIGHT and
 *     viewer-right and patient-right visibly come apart
 *   → Noura cuts the argument
 *
 * Educational contract: viewer right ≠ patient right.
 * Common misconception addressed: "screen right is the body's right".
 *
 * Every visual beat is anchored to a real audio line, never to a script estimate.
 */
export const SC01_GroupRight: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLinesAR(1);

  // ---- beat anchors, all derived from the measured audio ----
  const salemOpen = L.at('L001');
  const rashidTwoHands = L.at('L002');
  const salemInsists = L.at('L003');
  const rashidFixes = L.at('L004');
  const salemSpin = L.at('L005');
  const nouraJab = L.at('L006');
  const rashidTeach = L.at('L007');
  const salemClose = L.at('L008');

  // ---- we open inside the phone, then the room resolves around it ----
  // The phone itself scales rather than the camera: zooming the stage cropped
  // the phone at both ends and dragged the whole room with it.
  const pull = interpolate(f, [salemOpen + 46, rashidTwoHands - 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const roomIn = interpolate(pull, [0.04, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const veil = interpolate(pull, [0, 0.46], [0.94, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---- phone ----
  const members = interpolate(f, [salemOpen + 4, salemOpen + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const message = interpolate(f, [salemOpen + 30, salemOpen + 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // the phone stays in Salem's hand after the pull-back, smaller and angled
  const phoneScale = interpolate(pull, [0, 1], [1.42, 0.28]);
  const phoneX = interpolate(pull, [0, 1], [960, 548]);
  const phoneY = interpolate(pull, [0, 1], [500, 556]);

  // ---- the model ----
  // Salem asks for the body to be turned toward him, so it turns — all the way.
  // Edge-on while Noura lands her line (you can no longer tell any side apart),
  // then full back view: R is now on SCREEN RIGHT. The marker never moved on the
  // body; only the screen did. Then it turns back to anatomical position and R
  // returns to screen left, which is the proof, not a caption.
  const yaw = interpolate(
    f,
    [salemSpin + 6, nouraJab, nouraJab + 86, rashidTeach + 70, rashidTeach + 170],
    [0, 95, 180, 180, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // hands glance at each other exactly while Rashid says "he has two hands"
  const glance = interpolate(
    f,
    [rashidTwoHands + 14, rashidTwoHands + 30, salemInsists + 14, salemInsists + 26],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Salem insists on the wrong hand; Rashid moves the attention to patient right
  const wrongPulse = interpolate(f, [salemInsists, salemInsists + 8, rashidFixes + 18, rashidFixes + 28], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // the highlight clears completely before the body comes back to anatomical
  // position, so the term reveal lands on a clean frame
  const rightPulse = interpolate(f, [rashidFixes + 24, rashidFixes + 40, rashidTeach + 40, rashidTeach + 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const markersIn = f >= rashidFixes + 20;
  // L joins while the body is mid-turn, so both sides are seen travelling together
  const leftMarkerIn = f >= nouraJab + 50;
  const midlineIn = f >= rashidTeach + 180;

  // ---- performances ----
  const speaking = (id: string) => f >= L.at(id) && f <= L.end(id);
  const salemTalk = speaking('L001') || speaking('L003') || speaking('L005') || speaking('L008');
  const rashidTalk = speaking('L002') || speaking('L004') || speaking('L007');
  const nouraTalk = speaking('L006');

  // Noura steps into frame for her correction, then stays
  const nouraIn = interpolate(f, [nouraJab - 26, nouraJab - 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const salemExpr = speaking('L003') ? 'dramatic' : speaking('L005') ? 'smirk' : speaking('L008') ? 'smileSmall' : salemTalk ? 'talk' : f > nouraJab && f < rashidTeach ? 'surprised' : 'idle';
  const rashidExpr = speaking('L002') ? 'deadpan' : rashidTalk ? 'talk' : 'idle';

  return (
    <SceneShellAR lines={L}>
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {/* the room is dark until we come out of the phone */}
          {veil > 0.002 ? <rect width={1920} height={1080} fill="#060B10" opacity={veil} /> : null}
          <g opacity={roomIn}>
            {/* ---------- the anatomical model ---------- */}
            <g transform="translate(960 872)">
              <PatientModel
                yaw={yaw}
                scale={1.14}
                raised={null}
                handsGlance={glance}
                highlight={wrongPulse > rightPulse ? 'patientLeft' : 'patientRight'}
                highlightPulse={Math.max(wrongPulse, rightPulse)}
                showMarkers={markersIn}
                showLeftMarker={leftMarkerIn}
                showMidline={midlineIn}
              />
            </g>

            {/* ---------- Salem (screen left), phone in hand ---------- */}
            <g transform="translate(400 866)">
              <Salem
                scale={1.0}
                expression={salemExpr as never}
                gesture={speaking('L003') ? 'point' : speaking('L005') ? 'bothOpen' : pull > 0.6 ? 'phone' : 'phone'}
                look={pull < 0.6 ? 'down' : 'right'}
                blink={blinkAt(f, 118, 0)}
                mouth={mouthAt(f, salemTalk, 0)}
                breath={breathAt(f, 0)}
              />
            </g>

            {/* ---------- Rashid (screen right); he makes room when Noura arrives ---------- */}
            <g transform={`translate(${interpolate(nouraIn, [0, 1], [1430, 1372])} 866)`}>
              <Rashid
                flip
                scale={1.02}
                expression={rashidExpr as never}
                gesture={speaking('L004') ? 'point' : speaking('L007') ? 'teach' : 'none'}
                look="left"
                blink={blinkAt(f, 104, 37)}
                mouth={mouthAt(f, rashidTalk, 23)}
                breath={breathAt(f, 24)}
              />
            </g>

            {/* ---------- Noura steps in for the correction ---------- */}
            <g transform={`translate(${interpolate(nouraIn, [0, 1], [2080, 1752])} 866)`} opacity={nouraIn}>
              <Noura
                flip
                scale={0.98}
                expression={nouraTalk ? 'dry' : 'deadpan'}
                gesture={nouraTalk ? 'pointUp' : 'none'}
                look="left"
                blink={blinkAt(f, 126, 61)}
                mouth={mouthAt(f, nouraTalk, 51)}
                breath={breathAt(f, 48)}
              />
            </g>

          </g>

          {/* the phone is never veiled — we start inside it and it ends in Salem's hand */}
          <g transform={`translate(${phoneX} ${phoneY})`}>
            <PhoneGroup scale={phoneScale} members={members} message={message} rotate={interpolate(pull, [0, 1], [0, -12])} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* The term arrives only after the confusion has been seen and resolved:
          phenomenon → reaction → understanding → term. */}
      <TermReveal term="Patient Right" at={rashidTeach + 188} x={740} y={196} tint={colorAR.patientRight} small />
      <TermReveal term="Patient Left" at={rashidTeach + 214} x={1186} y={196} tint={colorAR.patientLeft} small />
    </SceneShellAR>
  );
};
