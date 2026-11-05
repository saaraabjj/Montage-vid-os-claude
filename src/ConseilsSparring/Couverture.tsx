import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";

// Couverture (miniature) de la vidéo conseils sparring, 1080×1920.
// Le texte reste dans la zone centrale 3:4 (y ≈ 240–1680), visible dans la grille du profil.
const ACCENT = "#FFD23F";
const ombre = "drop-shadow(0 8px 20px rgba(0,0,0,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))";

export const Couverture: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "black", fontFamily: "Inter, sans-serif" }}>
      {/* Image fixe : le doigt levé, regard caméra (24 s) */}
      <Img src={staticFile("video2/couverture.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Assombrit le bas pour faire ressortir le titre */}
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.75) 100%)" }}
      />
      <AbsoluteFill style={{ top: 1050, alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            background: ACCENT,
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
          Conseil JJB
        </div>
        <div style={{ fontWeight: 700, fontSize: 92, lineHeight: 1.05, letterSpacing: "-0.03em", color: "white", filter: ombre }}>
          Arrête de vouloir
        </div>
        <div style={{ fontWeight: 900, fontSize: 230, lineHeight: 1, letterSpacing: "-0.04em", color: ACCENT, filter: ombre }}>
          GAGNER
        </div>
        <div style={{ fontWeight: 700, fontSize: 92, lineHeight: 1.05, letterSpacing: "-0.03em", color: "white", filter: ombre }}>
          tes sparrings
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
