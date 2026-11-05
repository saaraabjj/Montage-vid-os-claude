import React from "react";
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DA } from "./theme";

export type HeureProps = {
  heures: string; // ex. "9"
  minutes?: string; // ex. "20"
  avion?: boolean;
};

// Badge d'heure en bas à droite. Il recouvre l'heure jaune déjà incrustée
// dans le vlog : il doit donc être opaque et assez grand pour la cacher.
export const Heure: React.FC<HeureProps> = ({ heures, minutes, avion }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entree = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const sortie = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Les chiffres défilent légèrement à l'entrée
  const texteY = interpolate(frame, [3, 12], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const texteOpacite = interpolate(frame, [3, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <Audio src={staticFile("sons/pop.wav")} volume={0.6} />
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 52,
          minWidth: 500,
          height: 184,
          borderRadius: 56,
          background: DA.fondSombre,
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          paddingLeft: 34,
          paddingRight: 48,
          boxSizing: "border-box",
          fontFamily: DA.police,
          transform: `translateX(${(1 - entree) * 40 + sortie * 40}px) scale(${0.92 + 0.08 * entree})`,
          opacity: Math.min(entree * 3, 1) * (1 - sortie),
          transformOrigin: "right center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 116,
            height: 116,
            borderRadius: 58,
            background: DA.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {avion ? <IconeAvion /> : <IconeHorloge progression={frame / fps} />}
        </div>
        <div
          style={{
            color: DA.blanc,
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            transform: `translateY(${texteY}px)`,
            opacity: texteOpacite,
            display: "flex",
            alignItems: "baseline",
          }}
        >
          {heures}
          <span style={{ color: DA.accentClair, fontSize: 72, margin: "0 4px" }}>h</span>
          {minutes ?? ""}
        </div>
      </div>
    </>
  );
};

const IconeHorloge: React.FC<{ progression: number }> = ({ progression }) => {
  const angle = progression * 90; // l'aiguille tourne doucement
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="6" />
      <line x1="32" y1="32" x2="32" y2="17" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <line
        x1="32"
        y1="32"
        x2="44"
        y2="32"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        transform={`rotate(${angle} 32 32)`}
      />
    </svg>
  );
};

const IconeAvion: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="#fff">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
