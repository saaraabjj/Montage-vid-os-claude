"""Montage de la vidéo sponsorisée OSMOSIS (face caméra, 9:16).

1. Garde les phrases choisies (plages de mots de la transcription), dans l'ordre.
2. Enlève les blancs : chaque plage est découpée autour des silences détectés
   dans l'audio (plus de 0,35 s sous -35 dB).
3. Recadre en 1080×1920 et alterne deux cadrages (plan normal / plan serré)
   à chaque nouvelle phrase pour masquer les coupes (« jump cuts »).
4. Écrit public/sponso/base.mp4 + src/Sponso/montage.json (sous-titres recalés,
   mots-clés, début de la carte finale) pour la composition Remotion `SponsoOsmosis`.

Usage : python3 outils/sponso.py
"""
import json
import os
import re
import subprocess

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, "public/sponso/src/brut.mov")
MOTS = os.environ.get("SPONSO_MOTS", "/tmp/claude-0/-workspace-Montage-vid-os-claude/bf3ec642-cc9a-56c2-9922-e88f6051f043/scratchpad/sponso/mots.json")
OUT = os.path.join(RACINE, "public/sponso")
TMP = os.path.join(OUT, "morceaux")
FPS = 30
MARGE = 0.12  # s gardées autour de la parole

# (premier mot, dernier mot, mot-clé affiché au début ou None, plan serré ?)
PHRASES = [
    (10, 42, "AVIS HONNÊTE", False),   # Coucou… mon avis sur Osmosis… kimono, rashguards
    (52, 66, "2 SEMAINES D'ESSAI", True, {"debut": 34.35}),  # mon retour après deux semaines (sans le « donc je vais vous donner mon… »)
    (99, 106, "LE DESIGN", False, {"debut": 62.95}),  # le design, il est grave bg (sans le « que »)
    (114, 129, "LA QUALITÉ", True),    # la qualité… très très satisfaite
    (130, 154, None, False),          # j'en ai des kimonos… agréable à porter
    (156, 159, None, False, {"debut": 101.86, "fin": 103.42}),  # 2e prise : que ce soit les finitions
    (171, 184, None, True, {"debut": 107.52}),  # 2e prise : on va pas s'en mentir… ils sont magnifiques
    (185, 199, "COUP DE CŒUR", False),
    (210, 220, "LE CONFORT", False),   # on se sent bien dedans… tellement confort
    (226, 252, "LA DOUBLURE", True),   # étonnée… petite doublure… satisfaisant
    (263, 345, "LES TAILLES", False),  # ce qui m'a surtout étonnée, c'est les tailles…
    (346, 384, None, True),           # A5, A6… A3L… j'étais grave étonnée
    (390, 444, "LES MODÈLES", False, {"debut": 194.6}),  # 2e prise : plusieurs choix… Dare to dream
    (446, 457, None, True),
    (458, 475, "LES FILLES", False),   # petit message pour les filles
    (532, 551, None, True),
    (552, 573, "COLLECTION MIXTE", False),
    (574, 584, None, True),           # en tout cas, très contente de cette sponso
    (586, 603, "-15 %", False),        # code promo
    (604, 639, None, True),
    (644, 651, "MERCI OSMOSIS", False),
]

# Corrections d'affichage des sous-titres (mot reconnu -> mot affiché ; "" = caché)
CORRECTIONS = {
    "rares": "rash", "gardes,": "guards,", "rascale": "rashguard", "Osmosis": "Osmosis",
    "3l": "A3L", "a5": "A5", "a6": "A6", "110": "", "d": "", "'art": "Dare", "obligé": "obligée",
    "sarah": "SAARAABJJ15", "bjj15": "", "étonné": "étonnée",
}


# Corrections par position du mot dans la transcription
CORR_IDX = {279: "du", 280: "", 442: "mon", 156: "que ce", 178: "designs,", 645: "sont", 142: "j'en", 143: "ai", 144: "", 145: "plein", 174: "se", 175: "", 177: "les"}


def silences():
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", SRC, "-vn", "-af",
                        "highpass=f=80,silencedetect=noise=-35dB:d=0.35", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", r)]
    e = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r)]
    return list(zip(s, e))


def decouper(a, b, sil):
    """Plage [a, b] moins les silences (en gardant une petite marge autour de la parole)."""
    morceaux = [[a, b]]
    for s0, s1 in sil:
        s0, s1 = s0 + MARGE, s1 - MARGE
        if s1 - s0 < 0.15:
            continue
        nouv = []
        for x0, x1 in morceaux:
            if s1 <= x0 or s0 >= x1:
                nouv.append([x0, x1])
                continue
            if s0 > x0:
                nouv.append([x0, s0])
            if s1 < x1:
                nouv.append([s1, x1])
        morceaux = nouv
    q = lambda v: round(v * 25) / 25  # coupes sur la grille des images de la source
    return [[q(m[0]), q(m[1])] for m in morceaux if q(m[1]) - q(m[0]) >= 0.24]


def main():
    W = json.load(open(MOTS))
    sil = silences()
    os.makedirs(TMP, exist_ok=True)
    pieces, subs, mots_cles = [], [], []
    t = 0.0
    for k, ph in enumerate(PHRASES):
        i0, i1, cle, serre = ph[:4]
        opt = ph[4] if len(ph) > 4 else {}
        a = opt.get("debut", max(0, W[i0]["d"] - MARGE))
        b = opt.get("fin", W[i1]["f"] + 0.2)
        morceaux = decouper(a, b, sil)
        # on ne garde que les morceaux où il y a vraiment des mots (pas de bruits, de « euh » ni de bouts isolés)
        centres = [max(a, (W[i]["d"] + W[i]["f"]) / 2) for i in range(i0, i1 + 1)]
        morceaux = [m for m in morceaux if any(m[0] - 0.05 <= c < m[1] + 0.05 for c in centres)]
        # pas de chevauchement avec la phrase précédente (sinon le son est répété)
        if pieces:
            fin_prec = max(p[1] for p in pieces)
            morceaux = [[max(x0, fin_prec), x1] for x0, x1 in morceaux if x1 > fin_prec + 0.24]
        if cle:
            mots_cles.append({"t": round(t, 3), "texte": cle})
        debuts = []
        for j, (x0, x1) in enumerate(morceaux):
            # cadrage : alterne normal / serré à chaque phrase, et légèrement à chaque coupe interne
            zoom = (1.18 if serre else 1.0) + (0.05 if j % 2 else 0.0)
            pieces.append((x0, x1, zoom))
            debuts.append(t)
            t += x1 - x0
        # chaque mot va dans le morceau qui contient son milieu, sinon dans le plus proche
        for idx in range(i0, i1 + 1):
            w = W[idx]
            if "debut" in opt and w["d"] < a and W[i0]["d"] < a - 1:
                # mots de la 1re prise (coupée) : on les recale sur la 2e prise
                dec = a - W[i0]["d"] + 0.15
                w = {**w, "d": w["d"] + dec, "f": w["f"] + dec}
            txt = CORR_IDX.get(idx, CORRECTIONS.get(w["m"].strip(), w["m"].strip()))
            if not txt:
                continue
            c = (w["d"] + w["f"]) / 2
            j = min(range(len(morceaux)), key=lambda q: 0 if morceaux[q][0] <= c < morceaux[q][1]
                    else min(abs(c - morceaux[q][0]), abs(c - morceaux[q][1])))
            x0, x1 = morceaux[j]
            d = min(max(w["d"], x0), x1 - 0.05)
            f = min(max(w["f"], d + 0.05), x1)
            subs.append({"m": txt, "d": round(debuts[j] + d - x0, 3), "f": round(debuts[j] + f - x0, 3),
                         "colle": w["m"].strip()[:1] in ("'", "’", "-") and txt == w["m"].strip(), "phrase": k})
    duree_parole = t
    # sous-titres en blocs de 2 à 4 mots
    json.dump({"duree": round(duree_parole, 3), "motsCles": mots_cles, "mots": subs},
              open(os.path.join(RACINE, "src/Sponso/montage.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(pieces)} morceaux, {duree_parole:.1f} s de parole (brut : 300 s)")
    if "--sans-video" in __import__("sys").argv:
        return
    # rendu en une seule passe : trim/atrim + concat, pour que le son reste calé sur l'image
    n = len(pieces)
    g = [f"[0:v]split={n}" + "".join(f"[v{i}]" for i in range(n)), f"[0:a]asplit={n}" + "".join(f"[a{i}]" for i in range(n))]
    for i, (x0, x1, zoom) in enumerate(pieces):
        d = x1 - x0
        g.append(f"[v{i}]trim={x0:.3f}:{x1:.3f},setpts=PTS-STARTPTS,"
                 f"crop=trunc(iw/{zoom}/2)*2:trunc(ih/{zoom}/2)*2:(iw-ow)/2:(ih-oh)*0.35,"
                 f"scale=1080:1920:flags=lanczos,setsar=1[w{i}]")
        g.append(f"[a{i}]atrim={x0:.3f}:{x1:.3f},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d=0.015,afade=t=out:st={max(0, d - 0.02):.3f}:d=0.02[b{i}]")
    g.append("".join(f"[w{i}][b{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac]")
    g.append(f"[vc]fps={FPS},eq=contrast=1.05:saturation=1.08:brightness=0.01,format=yuv420p[vo]")
    open(os.path.join(TMP, "graphe.txt"), "w").write(";\n".join(g))
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", SRC, "-filter_complex_script",
                    os.path.join(TMP, "graphe.txt"), "-map", "[vo]", "-map", "[ac]",
                    "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", os.path.join(OUT, "base.mp4")], check=True)
    print("base.mp4 prête")


if __name__ == "__main__":
    main()
