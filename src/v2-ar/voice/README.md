# V2 Arabic voice — provider-neutral pipeline

No TTS vendor is a dependency of this project. The animation depends on final
audio files and their measured durations, and on nothing else:

```
FINAL AUDIO  →  ffprobe duration  →  timing-ar.json  →  useLinesAR()  →  animation
```

If every TTS provider is unreachable, a person records the lines and the
animation architecture does not change by one line.

## The three data files

| file | what it is | vendor-specific? |
|---|---|---|
| `lines-ar.json` | the script: who says what, in what order, with which scripted pause | no |
| `cast-ar.json` | how each character's voice is sourced, per provider | yes, and it is the only place that is |
| `takes-ar.json` | which audio file is approved for each line, plus provenance | provenance only |

`scripts/build-timing-ar.mjs` reads `lines-ar.json`, `takes-ar.json` and the
audio files. It does **not** read `provenance`, and it imports no provider
module. A line voiced by ElevenLabs, by OpenAI, or by a person produces
identical timing output.

## Providers

Each provider is one file in `scripts/voice/providers/` exporting
`{ id, label, synthesizes, available, synthesize }`. Adding one is that file
plus a line in `providers/index.mjs`. Nothing in `src/` changes.

| provider | credentials | notes |
|---|---|---|
| `elevenlabs` | `ELEVENLABS_API_KEY` | the chat MCP connector is not scriptable, so without a key this reports unavailable and the runner moves on |
| `openai` | `OPENAI_API_KEY` | `gpt-4o-mini-tts`; the neutral direction becomes its `instructions` field |
| `manual` | none | always available — picks up human recordings from `voice-drop/` |

```bash
npm run voice:providers     # what is reachable right now
npm run voice:status        # what is done, what is awaiting QA, what is missing
```

The runner picks the first available provider in `cast-ar.json`'s
`providerPriority`. `manual` is always available, so there is no state in which
production is hard-blocked on a vendor.

## Recording lines by hand

1. Record one line per file, named after its line id: `L042.wav`. Later takes
   win, so `L042-take3.wav` supersedes `L042.wav`.
2. Drop them in `voice-drop/` (git-ignored — a hand-off area, not repo content).
3. `node scripts/voice/produce.mjs --scene 2 --provider manual`
4. `node scripts/build-timing-ar.mjs`

Any container ffmpeg reads is accepted (wav, mp3, m4a, flac, ogg, aac) at any
sample rate. The ingest normalises every take to the project's delivery format
and to −18 LUFS with **pure gain** — never a compressor or limiter, because
matching loudness must not change how a line was performed, and a human
recording would be audibly flattened by dynamics processing that a TTS take
barely shows. That normalisation is what makes a human take and a synthesized
take sit together in one scene without one jumping out.

`cast-ar.json` carries direction for the performer in each character's `manual`
binding — that is what the `generationInstructions` field is for when no machine
is doing the generating.

## Generating with a TTS provider

```bash
export OPENAI_API_KEY=...
node scripts/voice/produce.mjs --scene 2                  # best available provider
node scripts/voice/produce.mjs --all --provider openai    # force one
node scripts/voice/produce.mjs --line L042 --redo         # replace a take deliberately
```

## Approval

A take is `RENDERED` when it exists and `FINAL` when it has been checked.
`build-timing-ar.mjs` only ever uses `FINAL`, so an unchecked take cannot reach
the film. The runner never regenerates a line that already has a `RENDERED`
take — that is a QA job, not a generation job, and regenerating would spend a
provider call and throw away usable audio.

```bash
node scripts/voice/produce.mjs --approve L009 L010
```

Approved audio is never regenerated to make implementation easier.

## Mixing providers

This is supported and expected. A scene may hold an ElevenLabs line, an OpenAI
line and a human recording; `timing-ar.json` cannot tell them apart. Keeping one
character on one source is a *performance* decision, not a technical constraint —
`cast-ar.json` records which source each character is currently bound to so that
decision stays visible.
