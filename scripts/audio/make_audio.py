#!/usr/bin/env python3
"""Original music + sound design for the Kuwej Reel, generated in code and synced
frame-by-frame to the edit (src/timing.ts, scenes) and the voice-over.

    pip install numpy scipy
    python3 scripts/audio/make_audio.py

Writes (48 kHz stereo):
  assets/audio/music.wav   original track, ducked under the voice
  assets/audio/sfx.wav     sound effects on the animations
  assets/audio/master.wav  voice + music + sfx, -14 LUFS / -1 dBTP, exactly 29.9 s
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from synth import *  # noqa: E402,F401,F403

# ---------------------------------------------------------------- music
CHORDS = [
    (["D3", "F3", "A3", "C4", "E4"], "D2"),  # Dm9
    (["Bb2", "D3", "F3", "A3", "C4"], "Bb1"),  # Bbmaj9
    (["F3", "A3", "C4", "E4", "G4"], "F2"),  # Fmaj9
    (["C3", "E3", "G3", "A3", "D4"], "C2"),  # C6/9
]
ARP = [["D5", "A5", "F5", "C6", "E5", "A5", "F5", "C6"],
       ["Bb4", "F5", "D5", "A5", "C5", "F5", "D5", "A5"],
       ["F5", "C6", "A5", "E6", "G5", "C6", "A5", "E6"],
       ["C5", "G5", "E5", "A5", "D5", "G5", "E5", "A5"]]
BAR = 1.6  # 150 bpm, 4/4 → category beats are exactly one bar
BEAT = BAR / 4

drums, bass, pads, arps = bus(), bus(), bus(), bus()


def bar_groove(t0, k, level, full):
    chord, root = CHORDS[k % 4]
    place(drums, kick(), t0, 0.95 * level)
    place(drums, kick(0.8), t0 + BEAT * 1.5, 0.85 * level)
    if full:
        place(drums, kick(0.6), t0 + BEAT * 3.5, 0.6 * level)
    place(drums, clap(), t0 + BEAT * 2, 0.9 * level, pan=0.05)
    steps = 16 if full else 8
    for s in range(steps):
        tt0 = t0 + s * BAR / steps
        v = (0.55 if s % 2 == 0 else 0.3) * level
        place(drums, hat(v, open_=(full and s % 8 == 6)), tt0, 1.0, pan=0.25)
    for at, d in [(0, BEAT * 1.4), (BEAT * 1.5, BEAT * 2.4)]:
        place(bass, sub(hz(root), d), t0 + at, 0.9 * level)
    place(pads, pad([hz(n) for n in chord], BAR + 0.5, bright=0.6 if full else 0.35), t0, 0.9 * level)
    if full:
        for s, n in enumerate(ARP[k % 4]):
            place(arps, bell(hz(n), 0.6, 0.55 if s % 2 == 0 else 0.35), t0 + s * BAR / 8, level, pan=(-0.35 if s % 2 else 0.35))


# Intro 0 – 1.7 s: filtered Dm9 swell, low hit on « ENVIE »
place(pads, pad([hz(n) for n in CHORDS[0][0]], 1.9, bright=0.15), 0.0, 1.0)
place(bass, sub(hz("D2"), 0.5), F(2), 0.7)

# Section A 1.7 – 9.7 s (5 bars): half-time groove under the brand / statement / journey
G0 = 0.1  # grid offset: category beats start at 9.7 s = G0 + 6 bars
for k in range(1, 6):
    bar_groove(G0 + k * BAR, k - 1, 0.75, full=False)
for s in range(8):  # snare roll into the categories drop
    place(drums, clap(0.25 + s * 0.09), G0 + 5 * BAR + 2 * BEAT + s * BEAT / 4, 0.8)

# Section B 9.7 – 24.1 s (9 bars): full groove, one bar per category
for k in range(6, 15):
    bar_groove(G0 + k * BAR, k - 6, 1.0, full=True)

# Break 24.1 – 24.6 s, then end section on its own grid from 24.6 s
place(pads, pad([hz(n) for n in CHORDS[3][0]], 0.7, bright=0.2), 24.1, 0.7)
E0 = 24.6
for k in range(2):
    bar_groove(E0 + k * BAR, k, 1.0, full=True)
place(drums, kick(0.7), E0 + 2 * BAR, 0.6)  # pickup, then stop before the slogan
# Final hit on the slogan (28.1 s): Dm9 + low D + bells, ringing out
FINAL = F(843)
place(pads, pad([hz(n) for n in ["D3", "A3", "C4", "E4", "F4", "A4"]], DUR - FINAL, bright=0.7), FINAL, 1.1)
place(bass, sub(hz("D2"), 1.6), FINAL, 0.9)
for k, n in enumerate(["D5", "A5", "E6", "F6"]):
    place(arps, bell(hz(n), 1.8, 0.5), FINAL + k * 0.1, 1.0, pan=(-0.3 + 0.2 * k))

# Filter build over the journey (6.8 – 9.7 s) on pads + riser into the drop
pads = sweep(pads, lambda s: 2600 if s < 6.8 else (900 + 6000 * min(1, (s - 6.8) / 2.9)) if s < 9.7 else 9000, "low", blk=512)

music = drums * 0.9 + bass * 0.85 + pads * 0.7 + arps * 0.45
music += reverb(drums * 0.12 + arps * 0.45 + pads * 0.15, 0.6)

# ---------------------------------------------------------------- sfx timeline
sfx = bus()
S = lambda sig, frame, g=1.0, pan=0.0: place(sfx, sig, F(frame), g, pan)

# Hook
S(whoosh(0.55, 250, 3500, 0.7), 0)
for i, d in enumerate([0, 3, 6, 2, 8, 5]):
    S(pop(900 + 120 * i, 300 + 30 * i, 0.8), d + 11, 1.0, pan=[-0.6, 0.6, -0.5, 0.6, 0.0, 0.2][i])
S(hit(0.9), 2)
S(whoosh(0.3, 600, 6000, 0.8), 12, pan=0.3)
S(hit(0.6), 17)
S(whoosh(0.55, 300, 6000, 0.9, rev=True), 30)  # implode / suck-in
S(riser(1.2, 0.5), 12)
# Brand
S(impact(1.0), 50)
S(chime(0.35), 52)
S(whoosh(0.5, 800, 7000, 0.7), 54, pan=-0.5)
S(whoosh(0.5, 800, 7000, 0.6), 58, pan=0.5)
S(whoosh(0.3, 500, 4000, 0.5), 125)
# Statement
for fr in (137, 144):
    S(whoosh(0.28, 500, 5000, 0.6), fr, pan=-0.3)
S(hit(1.0), 151)
S(whoosh(0.35, 700, 6000, 0.6), 194)
# Journey
S(whoosh(0.7, 150, 2500, 0.9), 204)
S(whoosh(0.3, 500, 5000, 0.5), 206)
S(hit(0.8), 236)
S(tap(1.0), 218)
S(whoosh(0.4, 400, 3000, 0.6), 224)
S(whoosh(0.35, 3000, 400, 0.5), 248)
S(whoosh(0.25, 900, 6000, 0.5), 258, pan=0.4)
S(tap(1.0), 278)
S(riser(1.1, 0.55), 258)
# Categories: phone move + title whip, tap, cards lift, price dings
bounds = [0, 48, 96, 144, 192, 240, 288, 363]
counts = [2, 2, 1, 2, 1, 1, 2]
notes = ["A5", "C6", "D6", "E6", "F6", "A6", "D6"]
for i, n in enumerate(counts):
    s0 = 291 + bounds[i]
    seg = bounds[i + 1] - bounds[i]
    fast = seg < 60
    S(whoosh(0.32, 350, 5500, 0.75), s0, pan=(-0.4 if i % 2 else 0.4))
    S(tap(0.8), s0 + 1)
    starts = ([4, 9] if fast else [8, 15]) if n == 2 else [5 if fast else 10]
    for j, st in enumerate(starts):
        S(whoosh(0.25, 600, 4000, 0.45), s0 + st, pan=(0.4 if i % 2 == 0 else -0.4))
        S(ding(notes[i], 0.7 - 0.15 * j), s0 + st + 9, pan=(0.3 if i % 2 == 0 else -0.3))
# Offer
S(whoosh(0.4, 300, 4500, 0.7), 654)
S(hit(0.9), 664)
S(tap(1.0), 668)
S(whoosh(0.4, 400, 3500, 0.6), 674)
S(ding("A6", 0.6), 684)
S(whoosh(0.5, 4000, 300, 0.6), 724)
S(riser(0.5, 0.6), 723)
# End card
S(impact(1.0), 738)
S(whoosh(0.6, 150, 2000, 0.6), 744)
S(whoosh(0.3, 600, 5000, 0.5), 746)
S(hit(0.8), 752)
S(pop(800, 400, 0.7), 786)
S(pop(1000, 500, 0.6), 798)
S(tap(1.2), 818)
S(chime(0.7), 841)
S(whoosh(0.4, 2000, 8000, 0.25), 850)

sfx += reverb(sfx * 0.25, 0.5)

finish(music, sfx)
