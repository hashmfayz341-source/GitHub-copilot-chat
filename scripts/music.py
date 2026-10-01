#!/usr/bin/env python3
"""Procedural ambient music bed (royalty-free by construction).

Writes public/audio/music.wav: a 64-second seamlessly looping soft pad
(four slow chords, detuned sine/triangle voices, gentle swells, low-passed).
It is mixed at a low level under the narration by the Remotion composition.
"""
import os

import numpy as np
import soundfile as sf

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BAR = 16.0  # seconds per chord
CHORDS = [  # MIDI notes: Dmaj9, Bm7, Gmaj7, A6/9 — warm, unresolved, calm
    [50, 57, 62, 66, 69, 76],
    [47, 54, 62, 66, 69, 73],
    [43, 55, 59, 62, 66, 74],
    [45, 52, 57, 61, 64, 71],
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def voice(f, t, rng):
    det = [0.997, 1.0, 1.003]
    out = np.zeros_like(t)
    for d in det:
        ph = rng.uniform(0, 2 * np.pi)
        out += np.sin(2 * np.pi * f * d * t + ph)
        out += 0.18 * np.sin(2 * np.pi * 2 * f * d * t + ph)  # soft 2nd harmonic
    return out / len(det)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def main():
    rng = np.random.default_rng(7)
    n_bar = int(BAR * SR)
    total = n_bar * len(CHORDS)
    t_bar = np.arange(n_bar) / SR
    # long crossfading envelope (each chord swells in and out, overlapping neighbours)
    xf = int(4.0 * SR)
    out = np.zeros(total + xf)
    for i, chord in enumerate(CHORDS):
        seg_len = n_bar + xf
        t = np.arange(seg_len) / SR
        env = np.minimum(1, t / 4.0) * np.minimum(1, (seg_len / SR - t) / 4.0)
        env *= 0.85 + 0.15 * np.sin(2 * np.pi * t / 7.3)
        seg = np.zeros(seg_len)
        for j, m in enumerate(chord):
            seg += voice(hz(m), t, rng) * (0.9 if j == 0 else 0.55) * (0.8 + 0.2 * np.sin(2 * np.pi * t / (5 + j)))
        out[i * n_bar : i * n_bar + seg_len] += seg * env
    # wrap the tail onto the start for a seamless loop
    out[:xf] += out[total:]
    out = out[:total]
    out = lowpass(out, 1400.0)
    out = out / np.max(np.abs(out)) * 0.7
    stereo = np.stack([out, np.roll(out, int(0.011 * SR))], axis=1).astype(np.float32)
    path = os.path.join(ROOT, "public/audio/music.wav")
    sf.write(path, stereo, SR)
    print("wrote", path, f"{total / SR:.1f}s")
    del t_bar


if __name__ == "__main__":
    main()
