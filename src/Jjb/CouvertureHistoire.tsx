import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";

// Couverture du Reel « Histoire sponso OSMOSIS » (1080×1920).
// Photo : je souris après avoir noué ma ceinture. Texte en bas, sur le kimono noir,
// dans la zone visible de la grille Instagram (3:4 au centre).
const VIOLET = "#C9A8FF";
export const CouvertureHistoire: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: "Inter, sans-serif" }}>
    <Img src={staticFile("histoire/couverture.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.05)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,5,10,0.92) 0%, rgba(5,5,10,0.82) 30%, rgba(0,0,0,0) 50%)" }} />
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 260, color: "#fff", textAlign: "center" }}>
      <div style={{ display: "inline-block", border: `3px solid ${VIOLET}`, color: VIOLET, fontWeight: 900, fontSize: 38, padding: "8px 26px", borderRadius: 40, letterSpacing: "0.12em" }}>
        OSMOSIS
      </div>
      <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1.0, letterSpacing: "-0.03em", marginTop: 24, textShadow: "0 6px 26px rgba(0,0,0,0.6)" }}>
        Comment je me suis fait <span style={{ color: VIOLET }}>sponso</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 40, marginTop: 22, opacity: 0.92 }}>Première athlète féminine sponsorisée 🖤</div>
    </div>
  </AbsoluteFill>
);
