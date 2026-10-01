import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PatientModel} from '../anatomy/PatientModel';
import {Noura, Rashid, Salem} from '../characters/Cast';
import {blinkAt, breathAt, mouthAt} from '../characters/rig';
import {SceneShellAR} from '../components/SceneShellAR';
import {TermReveal} from '../components/TermReveal';
import {Viewfinder} from '../components/Viewfinder';
import {colorAR, fontAR} from '../design/theme-ar';
import {useLinesAR} from '../timing/beats-ar';

/**
 * المشهد 03 — الوقفة المرجعية
 *
 * The scene's own dialogue calls the pose "اللقطة" — the shot — so the reference
 * position is composed through a viewfinder rather than asserted on a card. That
 * gives the correction a mechanism the viewer can read before being told: the
 * frame sits amber while the palms are wrong and only locks green when they are
 * right, so "فيها شيء ما ضبط" is something you can already see.
 *
 * The palms are the whole lesson. Everything else about the pose lands early and
 * quietly; the scene then spends its middle on the one detail people get wrong.
 *
 * Noura's challenge (a lying patient) is answered by tipping the BODY while the
 * captured reference stays upright in the corner — the reference does not move
 * just because the patient did, which is the same lesson Scene 01 taught about
 * patient right.
 */
export const SC03_AnatomicalPosition: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLinesAR(3);

  const setPose = L.at('L016');
  const salemAsks = L.at('L017');
  const whatsOff = L.at('L018');
  const salemAnswers = L.at('L019');
  const confirm = L.at('L020');
  const nouraLying = L.at('L021');
  const joke = L.at('L022');
  const refStays = L.at('L023');
  const quiz = L.at('L024');
  const quizAnswer = L.at('L025');

  // ---- the pose assembles while Rashid describes it ----
  const stand = interpolate(f, [setPose + 10, setPose + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const feet = interpolate(f, [setPose + 70, setPose + 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arms = interpolate(f, [setPose + 140, setPose + 200], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /**
   * Palm orientation over the scene. It goes to the WRONG place first, because
   * that is what Salem suggests, and the viewfinder refusing to lock is what
   * makes the error visible without anyone correcting him yet.
   */
  const palmForward =
    f < salemAsks + 14 ? 0 : f < salemAnswers + 12 ? 0 : interpolate(f, [salemAnswers + 12, salemAnswers + 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const palms: 'forward' | 'medial' = palmForward > 0.5 ? 'forward' : 'medial';

  // the frame locks only once the palms are right
  const locked = f >= salemAnswers + 40;
  // while the retrieval question hangs, the frame pulses but never answers
  const waiting =
    (f > L.end('L018') && f < salemAnswers) || (f > L.end('L024') && f < quizAnswer)
      ? 0.5 + 0.5 * Math.sin((f / 7) * Math.PI)
      : 0;

  // ---- Noura tips the patient over; the captured reference does not follow ----
  const lying = interpolate(f, [nouraLying + 20, nouraLying + 90, refStays + 150, refStays + 190], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shutter = interpolate(f, [confirm + 96, confirm + 104, confirm + 128], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const refCard = interpolate(f, [confirm + 104, confirm + 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const speaking = (id: string) => f >= L.at(id) && f <= L.end(id);
  const rashidTalk = speaking('L016') || speaking('L018') || speaking('L020') || speaking('L023') || speaking('L024');
  const salemTalk = speaking('L017') || speaking('L019') || speaking('L022') || speaking('L025');
  const nouraTalk = speaking('L021');

  const nouraIn = interpolate(f, [nouraLying - 30, nouraLying - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneShellAR lines={L}>
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {/* ---------- the body being posed, inside the shot ---------- */}
          <g transform={`translate(960 ${876 - lying * 250}) rotate(${-lying * 86})`}>
            <g transform={`translate(0 ${lying * 250}) scale(${0.74 + 0.26 * stand})`} opacity={0.35 + 0.65 * stand}>
              <PatientModel
                yaw={0}
                scale={1.02}
                palms={arms > 0.4 ? palms : null}
                showMarkers={f >= refStays + 40}
                showLeftMarker={f >= refStays + 70}
              />
            </g>
          </g>

          {/* feet-together and toes-forward tick, early and quiet */}
          {feet > 0.02 && f < confirm ? (
            <g opacity={Math.min(feet, interpolate(f, [whatsOff, whatsOff + 20], [1, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}>
              <text x={960} y={1000} textAnchor="middle" fill={colorAR.textDim} style={{font: `600 26px ${fontAR.ar}`, direction: 'rtl'}}>
                القدمين مع بعض · الأصابع لقدام
              </text>
            </g>
          ) : null}

          {/* ---------- the viewfinder ---------- */}
          <g transform="translate(960 560)">
            <Viewfinder on={interpolate(f, [setPose, setPose + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} locked={locked} attention={waiting} label={locked ? 'LOCKED' : 'ADJUST'} w={700} h={820} />
          </g>

          {/* the shutter: the moment the reference is captured */}
          {shutter > 0.01 ? <rect width={1920} height={1080} fill="#FFFFFF" opacity={shutter * 0.75} /> : null}

          {/* the captured reference, which then stays put no matter what the patient does */}
          {refCard > 0.01 ? (
            <g transform="translate(168 226)" opacity={refCard}>
              <rect x={-100} y={-146} width={200} height={292} rx={12} fill="#0C141B" stroke="#5BD6A0" strokeWidth={3} />
              <g transform="translate(0 92) scale(0.26)">
                <PatientModel yaw={0} scale={1} palms="forward" />
              </g>
              <text y={128} textAnchor="middle" fill="#5BD6A0" style={{font: `700 17px ${fontAR.term}`}}>
                REFERENCE
              </text>
            </g>
          ) : null}

          {/* The palms ARE the lesson, and at body scale they are a few pixels.
              A magnified inset rides the moment they turn, then leaves. */}
          {(() => {
            const inset = interpolate(
              f,
              [salemAsks + 6, salemAsks + 30, confirm + 70, confirm + 100],
              [0, 1, 1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            );
            if (inset <= 0.01) return null;
            const turn = interpolate(palmForward, [0, 1], [0, 180]);
            return (
              <g transform="translate(1418 286)" opacity={inset}>
                <circle r={120} fill="#0C141B" stroke={locked ? '#5BD6A0' : colorAR.patientRight} strokeWidth={3} />
                <g transform={`scale(${Math.cos((turn * Math.PI) / 180) >= 0 ? 1 : -1} 1)`}>
                  <ellipse rx={54 * Math.abs(Math.cos((turn * Math.PI) / 180)) + 16} ry={66} fill={colorAR.skin} stroke={colorAR.skinLine} strokeWidth={3} />
                  {palmForward > 0.5 ? (
                    <g stroke={colorAR.skinLine} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8}>
                      <path d="M -26 -16 Q 0 -4 24 -18" />
                      <path d="M -26 4 Q 0 18 24 2" />
                    </g>
                  ) : (
                    <g opacity={0.65}>
                      {[-20, 0, 20].map((dx) => (
                        <circle key={dx} cx={dx} cy={-20} r={7} fill={colorAR.skinLine} />
                      ))}
                    </g>
                  )}
                </g>
                <text y={158} textAnchor="middle" fill={colorAR.textDim} style={{font: `600 26px ${fontAR.ar}`, direction: 'rtl'}}>
                  {palmForward > 0.5 ? 'راحة اليد لقدام' : 'راحة اليد للفخذ'}
                </text>
              </g>
            );
          })()}

          {/* ---------- the cast ---------- */}
          <g transform="translate(300 906)">
            <Salem
              scale={0.9}
              expression={speaking('L022') ? 'smirk' : speaking('L019') ? 'smileSmall' : salemTalk ? 'talk' : 'idle'}
              gesture={speaking('L019') ? 'bothOpen' : 'none'}
              look="right"
              blink={blinkAt(f, 118, 0)}
              mouth={mouthAt(f, salemTalk, 0)}
              breath={breathAt(f, 0)}
            />
          </g>
          <g transform="translate(1596 906)">
            <Rashid
              flip
              scale={0.92}
              expression={speaking('L018') || speaking('L024') ? 'deadpan' : rashidTalk ? 'talk' : 'idle'}
              gesture={speaking('L016') || speaking('L023') ? 'teach' : 'none'}
              look="left"
              blink={blinkAt(f, 104, 37)}
              mouth={mouthAt(f, rashidTalk, 23)}
              breath={breathAt(f, 24)}
            />
          </g>
          <g transform={`translate(${interpolate(nouraIn, [0, 1], [2080, 1788])} 906)`} opacity={nouraIn}>
            <Noura
              flip
              scale={0.88}
              expression={nouraTalk ? 'dry' : 'deadpan'}
              gesture={nouraTalk ? 'pointUp' : 'none'}
              look="left"
              blink={blinkAt(f, 126, 61)}
              mouth={mouthAt(f, nouraTalk, 51)}
              breath={breathAt(f, 48)}
            />
          </g>
        </svg>
      </AbsoluteFill>

      {/* the term only once the shot has actually locked */}
      <TermReveal term="Anatomical position" at={confirm + 132} until={nouraLying + 40} x={960} y={168} />
      <TermReveal term="Patient right" at={refStays + 52} until={quiz} x={700} y={168} tint={colorAR.patientRight} small />
    </SceneShellAR>
  );
};
