"""Musique de motivation originale et bruitages du montage « Prépa JJB » (aucun droit d'auteur tiers).

Style : épique / trap de motivation. 125 BPM (1 temps = 0,48 s = 12 images à 25 i/s), ré mineur.
21 mesures = 40,32 s. Un exercice = 3 mesures (5,76 s), calé sur src/PrepaJJB/plans.json.
Chaque ralenti (fin d'exercice) fait retomber la musique, puis elle repart encore plus fort :
  0,00 s  montée filtrée          5,76 s  drop 1 (808, grosse caisse, cuivres)
  17,28 s drop 2 (charlestons rapides, chœurs)   28,80 s drop 3
  34,56 s drop final  ->  38,40 s grand impact sur le dernier ralenti

Usage : python3 scripts/composer-musique.py public/jjb   (demande numpy et scipy)
"""
import sys, pathlib, wave, json
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
BEAT = 0.48
BAR = 4 * BEAT
sortie = pathlib.Path(sys.argv[1])
rng = np.random.default_rng(11)

# La structure suit le montage : chaque ralenti fait retomber la musique, le plan suivant relance un drop.
_cfg = json.loads((pathlib.Path(__file__).resolve().parent.parent / "src/PrepaJJB/plans.json").read_text())
_sec = _cfg["beatFrames"] / _cfg["fps"]
_t, RALENTIS = 0.0, []
for _p in _cfg["plans"]:
    _d = _p["beats"] * _sec
    if _p["speed"] < 1:
        RALENTIS.append((_t, _t + _d))
    _t += _d
DUREE = _t
NB_MESURES = int(round(DUREE / BAR))
N = int(DUREE * SR)
FINAL = RALENTIS[-1][0]                 # dernier ralenti : grand impact
DROPS = [b for _, b in RALENTIS[:-1]]   # le plan qui suit chaque ralenti


def t_(d):
    return np.arange(int(d * SR)) / SR


def hz(n):  # demi-tons par rapport au La 440
    return 440.0 * 2 ** (n / 12)


def place(buf, sig, t0, g=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += g * sig[: j - i]


def filt(x, f, kind="low", order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def saw(f, d, det=(0, 0.1, -0.12)):
    t = t_(d)
    return sum(2 * ((t * f * 2 ** (c / 12)) % 1) - 1 for c in det) / len(det)


def env(d, a, r):
    n = int(d * SR)
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def reverb(x, d=2.0, mix=0.25):
    n = int(d * SR)
    ir = filt(rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)), 7000)
    w = fftconvolve(x, ir)[: len(x)]
    w *= np.max(np.abs(x)) / (np.max(np.abs(w)) + 1e-9)
    return (1 - mix) * x + mix * w


# ---------- sons ----------
def kick(dur=1.0):
    t = t_(0.55)
    f = 48 + 130 * np.exp(-t * 38)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    s += 0.15 * filt(rng.standard_normal(len(t)), 3000, "high") * np.exp(-t * 120)
    return np.tanh(2.2 * dur * s)


def bass808(note, d):
    t = t_(d)
    f = hz(note) * (1 + 0.5 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(2.5 * s) * env(d, 0.004, min(0.25, d * 0.4))
    return filt(s, 900)


def clap():
    t = t_(0.45)
    n = filt(rng.standard_normal(len(t)), [1000, 6000], "band")
    e = np.exp(-t * 16) * 0.6
    for k in (0.0, 0.01, 0.02):
        e = e + np.exp(-np.maximum(t - k, 0) * 140) * (t >= k)
    s = n * e
    s += 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)  # corps de caisse claire
    return reverb(s * 0.6, 1.0, 0.3)


def hat(ouvert=False):
    d = 0.22 if ouvert else 0.05
    t = t_(d)
    return filt(rng.standard_normal(len(t)), 8000, "high") * np.exp(-t * (14 if ouvert else 90)) * 0.4


def tom(f0):
    t = t_(0.5)
    f = f0 * (1 + 0.7 * np.exp(-t * 20))
    return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7))


def cuivre(notes, d):
    s = sum(saw(hz(n), d, (0, 0.07, -0.08)) for n in notes) / len(notes)
    s = np.tanh(2.5 * s) * env(d, 0.02, d * 0.5)
    t = t_(d)
    return filt(s, 700) * 0.7 + filt(s, 2500) * 0.3 * np.exp(-t * 4)


def braam(d):
    s = sum(saw(hz(n), d, (0, 0.06, -0.07)) for n in (-43, -31, -24))
    return filt(np.tanh(2.5 * s), 600) * env(d, 0.06, d * 0.7)


def choeur(notes, d):  # nappe aiguë « voix » : scies désaccordées + vibrato, filtrées
    t = t_(d)
    s = np.zeros(len(t))
    for n in notes:
        for c in (-0.15, 0, 0.13):
            f = hz(n + c) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t))
            s += 2 * ((np.cumsum(f) / SR) % 1) - 1
    s = filt(filt(s / (3 * len(notes)), 1800), 250, "high")
    return s * env(d, 0.3, 0.4)


def corde(n, d):
    return filt(saw(hz(n), d, (0, 0.06, -0.05)), 3000) * env(d, 0.005, d * 0.6)


def montee(d, f0=200, f1=8000):
    n = rng.standard_normal(int(d * SR) + 4000)
    out = np.zeros(int(d * SR))
    blocs = 40
    L = len(out) // blocs
    for b in range(blocs):
        f = f0 * (f1 / f0) ** (b / blocs)
        out[b * L:(b + 1) * L] = filt(n[b * L:(b + 1) * L + 3000], [f * 0.7, min(f * 1.4, 20000)], "band")[:L]
    return out * np.linspace(0, 1, len(out)) ** 2


def roulement(d):  # roulement de caisse claire qui accélère
    s = np.zeros(int(d * SR))
    t, pas = 0.0, BEAT / 2
    while t < d - 0.02:
        place(s, clap(), t, 0.25 + 0.75 * t / d)
        t += pas
        pas = max(BEAT / 8, pas * 0.82)
    return s


def impact():
    d = 3.0
    t = t_(d)
    s = np.pad(kick(1.5), (0, len(t) - int(0.55 * SR)))
    s += 0.8 * np.sin(2 * np.pi * 34 * t) * np.exp(-t * 1.4)
    s += 0.35 * filt(rng.standard_normal(len(t)), 1200) * np.exp(-t * 3)
    return reverb(np.tanh(1.5 * s), 2.8, 0.35)


# ---------- composition ----------
m = np.zeros(N)
accords = [(-31, -28, -24), (-35, -31, -28), (-40, -36, -33), (-33, -29, -26)]  # Rém, Sib, Fa, Do
basses = [-43, -47, -40, -45]                                                   # Ré1, Sib0, Fa1, Do1


def dans_ralenti(t):
    return any(a <= t < b for a, b in RALENTIS)


for b in range(NB_MESURES):
    t_m = b * BAR
    acc, basse = accords[b % 4], basses[b % 4]
    ralenti = dans_ralenti(t_m)
    niveau = min(3, sum(1 for d in DROPS if t_m >= d - 0.01))
    if t_m >= FINAL - 0.01:  # dernier ralenti : grand impact, chœur et cuivres tenus
        continue

    # ostinato de cordes en doubles croches (filtré pendant la montée)
    for i in range(16):
        n = (acc[0] + 12, acc[2] + 12, acc[1] + 12, acc[2] + 12)[i % 4]
        place(m, corde(n, BEAT / 4), t_m + i * BEAT / 4, 0.05 if niveau == 0 else 0.07)

    if ralenti:  # tout retombe : basse tenue, chœur, montée et roulement vers le drop suivant
        place(m, bass808(basse, BAR), t_m, 0.35)
        place(m, choeur([n + 24 for n in acc], BAR), t_m, 0.18)
        place(m, montee(BAR), t_m, 0.25)
        place(m, roulement(BAR), t_m, 0.35)
        continue

    if niveau == 0:  # montée : grosse caisse étouffée
        for k in range(4):
            place(m, filt(kick(), 300), t_m + k * BEAT, 0.6)
        place(m, choeur([n + 24 for n in acc], BAR), t_m, 0.08 * (b + 1))
        continue

    # drops
    for k in range(4):
        place(m, kick(1.1 if niveau == 3 else 1.0), t_m + k * BEAT, 0.8)
        if k in (1, 3):
            place(m, clap(), t_m + k * BEAT, 0.6)
        place(m, hat(ouvert=True), t_m + k * BEAT + BEAT / 2, 0.35)
    subdiv = 8 if niveau >= 2 else 4
    for i in range(4 * subdiv // 2):
        place(m, hat(), t_m + i * BEAT * 2 / subdiv, 0.45)
    if niveau >= 2 and b % 2 == 1:  # roulements de charleston (triolets)
        for i in range(6):
            place(m, hat(), t_m + 3 * BEAT + i * BEAT / 6, 0.4)
    # 808 : rythme syncopé
    for pos, d in ((0, 0.7), (0.75, 0.2), (1.5, 0.4), (2.5, 0.9), (3.5, 0.35)):
        place(m, bass808(basse, d), t_m + pos * BEAT, 0.55)
    # cuivres en accords rythmés
    for pos in (0, 1.5, 2.5):
        place(m, cuivre(acc, 0.32), t_m + pos * BEAT, 0.22 + 0.04 * niveau)
    if niveau >= 2:
        place(m, choeur([n + 24 for n in acc], BAR), t_m, 0.16 + 0.04 * (niveau - 2))
    if b % 3 == 2 and niveau >= 2:  # descente de toms en fin d'exercice
        for i, f in enumerate((150, 120, 95, 75)):
            place(m, tom(f), t_m + 3 * BEAT + i * BEAT / 4, 0.5)

# braams sur chaque drop
for t0 in DROPS:
    place(m, braam(BAR), t0, 0.35)
# relances au milieu de la dernière partie (uchikomi)
for t0 in np.arange(DROPS[-1] + 4 * BAR, FINAL - BAR, 4 * BAR):
    place(m, braam(BAR), t0, 0.28)
place(m, montee(BAR), FINAL - BAR, 0.3)

# final : impact sur le dernier ralenti, chœur et cuivres tenus
fin = FINAL
queue = DUREE - FINAL
place(m, impact(), fin, 1.4)
place(m, braam(queue), fin, 0.4)
place(m, choeur([n + 24 for n in accords[0]], queue), fin, 0.22)
place(m, bass808(-43, queue), fin, 0.5)

m = reverb(m, 1.6, 0.15)
m *= np.interp(t_(DUREE), [0, 0.05, DUREE - 0.6, DUREE], [0, 1, 1, 0])
m = np.tanh(1.4 * m / (np.max(np.abs(m)) + 1e-9)) * 0.92


# ---------- bruitages ----------
def souffle(d=0.6):
    n = rng.standard_normal(int(d * SR) + 2000)
    out = np.zeros(int(d * SR))
    L = len(out) // 20
    for b in range(20):
        f = 400 * (4000 / 400) ** np.sin(np.pi * b / 20)
        out[b * L:(b + 1) * L] = filt(n[b * L:(b + 1) * L + 1500], [f * 0.6, f * 1.6], "band")[:L]
    return out * np.sin(np.linspace(0, np.pi, len(out))) ** 2


fx = np.zeros(N)
place(fx, souffle(), FINAL - 0.3, 0.6)  # entrée de la phrase finale
for t0 in DROPS:  # coups sourds sur les drops
    place(fx, np.pad(kick(1.3), (0, 0)), t0, 0.5)
fx = fx / (np.max(np.abs(fx)) + 1e-9) * 0.7


def ecrire(nom, x):
    st = np.stack([x, np.roll(x, int(0.009 * SR))], 1)
    with wave.open(str(sortie / nom), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())


ecrire("musique.wav", m)
ecrire("bruitages.wav", fx)
print("ok", round(DUREE, 2), "s")
