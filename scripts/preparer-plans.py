"""Prépare les plans du montage « Prépa JJB » à partir des rushes DJI.

Pour chaque plan de src/PrepaJJB/plans.json :
- découpe le passage, recadre en 1080x1920 (zoom optionnel pour les gros plans),
- applique l'étalonnage commun (contraste, ombres froides, hautes lumières chaudes, vignette),
- ralentit si speed < 1 (fusion d'images, sans inventer de mouvement),
- extrait le son direct (grave et ralenti pour les ralentis).

Usage : python3 scripts/preparer-plans.py <dossier des rushes> public/jjb
"""
import json, subprocess, sys, pathlib, glob
from concurrent.futures import ThreadPoolExecutor

racine = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((racine / "src/PrepaJJB/plans.json").read_text())
rushes, sortie = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
seul = set(sys.argv[3:])
(sortie / "plans").mkdir(parents=True, exist_ok=True)
(sortie / "sons").mkdir(parents=True, exist_ok=True)
FPS, BEAT = cfg["fps"], cfg["beatFrames"]

ETALONNAGE = ",".join([
    "eq=contrast=1.10:saturation=0.86:gamma=0.97",
    "curves=master='0/0 0.12/0.07 0.5/0.5 0.86/0.93 1/1'",
    "colorbalance=rs=-0.04:gs=-0.01:bs=0.05:rh=0.04:gh=0.01:bh=-0.03",
    "vignette=angle=PI/5",
])

def fichier(r):
    return glob.glob(str(rushes / f"DJI_*_{r}_D.MP4"))[0]

def preparer(p):
    if seul and p["id"] not in seul:
        return
    frames = p["beats"] * BEAT
    sec_out = frames / FPS
    src_dur = sec_out * p["speed"]
    z = p.get("zoom", 1.0)
    W, H = 1728, 3072
    cw, ch = int(W / z) // 2 * 2, int(H / z) // 2 * 2
    x = int(min(max(p.get("cx", 0.5) * W - cw / 2, 0), W - cw))
    y = int(min(max(p.get("cy", 0.5) * H - ch / 2, 0), H - ch))
    vf = [f"crop={cw}:{ch}:{x}:{y}", "scale=1080:1920:flags=lanczos", "format=yuv420p10le", ETALONNAGE]
    if p["speed"] < 1:
        vf += [f"setpts=PTS/{p['speed']}", f"framerate=fps={FPS}:interp_start=0:interp_end=255"]
    vf += [f"fps={FPS}", "format=yuv420p"]
    pre = ["-display_rotation", "0", "-noautorotate"] if p.get("noautorotate") else []
    base = ["ffmpeg", "-v", "error", "-y", *pre, "-ss", str(p["in"]), "-t", f"{src_dur + 0.2:.3f}", "-i", fichier(p["rush"])]
    subprocess.run([*base, "-map", "0:v:0", "-vf", ",".join(vf), "-frames:v", str(frames),
                    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-an",
                    str(sortie / "plans" / f"{p['id']}.mp4")], check=True)
    af = f"asetrate=48000*{p['speed']},aresample=48000" if p["speed"] < 1 else "anull"
    subprocess.run([*base, "-map", "0:a:0", "-af", af, "-t", f"{sec_out:.3f}", "-ac", "2",
                    str(sortie / "sons" / f"{p['id']}.wav")], check=True)
    print("ok", p["id"], flush=True)

with ThreadPoolExecutor(4) as ex:
    list(ex.map(preparer, cfg["plans"]))
