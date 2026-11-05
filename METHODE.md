# Méthode de montage

Comment on travaille ensemble sur une vidéo, étape par étape.

## 1. Préparer

1. **Déposer la vidéo source** dans le dossier `public/` (ou l'envoyer directement à Claude).
   - Nommer les fichiers clairement : `rush-01.mp4`, `musique-intro.mp3`, `logo.png`.
   - Fichiers de plus de 100 Mo : les compresser ou les envoyer hors GitHub.
2. **Remplir le haut de `SUIVI.md`** : objectif, plateforme, format, durée visée.
3. **Vérifier `DA.md`** : couleurs, polices, style des textes et des transitions.

## 2. Découper (le « dérushage »)

1. Regarder la vidéo et noter les passages à garder dans `SUIVI.md` (début, fin, contenu).
2. Claude crée une composition Remotion qui enchaîne ces passages (`<OffthreadVideo>` + `<Sequence>`).
3. Vérifier le rythme dans le Studio : `npm run dev`.

## 3. Habiller

Dans cet ordre, pour éviter de refaire le travail :

1. **Structure** : intro, enchaînement des passages, fin.
2. **Textes** : titres, sous-titres, légendes, selon `DA.md`.
3. **Son** : musique, volume, fondus.
4. **Transitions et effets** : en dernier, avec modération.

## 4. Relire et corriger

1. Claude fait un rendu de relecture (`out/vX.mp4`).
2. Noter les retours dans `SUIVI.md`, section « Retours et corrections ».
3. Corriger, puis faire un nouveau rendu (v2, v3…).

## 5. Rendu final

```bash
npx remotion render <NomDeLaComposition> out/final.mp4
```

- Noter le rendu dans `SUIVI.md`, section « Rendus ».
- Enregistrer le projet sur GitHub (commit + push) pour ne rien perdre.

## Commandes utiles

| Action | Commande |
| --- | --- |
| Ouvrir le Studio (aperçu) | `npm run dev` |
| Lister les compositions | `npx remotion compositions` |
| Rendre une vidéo | `npx remotion render <Nom> out/video.mp4` |
| Rendre un extrait | `npx remotion render <Nom> out/extrait.mp4 --frames=0-89` |
| Image fixe (miniature) | `npx remotion still <Nom> out/miniature.png --frame=30` |

## Organisation des fichiers

```
public/        vidéos, musiques, images, polices
src/           compositions Remotion (le montage lui-même)
out/           rendus (non enregistrés sur GitHub)
SUIVI.md       avancement du projet
METHODE.md     ce fichier
DA.md          direction artistique
```

## Bonnes pratiques

- Une composition par vidéo, nommée clairement (ex. `TiktokRecette`).
- Les réglages de style (couleurs, polices) viennent de `DA.md`, jamais « au feeling ».
- Toujours relire un rendu court avant de lancer le rendu complet.
- Enregistrer sur GitHub à la fin de chaque séance.
