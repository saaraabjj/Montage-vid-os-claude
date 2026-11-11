import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/800.css";
import montages from "./montages.json";

export const FPS = 25;

type Plan = {
  rush: string;
  entree: number;
  duree: number; // durée À L'ÉCRAN, en secondes
  vitesse?: number;
  son?: number; // volume du son du plan (0–1)
  note?: string;
};
type Texte = { debut: number; duree: number; haut: string; bas: string };
type Montage = {
  format: string;
  musique: string;
  volumeMusique: number;
  plans: Plan[];
  textes?: Texte[];
  fin?: number; // début de la carte de fin (s)
  texteFin?: string;
};

const M = montages as unknown as Record<string, Montage>;

export const dureeMontage = (id: string) => {
  const m = M[id];
  return Math.max(1, Math.round(m.plans.reduce((a, p) => a + p.duree, 0) * FPS));
};

const Titre: React.FC<{ haut: string; bas: string }> = ({ haut, bas }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = interpolate(f, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const espace = interpolate(f, [0, durationInFrames], [0.32, 0.42]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: op }}>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
          color: "white",
          textShadow: "0 4px 30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontWeight: 500, fontSize: 30, letterSpacing: `${espace}em`, opacity: 0.85 }}>
          {haut}
        </div>
        <div style={{ fontWeight: 800, fontSize: 96, letterSpacing: "0.04em", marginTop: 6 }}>{bas}</div>
      </div>
    </AbsoluteFill>
  );
};

// Fin : la dernière image reste, s'assombrit, et le nom du compte apparaît sobrement.
const CarteFin: React.FC<{ texte: string }> = ({ texte }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ombre = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const txt = interpolate(f, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noir = interpolate(f, [durationInFrames - 14, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(6,6,8,${0.55 * ombre})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: txt,
            transform: `translateY(${(1 - txt) * 16}px)`,
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            color: "white",
            fontSize: 72,
            letterSpacing: "0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          {texte}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${noir})` }} />
    </AbsoluteFill>
  );
};

export const MontageJjb: React.FC<{ id: string }> = ({ id }) => {
  const m = M[id];
  let t = 0;
  const seqs = m.plans.map((p, i) => {
    const debut = Math.round(t * FPS);
    t += p.duree;
    const fin = Math.round(t * FPS);
    return (
      <Sequence key={i} from={debut} durationInFrames={fin - debut}>
        <OffthreadVideo
          src={staticFile(`jjb/plans/${id}/${String(i).padStart(3, "0")}.mp4`)}
          volume={p.son ?? 0.5}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Sequence>
    );
  });
  const total = Math.round(t * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {seqs}
      {(m.textes ?? []).map((x, i) => (
        <Sequence key={`t${i}`} from={Math.round(x.debut * FPS)} durationInFrames={Math.round(x.duree * FPS)}>
          <Titre haut={x.haut} bas={x.bas} />
        </Sequence>
      ))}
      {m.fin !== undefined && (
        <Sequence from={Math.round(m.fin * FPS)} durationInFrames={total - Math.round(m.fin * FPS)}>
          <CarteFin texte={m.texteFin ?? ""} />
        </Sequence>
      )}
      <Audio src={staticFile(m.musique)} volume={m.volumeMusique} />
    </AbsoluteFill>
  );
};
