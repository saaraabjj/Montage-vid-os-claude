import React, { useMemo } from "react";
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
    <div style={{ position: "absolute", left: 60, right: 60, top: 1290, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 24, rowGap: 6, transform: `scale(${0.9 + 0.1 * pop})` }}>
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
              transform: actif ? "scale(1.05)" : "none",
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
const DUREE_MOT_CLE = 1.4;
// Icônes animées (SVG) associées aux mots-clés
const ICONES: Record<string, string> = {
  "AVIS HONNÊTE": "check", "2 SEMAINES D'ESSAI": "horloge", "LE DESIGN": "etincelle", "LA QUALITÉ": "etoile",
  "COUP DE CŒUR": "coeur", "LE CONFORT": "plume", "LA DOUBLURE": "couches", "LES TAILLES": "regle",
  "LES MODÈLES": "tshirt", "LES FILLES": "etincelle", "COLLECTION MIXTE": "tshirt", "-15 %": "etiquette", "MERCI OSMOSIS": "coeur",
};
const Icone: React.FC<{ nom: string; t: number }> = ({ nom, t }) => {
  const trace = { fill: "none", stroke: "#fff", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dash = { strokeDasharray: 400, strokeDashoffset: 400 * (1 - t) };
  const d: Record<string, React.ReactNode> = {
    check: <path d="M18 52 L40 74 L82 28" {...trace} style={dash} />,
    horloge: <><circle cx="50" cy="50" r="36" {...trace} style={dash} /><path d={`M50 50 L50 26`} {...trace} /><path d={`M50 50 L${50 + 20 * Math.cos(t * 6)} ${50 + 20 * Math.sin(t * 6)}`} {...trace} /></>,
    etincelle: <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" {...trace} style={dash} />,
    etoile: <path d="M50 10 L61 38 L91 39 L67 57 L76 87 L50 70 L24 87 L33 57 L9 39 L39 38 Z" {...trace} style={dash} />,
    coeur: <path d="M50 84 C10 58 12 22 34 20 C44 19 50 28 50 34 C50 28 56 19 66 20 C88 22 90 58 50 84 Z" {...trace} style={dash} />,
    plume: <path d="M80 18 C40 20 22 46 22 80 M22 80 C46 76 70 60 80 18 M38 62 L58 42" {...trace} style={dash} />,
    couches: <><path d="M50 18 L88 36 L50 54 L12 36 Z" {...trace} style={dash} /><path d="M12 52 L50 70 L88 52" {...trace} style={dash} /><path d="M12 68 L50 86 L88 68" {...trace} style={dash} /></>,
    regle: <><rect x="10" y="34" width="80" height="32" rx="4" {...trace} style={dash} /><path d="M26 34 V48 M42 34 V54 M58 34 V48 M74 34 V54" {...trace} /></>,
    tshirt: <path d="M34 16 L14 28 L22 46 L32 40 L32 86 L68 86 L68 40 L78 46 L86 28 L66 16 C62 26 38 26 34 16 Z" {...trace} style={dash} />,
    etiquette: <><path d="M14 50 L46 18 L86 18 L86 58 L54 90 Z" {...trace} style={dash} /><circle cx="70" cy="34" r="6" {...trace} /></>,
  };
  return <svg width="110" height="110" viewBox="0 0 100 100" style={{ marginRight: 18, flexShrink: 0 }}>{d[nom]}</svg>;
};

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
            maxWidth: 980,
            display: "flex",
            alignItems: "center",
          }}
        >
          {ICONES[texte] ? <Icone nom={ICONES[texte]} t={interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /> : null}
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
    <AbsoluteFill style={{ transform: `scale(${z * (1.02 + 0.02 * Math.sin(t / 3))})` }}>
      <OffthreadVideo src={staticFile("sponso/base.mp4")} />
    </AbsoluteFill>
  );
};

// Le rashguard beige (photos OSMOSIS détourées) quand je dis « … et l'autre beige »
const motT = (phrase: number, texte: string) => MOTS.find((m) => m.phrase === phrase && m.m.includes(texte));
const DEBUT_BEIGE = (motT(6, "beige")?.d ?? 0) - 0.5;
const FIN_BEIGE = MOTS.find((m) => m.phrase === 8)?.d ?? DEBUT_BEIGE + 4;

const RashBeige: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const moitie = Math.round(durationInFrames / 2);
  const fond = interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vue = (debut: number, src: string, sens: number) => {
    const f = frame - debut;
    const e = spring({ frame: f, fps, config: { damping: 15, stiffness: 160 }, durationInFrames: 12 });
    const visible = f >= 0 && f < moitie + 4;
    const s = interpolate(f, [moitie - 4, moitie + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (!visible) return null;
    return (
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute", left: "50%", top: 250, height: 980,
          transform: `translateX(-50%) translateX(${(1 - e) * 300 * sens}px) rotate(${(1 - e) * 6 * sens}deg) scale(${0.96 + 0.04 * e + 0.03 * (f / durationInFrames)})`,
          opacity: e * s,
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.45))",
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(243,230,211,${0.95 * fond}) 0%, rgba(205,180,150,${0.95 * fond}) 60%, rgba(120,95,70,${0.95 * fond}) 100%)` }} />
      {vue(0, "sponso/rash-beige-dos.png", 1)}
      {vue(moitie, "sponso/rash-beige-face.png", -1)}
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, textAlign: "center", opacity: fond, fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 64, color: "#3a2a1c", letterSpacing: "0.04em" }}>
        RASHGUARD BEIGE
      </div>
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

// Barre de progression en haut (s'arrête à la carte finale)
const Progression: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = Math.min(1, frame / (montage.duree * fps));
  const vis = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 70, left: 70, right: 70, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.35)", opacity: vis }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 6, background: ROUGE, boxShadow: "0 0 18px rgba(224,53,43,0.8)" }} />
      <div style={{ position: "absolute", left: `calc(${p * 100}% - 18px)`, top: -12, width: 36, height: 36, borderRadius: 18, background: "#fff", border: `5px solid ${ROUGE}` }} />
    </div>
  );
};

export const SponsoOsmosis: React.FC = () => {
  const { fps } = useVideoConfig();
  const fin = Math.round(montage.duree * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Base />
      <Sequence from={Math.round(DEBUT_BEIGE * fps)} durationInFrames={Math.round((FIN_BEIGE - DEBUT_BEIGE) * fps)} name="Rashguard beige">
        <RashBeige />
      </Sequence>
      <SousTitres />
      <Progression />
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
