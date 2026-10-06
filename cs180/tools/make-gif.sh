#!/usr/bin/env bash
# Build the dolly-zoom GIF from a folder of numbered stills.
#
#   tools/make-gif.sh <frames-dir> [output.gif] [fps]
#
# Frames are used in filename order, so name them frame-01.jpg, frame-02.jpg, ...
# Requires ffmpeg (brew install ffmpeg).

set -euo pipefail

DIR="${1:-proj0/images/part3}"
OUT="${2:-proj0/images/part3/dollyzoom.gif}"
FPS="${3:-6}"
WIDTH="${WIDTH:-800}"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found — brew install ffmpeg"; exit 1; }

shopt -s nullglob nocaseglob
frames=("$DIR"/frame-*.jpg "$DIR"/frame-*.jpeg "$DIR"/frame-*.png)
(( ${#frames[@]} )) || { echo "No frame-*.jpg files in $DIR"; exit 1; }
echo "Found ${#frames[@]} frames in $DIR"

list="$(mktemp)"
trap 'rm -f "$list" "$list.pal.png"' EXIT
for f in "${frames[@]}"; do
  printf "file '%s'\nduration %s\n" "$(cd "$(dirname "$f")" && pwd)/$(basename "$f")" "$(echo "scale=4; 1/$FPS" | bc)" >> "$list"
done
# ffmpeg's concat demuxer ignores the last duration unless the file repeats
printf "file '%s'\n" "$(cd "$(dirname "${frames[$((${#frames[@]}-1))]}")" && pwd)/$(basename "${frames[$((${#frames[@]}-1))]}")" >> "$list"

# Two passes: build an optimal palette, then apply it. Much cleaner than a naive GIF.
ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" \
  -vf "scale=${WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" "$list.pal.png"

ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" -i "$list.pal.png" \
  -lavfi "scale=${WIDTH}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 "$OUT"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"
