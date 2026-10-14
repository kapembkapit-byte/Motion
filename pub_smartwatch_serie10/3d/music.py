"""Musique synthétisée (libre de droits) calée sur la timeline de scene.js.

Usage : python3 music.py sortie.wav '<timeline JSON>'
"""
import json
import sys
import wave

import numpy as np


def make_audio(path, T, sr=44100, bpm=120):
    dur = T["end"]
    n = int(dur * sr)
    out = np.zeros(n)
    beat = 60 / bpm
    tt = np.arange(n) / sr
    rng = np.random.default_rng(7)

    def add(sig, start):
        i = int(start * sr)
        j = min(n, i + len(sig))
        if 0 <= i < n:
            out[i:j] += sig[: j - i]

    kt = np.arange(int(0.35 * sr)) / sr
    kick = np.sin(2 * np.pi * (45 * kt + (110 / 18) * (1 - np.exp(-kt * 18)))) * np.exp(-kt * 9)
    ht = np.arange(int(0.06 * sr)) / sr
    hat = np.diff(rng.standard_normal(len(ht) + 1)) * np.exp(-ht * 70) * 0.18
    nb = int(dur / beat)
    for b in range(nb):
        s = b * beat
        if T["hero"] <= s < dur - 1.0 or b % 2 == 0:
            add(kick * 0.9, s)
        if s >= T["hero"]:
            add(hat, s + beat / 2)

    # pad (La m – Fa – Do – Sol) + basse
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63),
              (196.0, 261.63, 329.63), (196.0, 246.94, 293.66)]
    bar = beat * 4
    pad = np.zeros(n)
    for k in range(int(dur / bar) + 1):
        fr = chords[k % 4]
        i0, i1 = int(k * bar * sr), min(n, int((k + 1) * bar * sr))
        if i0 >= n:
            break
        seg = tt[i0:i1] - k * bar
        env = np.minimum(1, seg / 0.08) * np.minimum(1, (bar - seg) / 0.15)
        x = tt[i0:i1]
        pad[i0:i1] += sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x) for f in fr) * env
        pad[i0:i1] += 0.9 * np.sin(2 * np.pi * fr[0] / 2 * x) * env
    out += pad * 0.07

    # arpège pendant les écrans
    notes = [659.25, 523.25, 587.33, 783.99]
    at = np.arange(int(0.2 * sr)) / sr
    for b in range(nb * 2):
        s = b * beat / 2
        if T["hero"] <= s < T["bands"]:
            add(np.sin(2 * np.pi * notes[b % 4] * at) * np.exp(-at * 14) * 0.12, s)

    # "tic" de couronne à chaque changement d'écran
    ct = np.arange(int(0.25 * sr)) / sr
    tick = np.zeros(len(ct))
    for k in range(6):
        i = int(k * 0.035 * sr)
        tick[i:i + 200] += np.sin(2 * np.pi * 3200 * ct[:200]) * np.exp(-ct[:200] * 400)
    for k in range(1, 6):
        add(tick * 0.18, T["hero"] + k * T["screen"] - 0.25)

    # whoosh aux transitions / tours de montre
    wt = np.arange(int(0.45 * sr)) / sr
    wh = np.convolve(rng.standard_normal(len(wt)), np.ones(30) / 30, mode="same") * np.sin(np.pi * wt / 0.45) ** 2 * 0.5
    for s in (T["hero"], T["bands"] + 1.0, T["bands"] + 2.0, T["charge"] + 0.8, T["cta"]):
        add(wh, s - 0.2)

    # "clac" magnétique du chargeur
    mt = np.arange(int(0.15 * sr)) / sr
    add((np.sin(2 * np.pi * 180 * mt) + 0.4 * rng.standard_normal(len(mt))) * np.exp(-mt * 45) * 0.5, T["charge"] + 0.55)

    # "ding" sur le prix
    dt = np.arange(int(1.2 * sr)) / sr
    add((np.sin(2 * np.pi * 1318.5 * dt) + 0.5 * np.sin(2 * np.pi * 1975.5 * dt)) * np.exp(-dt * 5) * 0.2, T["cta"] + 0.6)

    out *= np.clip((dur - tt) / 1.2, 0, 1) * np.clip(tt / 0.05, 0, 1)
    out = np.tanh(out * 1.2) / np.tanh(1.2) * 0.85
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((out * 32767).astype(np.int16).tobytes())


if __name__ == "__main__":
    make_audio(sys.argv[1], json.loads(sys.argv[2]))
