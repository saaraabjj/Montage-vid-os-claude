import React from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";

// Pub « collab » SAARAA.BJJ × OSMOSIS, 9:16 TikTok / Reels.
// Valeurs tirées de DA.md. Accent de cette vidéo : rouge néon, comme le
// « OSMOSIS » rouge imprimé sur le rashguard (cf. SUIVI.md).
const DA = {
  accent: "#F93C4A",
  blanc: "#FFFFFF",
  gris: "#AE9FA5",
  fondSombre: "#1C1818",
  police: "Inter, sans-serif",
};

export const FPS = 30;
// Repères dans le rush (en images, à 30 i/s)
const SORTIE_CHAMP = 74; // elle sort du champ, il ne reste que le sac
const WHIP = 123; // transition « balayage » vers le kimono
const FIN_RUSH = 255; // fin du rush (8,5 s)
const FIN_CARTE = 105; // durée de la carte de fin (3,5 s)
export const DUREE = FIN_RUSH + FIN_CARTE;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Le rush est filmé en selfie, donc en miroir : on le remet à l'endroit
// pour que « OSMOSIS » se lise sur le kimono et le sac.
const Rush: React.FC<{ flou?: number }> = ({ flou = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lent zoom vers le sac pendant le plan vide
  const zoomSac = interpolate(frame, [SORTIE_CHAMP, WHIP], [1, 1.22], clamp);
  // « Punch » à l'arrivée en kimono
  const punch =
    frame >= WHIP
      ? 1 + 0.14 * (1 - spring({ frame: frame - WHIP, fps, config: { damping: 18 } }))
      : 1;
  const zoom = frame < WHIP ? zoomSac : punch;
  // Le sac est vers 32 % / 80 % de l'image (une fois remise à l'endroit)
  const origine = frame < WHIP ? "32% 80%" : "50% 40%";

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: origine }}>
      <OffthreadVideo
        src={staticFile("osmosis/rush.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          filter: flou ? `blur(${flou}px) brightness(0.55)` : undefined,
        }}
        volume={(f) => interpolate(f, [FIN_RUSH - 15, FIN_RUSH], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};

// Titre façon carte DA : petite ligne grise, ligne blanche, ligne en accent
const Titre: React.FC<{
  intro?: string;
  ligne1?: string;
  ligne2?: string;
  top: number;
  taille?: number;
  introCouleur?: string;
}> = ({ intro, ligne1, ligne2, top, taille = 120, introCouleur = DA.gris }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sortie = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], clamp);
  const ligne = (delai: number) => {
    const s = spring({ frame: frame - delai, fps, config: { damping: 200 }, durationInFrames: 8 });
    return {
      opacity: Math.min(s * 2, 1) * sortie,
      transform: `translateY(${(1 - s) * 30}px) scale(${0.9 + 0.1 * s})`,
    };
  };
  const ombre = "0 6px 30px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)";
  return (
    <AbsoluteFill
      style={{
        top,
        alignItems: "center",
        fontFamily: DA.police,
        textAlign: "center",
        padding: "0 70px",
      }}
    >
      {intro && (
        <div style={{ ...ligne(0), fontWeight: 500, fontSize: 44, color: introCouleur, textShadow: introCouleur === DA.gris ? ombre : "none", marginBottom: 8 }}>
          {intro}
        </div>
      )}
      {ligne1 && (
        <div
          style={{
            ...ligne(3),
            fontWeight: 700,
            fontSize: taille,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: DA.blanc,
            textShadow: ombre,
          }}
        >
          {ligne1}
        </div>
      )}
      {ligne2 && (
        <div
          style={{
            ...ligne(7),
            fontWeight: 900,
            fontSize: taille,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: DA.accent,
            textShadow: ombre,
          }}
        >
          {ligne2}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Anneau qui entoure le logo du sac
const CibleSac: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 352 - 120,
        top: 1530 - 120,
        width: 240,
        height: 240,
        borderRadius: 120,
        border: `8px solid ${DA.accent}`,
        boxShadow: `0 0 40px ${DA.accent}99`,
        transform: `scale(${0.4 + 0.6 * s})`,
        opacity: Math.min(s * 2, 1),
      }}
    />
  );
};

// Pilule « Dynamic Island » en haut, avec le logo OSMOSIS
const Pilule: React.FC<{ texte: string }> = ({ texte }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ouverture = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: 10 });
  const apparition = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 6 });
  const fermeture = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  const largeur = interpolate(ouverture * fermeture, [0, 1], [130, 760]);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: "50%",
        width: largeur,
        height: 130,
        marginLeft: -largeur / 2,
        borderRadius: 65,
        background: DA.blanc,
        boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        opacity: apparition * Math.min(fermeture * 3, 1),
        transform: `scale(${0.8 + 0.2 * apparition})`,
      }}
    >
      <Img src={staticFile("osmosis/logo-noir.png")} style={{ width: 96, height: 96, marginLeft: 17, flexShrink: 0 }} />
      <div
        style={{
          marginLeft: 26,
          whiteSpace: "nowrap",
          fontFamily: DA.police,
          fontWeight: 700,
          fontSize: 46,
          color: "#111",
          opacity: interpolate(ouverture * fermeture, [0.6, 1], [0, 1], clamp),
        }}
      >
        {texte}
      </div>
    </div>
  );
};

// Flash blanc au moment du balayage
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 7], [0, 0.85, 0], clamp);
  return <AbsoluteFill style={{ background: "white", opacity: o }} />;
};

// Carte de fin : les deux logos et la phrase de la collab
const CarteFin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fond = interpolate(frame, [0, 10], [0, 1], clamp);
  const s1 = spring({ frame: frame - 4, fps, config: { damping: 13 } });
  const s2 = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  const croix = spring({ frame: frame - 16, fps, config: { damping: 200 }, durationInFrames: 8 });
  const texte = (d: number) => {
    const s = spring({ frame: frame - d, fps, config: { damping: 200 }, durationInFrames: 8 });
    return { opacity: s, transform: `translateY(${(1 - s) * 30}px)` };
  };
  // Le logo OSMOSIS tourne doucement, comme un nœud qui se serre
  const rotation = interpolate(s2, [0, 1], [-90, 0]) + frame * 0.15;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: fond }}>
        <Freeze frame={232}>
          <Rush flou={40} />
        </Freeze>
        <AbsoluteFill style={{ background: `${DA.fondSombre}B3` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: DA.police }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 90 }}>
          <Img
            src={staticFile("logo.png")}
            style={{ width: 300, transform: `scale(${s1})`, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.5))" }}
          />
          <div
            style={{
              fontSize: 90,
              fontWeight: 500,
              color: DA.gris,
              opacity: croix,
              transform: `scale(${0.5 + 0.5 * croix}) rotate(${(1 - croix) * 90}deg)`,
            }}
          >
            ×
          </div>
          <Img
            src={staticFile("osmosis/logo-blanc.png")}
            style={{
              width: 290,
              transform: `scale(${s2}) rotate(${rotation}deg)`,
              filter: "drop-shadow(0 10px 30px rgba(0,0,0,.5))",
            }}
          />
        </div>
        <div style={{ ...texte(22), fontWeight: 500, fontSize: 46, color: DA.gris, marginBottom: 14 }}>
          Nouvelle collab
        </div>
        <div style={{ ...texte(26), fontWeight: 700, fontSize: 104, letterSpacing: "-0.03em", color: DA.blanc }}>
          SAARAA.BJJ
        </div>
        <div style={{ ...texte(30), fontWeight: 900, fontSize: 104, letterSpacing: "-0.03em", color: DA.accent }}>
          × OSMOSIS
        </div>
        <div
          style={{
            ...texte(42),
            marginTop: 70,
            padding: "22px 46px",
            borderRadius: 60,
            border: "2px solid rgba(255,255,255,0.25)",
            fontWeight: 700,
            fontSize: 42,
            color: DA.blanc,
          }}
        >
          Officiellement sponsorisée
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PubOsmosis: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Sequence durationInFrames={FIN_RUSH}>
        <Rush />
      </Sequence>

      {/* 1. Accroche, en sweat */}
      <Sequence from={6} durationInFrames={SORTIE_CHAMP - 6}>
        <Titre intro="POV :" ligne1="tu reçois ton" ligne2="1er sponsor" top={1180} />
        <Audio src={staticFile("sons/pop.wav")} volume={0.5} />
      </Sequence>

      {/* 2. Plan vide : zoom sur le sac */}
      <Sequence from={SORTIE_CHAMP + 4} durationInFrames={WHIP - SORTIE_CHAMP - 4}>
        <Titre intro="Mais d'abord…" introCouleur={DA.fondSombre} ligne1="le kit" ligne2="vient d'arriver" top={330} taille={112} />
        <Audio src={staticFile("sons/pop.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={SORTIE_CHAMP + 14} durationInFrames={WHIP - SORTIE_CHAMP - 14}>
        <CibleSac />
      </Sequence>

      {/* 3. Balayage vers le kimono */}
      <Sequence from={WHIP - 12} durationInFrames={20}>
        <Audio src={staticFile("sons/whoosh.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={WHIP} durationInFrames={10}>
        <Flash />
        <Audio src={staticFile("sons/impact.wav")} volume={0.9} />
      </Sequence>

      {/* 4. En kimono OSMOSIS */}
      <Sequence from={WHIP + 6} durationInFrames={52}>
        <Titre ligne1="Mode" ligne2="OSMOSIS" top={1300} taille={150} />
      </Sequence>
      <Sequence from={WHIP + 62} durationInFrames={FIN_RUSH - WHIP - 62}>
        <Pilule texte="Sponsorisée par OSMOSIS" />
        <Audio src={staticFile("sons/pop.wav")} volume={0.5} />
      </Sequence>

      {/* 5. Carte de fin */}
      <Sequence from={FIN_RUSH - 10}>
        <CarteFin />
      </Sequence>
      <Sequence from={FIN_RUSH - 4} durationInFrames={40}>
        <Audio src={staticFile("sons/impact.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={FIN_RUSH + 12} durationInFrames={20}>
        <Audio src={staticFile("sons/pop.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
