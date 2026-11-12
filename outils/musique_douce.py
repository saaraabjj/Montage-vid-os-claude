"""Musique douce originale (libre de droits) pour les vlogs : lo-fi chaleureux.

84 BPM, accords de piano électrique (Fmaj7 – Am7 – Dm7 – Bbmaj7), basse ronde,
batterie feutrée, léger souffle de vinyle. Pensée pour passer SOUS la voix.

Usage : python3 outils/musique_douce.py <sortie.wav> <durée en secondes>
"""
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(26)

# Fmaj7, Am7, Dm7, Bbmaj7 (voicings doux, médium)
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]
BASSES = [41, 45, 38, 34]
MELO = [[72, 69, 67, 64], [69, 67, 64, 67], [65, 64, 62, 60], [62, 65, 69, 67]]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i: i + len(x)] += g * x


def epiano(note, dur, vel=1.0):
    """Piano électrique type Rhodes : sinus + légère FM, trémolo doux."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    mod = np.sin(2 * np.pi * f * 2 * t) * 1.2 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.1)
    x += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)
    x *= np.minimum(1, t / 0.006) * np.minimum(1, (dur - t) / 0.08)
    x *= 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return x * 0.18 * vel


def basse(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * hz(note) * t) + 0.3 * np.sin(2 * np.pi * hz(note) * 2 * t)
    x *= np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.05) * np.exp(-t * 0.6)
    return lp(x, 400) * 0.35


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return lp(x, 900) * 0.55


def snare():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = lp(hp(rng.standard_normal(n), 1200), 5000) * np.exp(-t * 18) * 0.25
    x += np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25) * 0.12
    return x


def hat(vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return lp(hp(rng.standard_normal(n), 6000), 11000) * np.exp(-t * 80) * 0.07 * vel


def reverb(x, sec=2.0, mix=0.25):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = lp(rng.standard_normal(n), 5000) * np.exp(-t * 3.5 / sec * 2)
    ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - mix) + fftconvolve(x, ir)[: len(x)] * mix


def render(out, duree):
    n = int((duree + 3) * SR)
    keys, bass, drums = np.zeros(n), np.zeros(n), np.zeros(n)
    bars = int(np.ceil(duree / BAR))
    for b in range(bars):
        tb = b * BAR
        ci = b % 4
        intro = b < 2
        # accords : attaque sur le 1, rappel léger sur le « et » du 2
        for k, m in enumerate(CHORDS[ci]):
            add(keys, epiano(m, BAR * 0.95, 0.9), tb + k * 0.012)
            add(keys, epiano(m, BEAT * 1.2, 0.35), tb + 1.5 * BEAT + k * 0.01)
        # petite mélodie une mesure sur deux, swinguée
        if b % 2 == 1 and not intro:
            for k, m in enumerate(MELO[ci]):
                add(keys, epiano(m, BEAT * 1.5, 0.45), tb + k * BEAT + (0.06 if k % 2 else 0))
        if not intro:
            add(bass, basse(BASSES[ci], BEAT * 1.8), tb)
            add(bass, basse(BASSES[ci] + 7, BEAT * 0.9), tb + 2.5 * BEAT)
            add(drums, kick(), tb)
            add(drums, kick(), tb + 2.5 * BEAT, 0.8)
            add(drums, snare(), tb + BEAT)
            add(drums, snare(), tb + 3 * BEAT)
            for s in range(8):  # charleys en croches swinguées
                add(drums, hat(1.0 if s % 2 == 0 else 0.6), tb + s * BEAT / 2 + (0.05 if s % 2 else 0))
    keys = reverb(keys, 2.4, 0.3)
    keys = lp(keys, 3500)  # côté feutré
    souffle = lp(hp(rng.standard_normal(n), 800), 6000) * 0.006
    craquements = np.zeros(n)
    for i in rng.integers(0, n, int(duree * 3)):
        craquements[i] = rng.uniform(0.05, 0.15) * rng.choice([-1, 1])
    mix = keys * 1.0 + bass * 0.9 + drums * 0.8 + souffle + lp(craquements, 3000)
    mix = np.tanh(mix * 1.2)
    mix = mix[: int(duree * SR)]
    fi, fo = int(2.0 * SR), int(4.0 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)
    mix[-fo:] *= np.linspace(1, 0, fo)
    mix /= np.abs(mix).max() / 0.8
    st = np.stack([mix, np.roll(mix, 13)], 1)
    sf.write(out, st, SR, subtype="PCM_16")
    print(out, f"{duree:.1f}s")


if __name__ == "__main__":
    render(sys.argv[1], float(sys.argv[2]))
