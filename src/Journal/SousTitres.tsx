import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Mot, SERIE } from "./theme";

// Sous-titres style A (DA.md) : un mot à la fois, en très gros, dégradé argenté ;
// mots-clés en jaune avec un « pop » plus marqué. Le mot suivant s'affiche en petit.
// `decalage` = temps de la vidéo d'origine au début de la séquence (s).
const motActif = (mots: Mot[], t: number) => {
  for (let i = mots.length - 1; i >= 0; i--) {
    if (t >= mots[i].debut) {
      const suivant = mots[i + 1]?.debut ?? Infinity;
      return t < Math.min(suivant, mots[i].fin + 0.5) ? i : -1;
    }
  }
  return -1;
};

const taillePour = (mot: string, cle: boolean) =>
  Math.min(cle ? 200 : 165, Math.floor(980 / (0.56 * Math.max(mot.length, 1))));

export const SousTitres: React.FC<{ mots: Mot[]; decalage: number; top?: number }> = ({
  mots,
  decalage,
  top = 1180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + decalage;
  const i = motActif(mots, t);
  if (i < 0) return null;

  const m = mots[i];
  const depuis = Math.round((t - m.debut) * fps);
  const pop = spring({ frame: depuis, fps, config: { damping: m.cle ? 10 : 200 }, durationInFrames: m.cle ? 10 : 3 });
  const echelle = (m.cle ? 0.8 : 0.9) + (m.cle ? 0.2 : 0.1) * pop;
  const suivant = mots[i + 1];
  const montrerSuivant = suivant && suivant.debut - m.fin < 0.4;

  return (
    <AbsoluteFill style={{ top, alignItems: "center", fontFamily: SERIE.police }}>
      <div style={{ position: "relative", transform: `scale(${echelle})` }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: taillePour(m.mot, m.cle),
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            ...(m.cle
              ? { color: SERIE.accent }
              : {
                  backgroundImage: "linear-gradient(180deg, #FFFFFF 35%, #C9D0DC 100%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }),
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
          }}
        >
          {m.mot}
        </div>
        {montrerSuivant && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 6,
              fontWeight: 600,
              fontSize: 50,
              color: "rgba(255,255,255,0.7)",
              whiteSpace: "nowrap",
              textShadow: "0 3px 10px rgba(0,0,0,0.6)",
            }}
          >
            {suivant.mot}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
