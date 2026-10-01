import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BodyPlane} from '../anatomy/BodyPlane';
import {PatientModel, yawProject} from '../anatomy/PatientModel';
import {Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt} from '../characters/rig';
import {SceneShellAR} from '../components/SceneShellAR';
import {TermReveal} from '../components/TermReveal';
import {colorAR, fontAR} from '../design/theme-ar';
import {useLinesAR} from '../timing/beats-ar';

/**
 * المشهد 04 — المستوى السهمي
 *
 * The plane is a pane of glass you can slide, not a line printed down the middle.
 * That is the entire misconception this scene exists to kill: students read
 * "sagittal" as "the middle one", so here the pane is dragged well off centre
 * and KEEPS its name, and only the exact-centre position earns the extra word.
 *
 * A second device carries Rashid's plane-versus-section line: the pane is the
 * surface we imagine, and the panel beside it shows the section that surface
 * would produce — which is what imaging gives you without any cutting. The two
 * are on screen together so the distinction is visible rather than asserted.
 *
 * The body is held at a 3/4 yaw throughout, because a sagittal plane seen from
 * straight on is edge-on and reads as a line, teaching exactly the wrong thing.
 */

// A sagittal plane seen near head-on projects to about the body's own width and
// reads as a tint laid over the anatomy. Turning further makes it recede in
// depth, so it reads as the surface it is.
const YAW = 48;

/** The section this plane would produce, as a silhouette that changes with offset. */
const SectionPanel: React.FC<{offset: number; reveal: number}> = ({offset, reveal}) => {
  const t = Math.min(1, Math.abs(offset) / 150);
  // nearer the midline: a tall central slice through head, trunk and one limb.
  // further out: a narrow slice that misses the midline structures entirely.
  const w = interpolate(t, [0, 1], [96, 44]);
  const headR = interpolate(t, [0, 1], [46, 20]);
  return (
    <g opacity={reveal}>
      <rect x={-150} y={-230} width={300} height={460} rx={14} fill="#0A1118" stroke={colorAR.sagittal} strokeWidth={3} />
      <g transform="translate(0 30)">
        <ellipse cy={-170} rx={headR} ry={headR * 1.1} fill="#6C7A86" />
        <rect x={-w / 2} y={-110} width={w} height={190} rx={18} fill="#6C7A86" />
        <rect x={-w / 2 + 6} y={80} width={w - 12} height={96} rx={14} fill="#5B6974" />
        {/* the midline structures only exist in a slice at or near the middle */}
        {t < 0.35 ? <rect x={-7} y={-150} width={14} height={240} rx={7} fill="#9AA8B2" opacity={0.85 * (1 - t / 0.35)} /> : null}
      </g>
      <text y={212} textAnchor="middle" fill={colorAR.sagittal} style={{font: `700 22px ${fontAR.term}`}}>
        SECTION
      </text>
    </g>
  );
};

export const SC04_SagittalPlane: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLinesAR(4);

  const split = L.at('L026');
  const define = L.at('L027');
  const salemSlides = L.at('L028');
  const stillSagittal = L.at('L029');
  const joke = L.at('L030');
  const planeVsSection = L.at('L031');
  const quiz = L.at('L032');
  const answer = L.at('L033');

  /**
   * Where the pane sits along the right-left axis, in body units.
   * 0 is the exact midline. The scene deliberately spends most of its time
   * NOT at zero.
   */
  const offset = interpolate(
    f,
    [0, define + 60, salemSlides + 10, salemSlides + 70, stillSagittal + 150, stillSagittal + 200, quiz - 60, quiz - 10, answer, answer + 50],
    [0, 0, 0, 112, 112, 0, 0, 86, 86, 86],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const atMidline = Math.abs(offset) < 4;

  const planeIn = interpolate(f, [split + 14, split + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // the body eases apart just enough to show the plane separated something
  const spread = interpolate(f, [define + 24, define + 80, salemSlides, salemSlides + 40], [0, 1, 1, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sectionIn = interpolate(f, [planeVsSection + 90, planeVsSection + 140, quiz - 40, quiz], [0, 1, 1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const {px} = yawProject(YAW);
  const paneScreenX = px(offset);

  const speaking = (id: string) => f >= L.at(id) && f <= L.end(id);
  const rashidTalk = speaking('L027') || speaking('L029') || speaking('L031') || speaking('L032');
  const salemTalk = speaking('L026') || speaking('L028') || speaking('L030') || speaking('L033');

  return (
    <SceneShellAR lines={L}>
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          <g transform="translate(900 880)">
            {/* the two sides ease apart along the pane's own normal */}
            <g transform={`translate(${-spread * 26} 0)`}>
              <PatientModel yaw={YAW} scale={1.04} />
            </g>
            {planeIn > 0.01 ? (
              <BodyPlane yaw={YAW} axis="sagittal" offset={offset} tint={colorAR.sagittal} opacity={planeIn} />
            ) : null}

            {/* how far the pane is from the midline — the quantity the scene is about */}
            {planeIn > 0.4 ? (
              <g opacity={planeIn} transform="translate(0 -556)">
                <line x1={px(0)} y1={0} x2={paneScreenX} y2={0} stroke={colorAR.sagittal} strokeWidth={3} opacity={0.8} />
                <circle cx={px(0)} cy={0} r={5} fill={colorAR.sagittal} />
                <circle cx={paneScreenX} cy={0} r={5} fill={colorAR.sagittal} />
                <text
                  x={(px(0) + paneScreenX) / 2}
                  y={-20}
                  textAnchor="middle"
                  fill={atMidline ? '#5BD6A0' : colorAR.sagittal}
                  style={{font: `700 34px ${fontAR.ar}`, direction: 'rtl'}}
                >
                  {atMidline ? 'بالنص بالضبط' : 'مو بالنص'}
                </text>
              </g>
            ) : null}
          </g>

          {/* the section the pane would produce — imaging, not cutting */}
          {sectionIn > 0.01 ? (
            <g transform="translate(1492 470)">
              <SectionPanel offset={offset} reveal={sectionIn} />
            </g>
          ) : null}

          <g transform="translate(250 920)">
            <Salem
              scale={0.86}
              expression={speaking('L030') ? 'smirk' : speaking('L028') ? 'surprised' : salemTalk ? 'talk' : 'idle'}
              gesture={speaking('L026') || speaking('L028') ? 'point' : 'none'}
              look="right"
              blink={blinkAt(f, 118, 0)}
              mouth={mouthAt(f, salemTalk, 0)}
              breath={breathAt(f, 0)}
            />
          </g>
          <g transform="translate(1760 920)">
            <Rashid
              flip
              scale={0.88}
              expression={speaking('L029') ? 'deadpan' : rashidTalk ? 'talk' : 'idle'}
              gesture={speaking('L027') || speaking('L031') ? 'teach' : 'none'}
              look="left"
              blink={blinkAt(f, 104, 37)}
              mouth={mouthAt(f, rashidTalk, 23)}
              breath={breathAt(f, 24)}
            />
          </g>
        </svg>
      </AbsoluteFill>

      {/* the name arrives after the separation has been seen, and survives the slide */}
      <TermReveal term="Sagittal plane" at={define + 150} until={planeVsSection + 60} x={700} y={150} tint={colorAR.sagittal} small />
      {/* only the exact-centre position earns the extra word */}
      <TermReveal term="Midsagittal" at={stillSagittal + 206} until={planeVsSection + 60} x={1190} y={150} tint="#5BD6A0" small />
      <TermReveal term="Plane" at={planeVsSection + 40} until={quiz - 20} x={700} y={150} tint={colorAR.sagittal} small />
      <TermReveal term="Section" at={planeVsSection + 150} until={quiz - 20} x={1190} y={150} tint={colorAR.sagittal} small />
    </SceneShellAR>
  );
};
