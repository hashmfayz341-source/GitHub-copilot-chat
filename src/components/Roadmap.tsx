import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {color, type} from '../design-system/theme';
import {appear, ease, pop, progress} from '../animation/motion';
import {Icon, IconKind} from './icons';
import {Background} from '../design-system/Background';
import {chapterName} from './ui';

export const ROADMAP: Array<{chapter: number; title: string; icon: IconKind}> = [
  {chapter: 1, title: 'Position', icon: 'figure'},
  {chapter: 2, title: 'Planes', icon: 'planes'},
  {chapter: 3, title: 'Directions', icon: 'arrows'},
  {chapter: 4, title: 'Movements', icon: 'move'},
  {chapter: 5, title: 'Clinical', icon: 'case'},
];

const nodeX = (i: number) => 260 + i * 350;
const NODE_Y = 560;
const pathD = `M140 ${NODE_Y} ${ROADMAP.map((_, i) => `L${nodeX(i)} ${NODE_Y + (i % 2 === 0 ? 0 : 0)}`).join(' ')} L1780 ${NODE_Y}`;

/**
 * Lecture roadmap: a route with five stops. `reveal[i]` = frame node i appears;
 * `active` = currently highlighted chapter (others dimmed).
 */
export const Roadmap: React.FC<{reveal: number[]; drawStart: number; active?: number; done?: number}> = ({reveal, drawStart, active, done = 0}) => {
  const frame = useCurrentFrame();
  const draw = progress(frame, drawStart, 40, ease.inOut);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={pathD} stroke="rgba(170,200,220,0.18)" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 16" />
        <path d={pathD} stroke={color.accent} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${1640 * draw} 4000`} opacity={0.9} />
      </svg>
      {ROADMAP.map((n, i) => {
        const s = pop(frame, reveal[i] ?? 0);
        const isActive = active === n.chapter;
        const isDone = n.chapter <= done;
        const dim = active !== undefined && !isActive ? 0.45 : 1;
        if ((reveal[i] ?? 0) > frame) return null;
        return (
          <div key={i} style={{position: 'absolute', left: nodeX(i) - 110, top: NODE_Y - 110, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${s * (isActive ? 1.15 : 1)})`, opacity: dim}}>
            <div style={{width: 220, height: 220, borderRadius: 110, background: isActive ? 'rgba(255,181,71,0.14)' : color.panel, border: `4px solid ${isActive ? color.accent : isDone ? 'rgba(255,181,71,0.5)' : color.panelLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 60px rgba(255,181,71,0.25)' : 'none'}}>
              <Icon kind={n.icon} size={130} />
            </div>
            <div style={{...type.label, fontSize: 36, color: isActive ? color.accent : color.text, marginTop: 26}}>{n.title}</div>
            <div style={{...type.kicker, fontSize: 20, color: color.textFaint, marginTop: 8}}>{String(n.chapter).padStart(2, '0')}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Silent chapter card between chapters (2.5 s): roadmap with the next stop lit. */
export const ChapterCard: React.FC<{chapter: number}> = ({chapter}) => {
  const frame = useCurrentFrame();
  const title = appear(frame, 8, {dur: 20, dy: 30});
  const isSummary = chapter > ROADMAP.length;
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', top: -60, left: 0, right: 0, bottom: 0, transform: `scale(${0.9 + progress(frame, 0, 75, ease.soft) * 0.04})`, opacity: 0.85}}>
        <Roadmap reveal={[0, 0, 0, 0, 0]} drawStart={-100} active={isSummary ? undefined : chapter} done={chapter - 1} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: title.opacity, transform: `translateY(${title.y}px)`}}>
        <div style={{...type.kicker, color: color.accent, fontSize: 28}}>Chapter {String(chapter).padStart(2, '0')}</div>
        <div style={{...type.h1, color: color.text, marginTop: 16}}>{chapterName(chapter)}</div>
      </div>
    </AbsoluteFill>
  );
};
