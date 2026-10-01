/**
 * HTML overlay components (crisp typography above the stage).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {color, font, layout, type} from '../design-system/theme';
import {appear, ease, pop, progress} from '../animation/motion';

const CHAPTERS = ['Foundations', 'Anatomical Position', 'Anatomical Planes', 'Directional Terms', 'Terms of Movement', 'Clinical Application', 'Summary'];

/** Small persistent chapter tag (top-left, inside safe area). */
export const ChapterTag: React.FC<{chapter: number; sub?: string}> = ({chapter, sub}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, 6, {dur: 20, dy: -10});
  return (
    <div style={{position: 'absolute', left: layout.safeX - 30, top: layout.safeY - 40, display: 'flex', alignItems: 'center', gap: 16, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
      <div style={{...type.kicker, fontSize: 22, color: color.bg0, background: color.accent, borderRadius: 8, padding: '6px 12px', letterSpacing: 2}}>
        {String(chapter).padStart(2, '0')}
      </div>
      <div style={{...type.kicker, fontSize: 22, color: color.textDim, letterSpacing: 4}}>
        {CHAPTERS[chapter]}
        {sub ? <span style={{color: color.textFaint}}> · {sub}</span> : null}
      </div>
    </div>
  );
};

export const chapterName = (n: number) => CHAPTERS[n];

/**
 * A term revealed AFTER its concept has been shown: wipes in from a mask,
 * with an optional one-line definition underneath.
 */
export const TermReveal: React.FC<{
  term: string;
  def?: string;
  start: number;
  out?: number;
  x: number;
  y: number;
  accent?: string;
  align?: 'left' | 'center' | 'right';
  size?: number;
  width?: number;
}> = ({term, def, start, out, x, y, accent = color.accent, align = 'left', size = 96, width = 760}) => {
  const frame = useCurrentFrame();
  const wipe = progress(frame, start, 18, ease.out);
  const o = out === undefined ? 1 : 1 - progress(frame, out, 14, ease.in);
  const defA = appear(frame, start + 12, {dy: 16});
  if (wipe <= 0 || o <= 0) return null;
  const tx = align === 'left' ? 0 : align === 'center' ? -width / 2 : -width;
  return (
    <div style={{position: 'absolute', left: x + tx, top: y, width, textAlign: align, opacity: o}}>
      <div style={{display: 'inline-block', position: 'relative', clipPath: `inset(-20% ${100 - wipe * 100}% -20% 0)`}}>
        <div style={{...type.h1, fontSize: size, color: color.text, letterSpacing: size * -0.025, whiteSpace: 'nowrap'}}>{term}</div>
        <div style={{height: 7, width: `${wipe * 100}%`, background: accent, borderRadius: 4, marginTop: 6, marginLeft: align === 'right' ? 'auto' : align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0}} />
      </div>
      {def ? (
        <div style={{...type.body, color: color.textDim, marginTop: 18, opacity: defA.opacity, transform: `translateY(${defA.y}px)`}}>{def}</div>
      ) : null}
    </div>
  );
};

/** Floating text block. */
export const Text: React.FC<{start: number; out?: number; x: number; y: number; style?: React.CSSProperties; children: React.ReactNode; width?: number; align?: 'left' | 'center' | 'right'}> = ({
  start, out, x, y, style, children, width, align = 'left',
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  const tx = width ? (align === 'center' ? -width / 2 : align === 'right' ? -width : 0) : 0;
  return (
    <div style={{position: 'absolute', left: x + tx, top: y, width, textAlign: align, opacity: a.opacity, transform: `translateY(${a.y}px)`, ...type.body, color: color.text, ...style}}>
      {children}
    </div>
  );
};

/** Checklist that ticks items as their cue frames pass. */
export const Checklist: React.FC<{items: Array<{text: string; at: number}>; x: number; y: number; start: number; out?: number; width?: number; activeColor?: string}> = ({
  items, x, y, start, out, width = 620, activeColor = color.accent,
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  const current = items.reduce((acc, it, i) => (frame >= it.at ? i : acc), -1);
  return (
    <div style={{position: 'absolute', left: x, top: y, width, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
      {items.map((it, i) => {
        const on = frame >= it.at;
        const s = pop(frame, it.at);
        const isCurrent = i === current;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26, opacity: on ? (isCurrent ? 1 : 0.62) : 0.28}}>
            <div style={{width: 46, height: 46, borderRadius: 14, border: `3px solid ${on ? activeColor : color.textFaint}`, background: on ? activeColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: `scale(${on ? 0.8 + 0.2 * s : 1})`}}>
              {on ? (
                <svg width={28} height={28} viewBox="0 0 28 28">
                  <path d="M5 14.5 L11.5 21 L23 8" fill="none" stroke={color.bg0} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - s)} />
                </svg>
              ) : null}
            </div>
            <div style={{...type.label, fontSize: 36, color: color.text, lineHeight: 1.2}}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Rounded glass panel. */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; start: number; out?: number; children?: React.ReactNode; border?: string; style?: React.CSSProperties}> = ({
  x, y, w, h, start, out, children, border, style,
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out});
  if (a.opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: layout.radius, background: color.panel, border: `2px solid ${border ?? color.panelLine}`, boxShadow: '0 30px 80px rgba(0,0,0,0.35)', opacity: a.opacity, transform: `translateY(${a.y}px)`, overflow: 'hidden', ...style}}>
      {children}
    </div>
  );
};

/** Multiple-choice option card for clinical questions. */
export const QuizOption: React.FC<{letter: string; text: string; start: number; revealAt?: number; correct?: boolean; x: number; y: number; w?: number}> = ({
  letter, text, start, revealAt, correct, x, y, w = 560,
}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {dy: 20});
  if (a.opacity <= 0) return null;
  const revealed = revealAt !== undefined && frame >= revealAt;
  const r = revealAt !== undefined ? progress(frame, revealAt, 14) : 0;
  const tone = revealed ? (correct ? color.correct : color.textFaint) : color.panelLine;
  const s = correct && revealed ? 1 + 0.05 * Math.sin(Math.min(1, r) * Math.PI) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 96, display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', borderRadius: 20, boxSizing: 'border-box', background: revealed && correct ? 'rgba(61,220,151,0.16)' : color.panel, border: `3px solid ${tone}`, opacity: a.opacity * (revealed && !correct ? 0.42 : 1), transform: `translateY(${a.y}px) scale(${s})`}}>
      <div style={{width: 56, height: 56, borderRadius: 14, background: revealed && correct ? color.correct : 'rgba(255,255,255,0.08)', color: revealed && correct ? color.bg0 : color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.label, fontSize: 32, fontWeight: 800}}>
        {letter}
      </div>
      <div style={{...type.label, fontSize: 38, color: color.text}}>{text}</div>
      {revealed && correct ? (
        <svg width={44} height={44} viewBox="0 0 28 28" style={{marginLeft: 'auto'}}>
          <path d="M5 14.5 L11.5 21 L23 8" fill="none" stroke={color.correct} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - r)} />
        </svg>
      ) : null}
    </div>
  );
};

/** Circular countdown ring for "pause and think" moments. */
export const Countdown: React.FC<{start: number; end: number; x: number; y: number; size?: number}> = ({start, end, x, y, size = 120}) => {
  const frame = useCurrentFrame();
  if (frame < start - 6 || frame > end + 10) return null;
  const a = appear(frame, start - 6, {out: end, outDur: 10, dy: 0});
  const p = progress(frame, start, end - start, (t) => t);
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const secs = Math.max(0, Math.ceil(((end - frame) / 30)));
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: a.opacity}}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.accent} strokeWidth={8} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * p} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.h3, fontSize: size * 0.38, color: color.text}}>{secs}</div>
    </div>
  );
};

/** Full-frame SVG layer in stage coordinates. */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color: c = color.accent, style}) => (
  <div style={{...type.kicker, color: c, ...style}}>{children}</div>
);

export {font};
