import React from "react";
import { SERIE } from "./theme";

// Jauge en forme de ceinture : la bande se remplit du bleu vers le violet,
// et le bout noir porte les barrettes (0 à 4), comme une vraie ceinture de JJB.
export const Ceinture: React.FC<{
  remplissage: number; // 0–100
  barrettes: number; // barrettes visibles (peut être fractionnaire pendant l'animation)
  largeur?: number;
}> = ({ remplissage, barrettes, largeur = 900 }) => {
  const hauteur = 96;
  const bout = 230; // bout noir
  const bande = largeur - bout;
  return (
    <div
      style={{
        position: "relative",
        width: largeur,
        height: hauteur,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
        display: "flex",
      }}
    >
      {/* Bande : bleu, avec la partie « déjà vers la violette » */}
      <div style={{ position: "relative", width: bande, height: "100%", background: SERIE.bleu }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${remplissage}%`,
            background: `linear-gradient(90deg, ${SERIE.bleuClair}, ${SERIE.violet})`,
            boxShadow: `0 0 30px ${SERIE.violet}`,
          }}
        />
        {/* Repère jaune : où j'en suis (le gag : il bouge à peine d'un épisode à l'autre) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${remplissage}% - 4px)`,
            width: 8,
            background: SERIE.accent,
            boxShadow: `0 0 18px ${SERIE.accent}`,
          }}
        />
        {/* Coutures de la ceinture */}
        {[0.22, 0.42, 0.62, 0.82].map((y) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${y * 100}%`,
              height: 2,
              background: "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
      {/* Bout noir avec les barrettes */}
      <div
        style={{
          width: bout,
          height: "100%",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {[0, 1, 2, 3].map((k) => {
          const visible = Math.max(0, Math.min(1, barrettes - k));
          return (
            <div
              key={k}
              style={{
                width: 22,
                height: hauteur,
                background: "white",
                opacity: 0.12 + 0.88 * visible,
                transform: `scaleY(${0.6 + 0.4 * visible})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
