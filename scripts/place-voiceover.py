#!/usr/bin/env python3
"""Place each voice-over sentence on its beat and export exactly `duration` seconds.

    python3 scripts/place-voiceover.py            # uses scripts/voiceover-placement.json

Each sentence is cut from the raw TTS file with a small lead/tail margin (taken
from the surrounding silence), delayed to its beat, mixed, loudness-normalised
(-14 LUFS, -1 dBTP), padded/cut to the exact duration with a short fade-out.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "scripts/voiceover-placement.json").read_text())
src = ROOT / "assets" / cfg["source"]
out = ROOT / "assets" / cfg["output"]
segs = cfg["segments"]
LEAD, TAIL = 0.04, 0.06

# Safety: sentences must not overlap once placed.
for a, b in zip(segs, segs[1:]):
    end_a = a["at"] + (a["speech"][1] - a["speech"][0])
    if end_a + 0.02 > b["at"]:
        sys.exit(f"overlap: '{a['text']}' ends {end_a:.2f}s > '{b['text']}' starts {b['at']:.2f}s")
last = segs[-1]
if last["at"] + last["speech"][1] - last["speech"][0] > cfg["duration"]:
    sys.exit("last sentence runs past the end")

parts, labels = [], []
for i, s in enumerate(segs):
    a = max(0.0, s["speech"][0] - LEAD)
    b = s["speech"][1] + TAIL
    delay_ms = max(0, round((s["at"] - (s["speech"][0] - a)) * 1000))
    parts.append(
        f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,"
        f"afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.3f}:d=0.03,adelay={delay_ms}|{delay_ms}[s{i}]"
    )
    labels.append(f"[s{i}]")
d, fo = cfg["duration"], cfg["fadeOut"]
graph = ";".join(parts) + ";" + "".join(labels) + (
    f"amix=inputs={len(segs)}:normalize=0,"
    f"loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[out]"
)
tmp = out.with_suffix(".tmp.wav")
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-filter_complex", graph,
     "-map", "[out]", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", str(tmp)],
    check=True,
)
# Second pass: exact sample count (pad or cut) + fade-out.
n = round(d * 48000)
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp),
     "-af", f"apad=whole_len={n},atrim=end_sample={n},afade=t=out:st={d - fo:.3f}:d={fo}",
     "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", str(out)],
    check=True,
)
tmp.unlink()
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                     capture_output=True, text=True).stdout.strip()
print(f"✔ {out.relative_to(ROOT)}  {float(dur):.3f} s")
