#!/usr/bin/env bash
# Resilient render: video in fixed-size frame chunks (resumable — finished chunks are skipped),
# audio rendered once for the whole timeline, then lossless concat + mux with FFmpeg.
#   bash scripts/render-chunks.sh [chunkFrames]
set -euo pipefail
cd "$(dirname "$0")/.."
CHUNK=${1:-1500}
OUT=output/introduction-to-anatomy.mp4
DIR=output/chunks
mkdir -p "$DIR"

TOTAL=$(npx remotion compositions src/index.ts --quiet 2>/dev/null | awk '$1=="AnatomyLecture"{print $4}')
[ -n "$TOTAL" ] || { echo "could not read composition length"; exit 1; }
echo "total frames: $TOTAL, chunk: $CHUNK"

: > "$DIR/list.txt"
for ((s=0; s<TOTAL; s+=CHUNK)); do
  e=$((s+CHUNK-1)); ((e>=TOTAL)) && e=$((TOTAL-1))
  f=$(printf "%s/chunk_%05d.mp4" "$DIR" "$s")
  echo "file '$(basename "$f")'" >> "$DIR/list.txt"
  if [ -s "$f" ] && ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f" | grep -qx "$((e-s+1))"; then
    echo "chunk $s-$e ok (skipped)"; continue
  fi
  echo "rendering chunk $s-$e"
  npx remotion render src/index.ts AnatomyLecture "$f.tmp.mp4" --frames="$s-$e" --muted --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done

if [ ! -s "$DIR/audio.wav" ]; then
  npx remotion render src/index.ts AnatomyLecture "$DIR/audio.wav" --codec=wav --log=error
fi

ffmpeg -y -v error -f concat -safe 0 -i "$DIR/list.txt" -i "$DIR/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "done: $OUT"
