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
  sousTitresFin?: string; // petite ligne sous le texte de fin
  sousTitres?: Array<{ m: string; d: number; f: number }>; // mots de la voix off, calés sur la vidéo
  voix?: string; // voix off
  voixDebut?: number; // où commencer dans le fichier de voix (s)
  voixA?: number; // à quel moment de la vidéo la voix démarre (s)
  phrases?: Array<{ debut: number; duree: number; texte: string }>; // texte de l'histoire, en bas
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
const CarteFin: React.FC<{ texte: string; sous?: string }> = ({ texte, sous }) => {
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
        {sous ? (
          <div style={{ opacity: interpolate(f, [18, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), marginTop: 28, maxWidth: 900, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 50, lineHeight: 1.25, color: "rgba(255,255,255,0.92)", textShadow: "0 3px 18px rgba(0,0,0,0.7)", whiteSpace: "pre-line" }}>
            {sous}
          </div>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${noir})` }} />
    </AbsoluteFill>
  );
};

// Phrase de l'histoire, posée en bas de l'image (fondu doux, mots qui montent un à un)
// Sous-titres de la voix off : 2 à 4 mots, le mot prononcé en violet (le cœur 🖤 de la marque)
type MotST = { m: string; d: number; f: number };
const blocsST = (mots: MotST[]) => {
  const out: Array<{ d: number; f: number; mots: MotST[] }> = [];
  let cur: MotST[] = [];
  const fermer = () => {
    if (cur.length) out.push({ d: cur[0].d, f: cur[cur.length - 1].f, mots: cur });
    cur = [];
  };
  for (const w of mots) {
    if (cur.length && !/^\s/.test(w.m)) {
      const p = cur[cur.length - 1];
      cur[cur.length - 1] = { ...p, m: p.m + w.m, f: w.f };
      continue;
    }
    const p = cur[cur.length - 1];
    if (p && (cur.length >= 4 || w.d - p.f > 0.45 || /[.,:!?]$/.test(p.m.trim()))) fermer();
    cur.push({ ...w });
  }
  fermer();
  for (let i = 0; i < out.length; i++) out[i].f = Math.min(out[i].f + 0.35, out[i + 1]?.d ?? Infinity);
  return out;
};
const SousTitresVoix: React.FC<{ mots: MotST[] }> = ({ mots }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const blocs = React.useMemo(() => blocsST(mots), [mots]);
  const b = blocs.find((x) => t >= x.d && t < x.f);
  if (!b) return null;
  const a = interpolate(t, [b.d, b.d + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380, paddingLeft: 60, paddingRight: 60 }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 18, rowGap: 4, textAlign: "center" }}>
        {b.mots.map((w, i) => {
          const actif = t >= w.d && t < (b.mots[i + 1]?.d ?? b.f);
          return (
            <span key={i} style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: actif ? "#C9A8FF" : "white", WebkitTextStroke: "2px rgba(0,0,0,0.75)", paintOrder: "stroke fill", textShadow: "0 4px 16px rgba(0,0,0,0.6)" }}>
              {w.m.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Phrase: React.FC<{ texte: string }> = ({ texte }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sortie = interpolate(f, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mots = texte.split(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330, paddingLeft: 70, paddingRight: 70 }}>
      <div style={{ opacity: sortie, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 58, lineHeight: 1.22, color: "white", textShadow: "0 3px 18px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9)" }}>
        {mots.map((m, i) => {
          const a = interpolate(f, [i * 1.6, i * 1.6 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ display: "inline-block", opacity: a, transform: `translateY(${(1 - a) * 14}px)`, marginRight: "0.26em" }}>
              {m}
            </span>
          );
        })}
      </div>
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
      {(m.phrases ?? []).map((x, i) => (
        <Sequence key={`p${i}`} from={Math.round(x.debut * FPS)} durationInFrames={Math.round(x.duree * FPS)}>
          <Phrase texte={x.texte} />
        </Sequence>
      ))}
      {m.sousTitres ? <SousTitresVoix mots={m.sousTitres} /> : null}
      {m.fin !== undefined && (
        <Sequence from={Math.round(m.fin * FPS)} durationInFrames={total - Math.round(m.fin * FPS)}>
          <CarteFin texte={m.texteFin ?? ""} sous={m.sousTitresFin} />
        </Sequence>
      )}
      <Audio src={staticFile(m.musique)} volume={m.volumeMusique} />
      {m.voix ? (
        <Sequence from={Math.round((m.voixA ?? 0) * FPS)} name="Voix off">
          <Audio src={staticFile(m.voix)} startFrom={Math.round((m.voixDebut ?? 0) * FPS)} volume={1} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
