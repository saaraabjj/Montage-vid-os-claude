import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Easing,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import plansJson from "./plans.json";

// Montage vertical « Préparation physique JJB » (Reels / TikTok, 1080x1920).
// Les plans sont préparés (recadrage, étalonnage, ralentis) par scripts/preparer-plans.py,
// la musique et les bruitages par scripts/composer-musique.py.
// Accent : bleu ceinture, qui reprend les gants bleus et la lumière froide des projecteurs (cf. SUIVI.md).

type Plan = {
  id: string;
  beats: number;
  speed: number;
  section: string;
  label?: string;
};

export const FPS_PREPA = plansJson.fps;
const BEAT = plansJson.beatFrames;
const PLANS = plansJson.plans as Plan[];

const C = {
  accent: "#5B82D6", // bleu ceinture éclairci, lisible sur fond sombre
  blanc: "#FFFFFF",
  gris: "#B9B2B6",
  police: "Inter, sans-serif",
};

// Début de chaque plan (en images)
const debuts: number[] = [];
PLANS.reduce((t, p) => {
  debuts.push(t);
  return t + p.beats * BEAT;
}, 0);
export const dureePrepa = () => PLANS.reduce((t, p) => t + p.beats * BEAT, 0);
const debutDe = (id: string) => debuts[PLANS.findIndex((p) => p.id === id)];

// Volume du son direct (poids, cordes, souffle) : discret sous la musique, plus présent dans la respiration
const VOLUME_SON: Record<string, number> = { p19: 0.95, p20: 0.6, p01: 0.15, p02: 0.15, p03: 0.2 };

const Plan: React.FC<{ plan: Plan; duree: number }> = ({ plan, duree }) => {
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

// Titre de section : un mot, une fine barre bleue, entrée courte (0,2 s)
const TitreSection: React.FC<{ numero: number; mot: string; duree: number }> = ({ numero, mot, duree }) => {
  const frame = useCurrentFrame();
  const entree = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const sortie = interpolate(frame, [duree - 6, duree], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barre = interpolate(frame, [2, 12], [0, 90], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, opacity: entree * sortie }}>
      <div style={{ transform: `translateY(${(1 - entree) * 24}px)`, textAlign: "center", fontFamily: C.police }}>
        <div style={{ color: C.gris, fontWeight: 500, fontSize: 38, letterSpacing: 6, marginBottom: 10, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
          {String(numero).padStart(2, "0")}
        </div>
        <div style={{ color: C.blanc, fontWeight: 800, fontSize: 124, letterSpacing: -3, lineHeight: 1, textShadow: "0 6px 30px rgba(0,0,0,0.55)" }}>
          {mot}
        </div>
        <div style={{ height: 8, width: barre, background: C.accent, margin: "26px auto 0", borderRadius: 4 }} />
      </div>
    </AbsoluteFill>
  );
};

const TitreIntro: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const ligne = (i: number) => {
    const o = interpolate(frame, [i * 6, i * 6 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: o, transform: `translateY(${(1 - o) * 20}px)` };
  };
  const sortie = interpolate(frame, [duree - 8, duree], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: C.police, textAlign: "center", opacity: sortie, textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ ...ligne(0), color: C.gris, fontWeight: 500, fontSize: 42, marginBottom: 18 }}>Préparation physique · JJB</div>
      <div style={{ ...ligne(1), color: C.blanc, fontWeight: 800, fontSize: 128, letterSpacing: -3, lineHeight: 1.02 }}>Le travail</div>
      <div style={{ ...ligne(2), color: C.accent, fontWeight: 800, fontSize: 128, letterSpacing: -3, lineHeight: 1.02 }}>invisible.</div>
    </AbsoluteFill>
  );
};

const MotFinal: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10, duree - 4, duree], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const espacement = interpolate(frame, [0, duree], [2, 8]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1180, opacity: o }}>
      <div style={{ fontFamily: C.police, color: C.blanc, fontWeight: 900, fontSize: 112, letterSpacing: espacement, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
        Discipline.
      </div>
    </AbsoluteFill>
  );
};

const CarteFin: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const flou = interpolate(frame, [0, 10], [0, 28], { extrapolateRight: "clamp" });
  const sombre = interpolate(frame, [0, 10], [0, 0.55], { extrapolateRight: "clamp" });
  const logo = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const texte = (i: number) => interpolate(frame, [14 + i * 5, 24 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noir = interpolate(frame, [duree - 14, duree], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${flou}px)`, transform: "scale(1.08)" }}>
        <OffthreadVideo muted src={staticFile("jjb/plans/p21.mp4")} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(8,8,12,${sombre})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: C.police, textAlign: "center" }}>
        <Img src={staticFile("logo.png")} style={{ width: 340, opacity: logo, transform: `scale(${0.92 + 0.08 * logo})`, marginBottom: 50 }} />
        <div style={{ opacity: texte(0), color: C.gris, fontWeight: 500, fontSize: 40, marginBottom: 14 }}>Hors des tatamis,</div>
        <div style={{ opacity: texte(1), color: C.blanc, fontWeight: 800, fontSize: 104, letterSpacing: -2, lineHeight: 1.04 }}>chaque séance</div>
        <div style={{ opacity: texte(2), color: C.accent, fontWeight: 800, fontSize: 104, letterSpacing: -2, lineHeight: 1.04 }}>compte.</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: noir }} />
    </AbsoluteFill>
  );
};

// Éclair blanc très court (les projecteurs) sur les grands changements de section
const Eclair: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 5], [0.85, 0.5, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

export const PrepaJJB: React.FC = () => {
  const frame = useCurrentFrame();
  const ouverture = interpolate(frame, [0, 14], [1, 0], { extrapolateRight: "clamp" });
  let numero = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {PLANS.map((p, i) => {
        const duree = p.beats * BEAT;
        if (p.section === "carte") {
          return (
            <Sequence key={p.id} from={debuts[i]} durationInFrames={duree}>
              <CarteFin duree={duree} />
            </Sequence>
          );
        }
        return (
          <Sequence key={p.id} from={debuts[i]} durationInFrames={duree}>
            <Plan plan={p} duree={duree} />
            <Audio src={staticFile(`jjb/sons/${p.id}.wav`)} volume={VOLUME_SON[p.id] ?? 0.32} />
          </Sequence>
        );
      })}

      {/* titres */}
      <Sequence from={debutDe("p02") + 6} durationInFrames={debutDe("p04") - debutDe("p02") - 10}>
        <TitreIntro duree={debutDe("p04") - debutDe("p02") - 10} />
      </Sequence>
      {PLANS.map((p, i) => {
        if (!p.label) return null;
        numero += 1;
        return (
          <Sequence key={`t${p.id}`} from={debuts[i]} durationInFrames={40}>
            <TitreSection numero={numero} mot={p.label} duree={40} />
          </Sequence>
        );
      })}
      <Sequence from={debutDe("p20") - 30} durationInFrames={debutDe("p21") - debutDe("p20") + 30}>
        <MotFinal duree={debutDe("p21") - debutDe("p20") + 30} />
      </Sequence>

      {/* éclairs sur les temps forts de la musique */}
      {["p08", "p12", "p21"].map((id) => (
        <Sequence key={`e${id}`} from={debutDe(id)} durationInFrames={6}>
          <Eclair />
        </Sequence>
      ))}

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: ouverture }} />

      <Audio src={staticFile("jjb/musique.wav")} volume={0.85} />
      <Audio src={staticFile("jjb/bruitages.wav")} volume={0.55} />
    </AbsoluteFill>
  );
};
