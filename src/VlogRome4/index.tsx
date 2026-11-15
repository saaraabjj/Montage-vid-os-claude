import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  useCurrentFrame,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CarteTitre, CarteTitreProps } from "../VlogRome/CarteTitre";
import { Heure, HeureProps } from "../VlogRome/Heure";
import { Segment, SousTitres } from "../VlogRome/SousTitres";
import timeline from "./timeline.json";
import transcription from "./sous-titres.json";

// Vlog Rome, jour 4 (28 octobre, dernier jour) : monté par outils/vlog2.py (VLOG_JOUR=4)
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
  { plan: 2, intro: "Jour 4", blanc: "Le dernier", couleur: "jour" },
  { plan: 5, intro: "Matinée", blanc: "La place", couleur: "d'Espagne" },
  { plan: 17, intro: "Giolitti", blanc: "La glace", couleur: "italienne" },
  { plan: 24, intro: "Le retour", blanc: "Direction", couleur: "l'aéroport" },
  { plan: 33, intro: "Rome", blanc: "Arrivederci", couleur: "Roma" },
  { plan: 37, decalage: 4.5, duree: 5, intro: "Fin du voyage", blanc: "Merci d'avoir", couleur: "suivi" },
];
// Légendes écrites (texte court posé sur l'image)
const LEGENDES: Array<{ plan: number; a: number; duree: number; lignes: string[] }> = [];

const Legende: React.FC<{ lignes: string[] }> = ({ lignes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  const sortie = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 120, pointerEvents: "none" }}>
      <div
        style={{
          opacity: s * sortie,
          transform: `translateY(${(1 - s) * -20}px)`,
          background: "rgba(14,14,20,0.82)",
          borderRadius: 28,
          padding: "18px 40px",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        {lignes.map((l, i) => (
          <div key={i} style={{ color: i === 0 ? "#fff" : "#9DB8F0", fontWeight: i === 0 ? 800 : 700, fontSize: i === 0 ? 54 : 44, lineHeight: 1.2 }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const DUREE_CARTE = 2.2;

const HEURES: Array<{ plan: number; a: number; duree: number } & HeureProps> = [
  { plan: 0, a: 0.3, duree: 3.5, heures: "10", minutes: "30" },
  { plan: 25, a: 0.3, duree: 4.0, heures: "13", minutes: "15" },
  { plan: 34, a: 0.3, duree: 4.0, heures: "17", minutes: "00" },
];

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
  staticFile(`vlog4/plans/${String(i).padStart(3, "0")}${k === undefined ? "" : `-c${k}`}.mp4`);

export const VlogRome4: React.FC = () => {
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
      {LEGENDES.map((l) => (
        <Sequence key={`l${l.plan}`} from={f(debutPlan(l.plan) + l.a)} durationInFrames={f(l.duree)} name={`Légende ${l.lignes[0]}`}>
          <Legende lignes={l.lignes} />
        </Sequence>
      ))}
      <SousTitres
        segments={transcription as Segment[]}
        zonesOccupees={HEURES.map((h) => ({ debut: debutPlan(h.plan) + h.a, fin: debutPlan(h.plan) + h.a + h.duree }))}
      />
      <Audio src={staticFile("vlog4/musique.wav")} volume={(fr) => volumeMusique(fr / fps)} />
    </AbsoluteFill>
  );
};
