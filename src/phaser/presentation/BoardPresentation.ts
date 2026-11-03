import Phaser from "phaser";
import type { Exit } from "../../game/simulation/puzzle";
import {
  blockColors,
  blockShadows,
  blockSymbols,
  bloomPetalColors,
  visualPalette,
} from "./visualTheme";

export type ExitView = {
  exit: Exit;
  root: Phaser.GameObjects.Container;
  flower: Phaser.GameObjects.Container;
  halo: Phaser.GameObjects.Arc;
  petals: Phaser.GameObjects.Ellipse[];
  center: Phaser.GameObjects.Arc;
  symbol: Phaser.GameObjects.Text;
  restingOpen: boolean;
};

export function drawGardenBackdrop(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container,
): void {
  target.removeAll(true);
  const width = scene.scale.width;
  const height = scene.scale.height;
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(0xf5f1ff, 0xeee9ff, 0xeaf7f1, 0xf4efff, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(0xffffff, 0.28);
  graphics.fillEllipse(width * 0.5, height * 0.52, width * 0.94, height * 0.7);
  graphics.fillStyle(0xd7f2e3, 0.3);
  graphics.fillEllipse(width * 0.06, height * 0.91, width * 0.52, height * 0.31);
  graphics.fillEllipse(width * 0.94, height * 0.12, width * 0.43, height * 0.25);
  graphics.lineStyle(Math.max(2, width * 0.006), visualPalette.bloomLeaf, 0.16);
  graphics.beginPath();
  graphics.moveTo(0, height * 0.82);
  graphics.lineTo(width * 0.14, height * 0.69);
  graphics.moveTo(width, height * 0.22);
  graphics.lineTo(width * 0.86, height * 0.34);
  graphics.strokePath();
  target.add(graphics);

  const leaves = [
    { x: 0.03, y: 0.76, rotation: -0.62, color: 0x55b986 },
    { x: 0.1, y: 0.7, rotation: 0.48, color: 0x83c99e },
    { x: 0.93, y: 0.27, rotation: 0.68, color: 0x55b986 },
    { x: 0.98, y: 0.34, rotation: -0.52, color: 0x83c99e },
    { x: 0.08, y: 0.94, rotation: 0.34, color: 0xf0b36b },
    { x: 0.9, y: 0.08, rotation: -0.38, color: 0x8faee8 },
  ];
  for (const leaf of leaves) {
    target.add(scene.add.ellipse(
      width * leaf.x,
      height * leaf.y,
      Math.max(28, width * 0.11),
      Math.max(13, width * 0.045),
      leaf.color,
      0.18,
    ).setRotation(leaf.rotation));
  }

  const specks = [
    [0.15, 0.18, 0xffc94a],
    [0.84, 0.72, 0xff6b66],
    [0.12, 0.48, 0x5796ff],
    [0.9, 0.52, 0x55d6a5],
  ] as const;
  for (const [x, y, color] of specks) {
    target.add(scene.add.circle(
      width * x,
      height * y,
      Math.max(3, width * 0.008),
      color,
      0.16,
    ));
  }
}

export function drawBoardSurface(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container,
  columns: number,
  rows: number,
  tile: number,
): void {
  const boardWidth = columns * tile;
  const boardHeight = rows * tile;
  const tray = scene.add.graphics();
  tray.fillStyle(0x655a83, 0.18);
  tray.fillRoundedRect(-17, -7, boardWidth + 34, boardHeight + 35, 24);
  tray.fillStyle(0xffffff, 0.97);
  tray.fillRoundedRect(-17, -17, boardWidth + 34, boardHeight + 34, 24);
  tray.lineStyle(3, 0xffffff, 1);
  tray.strokeRoundedRect(-17, -17, boardWidth + 34, boardHeight + 34, 24);
  tray.fillStyle(0xd9d3e9, 0.74);
  tray.fillRoundedRect(-7, -7, boardWidth + 14, boardHeight + 14, 16);
  tray.lineStyle(2, visualPalette.boardEdge, 0.13);
  tray.strokeRoundedRect(-7, -7, boardWidth + 14, boardHeight + 14, 16);
  target.add(tray);

  const cells = scene.add.graphics();
  const gap = Math.max(4, Math.round(tile * 0.075));
  const radius = Math.max(6, Math.round(tile * 0.12));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const x = col * tile + gap / 2;
      const y = row * tile + gap / 2;
      const size = tile - gap;
      cells.fillStyle(
        (row + col) % 2 === 0
          ? visualPalette.cellLight
          : visualPalette.cellShade,
        (row + col) % 2 === 0 ? 0.56 : 0.44,
      );
      cells.fillRoundedRect(x, y, size, size, radius);
      cells.lineStyle(1, 0xffffff, 0.64);
      cells.strokeRoundedRect(x, y, size, size, radius);
    }
  }
  target.add(cells);
}

export function createExitPresentation(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container,
  exit: Exit,
  levelWidth: number,
  levelHeight: number,
  tile: number,
  restingOpen: boolean,
): ExitView {
  const horizontal = exit.side === "top" || exit.side === "bottom";
  const thickness = Math.max(15, Math.min(20, tile * 0.28));
  const channelLength = exit.length * tile - 8;
  const width = horizontal ? channelLength : thickness;
  const height = horizontal ? thickness : channelLength;
  const x = horizontal
    ? exit.start * tile + (exit.length * tile) / 2
    : exit.side === "left"
      ? -10
      : levelWidth * tile + 10;
  const y = horizontal
    ? exit.side === "top"
      ? -10
      : levelHeight * tile + 10
    : exit.start * tile + (exit.length * tile) / 2;

  const channel = scene.add.graphics();
  channel.fillStyle(blockShadows[exit.color], 0.28);
  channel.fillRoundedRect(
    -width / 2 - 3,
    -height / 2 + 3,
    width + 6,
    height + 6,
    thickness / 2,
  );
  channel.fillStyle(blockColors[exit.color], 0.98);
  channel.fillRoundedRect(-width / 2, -height / 2, width, height, thickness / 2);
  channel.lineStyle(3, 0xffffff, 0.92);
  channel.strokeRoundedRect(-width / 2, -height / 2, width, height, thickness / 2);
  channel.lineStyle(1, visualPalette.ink, 0.12);
  channel.strokeRoundedRect(
    -width / 2 + 4,
    -height / 2 + 4,
    width - 8,
    height - 8,
    Math.max(2, thickness / 2 - 4),
  );

  const halo = scene.add.circle(0, 0, Math.max(22, tile * 0.39), blockColors[exit.color], 0.1)
    .setStrokeStyle(2, 0xffffff, 0.36);
  const petalDistance = Math.max(13, tile * 0.23);
  const petalWidth = Math.max(13, tile * 0.21);
  const petalHeight = Math.max(20, tile * 0.33);
  const petals = [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => {
    const openX = Math.cos(angle) * petalDistance;
    const openY = Math.sin(angle) * petalDistance;
    const petal = scene.add.ellipse(
      openX * (restingOpen ? 1 : 0.68),
      openY * (restingOpen ? 1 : 0.68),
      petalWidth,
      petalHeight,
      bloomPetalColors[exit.color],
      restingOpen ? 0.98 : 0.94,
    ).setRotation(angle).setStrokeStyle(3, 0xffffff, 0.96);
    petal.setScale(restingOpen ? 1 : 0.86);
    petal.setData("openX", openX);
    petal.setData("openY", openY);
    petal.setData("closedX", openX * 0.68);
    petal.setData("closedY", openY * 0.68);
    return petal;
  });
  const center = scene.add.circle(
    0,
    0,
    Math.max(10, tile * 0.17),
    blockColors[exit.color],
    1,
  ).setStrokeStyle(3, 0xffffff, 0.96);
  const symbol = scene.add.text(0, 0, blockSymbols[exit.color], {
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSize: `${Math.max(13, Math.min(19, tile * 0.28))}px`,
    fontStyle: "bold",
    stroke: "#493f64",
    strokeThickness: 3,
  }).setOrigin(0.5);
  const flower = scene.add.container(0, 0, [halo, ...petals, center, symbol]);
  const root = scene.add.container(x, y, [channel, flower]).setDepth(4);
  target.add(root);

  return {
    exit,
    root,
    flower,
    halo,
    petals,
    center,
    symbol,
    restingOpen,
  };
}

export function setExitRestingState(view: ExitView, open: boolean): void {
  view.restingOpen = open;
  view.flower.setScale(1).setAlpha(1);
  view.halo.setAlpha(open ? 0.16 : 0.1).setScale(1);
  view.center.setScale(1).setStrokeStyle(3, 0xffffff, 0.96);
  view.symbol.setScale(1).setAlpha(1);
  for (const petal of view.petals) {
    petal
      .setPosition(
        Number(petal.getData(open ? "openX" : "closedX")),
        Number(petal.getData(open ? "openY" : "closedY")),
      )
      .setScale(open ? 1 : 0.86)
      .setAlpha(open ? 0.98 : 0.96);
  }
}
