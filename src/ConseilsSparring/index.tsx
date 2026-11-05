import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/900.css";
import motsBruts from "./mots.json";

// Conseils sparring, face caméra, 9:16 TikTok / Reels (style A de DA.md).
// Sous-titres un mot à la fois, en très gros ; mots-clés en couleur d'accent.
// Accent de cette vidéo : rouge néon, qui ressort bien sur le pull bleu (cf. SUIVI.md).
const DA = {
  accent: "#F93C4A",
  blanc: "#FFFFFF",
  police: "Inter, sans-serif",
};

export const FPS = 30;
export const DUREE = Math.ceil(70.47 * FPS);

type Mot = { mot: string; debut: number; fin: number; cle: boolean };
const mots = motsBruts as Mot[];

// Index du mot affiché à l'image donnée : il reste jusqu'au mot suivant,
// et au plus 0,5 s après la fin de sa prononciation (pauses = écran libre).
const motActif = (t: number) => {
  for (let i = mots.length - 1; i >= 0; i--) {
    if (t >= mots[i].debut) {
      const suivant = mots[i + 1]?.debut ?? Infinity;
      return t < Math.min(suivant, mots[i].fin + 0.5) ? i : -1;
    }
  }
  return -1;
};

// Taille adaptée à la longueur du mot pour ne jamais dépasser la largeur
const taillePour = (mot: string, cle: boolean) => {
  const max = cle ? 200 : 165;
  return Math.min(max, Math.floor(980 / (0.56 * Math.max(mot.length, 1))));
};

const SousTitre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = motActif(t);
  if (i < 0) return null;

  const m = mots[i];
  const depuis = frame - Math.round(m.debut * fps);
  // « Pop » : 90 % → 100 % en 0,1 s ; un peu plus marqué sur les mots-clés
  const pop = spring({ frame: depuis, fps, config: { damping: m.cle ? 10 : 200 }, durationInFrames: m.cle ? 10 : 3 });
  const echelle = (m.cle ? 0.8 : 0.9) + (m.cle ? 0.2 : 0.1) * pop;
  const taille = taillePour(m.mot, m.cle);
  const suivant = mots[i + 1];
  const montrerSuivant = suivant && suivant.debut - m.fin < 0.4;

  return (
    <AbsoluteFill style={{ top: 1180, alignItems: "center", fontFamily: DA.police }}>
      <div style={{ position: "relative", transform: `scale(${echelle})` }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: taille,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            // Dégradé argenté pour les mots normaux, accent plein pour les mots-clés
            ...(m.cle
              ? { color: DA.accent }
              : {
                  backgroundImage: "linear-gradient(180deg, #FFFFFF 35%, #C9D0DC 100%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }),
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
          }}
        >
          {m.mot}
        </div>
        {montrerSuivant && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 6,
              fontWeight: 600,
              fontSize: 50,
              color: "rgba(255,255,255,0.7)",
              whiteSpace: "nowrap",
              textShadow: "0 3px 10px rgba(0,0,0,0.6)",
            }}
          >
            {suivant.mot}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const ConseilsSparring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Petit zoom « punch » sur l'image à chaque mot-clé
  const t = frame / fps;
  let punch = 0;
  for (const m of mots) {
    if (!m.cle) continue;
    const d = frame - Math.round(m.debut * fps);
    if (d >= 0 && d < 12) punch = Math.max(punch, interpolate(d, [0, 2, 12], [0, 1, 0]));
    if (m.debut > t) break;
  }

  return (
    <AbsoluteFill style={{ background: "black" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.045 * punch})`, transformOrigin: "50% 35%" }}>
        <OffthreadVideo src={staticFile("video2/rush.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <SousTitre />
    </AbsoluteFill>
  );
};
