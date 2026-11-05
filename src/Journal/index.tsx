import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
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
import { Ceinture } from "./Ceinture";
import { SousTitres } from "./SousTitres";
import { DUREE_FIN, EpisodeProps, FPS, SERIE } from "./theme";

// Modèle d'un épisode de la série. Pour un nouvel épisode, il suffit d'ajouter
// une entrée dans episodes.ts (vidéo, numéro, sous-titres, progression).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DUREE_TITRE = 75; // bandeau titre de la série au début (2,5 s)

export const calculerDuree: CalculateMetadataFunction<EpisodeProps> = ({ props }) => ({
  durationInFrames: Math.round((props.fin - props.debut) * FPS) + DUREE_FIN,
  fps: FPS,
});

// Bandeau titre en haut pendant les premières secondes : la vidéo démarre tout de suite
// (l'accroche n'est pas retardée), le titre de la série s'affiche par-dessus.
const BandeauTitre: React.FC<{ episode: number }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ligne = (d: number) => {
    const s = spring({ frame: frame - d, fps, config: { damping: 200 }, durationInFrames: 8 });
    const sortie = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
    return { opacity: s * sortie, transform: `translateY(${(1 - s) * -24 + (1 - sortie) * -24}px)` };
  };
  const ombre = "0 4px 18px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)";
  return (
    <AbsoluteFill style={{ top: 230, alignItems: "center", fontFamily: SERIE.police, textAlign: "center" }}>
      <div
        style={{
          ...ligne(0),
          background: SERIE.accent,
          color: "#111",
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: "0.06em",
          padding: "10px 28px",
          borderRadius: 40,
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        Épisode {episode}
      </div>
      <div style={{ ...ligne(3), fontWeight: 700, fontSize: 64, color: SERIE.blanc, textShadow: ombre, letterSpacing: "-0.02em" }}>
        {SERIE.titre1}
      </div>
      <div style={{ ...ligne(6), fontWeight: 600, fontSize: 52, color: SERIE.accent, textShadow: ombre }}>
        {SERIE.titre2}
      </div>
    </AbsoluteFill>
  );
};

// Carte de fin : la jauge-ceinture avance (très lentement, c'est le gag de la série)
const CarteProgression: React.FC<EpisodeProps> = ({ episode, video, fin, progressionAvant, progressionApres, barrettes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fond = interpolate(frame, [0, 8], [0, 1], clamp);
  const entree = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: 12 });
  const remplir = interpolate(frame, [22, 60], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const valeur = progressionAvant + (progressionApres - progressionAvant) * remplir;
  const gain = progressionApres - progressionAvant;
  const texte = (d: number) => {
    const s = spring({ frame: frame - d, fps, config: { damping: 200 }, durationInFrames: 8 });
    return { opacity: s, transform: `translateY(${(1 - s) * 26}px)` };
  };
  const badge = spring({ frame: frame - 60, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: fond }}>
        <Freeze frame={Math.round(fin * fps) - 2}>
          <OffthreadVideo src={staticFile(video)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.5)" }} />
        </Freeze>
        <AbsoluteFill style={{ background: `${SERIE.fondSombre}99` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SERIE.police, textAlign: "center" }}>
        <Img src={staticFile("logo-petit.png")} style={{ width: 120, marginBottom: 40, ...texte(0) }} />
        <div style={{ ...texte(4), fontWeight: 500, fontSize: 46, color: SERIE.gris }}>Progrès de la semaine</div>
        <div style={{ ...texte(8), fontWeight: 900, fontSize: 150, color: SERIE.blanc, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
          {valeur.toFixed(1).replace(".", ",")} %
        </div>
        <div style={{ ...texte(10), fontWeight: 600, fontSize: 40, color: SERIE.gris, marginBottom: 46 }}>
          vers la ceinture violette
        </div>
        <div style={{ position: "relative", transform: `scale(${0.9 + 0.1 * entree})`, opacity: entree }}>
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: (900 - 230) * (valeur / 100) - 40,
              width: 80,
              marginBottom: 10,
              textAlign: "center",
              fontWeight: 900,
              fontSize: 34,
              color: SERIE.accent,
            }}
          >
            moi ▼
          </div>
          <Ceinture remplissage={valeur} barrettes={barrettes} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: 900, marginTop: 16, fontWeight: 600, fontSize: 34 }}>
          <span style={{ color: SERIE.bleuClair }}>Bleue</span>
          <span style={{ color: "#A57BDA" }}>Violette</span>
        </div>
        <div
          style={{
            marginTop: 50,
            background: SERIE.accent,
            color: "#111",
            fontWeight: 900,
            fontSize: 54,
            padding: "14px 36px",
            borderRadius: 50,
            transform: `scale(${badge}) rotate(${(1 - badge) * -8}deg)`,
          }}
        >
          +{gain.toFixed(1).replace(".", ",")} % (on avance… lentement)
        </div>
        <div style={{ ...texte(75), marginTop: 60, fontWeight: 700, fontSize: 44, color: SERIE.blanc }}>
          Épisode {episode + 1} la semaine prochaine
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const JournalEpisode: React.FC<EpisodeProps> = (props) => {
  const { video, debut, fin, mots, episode } = props;
  const { fps } = useVideoConfig();
  const dureeVideo = Math.round((fin - debut) * fps);

  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Sequence durationInFrames={dureeVideo}>
        <OffthreadVideo
          src={staticFile(video)}
          startFrom={Math.round(debut * fps)}
          endAt={Math.round(fin * fps)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          volume={(f) => interpolate(f, [dureeVideo - 10, dureeVideo], [1, 0], clamp)}
        />
        <SousTitres mots={mots} decalage={debut} />
      </Sequence>

      <Sequence durationInFrames={DUREE_TITRE}>
        <BandeauTitre episode={episode} />
        <Audio src={staticFile("sons/pop.wav")} volume={0.5} />
      </Sequence>

      <Sequence from={dureeVideo}>
        <CarteProgression {...props} />
      </Sequence>
      <Sequence from={dureeVideo} durationInFrames={20}>
        <Audio src={staticFile("sons/whoosh.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={dureeVideo + 60} durationInFrames={30}>
        <Audio src={staticFile("sons/impact.wav")} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};
