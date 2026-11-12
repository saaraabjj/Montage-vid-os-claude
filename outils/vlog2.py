"""Prépare un vlog Rome (jour 2, jour 3…) à partir des rushes iPhone / DJI / Canon.

Lit src/VlogRome2/montage.json (liste des plans + plans de coupe) et produit :
  - public/vlog2/plans/NNN.mp4 : chaque plan en 1920×1080, 30 i/s, redressé,
    les plans verticaux posés sur un fond flouté de la même image ;
  - public/vlog2/plans/NNN-cK.mp4 : les plans de coupe (images seules, la voix
    du plan principal continue dessous) ;
  - src/VlogRome2/timeline.json : début de chaque plan dans la vidéo finale ;
  - src/VlogRome2/sous-titres.json : les mots transcrits recalés sur la vidéo
    finale, avec les corrections de noms.

Usage : python3 outils/vlog2.py [--sans-video] [--seul=052,053]
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Jour du vlog : VLOG_JOUR=2 (par défaut) ou 3… -> public/vlogN/, src/VlogRomeN/
JOUR = os.environ.get("VLOG_JOUR", "2")
SRC = os.environ.get("VLOG2_SRC", os.path.join(RACINE, f"public/vlog{JOUR}/src"))
OUT = os.path.join(RACINE, f"public/vlog{JOUR}/plans")
DOSSIER = os.path.join(RACINE, f"src/VlogRome{JOUR}")
FPS = 30

# Corrections de la transcription : suite de mots reconnus -> suite corrigée
CORRECTIONS = [
    (["exposée,"], ["explosée,"]),
    (["pontéon"], ["Panthéon"]),
    (["shiramisu"], ["tiramisu"]),
    (["true", "size"], ["Two", "Sizes,"]),
    (["creviante"], ["crevée,"]),
    (["mort."], ["morte."]),
    (["kawaii,"], ["KO,"]),
    (["couverture", "Hero."], ["couverture.", ""]),
    (["utiliser", "le", "mouillé"], ["l'utiliser,", "elle est", "mouillée,"]),
    (["Forum", "Palatin"], ["Forum,", "le Palatin,"]),
    (["crevais,"], ["suis crevée,"]),
    (["colisée"], ["Colisée"]),
    # relecture du 2026-11-12
    (["un", "fou", "du", "monde,"], ["", "full", "", "monde,"]),
    (["un", "fou", "du", "monde."], ["", "full", "", "monde."]),
    (["une", "fête"], ["une", "sieste"]),
    (["je", "me", "donne", "que"], ["tu", "m'étonnes", "", "que"]),
    (["une", "mini", "voiture"], ["un", "mini", "ventilo"]),
    (["A", "16h"], ["À", "16h"]),
    # jour 3 (à faire relire)
    (["Comment", "c", "'est", "dur", "les", "fêtes."], ["Comme", "c", "'est", "dur", "les", "défaites."]),
    (["J", "'aime", "perdre", "en", "absolu", "tout."], ["J", "'ai", "perdu", "en", "absolu", "aussi."]),
    (["craqué"], ["claquée"]),
]


def probe(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:stream_side_data=rotation", "-of", "json", f],
                       capture_output=True, text=True)
    s = json.loads(r.stdout)["streams"][0]
    w, h = s["width"], s["height"]
    rot = 0
    for sd in s.get("side_data_list", []):
        rot = int(sd.get("rotation", 0))
    if abs(rot) == 90:
        w, h = h, w
    return w, h


def filtre(p):
    f = []
    rot = p.get("rot")  # correction en plus des infos du téléphone : 1 = horaire, 2 = antihoraire
    if rot:
        f.append(f"transpose={rot}")
    chaine = ",".join(f) + ("," if f else "")
    w, h = probe(os.path.join(SRC, p["fichier"]))
    if rot:
        w, h = h, w
    if h > w:  # vertical : fond flouté de la même image
        return (f"[0:v]{chaine}fps={FPS},split[a][b];"
                f"[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:3,eq=brightness=-0.12:saturation=0.9[fond];"
                f"[b]scale=-2:1080:flags=lanczos[av];"
                f"[fond][av]overlay=(W-w)/2:0,format=yuv420p[v]")
    zoom = p.get("zoom", 1.0)  # zoom dans l'image (combats filmés de loin), centré sur cx / cy
    if zoom != 1.0:
        cx, cy = p.get("cx", 0.5), p.get("cy", 0.5)
        chaine += (f"crop=w=trunc(iw/{zoom}/2)*2:h=trunc(ih/{zoom}/2)*2:"
                   f"x=max(0\\,min(iw-ow\\,{cx}*iw-ow/2)):y=max(0\\,min(ih-oh\\,{cy}*ih-oh/2)),")
    return (f"[0:v]{chaine}fps={FPS},scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop=1920:1080,format=yuv420p[v]")


def rendre(p, sortie, avec_son=True):
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(p["entree"]), "-t", str(p["duree"]),
           "-i", os.path.join(SRC, p["fichier"]), "-filter_complex", filtre(p), "-map", "[v]"]
    if avec_son:
        cmd += ["-map", "0:a:0?", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
    else:
        cmd += ["-an"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", "30",
            "-t", str(p["duree"]), "-movflags", "+faststart", sortie]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print("ERREUR", sortie, r.stderr[-600:])
    return sortie


def corriger(mots):
    textes = [m["m"].strip() for m in mots]
    i = 0
    while i < len(textes):
        for avant, apres in CORRECTIONS:
            if textes[i:i + len(avant)] == avant:
                for k, nouveau in enumerate(apres):
                    textes[i + k] = nouveau
                i += len(avant) - 1
                break
        i += 1
    out = []
    for m, t in zip(mots, textes):
        if t and out and not any(c.isalnum() for c in t):
            # ponctuation seule (« ? », « ! ») : recollée au mot d'avant, espace insécable
            out[-1] = {**out[-1], "m": out[-1]["m"] + "\u00a0" + t, "f": m["f"]}
            continue
        if t:  # on garde l'espace d'origine : « C » + « 'est » se recollent à l'affichage
            espace = " " if m["m"].startswith(" ") else ""
            out.append({**m, "m": espace + t})
    return out


def main():
    sans_video = "--sans-video" in sys.argv
    m = json.load(open(os.path.join(DOSSIER, "montage.json")))
    transcription = json.load(open(os.path.join(DOSSIER, "transcription-brute.json")))
    os.makedirs(OUT, exist_ok=True)
    t = 0.0
    timeline, jobs, segments = [], [], []
    for i, p in enumerate(m["plans"]):
        debut = round(t, 3)
        item = {"i": i, "debut": debut, "duree": p["duree"], "son": p.get("son", 1.0),
                "voix": bool(p.get("voix")), "coupes": []}
        jobs.append((p, os.path.join(OUT, f"{i:03d}.mp4"), True))
        for k, c in enumerate(p.get("coupes", [])):
            cc = {**c, "fichier": c["fichier"]}
            jobs.append((cc, os.path.join(OUT, f"{i:03d}-c{k}.mp4"), False))
            item["coupes"].append({"a": c["a"], "duree": c["duree"]})
        # sous-titres : mots prononcés dans ce plan, recalés sur la vidéo finale
        if p.get("sousTitres", True):
            texte_manuel = p.get("texte")
            if texte_manuel:
                segments.append({"debut": debut + texte_manuel["d"], "fin": debut + texte_manuel["f"],
                                 "texte": texte_manuel["t"], "mots": [
                                     {"m": " " + w, "d": debut + texte_manuel["d"] + j * (texte_manuel["f"] - texte_manuel["d"]) / len(texte_manuel["t"].split()),
                                      "f": debut + texte_manuel["d"] + (j + 1) * (texte_manuel["f"] - texte_manuel["d"]) / len(texte_manuel["t"].split())}
                                     for j, w in enumerate(texte_manuel["t"].split())]})
            else:
                for seg in transcription.get(p["fichier"], []):
                    mots = [w for w in seg["mots"] if w["d"] >= p["entree"] - 0.05 and w["f"] <= p["entree"] + p["duree"] + 0.05]
                    mots = corriger(mots)
                    if not mots:
                        continue
                    decale = [{"m": w["m"], "d": round(debut + w["d"] - p["entree"], 2),
                               "f": round(debut + w["f"] - p["entree"], 2)} for w in mots]
                    segments.append({"debut": decale[0]["d"], "fin": decale[-1]["f"],
                                     "texte": "".join(w["m"] for w in decale).strip(), "mots": decale})
        timeline.append(item)
        t += p["duree"]
    json.dump({"duree": round(t, 3), "plans": timeline}, open(os.path.join(DOSSIER, "timeline.json"), "w"), indent=1)
    json.dump(segments, open(os.path.join(DOSSIER, "sous-titres.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(m['plans'])} plans, durée {t:.1f} s ({int(t // 60)} min {t % 60:.0f} s), {len(segments)} phrases sous-titrées")
    if not sans_video:
        seuls = [a.split("=")[1] for a in sys.argv if a.startswith("--seul=")]
        if seuls:  # ne refaire que certains plans, ex. --seul=052
            jobs = [j for j in jobs if os.path.basename(j[1]).split("-")[0].split(".")[0] in seuls[0].split(",")]
        with ThreadPoolExecutor(max_workers=3) as ex:
            list(ex.map(lambda j: rendre(*j), jobs))
        print("plans rendus :", len(jobs))


if __name__ == "__main__":
    main()
