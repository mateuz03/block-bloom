import Phaser from "phaser";
import { createGameAudio } from "./audio/gameAudio";
import { emitAppNavigation } from "./game/events";
import { GameScene } from "./phaser/scenes/GameScene";
import { createHud } from "./ui/hud";
import { createMainMenu } from "./ui/mainMenu";
import { createOnboarding } from "./ui/onboarding";
import { createPhaseHelp } from "./ui/phaseHelp";
import { createAndroidBackButton } from "./platform/androidBackButton";
import { createAppLifecycle } from "./platform/appLifecycle";
import "./styles.css";

const gameRoot = document.querySelector<HTMLElement>("#game-root");
const hudRoot = document.querySelector<HTMLElement>("#hud-root");

if (!gameRoot || !hudRoot) {
  throw new Error("App roots not found.");
}

createGameAudio();
createHud(hudRoot);
createMainMenu(hudRoot);
createOnboarding(hudRoot);
createPhaseHelp(hudRoot);
createAndroidBackButton();
createAppLifecycle();

const startGame = (): void => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameRoot,
    backgroundColor: "#eee9ff",
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent: gameRoot,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
    scene: [GameScene],
  });

  if (import.meta.env.DEV) {
    const preview = new URLSearchParams(window.location.search);
    const previewLevel = preview.get("level");
    if (preview.get("preview") === "game" && previewLevel) {
      window.setTimeout(() => {
        emitAppNavigation({
          screen: "game",
          levelId: previewLevel,
          mode: "restart",
        });
      }, 250);
    }
  }
};

if (import.meta.env.VITE_PLAYTEST_MODE === "true") {
  void import("./playtest/bootstrapPlaytest").then(({ bootstrapPlaytest }) => {
    bootstrapPlaytest(hudRoot);
    startGame();
  });
} else {
  startGame();
}
