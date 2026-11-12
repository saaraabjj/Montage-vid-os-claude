import { Composition, Folder, Still } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { VlogRome, FPS, DUREE_SECONDES } from "./VlogRome";
import { MiniatureInsta, MiniatureYouTube } from "./VlogRome/Miniatures";
import { TeaserVertical, dureeTeaser, FPS_TEASER } from "./VlogRome/Teaser";
import { Logo } from "./HelloWorld/Logo";
import { MiniatureInstaJ2, MiniatureYouTubeJ2 } from "./VlogRome2/Miniatures";
import { TeaserVerticalJ2, dureeTeaser2, FPS_TEASER2 } from "./VlogRome2/Teaser";
import { VlogRome2, FPS as FPS_J2, DUREE_SECONDES as DUREE_J2 } from "./VlogRome2";
import { MontageJjb, dureeMontage, FPS as FPS_JJB } from "./Jjb";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VlogRomeJour2"
        component={VlogRome2}
        durationInFrames={Math.round(DUREE_J2 * FPS_J2)}
        fps={FPS_J2}
        width={1920}
        height={1080}
      />
      <Composition
        id="ReelJJB"
        component={MontageJjb}
        durationInFrames={dureeMontage("reel")}
        fps={FPS_JJB}
        width={1080}
        height={1920}
        defaultProps={{ id: "reel" }}
      />
      <Composition id="TeaserInstaJour2" component={TeaserVerticalJ2} durationInFrames={dureeTeaser2()} fps={FPS_TEASER2} width={1080} height={1920} />
      <Composition id="TeaserTikTok" component={TeaserVertical} durationInFrames={dureeTeaser()} fps={FPS_TEASER} width={1080} height={1920} />
      <Still id="MiniatureYouTube" component={MiniatureYouTube} width={1920} height={1080} />
      <Still id="MiniatureYouTubeJour2" component={MiniatureYouTubeJ2} width={1920} height={1080} />
      <Still id="MiniatureInstaJour2" component={MiniatureInstaJ2} width={1080} height={1920} />
      <Still id="MiniatureInsta" component={MiniatureInsta} width={1080} height={1920} />
      <Composition
        id="VlogRome"
        component={VlogRome}
        durationInFrames={Math.floor(DUREE_SECONDES * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
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
