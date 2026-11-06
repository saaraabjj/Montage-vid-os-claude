import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DA } from "./theme";
import "@fontsource/inter/900.css";

// Miniatures du vlog Rome (YouTube 16:9 et couverture Instagram 9:16), dans la DA.
const img = (n: string) => staticFile(`miniature/${n}.jpg`);

const Carte: React.FC<{
  src: string;
  style: React.CSSProperties;
  position?: string;
  rotation?: number;
}> = ({ src, style, position = "center", rotation = 0 }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 36,
      overflow: "hidden",
      border: "8px solid #fff",
      boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
      transform: `rotate(${rotation}deg)`,
      ...style,
    }}
  >
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position }} />
  </div>
);

const Pastille: React.FC<{ children: React.ReactNode; taille: number }> = ({ children, taille }) => (
  <div
    style={{
      display: "inline-block",
      background: DA.accent,
      color: "#fff",
      fontWeight: 800,
      fontSize: taille,
      padding: `${taille * 0.28}px ${taille * 0.6}px`,
      borderRadius: taille,
      letterSpacing: "0.02em",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    }}
  >
    {children}
  </div>
);

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
    <div style={{ color: "#fff" }}>J'ai tout</div>
    <div style={{ color: "#fff" }}>goûté à</div>
    <div style={{ color: DA.accentClair }}>Rome</div>
  </div>
);

export const MiniatureYouTube: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img
      src={img("saint-pierre")}
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15)", transform: "scale(1.25)", transformOrigin: "85% 15%" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(90deg, rgba(10,12,22,0.92) 0%, rgba(10,12,22,0.75) 38%, rgba(10,12,22,0.1) 70%)",
      }}
    />
    <Carte src={img("visage")} position="45% 35%" rotation={3} style={{ right: 90, top: 70, width: 640, height: 760 }} />
    <Carte src={img("pizza")} position="75% 30%" rotation={-6} style={{ right: 560, bottom: 60, width: 400, height: 300 }} />
    <Carte src={img("tiramisu")} position="50% 40%" rotation={5} style={{ right: 80, bottom: 50, width: 400, height: 300 }} />
    <div style={{ position: "absolute", left: 90, top: 90 }}>
      <Pastille taille={46}>VLOG ROME · JOUR 1</Pastille>
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
      avant ma compétition de JJB
    </div>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 920, top: 60, width: 170, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

// Couverture Reels : 1080×1920. L'essentiel reste dans la zone centrale 1080×1350
// (le carré / 3:4 affiché sur la grille du profil).
export const MiniatureInsta: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: DA.police }}>
    <Img src={img("saint-pierre")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% 50%" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(10,12,22,0.2) 0%, rgba(10,12,22,0.35) 30%, rgba(10,12,22,0.9) 62%, rgba(10,12,22,0.95) 100%)",
      }}
    />
    <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 440, top: 90, width: 200, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
    <Carte src={img("visage")} position="45% 35%" rotation={-3} style={{ left: 170, top: 330, width: 740, height: 600 }} />
    <Carte src={img("pizza")} position="75% 30%" rotation={-7} style={{ left: 50, top: 820, width: 380, height: 270 }} />
    <Carte src={img("tiramisu")} position="50% 40%" rotation={6} style={{ right: 50, top: 800, width: 380, height: 270 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <Pastille taille={40}>VLOG ROME · JOUR 1</Pastille>
      <Titre taille={150} align="center" />
      <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 44 }}>avant ma compétition de JJB</div>
    </div>
  </AbsoluteFill>
);
