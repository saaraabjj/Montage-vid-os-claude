import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";

// Couverture du Reel « Histoire sponso OSMOSIS » (1080×1920).
// Photo : je noue ma ceinture bleue en souriant. Le texte est en haut, en noir sur le
// plafond blanc, pour laisser voir le visage, le kimono et la ceinture
// (et rester dans la zone visible de la grille Instagram, 3:4 au centre).
const VIOLET = "#6E3FD1";
export const CouvertureHistoire: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff", fontFamily: "Inter, sans-serif" }}>
    <Img src={staticFile("histoire/couverture2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 100%", filter: "contrast(1.05) saturate(1.05)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 22%, rgba(255,255,255,0) 32%)" }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 250, color: "#111", textAlign: "center" }}>
      <div style={{ display: "inline-block", border: `3px solid ${VIOLET}`, color: VIOLET, fontWeight: 900, fontSize: 34, padding: "6px 24px", borderRadius: 40, letterSpacing: "0.12em" }}>
        OSMOSIS
      </div>
      <div style={{ fontWeight: 900, fontSize: 74, lineHeight: 1.02, letterSpacing: "-0.03em", marginTop: 16 }}>
        Première athlète féminine <span style={{ color: VIOLET }}>sponsorisée</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 36, marginTop: 12, opacity: 0.85 }}>Comment je me suis faite sponso 🖤</div>
    </div>
  </AbsoluteFill>
);
