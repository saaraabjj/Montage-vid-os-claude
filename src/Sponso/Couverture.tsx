import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import { CODE_PROMO } from "./index";

// Couverture Reel (1080×1920) de la vidéo OSMOSIS. L'essentiel est dans la zone centrale 1080×1350.
const ROUGE = "#E0352B";
export const CouvertureOsmosis: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: "Inter, sans-serif" }}>
    <Img src={staticFile("sponso/couverture-photo.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.45)", transformOrigin: "52% 50%", filter: "saturate(1.08) contrast(1.05)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(10,10,14,0.55) 55%, rgba(10,10,14,0.92) 80%)" }} />
    <Img src={staticFile("sponso/rash-beige-dos.png")} style={{ position: "absolute", right: 30, top: 640, height: 430, transform: "rotate(8deg)", filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))" }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 1090, color: "#fff" }}>
      <div style={{ display: "inline-block", background: ROUGE, fontWeight: 900, fontSize: 40, padding: "8px 24px", borderRadius: 14, letterSpacing: "0.03em" }}>SPONSO OSMOSIS</div>
      <div style={{ fontWeight: 900, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 22, textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        Mon avis<br />
        <span style={{ color: ROUGE }}>honnête</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 46, marginTop: 20, opacity: 0.92 }}>kimono & rashguards, après 2 semaines</div>
      <div style={{ display: "inline-block", marginTop: 34, background: "#fff", color: ROUGE, fontWeight: 900, fontSize: 50, padding: "12px 30px", borderRadius: 18, border: `4px dashed ${ROUGE}` }}>
        -15 % : {CODE_PROMO}
      </div>
    </div>
  </AbsoluteFill>
);
