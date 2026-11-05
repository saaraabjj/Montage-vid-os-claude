import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { CarteTitre, CarteTitreProps } from "./CarteTitre";
import { Heure, HeureProps } from "./Heure";
import { Segment, SousTitres } from "./SousTitres";
import transcription from "./sous-titres.json";

export const FPS = 30;
export const DUREE_SECONDES = 765.07;

// Fichier source : à remplacer par la version en qualité d'origine dès réception
export const SOURCE = "vlog/vlog-basse-qualite.mp4";

// Heures jaunes déjà incrustées dans le vlog (repérées automatiquement), en secondes.
// Notre badge apparaît un peu avant et disparaît un peu après pour bien les cacher.
const HEURES: Array<{ debut: number; fin: number } & HeureProps> = [
  { debut: 73.33, fin: 79.97, heures: "4", minutes: "45" },
  { debut: 85.1, fin: 90.33, heures: "9", minutes: "20", avion: true },
  { debut: 380.93, fin: 383.63, heures: "17", minutes: "56" },
  { debut: 410.37, fin: 413.07, heures: "18", minutes: "47" },
];
// Cartes titres validées le 2026-11-05 (début en secondes, calé sur la phrase qui ouvre la partie)
const CARTES: Array<{ debut: number } & CarteTitreProps> = [
  { debut: 99.5, intro: "Étape 1", blanc: "Le", couleur: "Vatican" },
  { debut: 132.4, intro: "Crash test", blanc: "Pizza", couleur: "italienne" },
  { debut: 217.6, intro: "Dégustation", blanc: "Le", couleur: "tiramisu" },
  { debut: 310.1, intro: "Dégustation", blanc: "Le dessert au", couleur: "citron" },
  { debut: 415.3, intro: "Retour à l'hôtel", blanc: "Haul des", couleur: "courses" },
  { debut: 584.9, intro: "Test", blanc: "Kinder", couleur: "fruits des bois" },
  { debut: 683.4, intro: "Le match", blanc: "Estathé", couleur: "vs Nestea" },
];
const DUREE_CARTE = 2.2; // s

const AVANCE = 0.25; // s
const RETARD = 0.3; // s

export const VlogRome: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile(SOURCE)} />
      {HEURES.map((h) => {
        const from = Math.round((h.debut - AVANCE) * FPS);
        const to = Math.round((h.fin + RETARD) * FPS);
        return (
          <Sequence key={h.debut} from={from} durationInFrames={to - from} name={`Heure ${h.heures}h${h.minutes ?? ""}`}>
            <Heure heures={h.heures} minutes={h.minutes} avion={h.avion} />
          </Sequence>
        );
      })}
      {CARTES.map((c) => (
        <Sequence
          key={c.debut}
          from={Math.round(c.debut * FPS)}
          durationInFrames={Math.round(DUREE_CARTE * FPS)}
          name={`Carte ${c.blanc} ${c.couleur}`}
        >
          <CarteTitre intro={c.intro} blanc={c.blanc} couleur={c.couleur} />
        </Sequence>
      ))}
      <SousTitres
        segments={transcription as Segment[]}
        zonesOccupees={HEURES.map((h) => ({ debut: h.debut - AVANCE, fin: h.fin + RETARD }))}
      />
    </AbsoluteFill>
  );
};
