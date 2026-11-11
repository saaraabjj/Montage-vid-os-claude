"""Prépare les plans du montage JJB à partir des copies de travail 1080p.

Pour chaque plan de la liste (src/Jjb/montages.json) :
  - découpe (entrée + durée en secondes de rush),
  - étalonnage « sport haut de gamme » (contraste, couleurs maîtrisées, vignettage),
  - ralenti par interpolation de mouvement si vitesse < 1 (pas de saccades),
  - accélération si vitesse > 1,
  - recadrage vertical 9:16 (centre réglable) pour le Reel.
Sortie : public/jjb/plans/<montage>/<n°>.mp4, 25 i/s, son du plan conservé
(ralenti : son ralenti aussi, puis atténué par le montage).

Usage : python3 outils/plans.py <montage> [n° de plan…]
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROXY = os.path.join(RACINE, "public/jjb/proxy")
ORIG = os.environ.get("JJB_4K", "/tmp/jjb4k")
FPS = 25

# Étalonnage commun : noirs un peu denses, contraste en S, saturation contenue,
# rouge du tatami et bleu des murs gardés mais pas criards, léger vignettage.
GRADE = (
    "eq=contrast=1.08:brightness=-0.015:saturation=1.06:gamma=0.98,"
    "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.75/0.79 1/0.97',"
    "colorbalance=rs=0.02:gs=0.0:bs=0.03:rh=0.03:gh=0.01:bh=-0.02,"
    "huesaturation=hue=0:saturation=-0.12:colors=r,"
    "vignette=angle=PI/5:mode=forward"
)


def filtre(p, fmt):
    v = p.get("vitesse", 1.0)
    f = []
    if fmt == "vertical":
        cx = p.get("cx", 0.5)  # centre du cadrage, 0 = gauche, 1 = droite
        zoom = p.get("zoomV", 1.0)
        cy = p.get("cy", 0.5)
        h = f"trunc(ih/{zoom}/2)*2"
        w = f"trunc(ih/{zoom}*9/16/2)*2"
        f.append(f"crop=w={w}:h={h}:x=max(0\\,min(iw-ow\\,{cx}*iw-ow/2)):y=max(0\\,min(ih-oh\\,{cy}*ih-oh/2)),scale=1080:1920:flags=lanczos")
    else:
        zoom = p.get("zoom", 1.0)
        if zoom != 1.0:
            cx, cy = p.get("cx", 0.5), p.get("cy", 0.5)
            w, h = int(1920 / zoom) // 2 * 2, int(1080 / zoom) // 2 * 2
            f.append(f"crop={w}:{h}:max(0\\,min(iw-{w}\\,{cx}*iw-{w}/2)):max(0\\,min(ih-{h}\\,{cy}*ih-{h}/2)),scale=1920:1080:flags=lanczos")
    if v < 1:
        cible = round(FPS / v)
        f.append(f"minterpolate=fps={cible}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
        f.append(f"setpts=PTS/{v}*1.0,fps={FPS}")
    elif v > 1:
        f.append(f"setpts=PTS/{v},fps={FPS}")
    f.append(GRADE)
    f.append("format=yuv420p")
    return ",".join(f)


def audio(v):
    if v == 1:
        return "anull"
    chain, r = [], v
    while r < 0.5:
        chain.append("atempo=0.5"); r /= 0.5
    while r > 2:
        chain.append("atempo=2"); r /= 2
    chain.append(f"atempo={r}")
    return ",".join(chain)


def prepare(montage, i, p, fmt):
    out_dir = os.path.join(RACINE, "public/jjb/plans", montage)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"{i:03d}.mp4")
    v = p.get("vitesse", 1.0)
    # en vertical, on recadre dans le rush 4K d'origine s'il a été retéléchargé
    src4k = os.path.join(ORIG, p["rush"] + ".MP4")
    src = src4k if fmt == "vertical" and os.path.exists(src4k) else os.path.join(PROXY, p["rush"] + ".mp4")
    # on lit 0,2 s de marge de chaque côté pour l'interpolation
    duree_rush = p["duree"] * v
    cmd = [
        "ffmpeg", "-nostdin", "-v", "error", "-y",
        "-ss", str(p["entree"]), "-t", f"{duree_rush:.3f}", "-i", src, "-map", "0:v:0", "-map", "0:a:0",
        "-vf", filtre(p, fmt), "-af", audio(v),
        "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "12",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-t", f"{p['duree']:.3f}", "-movflags", "+faststart", out,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print("ERREUR", i, r.stderr[-800:])
    else:
        print("ok", montage, i, p["rush"], p["entree"], p["duree"], v)


def main():
    montage = sys.argv[1]
    seul = {int(x) for x in sys.argv[2:]}
    data = json.load(open(os.path.join(RACINE, "src/Jjb/montages.json")))[montage]
    fmt = data["format"]
    jobs = [(i, p) for i, p in enumerate(data["plans"]) if not seul or i in seul]
    with ThreadPoolExecutor(max_workers=2) as ex:
        list(ex.map(lambda a: prepare(montage, a[0], a[1], fmt), jobs))


if __name__ == "__main__":
    main()
