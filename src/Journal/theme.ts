// Série « Journal d'une ceinture bleue qui progresse lentement ».
// Valeurs tirées de DA.md : jaune vif pour les mots-clés (choix du 2026-11-05),
// bleu ceinture et violet pour la jauge de progression.
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";

export const SERIE = {
  accent: "#FFD23F",
  bleu: "#2C51A1",
  bleuClair: "#4C7BE0",
  violet: "#6B3FA0",
  blanc: "#FFFFFF",
  gris: "#AE9FA5",
  fondSombre: "#1C1818",
  police: "Inter, sans-serif",
  titre1: "Journal d'une ceinture bleue",
  titre2: "qui progresse lentement",
};

export const FPS = 30;
export const DUREE_FIN = 4 * FPS; // carte de progression à la fin

export type Mot = { mot: string; debut: number; fin: number; cle: boolean };

export type EpisodeProps = {
  episode: number;
  video: string; // chemin dans public/, ex. "journal/ep01.mp4"
  debut: number; // début de l'extrait dans la vidéo (s)
  fin: number; // fin de l'extrait (s)
  mots: Mot[]; // sous-titres (temps dans la vidéo d'origine), cf. scripts/transcrire.py
  progressionAvant: number; // jauge bleue → violette, en %
  progressionApres: number;
  barrettes: number; // 0 à 4
};
