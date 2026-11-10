import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/800.css";
import plansJson from "./plans.json";

// Montage vertical « Préparation physique JJB » (Reels / TikTok, 1080x1920), v3.
// Uniquement des plans d'exercices, chacun une seule fois (un « b » = la suite de la même prise, en ralenti),
// puis les uchikomi aux cordes. Aucun texte, sauf la phrase finale.
// Plans préparés par scripts/preparer-plans.py, musique et bruitages par scripts/composer-musique.py.
// Accent : bleu ceinture, qui reprend les gants bleus et la lumière froide des projecteurs (cf. SUIVI.md).

type Plan = { id: string; beats: number; speed: number };

export const FPS_PREPA = plansJson.fps;
const BEAT = plansJson.beatFrames;
const PLANS = plansJson.plans as Plan[];

const C = {
  accent: "#5B82D6", // bleu ceinture éclairci, lisible sur fond sombre
  blanc: "#FFFFFF",
  gris: "#B9B2B6",
  police: "Inter, sans-serif",
};

const debuts: number[] = [];
PLANS.reduce((t, p) => {
  debuts.push(t);
  return t + p.beats * BEAT;
}, 0);
export const dureePrepa = () => PLANS.reduce((t, p) => t + p.beats * BEAT, 0);
const debutDe = (id: string) => debuts[PLANS.findIndex((p) => p.id === id)];

const PlanVideo: React.FC<{ plan: Plan; duree: number }> = ({ plan, duree }) => {
  const frame = useCurrentFrame();
  // très légère poussée vers l'avant, pour donner de la vie sans effet visible
  const zoom = interpolate(frame, [0, duree], [1, 1.035]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <OffthreadVideo
        muted
        src={staticFile(`jjb/plans/${plan.id}.mp4`)}
        style={{ width: 1080, height: 1920, transform: `scale(${zoom})` }}
      />
    </AbsoluteFill>
  );
};

// Seul texte de la vidéo : logo et phrase finale, posés sur le dernier ralenti (pas de carte à part)
const LogoFinal: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const sombre = interpolate(frame, [0, 12], [0, 0.45], { extrapolateRight: "clamp" });
  const logo = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const texte = (i: number) => interpolate(frame, [8 + i * 4, 16 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noir = interpolate(frame, [duree - 8, duree], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${sombre}) 0%, rgba(0,0,0,${sombre * 0.4}) 55%, rgba(0,0,0,${sombre}) 100%)` }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260, fontFamily: C.police, textAlign: "center", textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
        <Img src={staticFile("logo.png")} style={{ width: 300, opacity: logo, transform: `scale(${0.92 + 0.08 * logo})`, marginBottom: 36 }} />
        <div style={{ opacity: texte(0), color: C.blanc, fontWeight: 800, fontSize: 100, letterSpacing: -2, lineHeight: 1.04 }}>La discipline</div>
        <div style={{ opacity: texte(1), color: C.blanc, fontWeight: 800, fontSize: 100, letterSpacing: -2, lineHeight: 1.04 }}>forge la</div>
        <div style={{ opacity: texte(2), color: C.accent, fontWeight: 800, fontSize: 100, letterSpacing: -2, lineHeight: 1.04 }}>combattante.</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: noir }} />
    </AbsoluteFill>
  );
};

// Éclair blanc très court (les projecteurs) sur les drops de la musique
const Eclair: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 5], [0.8, 0.45, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

export const PrepaJJB: React.FC = () => {
  const frame = useCurrentFrame();
  const ouverture = interpolate(frame, [0, 6], [1, 0], { extrapolateRight: "clamp" });
  const dernier = PLANS[PLANS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {PLANS.map((p, i) => {
        const duree = p.beats * BEAT;
        return (
          <Sequence key={p.id} from={debuts[i]} durationInFrames={duree}>
            <PlanVideo plan={p} duree={duree} />
            {/* son direct (poids, cordes, souffle), discret sous la musique */}
            <Audio src={staticFile(`jjb/sons/${p.id}.wav`)} volume={p.speed < 1 ? 0.35 : 0.28} />
          </Sequence>
        );
      })}

      {/* éclairs sur les drops de la musique */}
      {["e02a", "e04a", "e06a"].map((id) => (
        <Sequence key={`e${id}`} from={debutDe(id)} durationInFrames={6}>
          <Eclair />
        </Sequence>
      ))}

      <Sequence from={debutDe(dernier.id)} durationInFrames={dernier.beats * BEAT}>
        <LogoFinal duree={dernier.beats * BEAT} />
      </Sequence>

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: ouverture }} />

      <Audio src={staticFile("jjb/musique.wav")} volume={0.85} />
      <Audio src={staticFile("jjb/bruitages.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
