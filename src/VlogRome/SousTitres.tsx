import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DA } from "./theme";

export type Mot = { m: string; d: number; f: number };
export type Segment = { debut: number; fin: number; texte: string; mots: Mot[] };
type Bloc = { debut: number; fin: number; mots: Mot[] };

// Règles de la DA (adaptation YouTube) : 3 à 6 mots à la fois, en bas, centré,
// le mot prononcé surligné en bleu ceinture.
const MAX_MOTS = 6;
const MAX_CARACTERES = 34;
const PAUSE_COUPURE = 0.6; // s : un silence plus long commence un nouveau bloc
const PROLONGER_MAX = 0.5; // s : un bloc reste affiché un peu après le dernier mot

export function decouper(segments: Segment[]): Bloc[] {
  const blocs: Bloc[] = [];
  for (const seg of segments) {
    let courant: Mot[] = [];
    const fermer = () => {
      if (courant.length) {
        blocs.push({ debut: courant[0].d, fin: courant[courant.length - 1].f, mots: courant });
      }
      courant = [];
    };
    for (const mot of seg.mots) {
      const texte = mot.m.trim();
      if (!texte) continue;
      const precedent = courant[courant.length - 1];
      // Morceau collé au mot d'avant (ex. « J » + « 'ai ») : on les réunit
      if (precedent && !/^\s/.test(mot.m)) {
        precedent.m += texte;
        precedent.f = mot.f;
        continue;
      }
      const longueur = courant.map((x) => x.m.trim()).join(" ").length + texte.length + 1;
      if (
        precedent &&
        (courant.length >= MAX_MOTS ||
          longueur > MAX_CARACTERES ||
          mot.d - precedent.f > PAUSE_COUPURE ||
          /[.!?…]$/.test(precedent.m.trim()))
      ) {
        fermer();
      }
      courant.push({ ...mot, m: texte });
    }
    fermer();
  }
  // Chaque bloc reste affiché jusqu'au suivant si l'écart est court
  for (let i = 0; i < blocs.length; i++) {
    const suivant = blocs[i + 1];
    const limite = suivant ? suivant.debut : Infinity;
    blocs[i].fin = Math.min(blocs[i].fin + PROLONGER_MAX, limite);
  }
  return blocs;
}

export const SousTitres: React.FC<{
  segments: Segment[];
  // Moments où un badge d'heure occupe le bas à droite : on remonte les sous-titres
  zonesOccupees: Array<{ debut: number; fin: number }>;
}> = ({ segments, zonesOccupees }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const blocs = useMemo(() => decouper(segments), [segments]);

  const bloc = blocs.find((b) => t >= b.debut && t < b.fin);
  if (!bloc) return null;

  const occupe = zonesOccupees.some((z) => t >= z.debut - 0.3 && t < z.fin + 0.4);
  const apparition = interpolate(t, [bloc.debut, bloc.debut + 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: occupe ? 270 : 90,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 0,
          rowGap: 6,
          fontFamily: DA.police,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: DA.blanc,
          opacity: apparition,
          transform: `translateY(${(1 - apparition) * 10}px)`,
        }}
      >
        {bloc.mots.map((mot, i) => {
          const actif = t >= mot.d && t < (bloc.mots[i + 1]?.d ?? bloc.fin);
          return (
            <span
              key={i}
              style={{
                padding: "2px 9px",
                borderRadius: 14,
                background: actif ? DA.accent : "transparent",
                textShadow: actif
                  ? "none"
                  : "0 0 3px rgba(0,0,0,0.9), 0 3px 10px rgba(0,0,0,0.75), 0 0 1px #000",
                boxShadow: actif ? "0 6px 18px rgba(0,0,0,0.35)" : "none",
              }}
            >
              {mot.m}
            </span>
          );
        })}
      </div>
    </div>
  );
};
