import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {colorAR} from '../design/theme-ar';
import type {LinesAR} from '../timing/beats-ar';
import {SubtitleAR} from './SubtitleAR';

/** Warm stage for the Arabic edition — a room the characters stand in. */
export const StageAR: React.FC<{tint?: string}> = ({tint}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 18%, ${colorAR.bg2} 0%, ${colorAR.bg1} 42%, ${colorAR.bg0} 100%)`}} />
    {tint ? <AbsoluteFill style={{background: tint, opacity: 0.14, mixBlendMode: 'soft-light'}} /> : null}
    {/* floor line grounds the characters */}
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="ar-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorAR.bg2} stopOpacity={0.0} />
            <stop offset="100%" stopColor="#060B10" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <rect y={862} width={1920} height={218} fill="url(#ar-floor)" />
        <line x1={0} y1={862} x2={1920} y2={862} stroke={colorAR.panelLine} strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * Every V2 scene: stage, children, each dialogue line's real audio placed at its
 * own measured start frame, and the RTL subtitle band.
 *
 * The audio is mounted per line (not one pre-mixed scene file) so the
 * composition timeline and the voice track are the same source of truth.
 */
export const SceneShellAR: React.FC<{
  lines: LinesAR;
  tint?: string;
  subtitles?: boolean;
  children: React.ReactNode;
}> = ({lines, tint, subtitles = true, children}) => (
  <AbsoluteFill>
    <StageAR tint={tint} />
    {children}
    {lines.lines.map((l) =>
      l.audioFile && l.startFrame !== undefined ? (
        <Sequence key={l.lineId} from={l.startFrame} durationInFrames={Math.max(1, (l.endFrame ?? 0) - l.startFrame + 2)}>
          <Audio src={staticFile(l.audioFile)} />
        </Sequence>
      ) : null,
    )}
    {subtitles ? <SubtitleAR lines={lines} /> : null}
  </AbsoluteFill>
);
