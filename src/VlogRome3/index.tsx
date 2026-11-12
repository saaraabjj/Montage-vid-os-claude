import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CarteTitre, CarteTitreProps } from "../VlogRome/CarteTitre";
import { Heure, HeureProps } from "../VlogRome/Heure";
import { Segment, SousTitres } from "../VlogRome/SousTitres";
import timeline from "./timeline.json";
import transcription from "./sous-titres.json";

// Vlog Rome, jour 3 (27 octobre, jour de la compétition) : monté par outils/vlog2.py (VLOG_JOUR=3)
export const FPS = 30;
export const DUREE_SECONDES = timeline.duree;

type PlanTimeline = {
  i: number;
  debut: number;
  duree: number;
  son: number;
  voix: boolean;
  coupes: Array<{ a: number; duree: number }>;
};
const PLANS = timeline.plans as PlanTimeline[];
const debutPlan = (i: number) => PLANS[i].debut;

// Cartes titres (même style que le jour 1), posées au début de chaque grande partie
const CARTES: Array<{ plan: number; decalage?: number; duree?: number } & CarteTitreProps> = [
  { plan: 1, intro: "Jour 3", blanc: "Le jour de la", couleur: "compétition" },
  { plan: 7, intro: "IBJJF Rome International Open", blanc: "Premier", couleur: "combat" },
  { plan: 12, intro: "Résultat", blanc: "Médaille", couleur: "d'argent" },
  { plan: 13, intro: "L'après-midi", blanc: "Deuxième", couleur: "combat" },
  { plan: 21, intro: "Après la compète", blanc: "Rome by", couleur: "night" },
  { plan: 28, intro: "Enfin", blanc: "Le tiramisu", couleur: "Two Sizes" },
  { plan: 36, intro: "Dernier arrêt", blanc: "La fontaine de", couleur: "Trevi" },
  { plan: 40, decalage: 11.5, duree: 4.5, intro: "Fin du séjour", blanc: "Merci", couleur: "Rome" },
];
const DUREE_CARTE = 2.2;

const HEURES: Array<{ plan: number; a: number; duree: number } & HeureProps> = [];

// Musique douce : présente sous les images, elle baisse quand je parle
const VOL_MUSIQUE = 0.32;
const VOL_SOUS_VOIX = 0.07;
const RAMPE = 0.5; // s
const ZONES_VOIX = PLANS.filter((p) => p.voix).map((p) => ({ debut: p.debut, fin: p.debut + p.duree }));

const volumeMusique = (t: number) => {
  let v = VOL_MUSIQUE;
  for (const z of ZONES_VOIX) {
    const entree = interpolate(t, [z.debut - RAMPE, z.debut], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const sortie = interpolate(t, [z.fin - RAMPE, z.fin], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const dedans = Math.min(entree, sortie);
    v = Math.min(v, VOL_MUSIQUE - (VOL_MUSIQUE - VOL_SOUS_VOIX) * dedans);
  }
  // fondu de fin
  return v * interpolate(t, [DUREE_SECONDES - 4, DUREE_SECONDES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

const fichier = (i: number, k?: number) =>
  staticFile(`vlog3/plans/${String(i).padStart(3, "0")}${k === undefined ? "" : `-c${k}`}.mp4`);

export const VlogRome3: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {PLANS.map((p) => (
        <Sequence key={p.i} from={f(p.debut)} durationInFrames={f(p.debut + p.duree) - f(p.debut)} name={`Plan ${p.i}`}>
          <OffthreadVideo src={fichier(p.i)} volume={p.son} />
          {p.coupes.map((c, k) => (
            <Sequence key={k} from={f(c.a)} durationInFrames={f(c.duree)} name={`Coupe ${p.i}.${k}`}>
              <OffthreadVideo src={fichier(p.i, k)} muted />
            </Sequence>
          ))}
        </Sequence>
      ))}
      {HEURES.map((h) => {
        const debut = debutPlan(h.plan) + h.a;
        return (
          <Sequence key={`h${h.plan}`} from={f(debut)} durationInFrames={f(h.duree)} name={`Heure ${h.heures}h${h.minutes ?? ""}`}>
            <Heure heures={h.heures} minutes={h.minutes} />
          </Sequence>
        );
      })}
      {CARTES.map((c) => (
        <Sequence
          key={`c${c.plan}`}
          from={f(debutPlan(c.plan) + (c.decalage ?? 0))}
          durationInFrames={f(c.duree ?? DUREE_CARTE)}
          name={`Carte ${c.blanc} ${c.couleur}`}
        >
          <CarteTitre intro={c.intro} blanc={c.blanc} couleur={c.couleur} />
        </Sequence>
      ))}
      <SousTitres
        segments={transcription as Segment[]}
        zonesOccupees={HEURES.map((h) => ({ debut: debutPlan(h.plan) + h.a, fin: debutPlan(h.plan) + h.a + h.duree }))}
      />
      <Audio src={staticFile("vlog3/musique.wav")} volume={(fr) => volumeMusique(fr / fps)} />
    </AbsoluteFill>
  );
};
