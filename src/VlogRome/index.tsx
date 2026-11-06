import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { CarteTitre, CarteTitreProps } from "./CarteTitre";
import { Heure, HeureProps } from "./Heure";
import { Segment, SousTitres } from "./SousTitres";
import transcription from "./sous-titres.json";

export const FPS = 30;
export const DUREE_SECONDES = 765.18; // ordre des morceaux : (1), (2), (3), (5), (6), (7), (9)

// Fichier source : le vlog en qualité d'origine (1920×1080), reçu par SwissTransfer
export const SOURCE = "vlog/vlog-original.mp4";

// Heures jaunes déjà incrustées dans le vlog (repérées automatiquement), en secondes.
// Notre badge apparaît un peu avant et disparaît un peu après pour bien les cacher.
const HEURES: Array<{ debut: number; fin: number } & HeureProps> = [
  { debut: 0.6, fin: 5.73, heures: "4", minutes: "45" },
  { debut: 10.97, fin: 16.13, heures: "9", minutes: "20", avion: true },
  { debut: 380.97, fin: 383.67, heures: "17", minutes: "56" },
  { debut: 410.43, fin: 413.13, heures: "18", minutes: "47" },
];
// Cartes titres validées le 2026-11-05 (début en secondes, calé sur la phrase qui ouvre la partie)
const CARTES: Array<{ debut: number } & CarteTitreProps> = [
  { debut: 25.2, intro: "Étape 1", blanc: "Le", couleur: "Vatican" },
  { debut: 58.1, intro: "Crash test", blanc: "Pizza", couleur: "italienne" },
  { debut: 216.4, intro: "Dégustation", blanc: "Le", couleur: "tiramisu" },
  { debut: 310.1, intro: "Dégustation", blanc: "Le dessert au", couleur: "citron" },
  { debut: 415.4, intro: "Retour à l'hôtel", blanc: "Haul des", couleur: "courses" },
  { debut: 584.9, intro: "Test", blanc: "Kinder", couleur: "fruits des bois" },
  { debut: 683.3, intro: "Le match", blanc: "Estathé", couleur: "vs Nestea" },
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
