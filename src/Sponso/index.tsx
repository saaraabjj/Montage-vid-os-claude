import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import montage from "./montage.json";

// Vidéo sponsorisée OSMOSIS (9:16) : face caméra sans blancs, mots-clés en transition,
// sous-titres, carte finale avec le code promo.
export const FPS_SPONSO = 30;
export const CODE_PROMO = "SAARAABJJ15";
export const SITE = "osmosis-sports.com";
const ROUGE = "#E0352B"; // rouge du logo OSMOSIS sur le rashguard
const CREME = "#F3E6D3";
const DUREE_FIN = 5;

type Mot = { m: string; d: number; f: number; colle: boolean; phrase: number };
const MOTS = montage.mots as Mot[];
const MOTS_CLES = montage.motsCles as Array<{ t: number; texte: string }>;
export const dureeSponso = () => Math.round((montage.duree + DUREE_FIN) * FPS_SPONSO);

// Blocs de 2 à 4 mots pour les sous-titres
type Bloc = { d: number; f: number; mots: Mot[] };
const blocs = (): Bloc[] => {
  const out: Bloc[] = [];
  let cur: Mot[] = [];
  const fermer = () => {
    if (cur.length) out.push({ d: cur[0].d, f: cur[cur.length - 1].f, mots: cur });
    cur = [];
  };
  for (const m of MOTS) {
    if (m.colle && cur.length) {
      cur[cur.length - 1] = { ...cur[cur.length - 1], m: cur[cur.length - 1].m + m.m, f: m.f };
      continue;
    }
    const prev = cur[cur.length - 1];
    if (prev && (cur.length >= 4 || prev.phrase !== m.phrase || m.d - prev.f > 0.5 || /[.,!?]$/.test(prev.m))) fermer();
    cur.push({ ...m });
  }
  fermer();
  for (let i = 0; i < out.length; i++) out[i].f = Math.min(out[i].f + 0.3, out[i + 1]?.d ?? Infinity);
  return out;
};

const FORTS = /osmosis|kimono|rash|qualité|design|confort|doublure|taille|A3L|magnifique|coup|cœur|coeur|mixte|15|SAARAA|satisfait|bg|dream/i;

const SousTitres: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const B = useMemo(blocs, []);
  const b = B.find((x) => t >= x.d && t < x.f);
  if (!b) return null;
  const pop = spring({ frame: frame - Math.round(b.d * fps), fps, config: { damping: 16, stiffness: 240 }, durationInFrames: 6 });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1290, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 6, transform: `scale(${0.9 + 0.1 * pop})` }}>
      {b.mots.map((m, i) => {
        const actif = t >= m.d && t < (b.mots[i + 1]?.d ?? b.f);
        const fort = FORTS.test(m.m);
        return (
          <span
            key={i}
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: 76,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: actif ? (fort ? ROUGE : "#fff") : fort ? CREME : "rgba(255,255,255,0.92)",
              WebkitTextStroke: "3px rgba(0,0,0,0.85)",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.55)",
              transform: actif ? "scale(1.08)" : "none",
              display: "inline-block",
            }}
          >
            {m.m}
          </span>
        );
      })}
    </div>
  );
};

// Transition mot-clé : flash, le mot arrive en grand puis s'efface ; l'image fait un petit « punch »
const DUREE_MOT_CLE = 1.1;
const MotCle: React.FC<{ texte: string }> = ({ texte }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entree = spring({ frame, fps, config: { damping: 13, stiffness: 220 }, durationInFrames: 8 });
  const sortie = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [0, 2, 6], [0, 0.55, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Audio src={staticFile("sons/whoosh.wav")} volume={0.35} />
      <AbsoluteFill style={{ background: `rgba(255,255,255,${flash})` }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1110 }}>
        <div
          style={{
            opacity: sortie,
            transform: `translateX(${(1 - entree) * -160}px) skewX(${(1 - entree) * -12}deg)`,
            background: ROUGE,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: texte.length > 14 ? 72 : 96,
            letterSpacing: "-0.03em",
            padding: "14px 36px",
            borderRadius: 18,
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
            textAlign: "center",
            maxWidth: 940,
          }}
        >
          {texte}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Image de base avec un léger « punch » (zoom) à chaque mot-clé
const Base: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let z = 1;
  for (const k of MOTS_CLES) {
    const dt = t - k.t;
    if (dt >= 0 && dt < 0.5) z = Math.max(z, 1 + 0.06 * Math.exp(-dt * 8) * Math.min(1, dt * 30 + 0.2));
  }
  return (
    <AbsoluteFill style={{ transform: `scale(${z})` }}>
      <OffthreadVideo src={staticFile("sponso/base.mp4")} />
    </AbsoluteFill>
  );
};

const CarteFin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l = (r: number) => {
    const s = spring({ frame: frame - r, fps, config: { damping: 200 }, durationInFrames: 14 });
    return { opacity: s, transform: `translateY(${(1 - s) * 50}px)` };
  };
  const fond = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2);
  return (
    <AbsoluteFill style={{ background: `rgba(12,12,14,${0.82 * fond})`, backdropFilter: `blur(${18 * fond}px)`, justifyContent: "center", alignItems: "center", fontFamily: "Inter, sans-serif" }}>
      <Audio src={staticFile("sons/pop.wav")} volume={0.6} />
      <div style={{ ...l(2), color: CREME, fontWeight: 800, fontSize: 64, letterSpacing: "0.12em" }}>OSMOSIS</div>
      <div style={{ ...l(6), color: "#fff", fontWeight: 900, fontSize: 210, lineHeight: 1, marginTop: 30 }}>-15 %</div>
      <div style={{ ...l(10), color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 46, marginTop: 30 }}>avec mon code</div>
      <div style={{ ...l(13), marginTop: 22, transform: `${l(13).transform} scale(${pulse})`, background: ROUGE, color: "#fff", fontWeight: 900, fontSize: 92, letterSpacing: "0.04em", padding: "22px 48px", borderRadius: 26, border: "4px dashed rgba(255,255,255,0.85)", boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
        {CODE_PROMO}
      </div>
      <div style={{ ...l(18), color: "#fff", fontWeight: 700, fontSize: 52, marginTop: 50 }}>{SITE}</div>
    </AbsoluteFill>
  );
};

export const SponsoOsmosis: React.FC = () => {
  const { fps } = useVideoConfig();
  const fin = Math.round(montage.duree * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Base />
      <SousTitres />
      {MOTS_CLES.map((k) => (
        <Sequence key={k.t} from={Math.round(k.t * fps)} durationInFrames={Math.round(DUREE_MOT_CLE * fps)} name={`Mot-clé ${k.texte}`}>
          <MotCle texte={k.texte} />
        </Sequence>
      ))}
      <Sequence from={fin - 6} name="Carte finale">
        <CarteFin />
      </Sequence>
    </AbsoluteFill>
  );
};
