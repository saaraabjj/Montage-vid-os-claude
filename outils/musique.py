"""Musique originale (libre de droits) pour les montages JJB.

Trap cinématographique en ré mineur, 125 BPM : à 25 i/s, un temps = 12 images
exactement, ce qui permet de couper pile sur la musique.

Usage : python3 outils/musique.py <sortie.wav> <plan>
  plan = aftermovie | reel | teaser
Chaque plan est une liste de sections (nom, nombre de mesures).
"""
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 125
BEAT = 60 / BPM            # 0,48 s
BAR = 4 * BEAT             # 1,92 s
rng = np.random.default_rng(7)

# Progression i – VI – III – VII (Dm, Bb, F, C), une mesure par accord
CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]
ROOTS = [38, 34, 41, 36]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, o=4):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=4):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def env(n, a=0.005, d=0.3, s=0.0, r=0.0, total=None):
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    return e


def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i: i + len(x)] += g * x


# ---------- instruments ----------
def kick(punch=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 140 * np.exp(-t * 35)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7)
    click = hp(rng.standard_normal(n), 2000) * np.exp(-t * 300) * 0.3
    return np.tanh(2.2 * punch * (x + click)) * 0.9


def b808(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note) * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.minimum(1, (n - np.arange(n)) / (0.03 * SR)) * np.exp(-t * 0.8)
    return np.tanh(2.5 * x) * 0.75


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    no = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) * (60 if k < 2 else 14))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return (no * e * 0.5 + body) * 0.8


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7500)
    return x * np.exp(-t * (14 if open_ else 90)) * 0.22


def pad(notes, dur, bright=1500):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in notes:
        for det in (-0.12, 0.0, 0.11):
            f = hz(m + det)
            x += 2 * ((t * f + rng.random()) % 1) - 1
    x = lp(x / (len(notes) * 3), bright, 2)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.5)
    return x * a * 0.35


def piano(note, dur=1.6, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.6 + h * 0.9)) / h ** 1.3 for h in range(1, 7))
    x *= np.minimum(1, t / 0.004)
    return x * 0.28 * vel


def braam(note, dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in (note - 12, note, note + 7):
        for det in (-0.2, 0.2):
            x += 2 * ((t * hz(m + det)) % 1) - 1
    cut = 300 + 2200 * np.exp(-t * 1.2)
    y = np.zeros(n)
    for i in range(0, n, 2400):  # filtre qui se referme
        y[i:i + 2400] = lp(x[i:i + 2400], float(cut[i]), 2)
    return np.tanh(y * 0.6) * np.exp(-t * 0.7) * 0.5


def impact():
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (30 + 60 * np.exp(-t * 8)) * t) * np.exp(-t * 1.8)
    no = lp(rng.standard_normal(n), 1200) * np.exp(-t * 4) * 0.5
    return np.tanh(1.8 * (boom + no)) * 0.9


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    y = np.zeros(n)
    blk = 2400
    for i in range(0, n, blk):
        f = 300 + 9000 * (i / n) ** 2
        y[i:i + blk] = bp(x[i:i + blk], f * 0.7, min(f * 1.4, 20000), 1)
    return y * (t / dur) ** 2 * 0.35


def heartbeat():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    one = np.sin(2 * np.pi * (40 + 30 * np.exp(-t * 25)) * t) * np.exp(-t * 18)
    x = one.copy()
    i = int(0.18 * SR)
    x[i:] += 0.7 * one[: n - i]
    return np.tanh(2 * x) * 0.8


def reverb(x, sec=2.2, mix=0.25):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.2 / sec * 2)
    ir = lp(ir, 6000)
    ir /= np.sqrt((ir ** 2).sum())
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


# ---------- sections ----------
def section(kind, bars, t0, B):
    """Écrit `bars` mesures de type `kind` dans les pistes B à partir de t0."""
    for b in range(bars):
        tb = t0 + b * BAR
        ci = b % 4
        last = b == bars - 1
        if kind in ("intro", "build", "drop", "drop2", "break", "outro", "teaser_build"):
            B["pad"] = B["pad"]
        if kind == "intro":
            add(B["pad"], pad(CHORDS[ci], BAR + 0.5, 900), tb, 0.8)
            for k in (0, 2):
                add(B["perc"], heartbeat(), tb + k * BEAT, 0.9)
            if b % 2 == 1:
                add(B["keys"], piano(CHORDS[ci][2] + 12, 2.5, 0.6), tb + 2 * BEAT)
        elif kind in ("build", "teaser_build"):
            add(B["pad"], pad(CHORDS[ci], BAR + 0.5, 1200 + 300 * b), tb, 0.8)
            add(B["drums"], kick(0.8), tb)
            add(B["drums"], kick(0.8), tb + 2.5 * BEAT)
            add(B["drums"], clap(), tb + 2 * BEAT, 0.7)
            step = BEAT / 2 if b < bars - 2 else BEAT / 4
            for s in range(int(BAR / step)):
                add(B["hats"], hat(), tb + s * step, 0.8 + 0.4 * (s % 2 == 0))
            for k in range(4):  # arpège tendu
                add(B["keys"], piano(CHORDS[ci][k % 3] + 12, 0.7, 0.5), tb + k * BEAT)
        elif kind in ("drop", "drop2"):
            add(B["pad"], pad(CHORDS[ci], BAR + 0.5, 2200), tb, 0.6)
            # 808 : fondamentale + glissé à la fin de chaque 2e mesure
            add(B["bass"], b808(ROOTS[ci], BAR * 0.74), tb)
            add(B["bass"], b808(ROOTS[ci] + (12 if b % 2 else 7), BAR * 0.24), tb + 3 * BEAT)
            add(B["drums"], kick(), tb)
            add(B["drums"], kick(0.9), tb + 1.5 * BEAT)
            if b % 2:
                add(B["drums"], kick(0.8), tb + 3.25 * BEAT)
            add(B["drums"], clap(), tb + 2 * BEAT)
            # charleys trap : croches + roulements
            s = 0.0
            while s < 4 - 1e-6:
                roll = (b % 2 == 1 and 3 <= s < 4) or (kind == "drop2" and 1.5 <= s < 2)
                st = 0.125 if roll else 0.5
                add(B["hats"], hat(), tb + s * BEAT, 0.9 if roll else 1.0)
                s += st
            add(B["hats"], hat(True), tb + 3.5 * BEAT, 0.6)
            # motif mélodique (cloche sombre)
            mel = [CHORDS[ci][2] + 12, CHORDS[ci][1] + 12, CHORDS[ci][0] + 12, CHORDS[ci][1] + 12]
            for k, m in enumerate(mel):
                add(B["keys"], piano(m, 0.9, 0.55), tb + (k * 0.75) * BEAT)
            if kind == "drop2":
                add(B["keys"], piano(CHORDS[ci][0] + 24, 1.2, 0.35), tb + 2.5 * BEAT)
        elif kind == "break":
            add(B["pad"], pad(CHORDS[ci], BAR + 0.6, 600), tb, 1.0)
            add(B["perc"], heartbeat(), tb, 0.9)
            add(B["keys"], piano(CHORDS[ci][0] + 12, 2.0, 0.8), tb)
            add(B["keys"], piano(CHORDS[ci][2] + 12, 2.0, 0.6), tb + 1.5 * BEAT)
        elif kind == "outro":
            add(B["pad"], pad(CHORDS[ci], BAR + 0.8, 1400), tb, 0.9)
            arp = [CHORDS[ci][0] + 12, CHORDS[ci][1] + 12, CHORDS[ci][2] + 12, CHORDS[ci][1] + 24]
            for k in range(8):
                add(B["keys"], piano(arp[k % 4], 1.8, 0.75 if k % 4 == 0 else 0.5), tb + k * BEAT / 2)
            if b < bars - 2:
                add(B["drums"], kick(0.6), tb)
                add(B["drums"], clap(), tb + 2 * BEAT, 0.45)
                add(B["bass"], b808(ROOTS[ci], BAR * 0.9), tb, 0.6)
        elif kind == "fin":  # accord tenu + impact
            add(B["fx"], impact(), tb, 0.9)
            add(B["pad"], pad(CHORDS[0], BAR * bars + 1, 900), tb, 0.9)
            add(B["keys"], piano(CHORDS[0][0] + 12, 4, 0.9), tb)
            add(B["keys"], piano(CHORDS[0][2] + 12, 4, 0.6), tb)
            break
        # transitions
        if last and kind in ("build", "teaser_build"):
            add(B["fx"], riser(BAR * min(bars, 2)), tb + BAR - BAR * min(bars, 2))
        if b == 0 and kind in ("drop", "drop2"):
            add(B["fx"], impact(), tb, 0.8)
            add(B["fx"], braam(ROOTS[0] + 12), tb, 0.6)


PLANS = {
    # 46 mesures = 88,32 s (+ 1,5 s de résonance) : vidéo de 1 min 30
    "minute30": [("intro", 6), ("build", 6), ("drop", 14), ("break", 4), ("drop2", 10), ("outro", 4), ("fin", 2)],
    # 30 mesures = 57,6 s (+ 1,5 s de résonance) : vidéo de 1 min max
    "minute": [("intro", 4), ("build", 4), ("drop", 12), ("break", 2), ("drop2", 6), ("fin", 2)],
    # 52 mesures = 99,84 s
    "aftermovie": [("intro", 8), ("build", 8), ("drop", 16), ("break", 4), ("drop2", 8), ("outro", 6), ("fin", 2)],
    # 24 mesures = 46,08 s
    "reel": [("build", 4), ("drop", 8), ("break", 2), ("drop2", 6), ("outro", 2), ("fin", 2)],
    # 8 mesures = 15,36 s
    "teaser": [("teaser_build", 2), ("drop", 4), ("fin", 2)],
}


def render(plan, out):
    secs = PLANS[plan]
    total_bars = sum(b for _, b in secs)
    n = int((total_bars * BAR + 3) * SR)
    B = {k: np.zeros(n) for k in ("drums", "hats", "bass", "pad", "keys", "perc", "fx")}
    t = 0.0
    marks = []
    for kind, bars in secs:
        marks.append((kind, round(t, 3)))
        section(kind, bars, t, B)
        t += bars * BAR
    B["pad"] = reverb(B["pad"], 3.0, 0.4)
    B["keys"] = reverb(B["keys"], 2.5, 0.35)
    B["fx"] = reverb(B["fx"], 2.0, 0.3)
    gains = {"drums": 0.9, "hats": 0.55, "bass": 0.8, "pad": 0.55, "keys": 0.7, "perc": 0.8, "fx": 0.7}
    mix = sum(B[k] * g for k, g in gains.items())
    # « pompe » légère de la nappe et des claviers sur le kick (sidechain simplifié)
    mix = np.tanh(mix * 1.1)
    mix /= np.abs(mix).max() / 0.89
    end = int(total_bars * BAR * SR + 1.5 * SR)
    mix = mix[:end]
    fade = int(1.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    st = np.stack([mix, np.roll(mix, 9)], 1)  # légère largeur stéréo
    sf.write(out, st, SR, subtype="PCM_16")
    print(out, f"{total_bars * BAR:.2f}s", marks)


if __name__ == "__main__":
    render(sys.argv[2], sys.argv[1])
