import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SERIE } from "./theme";

// Couverture d'un épisode (1080×1920). Le texte reste dans la zone centrale 3:4,
// visible dans la grille du profil.
export type CouvertureProps = {
  episode: number;
  image: string; // image fixe dans public/ (extraite de la vidéo)
  ligne1: string;
  motCle: string;
  ligne3: string;
};

const ombre = "drop-shadow(0 8px 20px rgba(0,0,0,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))";

export const CouvertureJournal: React.FC<CouvertureProps> = ({ episode, image, ligne1, motCle, ligne3 }) => {
  const tailleCle = Math.min(230, Math.floor(1000 / (0.62 * Math.max(motCle.length, 1))));
  return (
    <AbsoluteFill style={{ background: "black", fontFamily: SERIE.police }}>
      <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.6) 62%, rgba(0,0,0,0.78) 100%)" }}
      />
      {/* Signature de la série, en haut de la zone visible */}
      <AbsoluteFill style={{ top: 270, alignItems: "center", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 50, color: SERIE.blanc, filter: ombre, letterSpacing: "-0.02em" }}>
          {SERIE.titre1}
        </div>
        <div style={{ fontWeight: 600, fontSize: 42, color: SERIE.accent, filter: ombre }}>{SERIE.titre2}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1040, alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            background: SERIE.accent,
            color: "#111",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: "0.06em",
            padding: "12px 30px",
            borderRadius: 40,
            marginBottom: 26,
            textTransform: "uppercase",
          }}
        >
          Épisode {episode}
        </div>
        <div style={{ fontWeight: 700, fontSize: 92, lineHeight: 1.05, letterSpacing: "-0.03em", color: SERIE.blanc, filter: ombre }}>
          {ligne1}
        </div>
        <div style={{ fontWeight: 900, fontSize: tailleCle, lineHeight: 1, letterSpacing: "-0.04em", color: SERIE.accent, filter: ombre }}>
          {motCle}
        </div>
        <div style={{ fontWeight: 700, fontSize: 92, lineHeight: 1.05, letterSpacing: "-0.03em", color: SERIE.blanc, filter: ombre }}>
          {ligne3}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
