/**
 * Audio utilities shared by every provider.
 *
 * This is where provider differences are erased. A take from ElevenLabs, from
 * OpenAI, or recorded by a person on a phone all leave here as the same thing:
 * one mono file, one container, one sample rate, one loudness. Everything
 * downstream then only has to know "an audio file and its duration".
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ffprobeDuration = (file) =>
  Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
      .toString()
      .trim(),
  );

export const probe = (file) => {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_name,sample_rate,channels',
    '-of', 'json', file,
  ]).toString();
  const j = JSON.parse(out);
  const s = (j.streams || []).find((x) => x.sample_rate) ?? {};
  return {
    duration: Number(j.format?.duration ?? 0),
    codec: s.codec_name ?? null,
    sampleRate: Number(s.sample_rate ?? 0),
    channels: Number(s.channels ?? 0),
  };
};

/** ffmpeg writes its analysis to stderr, not stdout. */
const ffmpegStderr = (args) => {
  const r = spawnSync('ffmpeg', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (r.error) throw r.error;
  return r.stderr ?? '';
};

/** Integrated loudness (EBU R128), in LUFS. */
export const measureLufs = (file) => {
  const out = ffmpegStderr(['-v', 'info', '-i', file, '-af', 'ebur128=framelog=verbose', '-f', 'null', '-']);
  const m = [...out.matchAll(/I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/g)];
  return m.length ? Number(m[m.length - 1][1]) : null;
};

/** True peak (dBTP) — catches the intersample peaks a sample-peak reading misses. */
export const measureTruePeak = (file) => {
  const out = ffmpegStderr(['-v', 'info', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const block = out.slice(out.lastIndexOf('Peak:'));
  const m = block.match(/Peak:\s*(-?\d+(?:\.\d+)?|-inf)/);
  return m ? (m[1] === '-inf' ? -Infinity : Number(m[1])) : null;
};

export const measure = (file) => ({
  duration: ffprobeDuration(file),
  lufs: measureLufs(file),
  truePeakDb: measureTruePeak(file),
});

/**
 * Write a delivery copy of a take with a fixed gain applied.
 *
 * Gain only — never a compressor, limiter or per-line loudness normaliser.
 * Normalising every line to the same number would erase the performance: an
 * emphatic line is *supposed* to sit above a muttered one, and in this episode
 * the characters are supposed to sit at different levels from each other.
 * Balancing therefore happens per character, over a whole character's lines at
 * once, not per line — see balance.mjs.
 */
export const render = (src, dest, fmt, gainDb = 0) => {
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  const args = ['-y', '-v', 'error', '-i', src];
  if (gainDb !== 0) args.push('-af', `volume=${gainDb}dB`);
  args.push('-ac', String(fmt.channels ?? 1), '-ar', String(fmt.sampleRate ?? 44100));
  if ((fmt.container ?? 'mp3') === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', `${fmt.bitrateKbps ?? 192}k`);
  else if (fmt.container === 'wav') args.push('-c:a', 'pcm_s24le');
  args.push(dest);
  execFileSync('ffmpeg', args, {stdio: ['ignore', 'ignore', 'pipe']});
  return {gainDb, ...measure(dest)};
};

/** Back-compat for the manual-ingest path: one take, one gain to a target. */
export const finalize = (src, dest, fmt, targetLufs = -18) => {
  const lufs = measureLufs(src);
  const gainDb = lufs === null ? 0 : Number((targetLufs - lufs).toFixed(2));
  const r = render(src, dest, fmt, gainDb);
  return {gainDb, sourceLufs: lufs, finalLufs: r.lufs, duration: r.duration};
};

/** Reject a take that is empty, clipped throughout, or obviously truncated. */
export const sanity = (file) => {
  const p = probe(file);
  const issues = [];
  if (!(p.duration > 0.25)) issues.push(`duration ${p.duration}s is too short to be a line`);
  const out = ffmpegStderr(['-v', 'info', '-i', file, '-af', 'astats=measure_overall=Peak_level', '-f', 'null', '-']);
  const peak = [...out.matchAll(/Peak level dB:\s*(-?\d+(?:\.\d+)?|-inf)/g)].map((m) => m[1]).pop();
  if (peak === '-inf') issues.push('track is silent');
  return {ok: issues.length === 0, issues, ...p, peakDb: peak};
};
