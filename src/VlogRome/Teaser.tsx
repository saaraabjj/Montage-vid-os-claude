import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/inter/900.css";
import { DA } from "./theme";
import { SOURCE } from "./index";
import transcription from "./sous-titres.json";
import type { Segment } from "./SousTitres";

// Extrait vertical TikTok / Reels (style A de la DA) qui renvoie vers le vlog complet sur YouTube.
export const FPS_TEASER = 30;

type Clip = { debut: number; fin: number; centreX: number; fond?: boolean };
// Moments choisis dans le vlog (en secondes). centreX = où se trouve ton visage dans l'image (0 = gauche, 1 = droite).
// fond = plan filmé en vertical (bandes noires dans le vlog) : il remplit l'écran tel quel.
const CLIPS: Clip[] = [
  { debut: 129.0, fin: 134.95, centreX: 0.62 }, // 30 minutes de route pour un tiramisu
  { debut: 150.8, fin: 154.75, centreX: 0.56 }, // j'ai un peu le seum
  { debut: 168.8, fin: 172.75, centreX: 0.55 }, // tout ça pour un tiramisu
  { debut: 241.4, fin: 244.8, centreX: 0.5 }, // il est trop beau
  { debut: 266.85, fin: 269.75, centreX: 0.5 }, // il est bon
  { debut: 66.7, fin: 69.0, centreX: 0.5, fond: true }, // la pizza : elle est grave bonne (plan filmé en vertical)
];
const DUREE_FIN = 4.5; // écran final

const MOTS_FORTS = /tiramisu|rome|seum|beau|magnifique|bon|bonne|best/i;

export const dureeTeaser = () =>
  Math.round((CLIPS.reduce((t, c) => t + (c.fin - c.debut), 0) + DUREE_FIN) * FPS_TEASER);

const segments = transcription as Segment[];
const motsDuClip = (c: Clip) =>
  segments
    .flatMap((s) => s.mots)
    .filter((m) => m.d >= c.debut - 0.05 && m.d < c.fin - 0.05)
    .map((m) => ({ ...m, m: m.m.trim(), d: m.d - c.debut, f: Math.min(m.f, c.fin) - c.debut }));

// Réunit les morceaux collés (« J » + « 'ai »)
const fusionner = (mots: ReturnType<typeof motsDuClip>) => {
  const out: typeof mots = [];
  for (const m of mots) {
    const p = out[out.length - 1];
    if (p && /^['’-]/.test(m.m)) {
      p.m += m.m;
      p.f = m.f;
    } else out.push({ ...m });
  }
  return out;
};

// Hauteur de la vidéo au premier plan : moins grand que l'écran (1920) pour garder du décor autour du visage
const HAUTEUR_PLAN = 1200;
const HAUT_PLAN = 300;

const PlanVertical: React.FC<{ clip: Clip }> = ({ clip }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, (clip.fin - clip.debut) * fps], [1, 1.02]);
  const depart = Math.round(clip.debut * fps);
  const largeurPlein = 1920 * (16 / 9);
  if (clip.fond) {
    // Plan filmé en vertical (bandes noires dans le vlog) : il remplit l'écran tel quel
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
        <OffthreadVideo src={staticFile(SOURCE)} startFrom={depart}
          style={{ position: "absolute", height: 1920, width: largeurPlein, left: (1080 - largeurPlein) / 2, top: 0, transform: `scale(${zoom})` }} />
      </AbsoluteFill>
    );
  }
  const largeur = HAUTEUR_PLAN * (16 / 9);
  const gauche = Math.min(0, Math.max(1080 - largeur, 540 - clip.centreX * largeur));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {/* Fond : la même image, floutée, pour remplir le haut et le bas */}
      <OffthreadVideo muted src={staticFile(SOURCE)} startFrom={depart}
        style={{ position: "absolute", height: 1920, width: largeurPlein, left: 540 - clip.centreX * largeurPlein, top: 0,
          filter: "blur(45px) brightness(0.55) saturate(1.2)", transform: "scale(1.15)" }} />
      <div style={{ position: "absolute", left: 0, top: HAUT_PLAN, width: 1080, height: HAUTEUR_PLAN, overflow: "hidden",
        boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>
        <OffthreadVideo src={staticFile(SOURCE)} startFrom={depart}
          style={{ position: "absolute", height: HAUTEUR_PLAN, width: largeur, left: gauche, top: 0, transform: `scale(${zoom})` }} />
      </div>
    </AbsoluteFill>
  );
};

const MotGeant: React.FC<{ clip: Clip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const mots = fusionner(motsDuClip(clip));
  const i = mots.findIndex((m, k) => t >= m.d && t < (mots[k + 1]?.d ?? clip.fin - clip.debut));
  if (i < 0) return null;
  const mot = mots[i];
  const suivant = mots[i + 1];
  const pop = spring({ frame: frame - Math.round(mot.d * fps), fps, config: { damping: 14, stiffness: 260 }, durationInFrames: 6 });
  const fort = MOTS_FORTS.test(mot.m);
  const texte = mot.m.replace(/[.,!?…]+$/, (p) => (p === "," ? "," : p));
  const taille = texte.length > 12 ? 100 : texte.length > 8 ? 124 : 168;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1300, textAlign: "center", fontFamily: DA.police }}>
      <div
        style={{
          display: "inline-block",
          fontWeight: 900,
          fontSize: taille,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          transform: `scale(${0.85 + 0.15 * pop})`,
          backgroundImage: fort
            ? `linear-gradient(180deg, #A9C2FF 0%, ${DA.accentClair} 55%, ${DA.accent} 100%)`
            : "linear-gradient(180deg, #FFFFFF 0%, #EDEFF5 45%, #B9C1D3 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.65))",
        }}
      >
        {texte}
      </div>
      {suivant ? (
        <div style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600, fontSize: 50, marginTop: 6, textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>
          {suivant.m}
        </div>
      ) : null}
    </div>
  );
};

const Pilule: React.FC<{ texte: string; sombre?: boolean }> = ({ texte, sombre }) => (
  <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "12px 34px 12px 14px",
        borderRadius: 60,
        background: sombre ? "rgba(18,18,22,0.92)" : "rgba(255,255,255,0.95)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        fontFamily: DA.police,
        fontWeight: 800,
        fontSize: 34,
        color: sombre ? "#fff" : "#16141A",
      }}
    >
      <Img src={staticFile("logo-petit.png")} style={{ width: 70 }} />
      {texte}
    </div>
  </div>
);

const EcranFin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ligne = (r: number) => {
    const s = spring({ frame: frame - r, fps, config: { damping: 200 }, durationInFrames: 14 });
    return { opacity: s, transform: `translateY(${(1 - s) * 50}px)` };
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0E0E14", fontFamily: DA.police, alignItems: "center", justifyContent: "center" }}>
      <Audio src={staticFile("sons/pop.wav")} volume={0.7} />
      <Img src={staticFile("miniature/tiramisu.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.45)", transform: "scale(1.2)" }} />
      <div style={{ ...ligne(0), position: "absolute", top: 360 }}>
        <Img src={staticFile("logo.png")} style={{ width: 260 }} />
      </div>
      <div style={{ ...ligne(4), color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 54, marginBottom: 20 }}>Alors, il était bon ?</div>
      <div style={{ ...ligne(8), textAlign: "center", fontWeight: 900, fontSize: 128, lineHeight: 0.98, letterSpacing: "-0.04em", textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ color: "#fff" }}>Le vlog complet</div>
        <div style={{ color: DA.accentClair }}>sur YouTube</div>
      </div>
      <div style={{ ...ligne(14), marginTop: 50, display: "flex", alignItems: "center", gap: 20, background: DA.accent, color: "#fff", fontWeight: 800, fontSize: 52, padding: "22px 46px", borderRadius: 70, boxShadow: "0 14px 40px rgba(0,0,0,0.45)" }}>
        <svg width="46" height="46" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M10 7.5v9l7-4.5z" fill={DA.accent} /></svg>
        Lien en bio
      </div>
      <div style={{ ...ligne(18), position: "absolute", bottom: 330, color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 40 }}>
        Pizza, tiramisu, haul italien… 12 min à Rome
      </div>
    </AbsoluteFill>
  );
};

export const TeaserVertical: React.FC = () => {
  let debut = 0;
  const plans = CLIPS.map((c) => {
    const from = Math.round(debut * FPS_TEASER);
    const duree = Math.round((c.fin - c.debut) * FPS_TEASER);
    debut += c.fin - c.debut;
    return (
      <Sequence key={c.debut} from={from} durationInFrames={duree} name={`Plan ${c.debut}s`}>
        <PlanVertical clip={c} />
        <MotGeant clip={c} />
      </Sequence>
    );
  });
  const finFrom = Math.round(debut * FPS_TEASER);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plans}
      <Sequence from={0} durationInFrames={finFrom}>
        <Pilule texte="VLOG ROME · JOUR 1" />
      </Sequence>
      <Sequence from={finFrom} durationInFrames={Math.round(DUREE_FIN * FPS_TEASER)} name="Écran final">
        <EcranFin />
        <Pilule texte="SAARAA.BJJ" sombre />
      </Sequence>
    </AbsoluteFill>
  );
};
