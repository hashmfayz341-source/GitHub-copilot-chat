import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, keyframes, lerp, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin, rig, toStage} from '../medical/Mannequin';
import {FeetFront} from '../medical/Foot';
import {LIMB, UpperLimbXray} from '../medical/Skeleton';
import {ForearmXray} from '../medical/Forearm';
import {Bracket, DrawnArrow, Pulse, SvgText} from '../components/svg';
import {Countdown, Kicker, QuizOption, Stage} from '../components/ui';
import {pt} from '../utils/geometry';

/* ───────── Clinical case ───────── */
export const Case: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('case');
  const toFeet = progress(frame, b('exam', 0.2), 30, ease.inOut);
  const R = rig('front', ANATOMICAL);
  const FX = 520, FY = 1000, FS = 0.86;
  const ankle = toStage(R.r.A, FX, FY, FS);
  const reveal = b('answer');
  const tilt = keyframes(frame, [
    [b('exam', 2.4), 0],
    [b('exam', 3.6), -18],
    [b('exam', 5.0), -18],
    [b('exam', 6.0), 0],
    [reveal + 6, 0],
    [reveal + 40, -22],
    [b('why', 0.4), -22],
    [b('why', 1.3), 24],
    [b.at('why', 0.45), 24],
    [b.at('why', 0.55), 0],
  ]);
  const optionsAt = b.at('question', 0.35);
  const caseCard = appear(frame, b('intro', 0.4), {out: b('question', -0.1)});
  const bubble = appear(frame, b('exam', 1.4), {out: b('question', -0.1)});
  return (
    <SceneShell id="case" chapter={5} sub="Case scenario">
      <Stage>
        <g opacity={1 - toFeet}>
          <Mannequin view="front" x={FX} y={FY} scale={FS} />
          <Pulse c={pt(ankle.x, ankle.y + 8)} r={34} start={b('intro', 2.4)} stroke={color.danger} />
          <SvgText x={ankle.x - 40} y={ankle.y + 70} text="right ankle" start={b('intro', 2.8)} size={32} fill={color.danger} anchor="end" />
        </g>
        <g opacity={toFeet}>
          <FeetFront x={520} y={640} scale={1.1} tilt={tilt} soleArrow={progress(frame, b('exam', 2.2), 14)} midline={toFeet} lateralGlow={progress(frame, b.at('exam', 0.7), 14)} />
          <SvgText x={520 - 150 * 1.1 - 120} y={600} text="lateral" start={b.at('exam', 0.72)} size={30} fill={color.danger} anchor="end" />
          <SvgText x={520 - 150 * 1.1 - 120} y={636} text="ankle" start={b.at('exam', 0.74)} size={30} fill={color.danger} anchor="end" />
          <SvgText x={520} y={160} text="patient’s RIGHT  ·  LEFT" start={b('exam', 0.8)} size={28} fill={color.textDim} family="Inter" weight={700} />
          {frame >= reveal ? <SvgText x={520} y={980} text={tilt > 5 ? 'inversion: sole toward the midline' : 'eversion: sole away from the midline'} start={reveal + 20} size={34} fill={tilt > 5 ? color.textDim : color.correct} /> : null}
        </g>
      </Stage>
      {/* case card */}
      <div style={{position: 'absolute', left: 1000, top: 230, width: 800, opacity: caseCard.opacity, transform: `translateY(${caseCard.y}px)`}}>
        <Kicker color={color.danger}>Clinical case</Kicker>
        <div style={{...type.h2, color: color.text, marginTop: 14}}>22-year-old football player</div>
        <div style={{...type.body, color: color.textDim, marginTop: 12}}>twisted his right ankle during a match</div>
        <div style={{...type.body, color: color.text, marginTop: 40, opacity: appear(frame, b.at('exam', 0.6)).opacity}}>
          Exam goal: <b style={{color: color.danger}}>integrity of the lateral ankle structures</b>
        </div>
      </div>
      {/* physician request */}
      <div style={{position: 'absolute', left: 1000, top: 640, opacity: bubble.opacity, transform: `translateY(${bubble.y}px)`}}>
        <div style={{background: '#F4F0E6', color: '#22303B', borderRadius: 24, padding: '26px 36px', ...type.h3, fontSize: 42, maxWidth: 720, boxShadow: '0 20px 50px rgba(0,0,0,0.4)'}}>
          “Turn the sole of your foot <span style={{color: '#C0392B'}}>outward</span>, away from the midline.”
        </div>
        <div style={{...type.small, color: color.textDim, marginTop: 14, marginLeft: 20}}>— the examining physician</div>
      </div>
      {/* question + options */}
      <div style={{position: 'absolute', left: 1000, top: 200, width: 820, opacity: appear(frame, b('question', 0.1)).opacity}}>
        <Kicker>Question</Kicker>
        <div style={{...type.h2, fontSize: 54, color: color.text, marginTop: 12}}>Which anatomical term describes this movement?</div>
      </div>
      {[
        ['A', 'Inversion', false, 'sole toward the midline'],
        ['B', 'Eversion', true, 'sole away from the midline ✓'],
        ['C', 'Dorsiflexion', false, 'dorsum up — not side to side'],
        ['D', 'Plantar flexion', false, 'foot down — not side to side'],
      ].map(([l, t, c, note], i) => (
        <React.Fragment key={l as string}>
          <QuizOption letter={l as string} text={t as string} correct={c as boolean} start={optionsAt + i * 8} revealAt={reveal + 10} x={1000} y={440 + i * 120} w={430} />
          <div style={{position: 'absolute', left: 1460, top: 440 + i * 120 + 30, ...type.small, color: c ? color.correct : color.textDim, opacity: appear(frame, b.at('why', i === 0 ? 0.05 : i === 1 ? 0.0 : 0.55), {dy: 10}).opacity, width: 420}}>
            {note as string}
          </div>
        </React.Fragment>
      ))}
      <Countdown start={b.end('question', 0.1)} end={b('answer', -0.3)} x={1640} y={640} />
      {void lerp}
      {void pop}
    </SceneShell>
  );
};

/* ───────── Rapid-fire self test ───────── */
const Q: Array<{q: string; a: string; tone: string}> = [
  {q: 'Which plane divides the body into superior and inferior parts?', a: 'Transverse plane', tone: color.transverse},
  {q: 'The arm moves toward the midline. Name the movement.', a: 'Adduction', tone: color.coronal},
  {q: 'Is the hand proximal or distal to the elbow?', a: 'Distal', tone: color.coronal},
  {q: 'The palm turns to face backward. Name the movement.', a: 'Pronation', tone: color.accent},
];

export const Quiz: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('quiz');
  const qi = frame >= b('q4') ? 3 : frame >= b('q3') ? 2 : frame >= b('q2') ? 1 : frame >= b('q1') ? 0 : -1;
  const qStart = qi >= 0 ? b(`q${qi + 1}`) : 0;
  const aStart = qi >= 0 ? b(`a${qi + 1}`) : 0;
  const answered = qi >= 0 && frame >= aStart;
  const local = frame - qStart;
  const qa = appear(frame, qStart, {dy: 24});
  const intro = appear(frame, b('intro', 0.1), {out: b('q1', -0.2)});
  return (
    <SceneShell id="quiz" chapter={5} sub="Self-test">
      {intro.opacity > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: intro.opacity, transform: `translateY(${intro.y}px)`}}>
          <Kicker>Retrieval practice</Kicker>
          <div style={{...type.hero, color: color.text, marginTop: 20}}>Quick self-test</div>
          <div style={{...type.body, color: color.textDim, marginTop: 20}}>answer before the reveal</div>
        </div>
      ) : null}
      {qi >= 0 ? (
        <>
          <div style={{position: 'absolute', left: 120, top: 120, width: 1680, opacity: qa.opacity, transform: `translateY(${qa.y}px)`}} key={qi}>
            <Kicker>Question {qi + 1} of 4</Kicker>
            <div style={{...type.h2, fontSize: 56, color: color.text, marginTop: 12}}>{Q[qi].q}</div>
          </div>
          <Stage>
            <QuizVisual qi={qi} local={local} answered={answered} answerAt={aStart - qStart} />
          </Stage>
          {answered ? (
            <div style={{position: 'absolute', left: 1240, top: 520, transform: `scale(${pop(frame, aStart)})`, transformOrigin: 'left center'}}>
              <div style={{...type.kicker, color: color.correct}}>Answer</div>
              <div style={{...type.h1, fontSize: 92, color: Q[qi].tone, marginTop: 8}}>{Q[qi].a}</div>
            </div>
          ) : null}
          <Countdown start={b.end(`q${qi + 1}`, 0.05)} end={aStart - 4} x={1500} y={600} size={150} />
          {/* progress dots */}
          <div style={{position: 'absolute', right: 120, top: 70, display: 'flex', gap: 14}}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: i < qi || (i === qi && answered) ? color.correct : i === qi ? color.accent : 'rgba(255,255,255,0.18)'}} />
            ))}
          </div>
        </>
      ) : null}
    </SceneShell>
  );
};

const QuizVisual: React.FC<{qi: number; local: number; answered: boolean; answerAt: number}> = ({qi, local, answered, answerAt}) => {
  const FX = 640, FY = 1010, FS = 0.78;
  if (qi === 0) {
    const y = FY - 470 * FS;
    return (
      <g>
        <Mannequin view="front" x={FX} y={FY} scale={FS} />
        <line x1={FX - 260} y1={y} x2={FX + 260} y2={y} stroke={answered ? color.transverse : color.textFaint} strokeWidth={answered ? 8 : 5} strokeDasharray={answered ? undefined : '16 12'} />
        {!answered ? <text x={FX + 290} y={y + 14} fill={color.textFaint} fontFamily="Manrope" fontWeight={800} fontSize={54}>?</text> : null}
        <SvgText x={FX - 330} y={y - 120} text="superior" start={10} size={34} fill={color.transverse} anchor="end" />
        <SvgText x={FX - 330} y={y + 140} text="inferior" start={16} size={34} fill={color.transverse} anchor="end" />
      </g>
    );
  }
  if (qi === 1) {
    const t = (local % 54) / 54;
    const abd = lerp(70, 9, Math.min(1, t * 1.4));
    const R = rig('front', {...ANATOMICAL, rAbd: abd});
    const S = toStage(R.r.S, FX, FY, FS);
    return (
      <g>
        <line x1={FX} y1={FY - 720} x2={FX} y2={FY} stroke={color.sagittal} strokeWidth={4} strokeDasharray="14 10" />
        <Mannequin view="front" x={FX} y={FY} scale={FS} pose={{...ANATOMICAL, rAbd: abd}} highlight={{rArm: color.coronal}} />
        <DrawnArrow d={`M${S.x - 340} ${S.y + 40} A 330 330 0 0 0 ${S.x - 60} ${S.y + 320}`} start={0} dur={1} stroke={color.coronal} width={6} head={22} />
      </g>
    );
  }
  if (qi === 2) {
    return (
      <g transform="translate(30 220) scale(0.72)">
        <UpperLimbXray />
        {[LIMB.elbow, LIMB.hand].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={18} fill={color.coronal} stroke={color.bg0} strokeWidth={4} />
            <text x={p.x} y={p.y + 110} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={44} fill={color.text}>{i ? 'hand' : 'elbow'}</text>
          </g>
        ))}
        {answered ? <Bracket a={pt(LIMB.elbow.x, 300)} b={pt(LIMB.hand.x, 300)} side={-40} start={answerAt} stroke={color.coronal} text="hand is DISTAL to elbow" size={46} /> : null}
      </g>
    );
  }
  const palm = (Math.sin((local / 40) * Math.PI - Math.PI / 2) * 0.5 + 0.5) * 180;
  return (
    <g transform="translate(110 225) scale(0.78)">
      <ForearmXray palm={palm} radiusGlow />
    </g>
  );
};
