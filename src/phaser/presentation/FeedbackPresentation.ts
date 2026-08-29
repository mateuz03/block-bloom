import Phaser from "phaser";
import type { ExitView } from "./BoardPresentation";
import { blockColors } from "./visualTheme";

type RegisterEffect = (effect: Phaser.GameObjects.GameObject) => void;

export function spawnExitBloom(
  scene: Phaser.Scene,
  board: Phaser.GameObjects.Container,
  view: ExitView,
  tile: number,
  reducedMotion: boolean,
  register: RegisterEffect,
): void {
  if (reducedMotion) return;
  const color = blockColors[view.exit.color];
  const glow = scene.add.circle(
    view.root.x,
    view.root.y,
    Math.max(18, tile * 0.34),
    color,
    0.2,
  ).setDepth(3);
  board.add(glow);
  register(glow);
  scene.tweens.add({
    targets: glow,
    scale: 2.2,
    alpha: 0,
    duration: 360,
    ease: "Cubic.easeOut",
    onComplete: () => glow.destroy(),
  });

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const petal = scene.add.ellipse(
      view.root.x,
      view.root.y,
      Math.max(7, tile * 0.12),
      Math.max(12, tile * 0.2),
      index % 2 === 0 ? color : 0xffffff,
      0.86,
    ).setDepth(8).setRotation(angle);
    board.add(petal);
    register(petal);
    scene.tweens.add({
      targets: petal,
      x: view.root.x + Math.cos(angle) * tile * 0.62,
      y: view.root.y + Math.sin(angle) * tile * 0.62,
      angle: petal.angle + (index % 2 === 0 ? 54 : -54),
      alpha: 0,
      scale: 0.52,
      duration: 390 + index * 12,
      ease: "Cubic.easeOut",
      onComplete: () => petal.destroy(),
    });
  }
}

export function spawnCompletionPetals(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  tile: number,
  reducedMotion: boolean,
  register: RegisterEffect,
): void {
  if (reducedMotion) return;
  const palette = [0xff6b66, 0x5796ff, 0xffc94a, 0x55d6a5];
  for (let index = 0; index < 10; index += 1) {
    const angle = (Math.PI * 2 * index) / 10 - Math.PI / 2;
    const startX = centerX + Math.cos(angle) * radiusX;
    const startY = centerY + Math.sin(angle) * radiusY;
    const petal = scene.add.ellipse(
      startX,
      startY,
      Math.max(8, tile * 0.17),
      Math.max(14, tile * 0.29),
      palette[index % palette.length],
      0.88,
    ).setDepth(8).setRotation(angle);
    register(petal);
    scene.tweens.add({
      targets: petal,
      x: startX + Math.cos(angle) * tile * 0.66,
      y: startY + Math.sin(angle) * tile * 0.66 + tile * 0.16,
      angle: petal.angle + (index % 2 === 0 ? 64 : -64),
      alpha: 0,
      scale: 0.58,
      duration: 480 + index * 14,
      ease: "Cubic.easeOut",
      onComplete: () => petal.destroy(),
    });
  }
}
