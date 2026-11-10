# Suivi du montage

Journal du projet : ce qui est fait, ce qui reste à faire, et les décisions prises.

## Projet en cours : Prépa physique JJB (Reels / TikTok)

| Champ | Valeur |
| --- | --- |
| Nom de la vidéo | Prépa physique JJB, « Le travail invisible » (composition `PrepaJJB`) |
| Objectif / plateforme | Instagram Reels et TikTok : raconter la préparation physique d'une athlète de JJB |
| Format | 9:16 vertical, 1080×1920, **25 i/s** (cadence des rushes, pour ne pas dupliquer d'images) |
| Durée | 48 s (20 mesures à 100 BPM : chaque coupe tombe sur un temps) |
| Vidéo source | 9 rushes DJI du 2026-11-10 (0061 à 0069, 1728×3072 HEVC 10 bits, 4,8 Go) reçus par SwissTransfer, hors GitHub. Le 0064 a une rotation erronée dans ses métadonnées (lu sans auto-rotation) |
| Couleur d'accent | **bleu ceinture** (`#5B82D6`, version claire) : il reprend les gants bleus et la lumière froide des projecteurs |
| Musique | **originale**, composée par script (`scripts/composer-musique.py`) : aucun droit d'auteur tiers. Bruitages : son direct des rushes (poids, cordes, souffle) + souffles et impacts sur les titres |
| Statut | 🟣 En relecture (v1 rendue) |

### Déroulé (plans dans `src/PrepaJJB/plans.json`)

| Temps | Partie | Plans |
| --- | --- | --- |
| 0–7 s | Intro « Le travail invisible. » | silhouette sous les projecteurs (0068), plan large de la salle (0066), regard caméra (0061) |
| 7–17 s | 01 Préhension, 02 Isométrie | rouleau de poignets avec ralenti du disque qui monte (0061), travail au disque (0064), maintien bras tendus (0061) |
| 17–26 s | 03 Force | développé landmine à genou + ralenti (0062, 0063), tirages à la poulie (0067, 0069) |
| 26–38 s | 04 Explosivité, 05 Endurance | battle rope de face et de dos, slams, 2 ralentis (0065, 0066) |
| 38–43 s | Respiration « Discipline. » | au sol après la série, souffle réel, puis regard caméra (0063) |
| 43–48 s | Carte de fin | logo, « Hors des tatamis, chaque séance compte. » |

Règles respectées : vitesse réelle partout sauf 4 ralentis (×0,5, par fusion d'images, sans mouvement inventé) ; seulement des exercices présents dans les rushes ; étalonnage identique sur tous les plans (contraste, ombres froides, vignette légère).

Recréer les plans et la musique (rushes hors GitHub) :

```bash
python3 scripts/preparer-plans.py <dossier des rushes> public/jjb
python3 scripts/composer-musique.py public/jjb   # demande numpy et scipy
npx remotion render PrepaJJB out/PrepaJJB-v1.mp4
```

| Version | Fichier | Date | Remarques |
| --- | --- | --- | --- |
| v1 | `out/PrepaJJB-v1.mp4` (1080×1920, 48 s, −17 LUFS) | 2026-11-10 | premier montage complet |

## Projet précédent : Vlog Rome

| Champ | Valeur |
| --- | --- |
| Nom de la vidéo | Vlog Rome (titre à définir) |
| Objectif / plateforme | YouTube, puis extraits TikTok et Instagram |
| Format | 16:9 horizontal, 1920×1080 (extraits en 9:16) |
| Durée visée | ≈ 12 min, déjà monté (extraits 30–60 s) |
| Vidéo source | **Qualité d'origine reçue** par SwissTransfer : 7 fichiers 1920×1080, 1,4 Go, recollés dans l'ordre (2, 1, 3, 5, 6, 7, 9) → `public/vlog/vlog-original.mp4` (hors GitHub) |
| Couleur d'accent | **bleu ceinture `#2C51A1`** : il s'accorde au ciel, au fleuve et aux rideaux bleus de l'hôtel (proposé, à valider) |
| Statut | 🟣 En relecture (rendu complet terminé) |

Légende des statuts : 🟡 En préparation · 🔵 En montage · 🟣 En relecture · 🟢 Terminé

## À faire

- [x] Envoyer la vidéo source en morceaux (version basse qualité)
- [x] Renvoyer la vidéo en qualité d'origine (SwissTransfer)
- [x] Définir le format et la durée
- [x] Recoller les morceaux (12:45, sans coupure)
- [x] Compléter la DA (`DA.md`), à partir de 2 vidéos de référence
- [ ] Valider les points « à confirmer » de la DA et déposer le logo
- [ ] Repérer les grandes parties du vlog (cartes titres)
- [x] Remplacer les heures incrustées (4h45, 9h20 ✈, 17h56, 18h47) par un badge dans la DA
- [x] Sous-titres automatiques (transcription Whisper, 1 497 mots, 21 corrections de noms)
- [ ] Relire les sous-titres (mots douteux : « missou », « rassoute »…)
- [x] Ajouter les 7 cartes titres (Vatican, pizza, tiramisu, citron, haul, Kinder, Estathé vs Nestea)
- [ ] Ajouter les petits sons (pas de musique)
- [x] Premier rendu à relire (v1 envoyée)
- [ ] Corrections
- [ ] Rendu final YouTube
- [x] Extrait TikTok / Instagram (9:16, 27 s) qui renvoie vers YouTube : composition `TeaserTikTok`

## Contenu du vlog (repéré le 2026-11-05)

| Vers | Partie | Idée de carte titre |
| --- | --- | --- |
| 0:00 | Arrivée et balade dans Rome, face caméra | « Jour 1 / Rome » |
| ≈ 1:20 | L'avion (« 9h »), le Vatican, la place Saint-Pierre | « Le Vatican » |
| ≈ 3:00 | Le Tibre, la pizza, une boutique | « Pause pizza » |
| ≈ 3:40 | Dégustation assise devant un monument | « Le goûter » |
| ≈ 5:30 | Retour à l'hôtel (18:41) et haul des courses Conad | « Les courses italiennes » |

Remarques : le logo et l'heure « 9h » sont déjà incrustés à certains endroits. Quelques plans verticaux ont des bandes noires sur les côtés.

## Passages retenus

| # | Début | Fin | Contenu | Notes |
| --- | --- | --- | --- | --- |
| 1 | 0:00 | 0:00 | | |

## Journal

| Date | Ce qui a été fait | Prochaine étape |
| --- | --- | --- |
| 2026-11-05 | Installation de Remotion, projet sur GitHub, création des fichiers de suivi | Envoyer la vidéo source |
| 2026-11-05 | DA remplie à partir de 2 vidéos de référence (style A face caméra, style B court métrage) | Valider la DA, envoyer la vidéo source |
| 2026-11-05 | Logo ajouté, choix du son : pas de musique, petits effets sonores oui | Confirmer police et pseudo, envoyer la vidéo source |
| 2026-11-05 | Couleur d'accent adaptée à chaque vidéo, logo entier dans la pilule | Envoyer la vidéo source |
| 2026-11-05 | Projet = vlog YouTube de 12 min déjà monté, à habiller. DA adaptée au 16:9. Extraits TikTok / Insta plus tard | Envoyer le vlog en morceaux |
| 2026-11-05 | Vlog reçu par Mail Drop (7 morceaux, recollés), contenu repéré, accent bleu proposé | Renvoyer en qualité d'origine, valider les parties |
| 2026-11-05 | Décision : logo incrusté gardé. Les 4 heures jaunes remplacées par un badge sombre avec icône bleue et petit « pop » (composition `VlogRome`). Aperçu envoyé | Valider le badge |
| 2026-11-05 | Sous-titres ajoutés : 3 à 6 mots en bas, mot prononcé surligné en bleu, remontés quand un badge d'heure est affiché. Aperçu envoyé | Relire les mots douteux |
| 2026-11-05 | Corrections des sous-titres (tiramisu, de Rome, en soute). 7 cartes titres validées et ajoutées. Aperçu envoyé | Valider les cartes, renvoyer la vidéo d'origine, rendu complet |
| 2026-11-05 | Vidéo d'origine reçue (SwissTransfer), heures recalées dessus, rendu complet 1080p lancé | Relire le rendu complet |
| 2026-11-05 | Rendu complet v1 terminé (1080p, 1,2 Go). Version allégée 720p envoyée, version YouTube 1080p < 500 Mo en préparation | Relire la v1 et noter les retours |
| 2026-11-06 | Retours v1 : ordre des vidéos mélangé (les morceaux 1 et 2 étaient inversés) et beaucoup d'erreurs de transcription. Vidéo réassemblée dans l'ordre (1), (2), (3), (5), (6), (7), (9). Nouvelle transcription avec Whisper large-v3 + contexte, texte complet dans `SOUS-TITRES.md` pour relecture. Badges et cartes recalés | Relire `SOUS-TITRES.md`, puis rendu v2 |
| 2026-11-06 | Corrections de relecture appliquées (3:17, 8:06, 8:10). Rendu v2 terminé, envoyé en 720p et en 1080p YouTube (352 Mo) | Relire la v2, puis extraits TikTok / Insta |
| 2026-11-06 | Miniatures créées dans la DA (compositions `MiniatureYouTube` 1920×1080 et `MiniatureInsta` 1080×1920) : « J'ai tout goûté à Rome », place Saint-Pierre, visage, pizza, tiramisu, logo | Valider les miniatures |
| 2026-11-06 | Extrait vertical de 27 s (histoire du tiramisu, mot par mot en très gros, pilule logo, écran final « Le vlog complet sur YouTube · Lien en bio ») | Valider l'extrait |

## Retours et corrections

| Version | Retour | Corrigé ? |
| --- | --- | --- |
| v1 | Ordre des vidéos mélangé | ☑ |
| v1 | Beaucoup d'erreurs dans les sous-titres | ☑ (transcription large-v3 + relecture) |

## Rendus

| Version | Fichier | Date | Remarques |
| --- | --- | --- | --- |
| v2 | `out/VlogRome-v2.mp4` (1080p, bon ordre, nouveaux sous-titres) | 2026-11-06 | envoyé en 720p et en 1080p YouTube |
| v1 | `out/VlogRome-final.mp4` (1080p, 1,2 Go) | 2026-11-05 | rendu complet, envoyé en 720p (190 Mo) et en 1080p allégé |
