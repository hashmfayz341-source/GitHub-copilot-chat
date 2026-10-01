import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, keyframes, lerp, progress} from '../animation/motion';
import {color} from '../design-system/theme';
import {HEAD_POINTS, HeadProfile} from '../medical/Head';
import {Mannequin, rig, toStage, ANATOMICAL} from '../medical/Mannequin';
import {DrawnArrow, Label, SvgText} from '../components/svg';
import {Stage, TermReveal} from '../components/ui';

export const Jaw: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('jaw');
  const protrude = keyframes(frame, [
    [b('pro', 0.4), 0],
    [b('pro', 1.4), 34],
    [b('ret', 0.2), 34],
    [b('ret', 1.4), -24],
    [b('elev', -0.4), -24],
    [b('elev', 0.2), 0],
  ]);
  const open = keyframes(frame, [
    [b('elevJaw', -0.6), 0],
    [b('elevJaw', 0.0), 22],
    [b('elevJaw', 0.5), 22],
    [b('elevJaw', 1.6), 0],
    [b('depJaw', 0.4), 0],
    [b('depJaw', 1.6), 24],
    [b.end('depJaw', 0.6), 24],
  ]);
  const shrug = keyframes(frame, [
    [b('elev', 1.6), 0],
    [b('elev', 2.6), 38],
    [b('dep', 1.6), 38],
    [b('dep', 2.8), 0],
  ]);
  // spotlight: which side is active
  const bodyFocus = keyframes(frame, [
    [b('elev', 0.2), 0],
    [b('elev', 0.8), 1],
    [b('elevJaw', -0.6), 1],
    [b('elevJaw', 0.0), 0],
    [b('dep', 0.0), 0],
    [b('dep', 0.6), 1],
    [b('depJaw', -0.4), 1],
    [b('depJaw', 0.2), 0],
  ]);
  const HX = 470, HY = 545, HS = 1.3;
  const BX = 1420, BY = 1010, BS = 0.9;
  const R = rig('back', {...ANATOMICAL, rShrug: shrug, lShrug: shrug});
  const shL = toStage(R.l.S, BX, BY, BS), shR = toStage(R.r.S, BX, BY, BS);
  const chin = {x: HX + (HEAD_POINTS.chin.x + protrude) * HS, y: HY + HEAD_POINTS.chin.y * HS};
  const bodyA = appear(frame, b('intro', 0.6)).opacity;
  return (
    <SceneShell id="jaw" chapter={4} sub="Glides & vertical movements">
      <Stage>
        <g opacity={lerp(1, 0.32, bodyFocus)}>
          <HeadProfile x={HX} y={HY} scale={HS} protrude={protrude} open={open} />
          <DrawnArrow d={`M${chin.x + 40} ${chin.y - 40} L${chin.x + 250} ${chin.y - 40}`} start={b('pro', 0.4)} dur={18} out={b('ret')} stroke={color.accent} width={10} head={34} />
          <DrawnArrow d={`M${chin.x + 250} ${chin.y - 40} L${chin.x + 50} ${chin.y - 40}`} start={b('ret', 0.3)} dur={18} out={b('elev')} stroke={color.coronal} width={10} head={34} />
          <DrawnArrow d={`M${chin.x + 90} ${chin.y + 110} L${chin.x + 90} ${chin.y - 60}`} start={b('elevJaw', 0.4)} dur={18} out={b('dep')} stroke={color.transverse} width={10} head={34} />
          <DrawnArrow d={`M${chin.x + 90} ${chin.y - 60} L${chin.x + 90} ${chin.y + 110}`} start={b('depJaw', 0.3)} dur={18} stroke={color.transverse} width={10} head={34} />
          <Label anchor={{x: HX + (90 + protrude) * HS, y: HY + 175 * HS}} at={{x: HX + 330, y: HY + 360}} text="mandible" start={b('intro', 1.0)} size={34} stroke={color.text} />
        </g>
        <g opacity={bodyA * lerp(0.32, 1, bodyFocus)}>
          <Mannequin view="back" x={BX} y={BY} scale={BS} pose={{...ANATOMICAL, rShrug: shrug, lShrug: shrug}} highlight={bodyFocus > 0.5 ? {torso: color.transverse} : {}} />
          {[shL, shR].map((s, i) => (
            <g key={i}>
              <DrawnArrow d={`M${s.x} ${s.y - 60} L${s.x} ${s.y - 170}`} start={b('elev', 1.4)} dur={16} out={b('elevJaw')} stroke={color.transverse} width={8} />
              <DrawnArrow d={`M${s.x} ${s.y - 170} L${s.x} ${s.y - 60}`} start={b('dep', 1.4)} dur={16} out={b('depJaw')} stroke={color.transverse} width={8} />
            </g>
          ))}
        </g>
      </Stage>
      <TermReveal term="PROTRACTION" def="moving the jaw forwards" start={b('pro', 1.6)} out={b('ret', 0.1)} x={120} y={110} size={78} width={760} />
      <TermReveal term="RETRACTION" def="moving the jaw backwards" start={b('ret', 1.5)} out={b('elev', 0.1)} x={120} y={110} size={78} width={760} accent={color.coronal} />
      <TermReveal term="ELEVATION" def="moving a part upward (superiorly)" start={b('elev', 0.3)} out={b('dep', 0.1)} x={960} y={110} size={78} width={820} accent={color.transverse} align="center" />
      <TermReveal term="DEPRESSION" def="moving a part downward (inferiorly)" start={b('dep', 0.3)} x={960} y={110} size={78} width={820} accent={color.transverse} align="center" />
      <Caption text="shrug the shoulders" start={b('elev', 2.0)} out={b('elevJaw')} x={BX} y={1030} />
      <Caption text="close the mouth: mandible up" start={b('elevJaw', 0.6)} out={b('dep')} x={HX + 100} y={1030} />
      <Caption text="lower the shoulders" start={b('dep', 2.0)} out={b('depJaw')} x={BX} y={1030} />
      <Caption text="open the mouth: mandible down" start={b('depJaw', 0.6)} x={HX + 100} y={1030} />
      {void progress}
    </SceneShell>
  );
};

const Caption: React.FC<{text: string; start: number; out?: number; x: number; y: number}> = ({text, start, out, x, y}) => (
  <Stage>
    <SvgText x={x} y={y} text={text} start={start} out={out} size={34} fill={color.text} family="Inter" weight={700} />
  </Stage>
);
