import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DA } from "./theme";

export type CarteTitreProps = {
  intro: string; // petite ligne au-dessus (ex. « Dégustation »)
  blanc: string; // début du titre, en blanc
  couleur: string; // fin du titre, en couleur d'accent
};

// Carte titre de la DA : l'image se floute, petite ligne d'intro,
// puis le titre en blanc + couleur d'accent. Environ 2 secondes.
export const CarteTitre: React.FC<CarteTitreProps> = ({ intro, blanc, couleur }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fond = interpolate(
    frame,
    [0, 7, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const ligne = (retard: number) => {
    const s = spring({ frame: frame - retard, fps, config: { damping: 200 }, durationInFrames: 12 });
    const sortie = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      opacity: s * (1 - sortie),
      transform: `translateY(${(1 - s) * 36 - sortie * 20}px)`,
    };
  };

  return (
    <AbsoluteFill>
      <Audio src={staticFile("sons/pop.wav")} volume={0.6} />
      <AbsoluteFill
        style={{
          backdropFilter: `blur(${fond * 28}px)`,
          WebkitBackdropFilter: `blur(${fond * 28}px)`,
          backgroundColor: `rgba(12, 12, 18, ${fond * 0.38})`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: DA.police,
          textAlign: "center",
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            ...ligne(2),
            color: "rgba(255,255,255,0.78)",
            fontWeight: 500,
            fontSize: 46,
            marginBottom: 10,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {intro}
        </div>
        <div
          style={{
            ...ligne(5),
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            textShadow: "0 6px 28px rgba(0,0,0,0.45)",
            maxWidth: 1500,
          }}
        >
          <span style={{ color: DA.blanc }}>{blanc} </span>
          <span style={{ color: DA.accentClair }}>{couleur}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
