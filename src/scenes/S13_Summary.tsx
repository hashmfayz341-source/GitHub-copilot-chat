import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../animation/beats';
import {appear, ease, lerp, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin} from '../medical/Mannequin';
import {Icon} from '../components/icons';
import {Kicker} from '../components/ui';

const TileVisual: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const wave = Math.sin(f / 14) * 0.5 + 0.5;
  const fig = (pose = {}, extra?: React.ReactNode) => (
    <svg width={280} height={250} viewBox="0 0 280 250">
      <Mannequin view="front" x={140} y={238} scale={0.25} pose={{...ANATOMICAL, ...pose}} shadow={false} />
      {extra}
    </svg>
  );
  if (i === 0) return fig({}, <rect x={78} y={6} width={124} height={238} rx={14} fill="none" stroke={color.accent} strokeWidth={3} strokeDasharray="8 7" strokeDashoffset={-f * 0.8} />);
  if (i === 1)
    return fig(
      {},
      <g>
        <line x1={140} y1={4} x2={140} y2={246} stroke={color.sagittal} strokeWidth={4} />
        <line x1={60} y1={120 + (wave - 0.5) * 60} x2={220} y2={120 + (wave - 0.5) * 60} stroke={color.transverse} strokeWidth={4} />
        <path d="M86 30 L196 14 L196 232 L86 246Z" fill={color.coronal} fillOpacity={0.16} stroke={color.coronal} strokeWidth={3} />
      </g>,
    );
  if (i === 2)
    return fig(
      {},
      <g stroke={color.accent} strokeWidth={5} strokeLinecap="round">
        <line x1={210} y1={140} x2={210} y2={40} />
        <path d="M210 30 l-10 16 h20z" fill={color.accent} />
        <line x1={70} y1={120} x2={20} y2={120} />
        <path d="M12 120 l16 -10 v20z" fill={color.accent} />
      </g>,
    );
  if (i === 3) return fig({rAbd: lerp(9, 85, wave), lAbd: lerp(9, 85, 1 - wave)});
  return (
    <div style={{width: 280, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon kind="language" size={170} />
    </div>
  );
};

export const Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('summary');
  const tiles = [
    {title: 'Anatomical position', sub: 'the standard reference', beat: 's1', tone: color.accent},
    {title: 'Planes', sub: 'coronal · sagittal · transverse', beat: 's2', tone: color.coronal},
    {title: 'Directional terms', sub: 'relative location of structures', beat: 's3', tone: color.sagittal},
    {title: 'Movement terms', sub: 'joint & body movements', beat: 's4', tone: color.transverse},
    {title: 'Common language', sub: 'anatomical & clinical communication', beat: 's5', tone: color.axis},
  ];
  const shrink = progress(frame, b('refs', -0.4), 30, ease.inOut);
  const head = appear(frame, b('intro'), {dy: 20});
  return (
    <SceneShell id="summary" chapter={6}>
      <div style={{position: 'absolute', left: 120, top: 130, opacity: head.opacity, transform: `translateY(${head.y}px)`}}>
        <Kicker>Summary</Kicker>
        <div style={{...type.h1, color: color.text, marginTop: 10, fontSize: 84}}>Bringing it together</div>
      </div>
      <div style={{position: 'absolute', left: 100, top: lerp(330, 290, shrink), display: 'flex', gap: 30, transform: `scale(${lerp(1, 0.74, shrink)})`, transformOrigin: '50% 0', width: 1720}}>
        {tiles.map((t, i) => {
          const s = pop(frame, b(t.beat));
          const a = appear(frame, b(t.beat), {dy: 40});
          const current = frame >= b(t.beat) && (i === tiles.length - 1 || frame < b(tiles[i + 1].beat)) && frame < b('refs', -0.4);
          return (
            <div key={i} style={{width: 320, height: 470, borderRadius: 28, background: color.panel, border: `3px solid ${current ? t.tone : color.panelLine}`, opacity: a.opacity, transform: `translateY(${a.y}px) scale(${0.9 + 0.1 * s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', boxSizing: 'border-box'}}>
              <TileVisual i={i} />
              <div style={{...type.h3, fontSize: 36, color: t.tone, textAlign: 'center', marginTop: 18}}>{t.title}</div>
              <div style={{...type.body, fontSize: 26, color: color.textDim, textAlign: 'center', marginTop: 10}}>{t.sub}</div>
            </div>
          );
        })}
      </div>
      {/* references */}
      <div style={{position: 'absolute', left: 160, right: 160, top: 690, opacity: appear(frame, b('refs', 0.2)).opacity, display: 'flex', gap: 60, alignItems: 'flex-start'}}>
        <div style={{flex: 1}}>
          <Kicker color={color.textDim}>References</Kicker>
          <div style={{...type.body, fontSize: 32, color: color.text, marginTop: 16, lineHeight: 1.55}}>
            Gray’s Anatomy for Students, 5th ed. Elsevier; 2023.
            <br />
            Last’s Anatomy: Regional and Applied, 12th ed. Elsevier; 2011.
            <br />
            AMBOSS
          </div>
        </div>
        <div style={{width: 520}}>
          <Kicker color={color.textDim}>Based on</Kicker>
          <div style={{...type.body, fontSize: 30, color: color.textDim, marginTop: 16}}>Lecture 1 — Introduction to Anatomy · Anatomy &amp; Embryology</div>
        </div>
      </div>
    </SceneShell>
  );
};
