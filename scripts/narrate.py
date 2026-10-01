#!/usr/bin/env python3
"""Narration pipeline.

Reads src/video/narration.json, synthesizes every beat with the Kokoro neural TTS
(offline, ONNX), assembles one WAV per scene (lead-in + beats + gaps + tail) and writes:

  public/audio/<sceneId>.wav     narration audio placed by Remotion
  src/video/timing.json          per-scene duration and per-beat start/end (seconds)
  output/introduction-to-anatomy.srt   captions for the whole video
  docs/NARRATION.md              human-readable narration script

Animations in Remotion key off timing.json, so visuals always land on the spoken word.
Beats are cached by (voice, speed, text) so re-runs only synthesize changed lines.

Model files: set KOKORO_DIR (default /home/user/tts) containing kokoro-v1.0.onnx and
voices-v1.0.bin from https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0).
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
FPS = 30
# Must match the transition overlap used in src/video/AnatomyLecture.tsx (frames).
TRANSITION_FRAMES = 20
# Silent chapter-transition scenes inserted before these chapters (must match sceneRegistry).
CHAPTER_CARD_FRAMES = 75


def load_kokoro():
    from kokoro_onnx import Kokoro

    d = os.environ.get("KOKORO_DIR", "/home/user/tts")
    return Kokoro(os.path.join(d, "kokoro-v1.0.onnx"), os.path.join(d, "voices-v1.0.bin"))


def synth(kokoro, text, voice, speed, cache_dir):
    key = hashlib.sha1(f"{voice}|{speed}|{text}".encode()).hexdigest()[:16]
    path = os.path.join(cache_dir, key + ".wav")
    if os.path.exists(path):
        audio, _ = sf.read(path, dtype="float32")
        return audio
    samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
    assert sr == SR
    audio = trim_silence(np.asarray(samples, dtype="float32"))
    sf.write(path, audio, SR)
    return audio


def trim_silence(a, thresh=0.004):
    idx = np.where(np.abs(a) > thresh)[0]
    if len(idx) == 0:
        return a
    start = max(0, idx[0] - int(0.02 * SR))
    end = min(len(a), idx[-1] + int(0.06 * SR))
    return a[start:end]


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    with open(os.path.join(ROOT, "src/video/narration.json")) as f:
        script = json.load(f)
    voice, speed = script["voice"], script["speed"]
    gap, lead, tail = script["beatGap"], script["sceneLead"], script["sceneTail"]

    cache_dir = os.path.join(ROOT, ".tts-cache")
    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
    kokoro = load_kokoro()

    timing = {"fps": FPS, "scenes": {}}
    srt_entries = []
    md = ["# Narration Script — Introduction to Anatomy\n",
          "_Generated from `src/video/narration.json` by `scripts/narrate.py`. Times are scene-relative._\n"]
    global_t = 0.0
    prev_chapter = None

    for scene in script["scenes"]:
        if prev_chapter is not None and scene["chapter"] != prev_chapter and scene["chapter"] not in (0,):
            global_t += CHAPTER_CARD_FRAMES / FPS - TRANSITION_FRAMES / FPS
        prev_chapter = scene["chapter"]

        parts = [np.zeros(int(lead * SR), dtype="float32")]
        t = lead
        beats = {}
        md.append(f"\n## {scene['id']}\n")
        for i, beat in enumerate(scene["beats"]):
            audio = synth(kokoro, beat["text"], beat.get("voice", voice), beat.get("speed", speed), cache_dir)
            dur = len(audio) / SR
            beats[beat["id"]] = {"start": round(t, 3), "end": round(t + dur, 3)}
            srt_entries.append((global_t + t, global_t + t + dur, beat["text"]))
            md.append(f"- **[{t:6.2f}s] `{beat['id']}`** — {beat['text']}")
            parts.append(audio)
            t += dur
            pause = beat.get("pauseAfter", 0.0) + (gap if i < len(scene["beats"]) - 1 else 0.0)
            parts.append(np.zeros(int(pause * SR), dtype="float32"))
            t += pause
            print(f"  {scene['id']}.{beat['id']}: {dur:.2f}s", file=sys.stderr)
        parts.append(np.zeros(int(tail * SR), dtype="float32"))
        t += tail
        wav = np.concatenate(parts)
        peak = np.max(np.abs(wav)) or 1.0
        wav = (wav / peak * 0.89).astype("float32")
        sf.write(os.path.join(ROOT, f"public/audio/{scene['id']}.wav"), wav, SR)
        duration = len(wav) / SR
        timing["scenes"][scene["id"]] = {"duration": round(duration, 3), "beats": beats}
        global_t += duration - TRANSITION_FRAMES / FPS

    with open(os.path.join(ROOT, "src/video/timing.json"), "w") as f:
        json.dump(timing, f, indent=1)

    os.makedirs(os.path.join(ROOT, "output"), exist_ok=True)
    with open(os.path.join(ROOT, "output/introduction-to-anatomy.srt"), "w") as f:
        for n, (a, b, text) in enumerate(srt_entries, 1):
            f.write(f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n\n")
    with open(os.path.join(ROOT, "docs/NARRATION.md"), "w") as f:
        f.write("\n".join(md) + "\n")

    total = sum(s["duration"] for s in timing["scenes"].values())
    print(f"Total narration track: {total/60:.2f} min across {len(timing['scenes'])} scenes")


if __name__ == "__main__":
    main()
