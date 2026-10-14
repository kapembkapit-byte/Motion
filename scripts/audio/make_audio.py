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
import subprocess
import wave
from pathlib import Path

import numpy as np
import scipy.signal as sg

ROOT = Path(__file__).resolve().parents[2]
AUDIO = ROOT / "assets" / "audio"
SR = 48000
DUR = 29.9
N = round(DUR * SR)
FPS = 30
rng = np.random.default_rng(20261014)


def F(frame):  # video frame -> seconds
    return frame / FPS


def tt(d):
    return np.arange(int(d * SR)) / SR


# ---------------------------------------------------------------- utilities
def bus():
    return np.zeros((N, 2))


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i]
    if sig.ndim == 1:
        th = (pan + 1) * np.pi / 4
        buf[i : i + len(sig), 0] += sig * gain * np.cos(th) * np.sqrt(2)
        buf[i : i + len(sig), 1] += sig * gain * np.sin(th) * np.sqrt(2)
    else:
        buf[i : i + len(sig)] += sig * gain


def filt(x, btype, f, order=2):
    sos = sg.butter(order, f, btype=btype, fs=SR, output="sos")
    return sg.sosfilt(sos, x, axis=0)


def sweep(x, fc_fn, btype="low", blk=256, q=1.6):
    """Time-varying Butterworth filter (block-wise, state carried)."""
    y = np.zeros_like(x)
    zi = None
    n = len(x)
    for b in range(0, n, blk):
        fc = float(np.clip(fc_fn(b / SR), 30, SR * 0.45))
        if btype == "band":
            band = [max(20, fc / q), min(SR * 0.45, fc * q)]
            sos = sg.butter(2, band, btype="band", fs=SR, output="sos")
        else:
            sos = sg.butter(2, fc, btype=btype, fs=SR, output="sos")
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        y[b : b + blk], zi = sg.sosfilt(sos, x[b : b + blk], axis=0, zi=zi)
    return y


def env(n, a=0.005, r=0.05, sustain_until=None):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    nr = max(1, int(r * SR))
    end = n if sustain_until is None else min(n, int(sustain_until * SR) + nr)
    if sustain_until is not None:
        s = int(sustain_until * SR)
        e[s:end] *= np.linspace(1, 0, end - s)
        e[end:] = 0
    else:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


def hz(note):
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def make_ir(rt=1.8, d=2.4):
    t = tt(d)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-6.9 * t / rt)[:, None]
    ir = filt(ir, "low", 6500)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir**2) / 2)


IR = make_ir()


def reverb(x, mix=1.0):
    wet = np.stack([sg.fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], axis=1)
    return wet * mix


# ---------------------------------------------------------------- instruments
def kick(vel=1.0):
    t = tt(0.55)
    f = 44 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = filt(rng.standard_normal(len(t)) * np.exp(-t * 500), "high", 1500) * 0.25
    return np.tanh((body + click) * 1.6) * vel


def clap(vel=1.0):
    t = tt(0.35)
    x = np.zeros(len(t))
    for k, o in enumerate([0.0, 0.011, 0.022]):
        i = int(o * SR)
        x[i:] += rng.standard_normal(len(t) - i) * np.exp(-(t[: len(t) - i]) * (90 if k < 2 else 22))
    return filt(x, "band", [900, 4200]) * vel * 0.6


def hat(vel=1.0, open_=False):
    t = tt(0.25 if open_ else 0.07)
    x = rng.standard_normal(len(t)) * np.exp(-t * (14 if open_ else 70))
    return filt(x, "high", 7500) * vel * 0.35


def sub(f, d, vel=1.0):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return np.tanh(1.3 * x) * env(len(t), 0.004, 0.06) * vel * 0.8


def pad(freqs, d, bright=1.0):
    t = tt(d)
    out = np.zeros((len(t), 2))
    for f in freqs:
        for c, det in enumerate((-6, 7)):
            for k, cents in enumerate((det, -det / 2)):
                ff = f * 2 ** (cents / 1200)
                out[:, c] += sg.sawtooth(2 * np.pi * ff * t + rng.uniform(0, 6.28)) * (0.6 if k else 1)
    out = filt(out, "low", 900 + 2400 * bright, order=2)
    e = env(len(t), 0.25, 0.5)
    return out * e[:, None] / (len(freqs) * 2.5)


def bell(f, d=1.2, vel=1.0, ratio=3.5, idx=2.2):
    t = tt(d)
    mod = idx * np.exp(-t * 6) * np.sin(2 * np.pi * f * ratio * t)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return x * vel * 0.5


# ---------------------------------------------------------------- sfx
def whoosh(d=0.4, f0=300, f1=5000, vel=1.0, rev=False):
    n = int(d * SR)
    x = rng.standard_normal(n)
    fc = (lambda s: f0 * (f1 / f0) ** min(1, s / d)) if not rev else (lambda s: f1 * (f0 / f1) ** min(1, s / d))
    y = sweep(x, fc, "band")
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    if rev:
        shape = np.linspace(0, 1, n) ** 2.2 * np.exp(-np.linspace(0, 1, n) * 0)
        shape[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return y * shape * vel * 0.55


def pop(f0=900, f1=320, vel=1.0):
    t = tt(0.09)
    f = f1 + (f0 - f1) * np.exp(-t * 60)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
    return x * vel * 0.45


def tap(vel=1.0):
    t = tt(0.05)
    x = filt(rng.standard_normal(len(t)) * np.exp(-t * 900), "band", [1800, 7000]) * 0.8
    x += np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 160) * 0.25
    return x * vel * 0.5


def ding(note="A5", vel=1.0):
    x = bell(hz(note), 0.9, vel, ratio=2.0, idx=1.2) * 0.8
    p = pop(1400, 700, 0.3)
    x[: len(p)] += p
    return x


def hit(vel=1.0):
    t = tt(0.45)
    f = 60 + 80 * np.exp(-t * 35)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    noise = filt(rng.standard_normal(len(t)) * np.exp(-t * 30), "band", [400, 3000]) * 0.4
    return np.tanh((body + noise) * 1.4) * vel * 0.6


def impact(vel=1.0, d=2.2):
    t = tt(d)
    f = 34 + 60 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    crack = filt(rng.standard_normal(len(t)) * np.exp(-t * 18), "low", 2500) * 0.5
    return np.tanh((boom * 1.2 + crack) * 1.3) * vel * 0.7


def riser(d=1.6, vel=1.0):
    n = int(d * SR)
    x = sweep(rng.standard_normal(n), lambda s: 400 * (9000 / 400) ** (s / d), "band", q=1.4)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(180 * 4 ** (t / d)) / SR) * 0.15
    return (x * 0.5 + tone) * (t / d) ** 2.4 * vel


def chime(vel=1.0):
    out = np.zeros(int(2.4 * SR))
    for k, n in enumerate(["D6", "A5", "F6", "C7", "E7"]):
        b = bell(hz(n), 2.2, 0.55 - k * 0.07, ratio=3.0, idx=1.4)
        i = int(k * 0.045 * SR)
        out[i : i + len(b)] += b[: len(out) - i]
    return out * vel


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

# ---------------------------------------------------------------- mix
def read_wav(p):
    with wave.open(str(p)) as w:
        assert w.getframerate() == SR, "voice must be 48 kHz"
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    out = np.zeros(N)
    out[: min(N, len(x))] = x[:N]
    return out


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


voice = read_wav(AUDIO / "voiceover.wav")

# Sidechain ducking: music −8 dB / sfx −3 dB while the voice speaks (fast attack, smooth release).
lvl = np.abs(voice)
att, rel = np.exp(-1 / (0.008 * SR)), np.exp(-1 / (0.28 * SR))
envv = np.zeros(N)
e = 0.0
for i in range(0, N, 32):  # control rate
    v = lvl[i : i + 32].max()
    e = v + (e - v) * (att**32 if v > e else rel**32)
    envv[i : i + 32] = e
k = np.clip(envv / 0.12, 0, 1)
duck_m = 10 ** (-8 * k / 20)
duck_s = 10 ** (-3 * k / 20)

music = norm(music, 0.5) * duck_m[:, None]
sfx = norm(sfx, 0.42) * duck_s[:, None]
fade = np.ones(N)
fade[-int(0.1 * SR):] = np.linspace(1, 0, int(0.1 * SR))
music *= fade[:, None]
sfx *= fade[:, None]

write_wav(AUDIO / "music.wav", music)
write_wav(AUDIO / "sfx.wav", sfx)
mix = voice[:, None] * 0.95 + music + sfx
tmp = AUDIO / "master.tmp.wav"
write_wav(tmp, norm(mix, 0.95))

# Loudness: two-pass EBU R128 to -14 LUFS, -1 dBTP, then exact sample count.
import json, re
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", meas, re.S).group(0))
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000,"
      f"apad=whole_len={N},atrim=end_sample={N}")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", af, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le",
                str(AUDIO / "master.wav")], check=True)
tmp.unlink()
print("✔ music.wav, sfx.wav, master.wav written to assets/audio/")
