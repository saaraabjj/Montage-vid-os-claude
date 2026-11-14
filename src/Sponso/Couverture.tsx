import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import { CODE_PROMO } from "./index";

// Couverture Reel (1080×1920) : moi de dos en kimono OSMOSIS sur le tapis du club.
// Le texte est en haut (plafond vide) pour ne pas cacher le logo dans le dos.
const ROUGE = "#E0352B";
export const CouvertureOsmosis: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: "Inter, sans-serif" }}>
    <Img src={staticFile("sponso/couverture-photo2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.08) contrast(1.06)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,20,0.75) 0%, rgba(8,10,20,0.45) 30%, rgba(0,0,0,0) 48%)" }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, color: "#fff" }}>
      <div style={{ display: "inline-block", background: ROUGE, fontWeight: 900, fontSize: 40, padding: "8px 24px", borderRadius: 14, letterSpacing: "0.03em" }}>SPONSO OSMOSIS</div>
      <div style={{ fontWeight: 900, fontSize: 140, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 22, textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        Mon avis<br />
        <span style={{ color: ROUGE }}>honnête</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 46, marginTop: 20, textShadow: "0 3px 14px rgba(0,0,0,0.6)" }}>kimono & rashguards, après 2 semaines</div>
      <div style={{ display: "inline-block", marginTop: 34, background: "#fff", color: ROUGE, fontWeight: 900, fontSize: 50, padding: "12px 30px", borderRadius: 18, border: `4px dashed ${ROUGE}` }}>
        -15 % : {CODE_PROMO}
      </div>
    </div>
  </AbsoluteFill>
);
