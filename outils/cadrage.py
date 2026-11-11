"""Calcule le centre horizontal du cadrage vertical de chaque plan
à partir du mouvement (là où les combattants bougent).
Les plans marqués "cxManuel": true (regards, un seul combattant) sont gardés.

Usage : python3 outils/cadrage.py <montage>
"""
import json
import os
import subprocess
import sys
import numpy as np

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 160, 90


def centre(rush, entree, duree):
    src = os.path.join(RACINE, "public/jjb/proxy", rush + ".mp4")
    raw = subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-ss", str(entree), "-t", str(duree), "-i", src,
         "-vf", f"fps=10,scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
        capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    if len(f) < 2:
        return 0.5
    mv = np.abs(np.diff(f, axis=0))
    mv = np.where(mv > 12, mv, 0).sum(axis=(0, 1))  # énergie de mouvement par colonne
    if mv.sum() == 0:
        return 0.5
    mv = np.convolve(mv, np.ones(15) / 15, mode="same")
    # centre de la fenêtre 9:16 (largeur 0,316) qui contient le plus de mouvement
    larg = int(W * (9 / 16) / (16 / 9))
    cum = np.concatenate([[0], np.cumsum(mv)])
    sommes = cum[larg:] - cum[:-larg]
    x0 = int(np.argmax(sommes))
    return round((x0 + larg / 2) / W, 3)


def main():
    m = sys.argv[1]
    chemin = os.path.join(RACINE, "src/Jjb/montages.json")
    d = json.load(open(chemin))
    for i, p in enumerate(d[m]["plans"]):
        if p.get("cxManuel"):
            continue
        v = p.get("vitesse", 1.0)
        cx = centre(p["rush"], p["entree"], p["duree"] * v)
        print(i, p["rush"][-6:], p["entree"], p.get("cx"), "->", cx, p.get("note", ""))
        p["cx"] = cx
    json.dump(d, open(chemin, "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
