#!/usr/bin/env python3
"""Version B (« Éditorial / Afro ») audio: original Afro / Congolese sebene-inspired
track + sound design synced to src/editorial/*, mixed with the Fish Audio voice-over.

    pip install -r scripts/audio/requirements.txt
    python3 scripts/audio/make_audio_afro.py

Writes assets/audio/music-afro.wav, sfx-afro.wav, master-afro.wav (-14 LUFS, 29.9 s).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from synth import *  # noqa: E402,F401,F403

# ---------------------------------------------------------------- afro instruments
UP = 4  # Karplus-Strong runs at 4x the sample rate for accurate tuning


def guitar(f, d=0.6, vel=1.0, damp=0.996, bright=0.65):
    """Plucked nylon/steel-ish string (Karplus-Strong), bright 'sebene' tone."""
    sr = SR * UP
    n = int(d * sr)
    P = max(2, int(round(sr / f - 0.5)))  # the 2-tap average adds half a sample of delay
    out = np.zeros(n + P + 1)
    burst = rng.uniform(-1, 1, P + 1)
    burst = filt(burst, "low", 2500 + 14000 * bright) if P + 1 > 12 else burst
    out[: P + 1] = burst
    for start in range(P + 1, n, P):
        end = min(start + P, n)
        seg = damp * 0.5 * (out[start - P : start] + out[start - P - 1 : start - 1])
        out[start:end] = seg[: end - start]
    y = sg.resample_poly(out[:n], 1, UP)
    y = filt(y, "high", 140)
    y += filt(y, "band", [1800, 4200]) * 0.6  # pick 'twang'
    e = np.ones(len(y))
    e[-int(0.03 * SR):] = np.linspace(1, 0, int(0.03 * SR))
    return y * e * vel * 0.9


def conga(f=330, vel=1.0, slap=False):
    t = tt(0.35)
    fr = f * (1 + 0.5 * np.exp(-t * 40))
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * (22 if slap else 11))
    hitn = filt(rng.standard_normal(len(t)) * np.exp(-t * (180 if slap else 260)), "band", [700, 5000]) * (0.9 if slap else 0.35)
    return np.tanh((body + hitn) * 1.2) * vel * 0.5


def shaker(vel=1.0):
    t = tt(0.09)
    e = np.minimum(t / 0.012, 1) * np.exp(-t * 45)
    return filt(rng.standard_normal(len(t)) * e, "band", [4500, 11000]) * vel * 0.25


def rim(vel=1.0):
    t = tt(0.08)
    x = np.sin(2 * np.pi * 1750 * t) * np.exp(-t * 90) * 0.6 + filt(rng.standard_normal(len(t)) * np.exp(-t * 160), "band", [2000, 6000]) * 0.5
    return x * vel * 0.5


def cowbell(vel=1.0):
    t = tt(0.25)
    x = (sg.square(2 * np.pi * 587 * t) + sg.square(2 * np.pi * 845 * t)) * np.exp(-t * 16)
    return filt(x, "band", [500, 3500]) * vel * 0.08


def crash(vel=1.0):
    t = tt(2.0)
    return filt(rng.standard_normal(len(t)) * np.exp(-t * 2.4), "high", 5000) * vel * 0.25


def bass(f, d, vel=1.0):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)
    e = np.minimum(t / 0.006, 1) * np.exp(-t * 2.2)
    e[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return np.tanh(1.4 * x) * e * vel * 0.75


# ---------------------------------------------------------------- arrangement (A major, I–IV–V–IV)
CH = [
    {"root": "A1", "tones": ["A", "C#", "E"]},
    {"root": "D2", "tones": ["D", "F#", "A"]},
    {"root": "E2", "tones": ["E", "G#", "B"]},
    {"root": "D2", "tones": ["D", "F#", "A"]},
]
BAR, STEP = 1.6, 0.1  # 150 bpm, 16th = 0.1 s
LEAD_PAT = [0, 2, 1, 2, 0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2]
LEAD_ACC = {0: 1.0, 3: 0.9, 6: 0.95, 10: 0.9, 12: 0.95}
BASS_PAT = [(0, "R", 0.25), (3, "R", 0.2), (6, "5", 0.2), (8, "R", 0.25), (11, "8", 0.2), (14, "5", 0.15)]
CONGA_PAT = [(3, 330, True), (6, 220, False), (7, 220, False), (11, 330, True), (14, 330, False), (15, 220, False)]

drums, perc, low, gtr, pads = bus(), bus(), bus(), bus(), bus()


def note(name, octave):
    return hz(f"{name}{octave}")


def lead_tones(k):
    t = CH[k % 4]["tones"]
    return [note(t[0], 5), note(t[1], 5), note(t[2], 5), note(t[0], 6)]


def bar_afro(t0, k, level=1.0, lead=1.0, kit=True, second=True):
    c = CH[k % 4]
    r = hz(c["root"])
    if kit:
        for s in (0, 8):
            place(drums, kick(0.85), t0 + s * STEP, 0.8 * level)
        place(drums, kick(0.5), t0 + 14 * STEP, 0.45 * level)
        for s in (4, 12):
            place(drums, rim(), t0 + s * STEP, 0.9 * level, pan=0.1)
            place(drums, clap(0.5), t0 + s * STEP, 0.35 * level)
        for s in range(16):
            place(perc, hat(0.45 if s % 4 == 2 else 0.22, open_=(s % 8 == 6)), t0 + s * STEP, level, pan=0.3)
        for s in (2, 6, 10, 14):
            place(perc, cowbell(), t0 + s * STEP, level, pan=-0.35)
    for s in range(16):
        place(perc, shaker(0.9 if s % 2 == 0 else 0.55), t0 + s * STEP + 0.006 * (s % 2), level, pan=-0.2)
    for s, f0, slap in CONGA_PAT:
        place(perc, conga(f0, 0.9, slap), t0 + s * STEP, level, pan=(0.45 if f0 > 300 else -0.45))
    for s, deg, d in BASS_PAT:
        f = {"R": r, "5": r * 1.5, "8": r * 2}[deg]
        place(low, bass(f, d + 0.1), t0 + s * STEP, level)
    if lead > 0:
        tones = lead_tones(k)
        for s, idx in enumerate(LEAD_PAT):
            v = LEAD_ACC.get(s, 0.6) * lead
            place(gtr, guitar(tones[idx], 0.45, v, damp=0.995), t0 + s * STEP, level, pan=0.4)
    if second:
        t = CH[k % 4]["tones"]
        sec = [note(t[1], 4), note(t[2], 4), note(t[0], 5), note(t[2], 4)]
        for j, s in enumerate((1, 3, 5, 7, 9, 11, 13, 15)):
            place(gtr, guitar(sec[j % 4], 0.3, 0.45, damp=0.985, bright=0.5), t0 + s * STEP, level, pan=-0.45)
    place(pads, pad([note(x, 3) for x in c["tones"]] + [note(c["tones"][0], 4)], BAR + 0.4, bright=0.3), t0, 0.35 * level)


def strum(t0, k, vel=1.0, ring=1.2, damp=0.998):
    t = CH[k % 4]["tones"]
    voicing = [note(t[0], 3), note(t[2], 3), note(t[0], 4), note(t[1], 4), note(t[2], 4), note(t[0], 5)]
    for i, f in enumerate(voicing):
        place(gtr, guitar(f, ring, vel * 0.55, damp=damp, bright=0.55), t0 + i * 0.012, 1.0, pan=(-0.3 + 0.12 * i))


G0 = 0.1
# Intro (0 – 1.7 s): lead lick alone with shaker + congas, then crash on the logo
bar_afro(G0, 0, level=0.7, lead=0.75, kit=False, second=False)
place(drums, crash(0.9), F(52), 1.0)
# Section A (1.7 – 9.7 s): light kit, bass, second guitar; lead from bar 3
for k in range(1, 6):
    bar_afro(G0 + k * BAR, k - 1, level=0.8, lead=(0.55 if k >= 3 else 0), kit=True, second=True)
for s in range(8):  # conga / tom fill into the drop
    place(perc, conga(330 - s * 18, 0.6 + s * 0.05, slap=(s % 2 == 0)), G0 + 5 * BAR + 8 * STEP + s * STEP, 1.0)
# Section B (9.7 – 24.1 s): full sebene, one bar per category
place(drums, crash(1.0), G0 + 6 * BAR, 1.0)
for k in range(6, 15):
    bar_afro(G0 + k * BAR, k - 6, level=1.0, lead=1.0)
# Break (24.1 – 24.6 s): guitar alone, then end section from 24.6 s
for s, idx in enumerate([0, 2, 1, 2, 3]):
    place(gtr, guitar(lead_tones(3)[idx], 0.45, 0.7), 24.1 + s * STEP, 1.0, pan=0.4)
E0 = 24.6
place(drums, crash(1.0), E0, 1.0)
for k in range(2):
    bar_afro(E0 + k * BAR, k, level=1.0, lead=1.0)
# Final (28.1 s, on the slogan): A major strum ringing + low A + crash
FINAL = F(843)
strum(FINAL, 0, vel=1.0, ring=1.8)
place(low, bass(hz("A1"), 1.7), FINAL, 1.0)
place(drums, crash(0.6), FINAL, 1.0)
place(drums, kick(0.9), FINAL, 0.8)

music = drums * 0.85 + perc * 0.7 + low * 0.9 + gtr * 0.75 + pads * 0.6
music += reverb(gtr * 0.25 + perc * 0.15 + pads * 0.2 + drums * 0.08, 0.5)
# Bus limiter: soft-clip the rare transient peaks (bright guitar + crash) above the 99.5th percentile.
ref = np.percentile(np.abs(music), 99.5)
music = np.tanh(music / (ref * 1.3)) * ref * 1.3

# ---------------------------------------------------------------- sfx (src/editorial/*)
sfx = bus()
S = lambda sig, frame, g=1.0, pan=0.0: place(sfx, sig, F(frame), g, pan)
WIPES = [48, 135, 204, 291, 654, 738]
for w in WIPES:
    S(whoosh(0.5, 250, 7000, 0.9), w - 8, pan=-0.3)
    S(whoosh(0.4, 400, 6000, 0.5), w - 5, pan=0.3)
# Hook: mosaic tiles land, band sweeps, explode
for j in range(9):
    S(pop(700 + j * 70, 300 + j * 25, 0.6), 7 + j * 2, pan=[-0.4, 0, 0.4][j % 3])
S(whoosh(0.35, 400, 5000, 0.6), 8)
S(hit(0.5), 13)
S(whoosh(0.4, 5000, 300, 0.6), 34)
# Brand
S(impact(0.9), 52)
S(chime(0.3), 54)
S(whoosh(0.25, 800, 5000, 0.3), 62)
S(whoosh(0.25, 800, 5000, 0.3), 68)
# Statement
for fr in (137, 143, 149):
    S(whoosh(0.25, 500, 5000, 0.4), fr)
S(hit(0.7), 151)
S(whoosh(0.45, 1500, 8000, 0.25), 159)
for i in range(5):
    S(pop(900 + 80 * i, 400, 0.5), 158 + 3 * i, pan=-0.4 + 0.2 * i)
# Journey
S(whoosh(0.6, 150, 2500, 0.8), 204)
S(hit(0.6), 234)
S(riser(1.0, 0.35), 214)
S(tap(1.0), 246)
S(whoosh(0.3, 900, 6000, 0.5), 254, pan=0.4)
S(tap(1.0), 276)
# Categories: sheet whip, card flips, sticker pops + dings, exit whips
bounds = [0, 48, 96, 144, 192, 240, 288, 363]
counts = [2, 2, 1, 2, 1, 1, 2]
notes = ["E6", "A6", "C#6", "E6", "B5", "A6", "E6"]
for i, n in enumerate(counts):
    s0 = 291 + bounds[i]
    seg = bounds[i + 1] - bounds[i]
    fast = seg < 60
    S(whoosh(0.3, 500, 6000, 0.6), s0, pan=0.4)
    starts = ([3, 7] if fast else [6, 13]) if n == 2 else [4 if fast else 8]
    for j, st in enumerate(starts):
        S(whoosh(0.2, 1200, 7000, 0.4), s0 + st, pan=(-0.3 if j == 0 else 0.3))
        S(pop(1100, 500, 0.6), s0 + st + 6, pan=(-0.3 if j == 0 else 0.3))
        S(ding(notes[i], 0.55), s0 + st + 8, pan=(-0.2 if j == 0 else 0.2))
    if i < len(counts) - 1:
        S(whoosh(0.22, 6000, 600, 0.45), s0 + seg - 6, pan=-0.4)
# Offer: reveals, progress bar riser → ding at full, card lifts, tap
for fr in (656, 661, 668):
    S(whoosh(0.22, 600, 5000, 0.35), fr)
S(riser(1.05, 0.5), 672)
S(ding("A6", 0.8), 704)
S(whoosh(0.4, 300, 3000, 0.5), 688)
S(tap(1.0), 706)
# End card
S(impact(1.0), 740)
for i in range(7):
    S(pop(800 + 60 * i, 350, 0.45), 750 + 2 * i, pan=-0.6 + 0.2 * i)
S(whoosh(0.25, 600, 5000, 0.35), 746)
S(whoosh(0.25, 600, 5000, 0.35), 752)
S(pop(900, 450, 0.7), 788)
S(pop(1000, 500, 0.6), 800)
S(tap(1.2), 818)
S(chime(0.7), 840)
S(whoosh(0.4, 2000, 8000, 0.25), 852)

sfx += reverb(sfx * 0.22, 0.5)

finish(music, sfx, "-afro", music_peak=0.62)
