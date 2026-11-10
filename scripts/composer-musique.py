"""Musique originale et bruitages du montage « Prépa JJB » (aucun droit d'auteur tiers).

100 BPM (1 temps = 0,6 s = 15 images à 25 i/s), ré mineur, 20 mesures = 48 s.
Structure calée sur src/PrepaJJB/plans.json :
  0,0 s   intro : nappe grave, battement sourd
  7,2 s   montée : ostinato de cordes, grosse caisse sur 1 et 3
  16,8 s  « Force » : cuivres (braam), percussions à chaque temps
  26,4 s  « Explosivité » : tutti, caisse claire, toms
  38,4 s  respiration : tout retombe, cœur qui bat
  40,8 s  montée finale -> 43,2 s grand impact et carte de fin

Usage : python3 scripts/composer-musique.py public/jjb
Sorties : musique.wav, bruitages.wav (impacts et souffles sur les coupes)
"""
import sys, pathlib
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
BEAT = 0.6
BAR = 4 * BEAT
DUREE = 48.0
N = int(DUREE * SR)
rng = np.random.default_rng(7)
sortie = pathlib.Path(sys.argv[1])


def t_(d):
    return np.arange(int(d * SR)) / SR


def hz(note):  # nombre de demi-tons par rapport à La 440
    return 440.0 * 2 ** (note / 12)


D1, A1, D2, F2, A2, Bb1, C2, F1 = -43, -36, -31, -28, -24, -35, -33, -40


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f, d, detune=(0, 0.11, -0.13)):
    t = t_(d)
    return sum(2 * ((t * f * 2 ** (c / 12)) % 1) - 1 for c in detune) / len(detune)


def env(d, a, r):
    n = int(d * SR)
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def reverb(x, duree=2.8, mix=0.3):
    ir = rng.standard_normal(int(duree * SR)) * np.exp(-np.linspace(0, 7, int(duree * SR)))
    ir = lp(ir, 6000)
    w = fftconvolve(x, ir)[: len(x)]
    w /= np.max(np.abs(w)) + 1e-9
    return (1 - mix) * x + mix * w * np.max(np.abs(x))


# ---------- instruments ----------
def kick(gros=1.0):
    d = 0.9
    t = t_(d)
    f = 42 + 90 * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    s += 0.12 * bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 90)
    return np.tanh(1.6 * gros * s)


def tom(f0):
    d = 0.7
    t = t_(d)
    f = f0 * (1 + 0.6 * np.exp(-t * 18))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
    s += 0.15 * bp(rng.standard_normal(len(t)), 200, 2000) * np.exp(-t * 25)
    return np.tanh(1.3 * s)


def clap():
    d = 0.5
    t = t_(d)
    n = bp(rng.standard_normal(len(t)), 900, 5000)
    e = np.exp(-t * 18)
    for k in (0.0, 0.012, 0.024):
        e += np.exp(-np.maximum(t - k, 0) * 120) * (t >= k)
    return reverb(n * e * 0.5, 1.2, 0.35)


def hat(ouvert=False):
    d = 0.25 if ouvert else 0.06
    t = t_(d)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (12 if ouvert else 70)) * 0.35


def braam(d=2.4):
    s = sum(saw(hz(n), d, (0, 0.08, -0.09)) for n in (D1, D2, A2))
    s = np.tanh(2.2 * s) * env(d, 0.12, 1.2)
    t = t_(d)
    # le filtre s'ouvre au début (attaque cuivrée)
    s = lp(s, 500) * 0.7 + lp(s, 1800) * 0.3 * np.exp(-t * 2)
    return s


def nappe(notes, d, ouverture=900):
    s = sum(saw(hz(n), d) for n in notes) / len(notes)
    return lp(s, ouverture) * env(d, 0.6, 0.6)


def corde(note, d=0.28):
    s = saw(hz(note), d, (0, 0.07, -0.06))
    return lp(s, 2400) * env(d, 0.01, 0.15)


def montee(d, f0=200, f1=6000):
    n = rng.standard_normal(int(d * SR))
    out = np.zeros_like(n)
    blocs = 48
    L = len(n) // blocs
    for b in range(blocs):
        f = f0 * (f1 / f0) ** (b / blocs)
        seg = bp(n[b * L:(b + 1) * L + 2000], f * 0.7, min(f * 1.4, 20000))[:L]
        out[b * L:(b + 1) * L] = seg
    return out * np.linspace(0, 1, len(out)) ** 2 * 0.5


def impact():
    d = 3.5
    t = t_(d)
    s = kick(1.6)
    s = np.pad(s, (0, len(t) - len(s)))
    s += 0.6 * np.sin(2 * np.pi * 32 * t) * np.exp(-t * 1.3)
    s += 0.3 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 3)
    return reverb(np.tanh(1.4 * s), 3.0, 0.35)


# ---------- composition ----------
m = np.zeros(N)
grille = [[D2, F2, A2], [Bb1 + 12, D2, F2], [F1 + 12, A1 + 12, C2 + 12], [C2, -26 + 12 - 12, -21]]  # Dm Bb F C
grille[3] = [C2, C2 + 4, C2 + 7]

# drone grave sur toute la durée, respirations comprises
drone = (np.sin(2 * np.pi * hz(D1) * t_(DUREE)) + 0.4 * np.sin(2 * np.pi * hz(A1) * t_(DUREE)))
courbe = np.interp(t_(DUREE), [0, 6, 38, 38.6, 43, 44, 48], [0.0, 0.35, 0.5, 0.25, 0.4, 0.5, 0.0])
m += drone * courbe * 0.5

# nappes : un accord toutes les 2 mesures, de plus en plus ouvertes
for k in range(10):
    t0 = k * 2 * BAR
    if 38.4 <= t0 < 43.2:
        continue
    ouv = 500 + 2200 * min(1, t0 / 30)
    g = 0.10 + 0.12 * min(1, t0 / 26)
    place(m, nappe(grille[k % 4], 2 * BAR + 0.5, ouv), t0, g)

# ostinato de cordes (croches puis doubles croches)
motif = [D2 + 12, D2 + 12, A2, D2 + 12, F2 + 12, D2 + 12, A2, C2 + 12]
for b in range(3, 16):
    sub = 2 if b < 11 else 4
    for i in range(4 * sub):
        note = motif[(i // (sub // 2)) % len(motif)]
        place(m, corde(note, 0.6 / sub + 0.05), b * BAR + i * BEAT / sub, 0.06 if b < 11 else 0.075)

# percussions
for b in range(20):
    for temps in range(4):
        t0 = b * BAR + temps * BEAT
        if b < 3:  # intro : battement sourd sur le 1
            if temps == 0 and b > 0:
                place(m, kick(0.7), t0, 0.5)
        elif b < 7:
            if temps in (0, 2):
                place(m, kick(), t0, 0.75)
            place(m, hat(), t0 + BEAT / 2, 0.5)
        elif b < 11:
            place(m, kick(), t0, 0.8)
            place(m, hat(), t0 + BEAT / 2, 0.6)
            if temps == 3:
                place(m, tom(90), t0 + BEAT / 2, 0.45)
        elif b < 16:
            place(m, kick(1.2), t0, 0.85)
            if temps in (1, 3):
                place(m, clap(), t0, 0.55)
            place(m, hat(), t0 + BEAT / 2, 0.6)
            place(m, hat(), t0 + BEAT / 4, 0.3)
            if b in (12, 14, 15) and temps == 3:
                for i, f in enumerate((140, 110, 85, 70)):
                    place(m, tom(f), t0 + i * BEAT / 4, 0.55)
        elif b < 18:  # respiration : cœur qui bat
            if temps in (0, 2):
                place(m, kick(0.6), t0, 0.45)
                place(m, kick(0.5), t0 + 0.22, 0.3)

# cuivres sur les débuts de section
for t0, g in ((16.8, 0.32), (26.4, 0.38), (31.2, 0.3), (43.2, 0.42)):
    place(m, braam(2.4 if t0 < 43 else 4.8), t0, g)

# montées
place(m, montee(4.8, 150, 5000), 21.6, 0.35)
place(m, montee(2.4, 300, 9000), 40.8, 0.45)

# impact final et queue
place(m, impact(), 43.2, 1.8)
place(m, nappe(grille[0], 4.8, 1200), 43.2, 0.16)

m = reverb(m, 2.2, 0.18)
fin = np.interp(t_(DUREE), [0, 46.0, 48.0], [1, 1, 0])
m *= fin
m = np.tanh(1.2 * m / (np.max(np.abs(m)) + 1e-9)) * 0.9

# ---------- bruitages ----------
def souffle(d=0.7):
    n = rng.standard_normal(int(d * SR))
    e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    out = np.zeros_like(n)
    L = len(n) // 24
    for b in range(24):
        f = 400 * (3000 / 400) ** (np.sin(np.pi * b / 24))
        out[b * L:(b + 1) * L] = bp(n[b * L:(b + 1) * L + 1500], f * 0.6, f * 1.6)[:L]
    return out * e * 0.6


def coup_sourd():
    d = 1.2
    t = t_(d)
    s = np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 5)
    s += 0.3 * lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 12)
    return reverb(np.tanh(1.5 * s), 1.5, 0.3)


fx = np.zeros(N)
for t0 in (7.2, 13.8, 16.8, 26.4, 33.6):  # titres des sections
    place(fx, souffle(0.7), t0 - 0.35, 0.5)
for t0 in (16.8, 26.4, 38.4):
    place(fx, coup_sourd(), t0, 0.6)
place(fx, souffle(1.4), 1.8, 0.35)  # titre d'intro
fx = fx / (np.max(np.abs(fx)) + 1e-9) * 0.7


def ecrire(nom, x):
    st = np.stack([x, x], 1)
    # légère largeur stéréo
    st[:, 1] = np.roll(x, int(0.011 * SR))
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    import wave
    with wave.open(str(sortie / nom), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


ecrire("musique.wav", m)
ecrire("bruitages.wav", fx)
print("ok")
