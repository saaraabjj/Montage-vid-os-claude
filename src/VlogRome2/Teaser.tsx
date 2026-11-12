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
import { DA } from "../VlogRome/theme";
import timeline from "./timeline.json";
import transcription from "./sous-titres.json";
import type { Segment } from "../VlogRome/SousTitres";

// Teaser Instagram (9:16) du vlog Rome jour 2, même style que celui du jour 1.
// Les images viennent des plans propres du vlog (sans sous-titres ni cartes incrustés).
export const FPS_TEASER2 = 30;

// debut / fin : temps dans le vlog du jour 2 (s). fond = plan filmé en vertical : il remplit l'écran.
type Clip = { debut: number; fin: number; centreX?: number; fond?: boolean; musique?: boolean };
const CLIPS: Clip[] = [
  { debut: 4.2, fin: 8.3, fond: true }, // selfie devant le Colisée : « Aujourd'hui c'est une visite au Colisée, on y va ! »
  { debut: 18.8, fin: 21.8, centreX: 0.47, musique: true }, // Osmo : debout devant le Colisée
  { debut: 105.6, fin: 108.4, centreX: 0.5 }, // full monde, vraiment full monde
  { debut: 109.5, fin: 111.7, centreX: 0.5 }, // demain j'ai ma compète
  { debut: 114.3, fin: 117.45, centreX: 0.5 }, // je suis extrêmement fatiguée, je suis KO
  { debut: 168.4, fin: 170.5, fond: true }, // elles sont super bonnes, franchement
  { debut: 172.0, fin: 174.7, fond: true }, // pâtes à la truffe, vraiment pépites
  { debut: 284.9, fin: 286.9, fond: true, musique: true }, // la coupole du Panthéon
  { debut: 352.1, fin: 353.5, fond: true }, // non mais c'est une dinguerie
  { debut: 368.9, fin: 370.6, fond: true }, // il fait trop froid
];
const DUREE_FIN = 4.5;
const MOTS_FORTS = /Colisée|compète|KO|explosée|truffe|pépites|full|dinguerie|froid|Rome/i;

const PLANS = timeline.plans as Array<{ i: number; debut: number; duree: number }>;
const planDe = (c: Clip) => {
  const p = PLANS.find((x) => c.debut >= x.debut - 0.01 && c.fin <= x.debut + x.duree + 0.01);
  if (!p) throw new Error(`Extrait ${c.debut}–${c.fin} à cheval sur deux plans`);
  return p;
};

export const dureeTeaser2 = () =>
  Math.round((CLIPS.reduce((t, c) => t + (c.fin - c.debut), 0) + DUREE_FIN) * FPS_TEASER2);

const segments = transcription as Segment[];
const motsDuClip = (c: Clip) => {
  const out: Array<{ m: string; d: number; f: number }> = [];
  for (const m of segments.flatMap((s) => s.mots)) {
    if (m.d < c.debut - 0.05 || m.d >= c.fin - 0.05) continue;
    const mot = { m: m.m.trim(), d: m.d - c.debut, f: Math.min(m.f, c.fin) - c.debut };
    const p = out[out.length - 1];
    if (p && !/^\s/.test(m.m)) {
      p.m += mot.m; // « C » + « 'est »
      p.f = mot.f;
    } else out.push(mot);
  }
  return out;
};

const fichier = (i: number) => staticFile(`vlog2/plans/${String(i).padStart(3, "0")}.mp4`);
const HAUTEUR_PLAN = 1200;
const HAUT_PLAN = 300;

const PlanVertical: React.FC<{ clip: Clip }> = ({ clip }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const p = planDe(clip);
  const depart = Math.round((clip.debut - p.debut) * fps);
  const zoom = interpolate(frame, [0, (clip.fin - clip.debut) * fps], [1, 1.03]);
  const largeurPlein = 1920 * (16 / 9);
  const volume = clip.musique ? 0.3 : 1;
  if (clip.fond) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
        <OffthreadVideo src={fichier(p.i)} startFrom={depart} volume={volume}
          style={{ position: "absolute", height: 1920, width: largeurPlein, left: (1080 - largeurPlein) / 2, top: 0, transform: `scale(${zoom})` }} />
      </AbsoluteFill>
    );
  }
  const cx = clip.centreX ?? 0.5;
  const largeur = HAUTEUR_PLAN * (16 / 9);
  const gauche = Math.min(0, Math.max(1080 - largeur, 540 - cx * largeur));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={fichier(p.i)} startFrom={depart}
        style={{ position: "absolute", height: 1920, width: largeurPlein, left: 540 - cx * largeurPlein, top: 0,
          filter: "blur(45px) brightness(0.55) saturate(1.2)", transform: "scale(1.15)" }} />
      <div style={{ position: "absolute", left: 0, top: HAUT_PLAN, width: 1080, height: HAUTEUR_PLAN, overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>
        <OffthreadVideo src={fichier(p.i)} startFrom={depart} volume={volume}
          style={{ position: "absolute", height: HAUTEUR_PLAN, width: largeur, left: gauche, top: 0, transform: `scale(${zoom})` }} />
      </div>
    </AbsoluteFill>
  );
};

const MotGeant: React.FC<{ clip: Clip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const mots = motsDuClip(clip);
  const i = mots.findIndex((m, k) => t >= m.d && t < (mots[k + 1]?.d ?? clip.fin - clip.debut));
  if (i < 0) return null;
  const mot = mots[i];
  const suivant = mots[i + 1];
  const pop = spring({ frame: frame - Math.round(mot.d * fps), fps, config: { damping: 14, stiffness: 260 }, durationInFrames: 6 });
  const fort = MOTS_FORTS.test(mot.m);
  const texte = mot.m;
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
      <Img src={staticFile("miniature/j2-colisee.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.45)", transform: "scale(1.2)" }} />
      <div style={{ ...ligne(0), position: "absolute", top: 360 }}>
        <Img src={staticFile("logo.png")} style={{ width: 260 }} />
      </div>
      <div style={{ ...ligne(4), color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 54, marginBottom: 20 }}>Rome m'a mise KO…</div>
      <div style={{ ...ligne(8), textAlign: "center", fontWeight: 900, fontSize: 128, lineHeight: 0.98, letterSpacing: "-0.04em", textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ color: "#fff" }}>Le vlog complet</div>
        <div style={{ color: DA.accentClair }}>sur YouTube</div>
      </div>
      <div style={{ ...ligne(14), marginTop: 50, display: "flex", alignItems: "center", gap: 20, background: DA.accent, color: "#fff", fontWeight: 800, fontSize: 52, padding: "22px 46px", borderRadius: 70, boxShadow: "0 14px 40px rgba(0,0,0,0.45)" }}>
        <svg width="46" height="46" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M10 7.5v9l7-4.5z" fill={DA.accent} /></svg>
        Lien en bio
      </div>
      <div style={{ ...ligne(18), position: "absolute", bottom: 330, color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 40, textAlign: "center" }}>
        Colisée, pâtes à la truffe, Panthéon…
        <br />
        la veille de ma compète
      </div>
    </AbsoluteFill>
  );
};

export const TeaserVerticalJ2: React.FC = () => {
  let debut = 0;
  const plans = CLIPS.map((c) => {
    const from = Math.round(debut * FPS_TEASER2);
    const duree = Math.round((c.fin - c.debut) * FPS_TEASER2);
    debut += c.fin - c.debut;
    return (
      <Sequence key={c.debut} from={from} durationInFrames={duree} name={`Plan ${c.debut}s`}>
        <PlanVertical clip={c} />
        <MotGeant clip={c} />
      </Sequence>
    );
  });
  const finFrom = Math.round(debut * FPS_TEASER2);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plans}
      <Sequence from={0} durationInFrames={finFrom}>
        <Pilule texte="VLOG ROME · JOUR 2" />
      </Sequence>
      <Sequence from={finFrom} durationInFrames={Math.round(DUREE_FIN * FPS_TEASER2)} name="Écran final">
        <EcranFin />
        <Pilule texte="SAARAA.BJJ" sombre />
      </Sequence>
      {/* musique douce très basse sous tout le teaser */}
      <Audio src={staticFile("vlog2/musique.wav")} startFrom={Math.round(20 * FPS_TEASER2)} volume={0.12} />
    </AbsoluteFill>
  );
};
