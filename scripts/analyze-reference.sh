#!/usr/bin/env bash
# Download the reference Reel and extract frames + cut timestamps for analysis.
#   npm run reference                         # https://whatships.com/videos/havyn/
#   bash scripts/analyze-reference.sh <page-or-mp4-url>
# Output: reference/ (video, 2 fps frames, contact sheets, scene cuts)
set -euo pipefail
URL="${1:-https://whatships.com/videos/havyn/}"
OUT=reference
mkdir -p "$OUT/frames"

if [[ "$URL" =~ \.(mp4|webm|mov|m3u8)(\?|$) ]]; then
  VIDEO_URL="$URL"
else
  curl -fsSL "$URL" -o "$OUT/page.html"
  VIDEO_URL=$(grep -oE 'https?://[^"'"'"' )]+\.(mp4|webm|m3u8)[^"'"'"' )]*' "$OUT/page.html" | head -1 || true)
  if [[ -z "$VIDEO_URL" ]]; then
    echo "No direct video URL in the page; trying yt-dlp…"
    python3 -m pip install -q --user yt-dlp
    python3 -m yt_dlp -o "$OUT/reference.%(ext)s" -f "bv*+ba/b" --merge-output-format mp4 "$URL"
  fi
fi
[[ -n "${VIDEO_URL:-}" ]] && ffmpeg -loglevel error -y -i "$VIDEO_URL" -c copy "$OUT/reference.mp4"

V="$OUT/reference.mp4"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of default=nw=1 "$V" | tee "$OUT/info.txt"

# 2 frames per second, numbered by time.
ffmpeg -loglevel error -y -i "$V" -vf "fps=2,scale=360:-1" "$OUT/frames/f_%04d.png"

# Hard cuts (scene score > 0.3) with timestamps.
ffmpeg -hide_banner -i "$V" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 \
  | grep -oE 'pts_time:[0-9.]+' | cut -d: -f2 > "$OUT/cuts.txt" || true
echo "cuts (s):"; cat "$OUT/cuts.txt"

# Contact sheets: 6 x 3 thumbnails = 9 s per sheet at 2 fps.
ffmpeg -loglevel error -y -i "$V" -vf "fps=2,scale=240:-1,tile=6x3:padding=6:color=white" "$OUT/sheet_%02d.png"
echo "✔ $OUT/ ready (frames/, sheet_*.png, cuts.txt, info.txt)"
