"""Transcrit une vidéo en sous-titres mot par mot pour Remotion.

Usage : python3 scripts/transcrire.py public/journal/ep02.mp4 src/Journal/mots/ep02.json

Sortie : liste de {"mot", "debut", "fin", "cle"} (temps en secondes dans la vidéo).
Les mots-clés (cle = true) sont à choisir ensuite à la main dans le JSON.
Nécessite : pip install faster-whisper (et HF_HUB_DISABLE_XET=1 si le téléchargement du modèle échoue).
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

video, sortie = sys.argv[1], sys.argv[2]
pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", video, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
    capture_output=True, check=True,
).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

modele = WhisperModel("small", device="cpu", compute_type="int8")
segments, _ = modele.transcribe(audio, language="fr", word_timestamps=True, vad_filter=True)

mots = []
for s in segments:
    print(f"[{s.start:5.1f}–{s.end:5.1f}] {s.text}")
    for w in s.words:
        t = w.word.strip()
        # recoller les élisions et la ponctuation séparée (l + 'entraînement, 100 + %)
        if mots and (t.startswith("'") or t.startswith("-") or t == "%"):
            mots[-1]["mot"] += t
            mots[-1]["fin"] = round(w.end, 2)
        else:
            mots.append({"mot": t, "debut": round(w.start, 2), "fin": round(w.end, 2), "cle": False})

with open(sortie, "w", encoding="utf-8") as f:
    json.dump(mots, f, ensure_ascii=False, indent=1)
print(f"{len(mots)} mots → {sortie}")
