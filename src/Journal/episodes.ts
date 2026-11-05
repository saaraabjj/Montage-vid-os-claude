import { CouvertureProps } from "./Couverture";
import { EpisodeProps, Mot } from "./theme";
import motsSparring from "../ConseilsSparring/mots.json";

// Liste des épisodes de la série. Un nouvel épisode = une nouvelle entrée ici :
// 1. déposer la vidéo dans public/journal/epXX.mp4
// 2. transcrire : python3 scripts/transcrire.py public/journal/epXX.mp4 src/Journal/mots/epXX.json
// 3. ajouter l'entrée ci-dessous (la jauge reprend là où l'épisode précédent s'est arrêté)
// Chaque épisode apparaît dans le Studio sous « Journal-EpXX » et « Couverture-EpXX ».

export type Episode = { id: string; video: EpisodeProps; couverture: CouvertureProps };

export const EPISODES: Episode[] = [
  {
    // Démo du modèle, avec le début de la vidéo conseils sparring
    id: "Demo",
    video: {
      episode: 1,
      video: "video2/rush.mp4",
      debut: 0,
      fin: 11.7,
      mots: (motsSparring as Mot[]).filter((m) => m.fin <= 11.7),
      progressionAvant: 3,
      progressionApres: 4,
      barrettes: 1,
    },
    couverture: {
      episode: 1,
      image: "video2/couverture.jpg",
      ligne1: "Arrête de vouloir",
      motCle: "GAGNER",
      ligne3: "tes sparrings",
    },
  },
];
