import Phaser from "phaser";
import { GameScene } from "./phaser/scenes/GameScene";
import { createHud } from "./ui/hud";
import "./styles.css";

const gameRoot = document.querySelector<HTMLElement>("#game-root");
const hudRoot = document.querySelector<HTMLElement>("#hud-root");

if (!gameRoot || !hudRoot) {
  throw new Error("App roots not found.");
}

createHud(hudRoot);

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
