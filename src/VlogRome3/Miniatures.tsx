import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DA } from "../VlogRome/theme";
import { Carte, Pastille } from "../VlogRome/Miniatures";
import "@fontsource/inter/900.css";

// Miniatures du vlog Rome jour 3 (compétition) : même mise en page que le jour 1.
const img = (n: string) => staticFile(`miniature/j3-${n}.jpg`);

const Titre: React.FC<{ taille: number; align?: "left" | "center" }> = ({ taille, align = "left" }) => (
  <div
    style={{
      fontWeight: 900,
      fontSize: taille,
      lineHeight: 0.92,
      letterSpacing: "-0.045em",
      textAlign: align,
      textShadow: "0 8px 40px rgba(0,0,0,0.6)",
    }}
  >
    <div style={{ color: "#fff" }}>Médaille</div>
    <div style={{ color: DA.accentClair }}>d'argent</div>
    <div style={{ color: "#fff" }}>à Rome</div>
  </div>
);

const SOUS_TITRE = "IBJJF Rome International Open";

export const MiniatureYouTubeJ3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img
      src={img("salle")}
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15)", transform: "scale(1.15)", transformOrigin: "80% 30%" }}
    />
    <AbsoluteFill
      style={{
        background: "linear-gradient(90deg, rgba(10,12,22,0.92) 0%, rgba(10,12,22,0.75) 38%, rgba(10,12,22,0.1) 70%)",
      }}
    />
    <Carte src={img("medaille")} position="50% 30%" rotation={3} style={{ right: 90, top: 70, width: 640, height: 760 }} />
    <Carte src={img("podium")} position="50% 55%" rotation={-6} style={{ right: 560, bottom: 60, width: 400, height: 300 }} />
    <Carte src={img("drapeau")} position="50% 35%" rotation={5} style={{ right: 80, bottom: 50, width: 400, height: 300 }} />
    <div style={{ position: "absolute", left: 90, top: 90 }}>
      <Pastille taille={46}>VLOG ROME · JOUR 3</Pastille>
    </div>
    <div style={{ position: "absolute", left: 85, top: 210 }}>
      <Titre taille={190} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 92,
        bottom: 90,
        color: "rgba(255,255,255,0.9)",
        fontWeight: 700,
        fontSize: 52,
        textShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}
    >
      {SOUS_TITRE}
    </div>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 920, top: 60, width: 170, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

export const MiniatureInstaJ3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img src={img("salle")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 50%" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(10,12,22,0.2) 0%, rgba(10,12,22,0.35) 30%, rgba(10,12,22,0.9) 62%, rgba(10,12,22,0.95) 100%)",
      }}
    />
    <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 440, top: 90, width: 200, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
    <Carte src={img("medaille")} position="50% 30%" rotation={-3} style={{ left: 170, top: 330, width: 740, height: 600 }} />
    <Carte src={img("podium")} position="50% 55%" rotation={-7} style={{ left: 50, top: 820, width: 380, height: 270 }} />
    <Carte src={img("drapeau")} position="50% 35%" rotation={6} style={{ right: 50, top: 800, width: 380, height: 270 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <Pastille taille={40}>VLOG ROME · JOUR 3</Pastille>
      <Titre taille={150} align="center" />
      <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 44 }}>{SOUS_TITRE}</div>
    </div>
  </AbsoluteFill>
);
