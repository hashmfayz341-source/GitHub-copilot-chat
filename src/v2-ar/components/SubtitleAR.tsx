import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colorAR, layoutAR, SPEAKERS, typeAR, type SpeakerId} from '../design/theme-ar';
import type {LinesAR} from '../timing/beats-ar';

/**
 * Arabic subtitles, RTL, driven by the real per-line audio timing.
 *
 * - `dir="rtl"` + `unicodeBidi: plaintext` so an English medical term inside an
 *   Arabic sentence keeps Latin order while the sentence stays right-to-left.
 * - Lives in a reserved band at the bottom so it never covers the anatomy.
 * - Two lines maximum; longer lines are split on a word boundary near the middle.
 */

const splitTwo = (text: string): string[] => {
  if (text.length <= 46) return [text];
  const words = text.split(' ');
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    const diff = Math.abs(a - b) + Math.max(0, Math.max(a, b) - 52) * 4;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
};

export const SubtitleAR: React.FC<{lines: LinesAR; showSpeaker?: boolean}> = ({lines, showSpeaker = true}) => {
  const frame = useCurrentFrame();
  const active = lines.lines.find(
    (l) => l.startFrame !== undefined && frame >= l.startFrame - 3 && frame <= (l.endFrame ?? 0) + 8,
  );
  if (!active || active.startFrame === undefined) return null;

  const sp = SPEAKERS[active.speaker as SpeakerId];
  const inAt = active.startFrame - 3;
  const outAt = (active.endFrame ?? 0) + 8;
  const opacity = interpolate(frame, [inAt, inAt + 5, outAt - 6, outAt], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [inAt, inAt + 7], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rows = splitTwo(active.text);

  return (
    <div
      style={{
        position: 'absolute',
        left: layoutAR.safeX,
        right: layoutAR.safeX,
        top: layoutAR.subtitleBandTop,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      {showSpeaker ? (
        <div
          style={{
            ...typeAR.speaker,
            color: sp.accent,
            background: 'rgba(10,16,22,0.72)',
            border: `1px solid ${sp.accent}44`,
            padding: '4px 16px',
            borderRadius: 999,
          }}
          dir="rtl"
        >
          {sp.ar}
        </div>
      ) : null}
      <div
        dir="rtl"
        style={{
          ...typeAR.subtitle,
          color: colorAR.text,
          textAlign: 'center',
          background: 'rgba(8,13,18,0.80)',
          borderInlineEnd: `6px solid ${sp.accent}`,
          padding: '12px 28px',
          borderRadius: layoutAR.radius,
          unicodeBidi: 'plaintext',
          maxWidth: 1440,
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {rows.map((r, i) => (
          <div key={i} style={{unicodeBidi: 'plaintext'}}>{r}</div>
        ))}
      </div>
    </div>
  );
};
