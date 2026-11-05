import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { Heure, HeureProps } from "./Heure";

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
    </AbsoluteFill>
  );
};
