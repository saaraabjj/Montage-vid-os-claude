import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { VlogRome, FPS, DUREE_SECONDES } from "./VlogRome";
import { PubOsmosis, FPS as FPS_PUB, DUREE as DUREE_PUB } from "./PubOsmosis";
import { ConseilsSparring, FPS as FPS_CONSEILS, DUREE as DUREE_CONSEILS } from "./ConseilsSparring";
import { Couverture } from "./ConseilsSparring/Couverture";
import { JournalEpisode, calculerDuree } from "./Journal";
import { CouvertureJournal } from "./Journal/Couverture";
import { EPISODES } from "./Journal/episodes";
import { DUREE_FIN as FIN_JOURNAL, FPS as FPS_JOURNAL } from "./Journal/theme";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VlogRome"
        component={VlogRome}
        durationInFrames={Math.floor(DUREE_SECONDES * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PubOsmosis"
        component={PubOsmosis}
        durationInFrames={DUREE_PUB}
        fps={FPS_PUB}
        width={1080}
        height={1920}
      />
      <Composition
        id="ConseilsSparring"
        component={ConseilsSparring}
        durationInFrames={DUREE_CONSEILS}
        fps={FPS_CONSEILS}
        width={1080}
        height={1920}
      />
      <Still id="CouvertureSparring" component={Couverture} width={1080} height={1920} />
      <Folder name="Journal">
        {EPISODES.map((ep) => (
          <React.Fragment key={ep.id}>
            <Composition
              id={`Journal-Ep${ep.id}`}
              component={JournalEpisode}
              defaultProps={ep.video}
              calculateMetadata={calculerDuree}
              durationInFrames={FIN_JOURNAL}
              fps={FPS_JOURNAL}
              width={1080}
              height={1920}
            />
            <Still id={`Couverture-Ep${ep.id}`} component={CouvertureJournal} defaultProps={ep.couverture} width={1080} height={1920} />
          </React.Fragment>
        ))}
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};
