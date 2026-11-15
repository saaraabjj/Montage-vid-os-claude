import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DA } from "../VlogRome/theme";
import { Carte, Pastille } from "../VlogRome/Miniatures";
import "@fontsource/inter/900.css";

// Miniatures du vlog Rome jour 4 (dernier jour) : même mise en page que le jour 1.
const img = (n: string) => staticFile(`miniature/j4-${n}.jpg`);

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
    <div style={{ color: "#fff" }}>Le dernier</div>
    <div style={{ color: DA.accentClair }}>jour</div>
    <div style={{ color: "#fff" }}>à Rome</div>
  </div>
);

const SOUS_TITRE = "Place d’Espagne · Giolitti · retour";

export const MiniatureYouTubeJ4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img src={img("selfie")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", filter: "saturate(1.12)" }} />
    <AbsoluteFill
      style={{
        background: "linear-gradient(90deg, rgba(10,12,22,0.92) 0%, rgba(10,12,22,0.72) 36%, rgba(10,12,22,0.05) 62%)",
      }}
    />
    <Carte src={img("glace")} position="50% 60%" rotation={-5} style={{ left: 760, bottom: 50, width: 300, height: 380 }} />
    <Carte src={img("avion")} position="50% 45%" rotation={4} style={{ left: 1090, bottom: 40, width: 300, height: 380 }} />
    <div style={{ position: "absolute", left: 90, top: 90 }}>
      <Pastille taille={46}>VLOG ROME · JOUR 4</Pastille>
    </div>
    <div style={{ position: "absolute", left: 85, top: 210 }}>
      <Titre taille={180} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 92,
        bottom: 90,
        color: "rgba(255,255,255,0.9)",
        fontWeight: 700,
        fontSize: 46,
        textShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}
    >
      {SOUS_TITRE}
    </div>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 60, top: 50, width: 160, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

export const MiniatureInstaJ4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img src={img("selfie")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 50%", filter: "saturate(1.1)" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(10,12,22,0.35) 0%, rgba(10,12,22,0) 18%, rgba(10,12,22,0) 50%, rgba(10,12,22,0.88) 66%, rgba(10,12,22,0.96) 100%)",
      }}
    />
    <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 450, top: 80, width: 180, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
    <Carte src={img("glace")} position="50% 60%" rotation={-7} style={{ left: 60, top: 1010, width: 300, height: 380 }} />
    <Carte src={img("avion")} position="50% 45%" rotation={6} style={{ right: 60, top: 1000, width: 300, height: 380 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Pastille taille={40}>VLOG ROME · JOUR 4</Pastille>
      <Titre taille={140} align="center" />
      <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 42 }}>{SOUS_TITRE}</div>
    </div>
  </AbsoluteFill>
);
