import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, keyframes, lerp, progress} from '../animation/motion';
import {color} from '../design-system/theme';
import {FeetFront, FootSide} from '../medical/Foot';
import {ArcArrow, SvgText} from '../components/svg';
import {Stage, TermReveal} from '../components/ui';
import {pt} from '../utils/geometry';

export const Foot: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('foot');
  const ankle = keyframes(frame, [
    [b('dorsi', 0.3), 0],
    [b('dorsi', 1.6), 22],
    [b('plantar', 0.0), 22],
    [b('plantar', 1.4), -38],
    [b('front', -0.2), -38],
    [b('front', 0.4), 0],
  ]);
  const swap = progress(frame, b('front', -0.3), 26, ease.inOut);
  const tilt = keyframes(frame, [
    [b('inv', 0.2), 0],
    [b('inv', 1.5), 28],
    [b('ev', 0.0), 28],
    [b('ev', 0.4), 0],
    [b('ev', 1.5), -20],
  ]);
  const sx = lerp(0, -500, swap);
  return (
    <SceneShell id="foot" chapter={4} sub="Foot movements">
      <Stage>
        <g opacity={1 - swap} transform={`translate(${sx} 0)`}>
          <FootSide x={760} y={740} scale={1.35} ankle={ankle} dorsumGlow={progress(frame, b('dorsi', 0.2), 12) * (1 - progress(frame, b('plantar'), 10))} soleGlow={progress(frame, b('plantar', 0.1), 12)} />
          <ArcArrow c={pt(760, 740)} r={300} a0={-8} a1={-40} start={b('dorsi', 0.5)} dur={20} out={b('plantar')} stroke={color.accent} width={7} head={24} />
          <ArcArrow c={pt(760, 740)} r={300} a0={20} a1={52} start={b('plantar', 0.3)} dur={20} out={b('front', -0.3)} stroke={color.sagittal} width={7} head={24} />
          <SvgText x={1000} y={620} text="dorsum" start={b('dorsi', 0.5)} out={b('plantar')} size={34} fill={color.accent} anchor="start" />
          <SvgText x={1020} y={880} text="sole" start={b('plantar', 0.4)} out={b('front', -0.3)} size={34} fill={color.sagittal} anchor="start" />
        </g>
        <g opacity={swap}>
          <FeetFront x={700} y={640} scale={1.15} tilt={tilt} soleArrow={progress(frame, b('front', 0.6), 16)} midline={progress(frame, b('front', 0.2), 16)} />
          <SvgText x={700} y={150} text="MIDLINE" start={b('front', 0.4)} size={28} fill={color.sagittal} family="Inter" />
          <SvgText x={700} y={990} text="arrows show where each sole faces" start={b('front', 1.0)} size={30} fill={color.textDim} family="Inter" weight={600} />
        </g>
      </Stage>
      <TermReveal term="DORSIFLEXION" def="moves the dorsum of the foot upwards" start={b('dorsi', 1.8)} out={b('plantar', 0.1)} x={1240} y={300} size={82} width={640} />
      <TermReveal term="PLANTAR FLEXION" def="moves the foot downward" start={b('plantar', 1.6)} out={b('front', -0.2)} x={1240} y={300} size={76} width={640} accent={color.sagittal} />
      <TermReveal term="INVERSION" def="turns the sole toward the midline" start={b('inv', 1.4)} out={b('ev', 0.1)} x={1240} y={300} size={86} width={640} accent={color.sagittal} />
      <TermReveal term="EVERSION" def="turns the sole away from the midline" start={b('ev', 1.4)} x={1240} y={300} size={86} width={640} accent={color.sagittal} />
      {void appear}
    </SceneShell>
  );
};
