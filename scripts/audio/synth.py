"""Shared synthesis toolkit for the Kuwej Reel audio (instruments, sound effects,
reverb, sidechain ducking and EBU R128 mastering). Used by make_audio.py and
make_audio_afro.py."""
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



def finish(music, sfx, suffix="", music_peak=0.5):
    """Duck music/sfx under the voice, write stems and the -14 LUFS master (exact length)."""
    import json, re
    voice = read_wav(AUDIO / "voiceover.wav")
    lvl = np.abs(voice)
    att, rel = np.exp(-1 / (0.008 * SR)), np.exp(-1 / (0.28 * SR))
    envv = np.zeros(N)
    e = 0.0
    for i in range(0, N, 32):  # control rate
        v = lvl[i : i + 32].max()
        e = v + (e - v) * (att**32 if v > e else rel**32)
        envv[i : i + 32] = e
    k = np.clip(envv / 0.12, 0, 1)
    music = norm(music, music_peak) * (10 ** (-8 * k / 20))[:, None]
    sfx = norm(sfx, 0.42) * (10 ** (-3 * k / 20))[:, None]
    fade = np.ones(N)
    fade[-int(0.1 * SR):] = np.linspace(1, 0, int(0.1 * SR))
    music *= fade[:, None]
    sfx *= fade[:, None]
    write_wav(AUDIO / f"music{suffix}.wav", music)
    write_wav(AUDIO / f"sfx{suffix}.wav", sfx)
    tmp = AUDIO / f"master{suffix}.tmp.wav"
    write_wav(tmp, norm(voice[:, None] * 0.95 + music + sfx, 0.95))
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", meas, re.S).group(0))
    af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000,"
          f"apad=whole_len={N},atrim=end_sample={N}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", af, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le",
                    str(AUDIO / f"master{suffix}.wav")], check=True)
    tmp.unlink()
    print(f"✔ music{suffix}.wav, sfx{suffix}.wav, master{suffix}.wav written to assets/audio/")
