import Phaser from "phaser";
import type { Block } from "../../game/simulation/puzzle";
import {
  blockColors,
  blockShadows,
  blockSymbols,
  visualPalette,
} from "./visualTheme";

export type BlockView = Phaser.GameObjects.Container & {
  blockId: string;
  shadow: Phaser.GameObjects.Graphics;
  blockBody: Phaser.GameObjects.Graphics;
  blockColor: number;
  blockWidth: number;
  blockHeight: number;
};

export function createBlockPresentation(
  scene: Phaser.Scene,
  block: Block,
  tile: number,
): BlockView {
  const width = block.width * tile - 8;
  const height = block.height * tile - 8;
  const radius = blockRadius(width, height);
  const shadow = scene.add.graphics().setY(Math.max(4, tile * 0.075));
  shadow.fillStyle(blockShadows[block.color], 0.38);
  shadow.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  const body = scene.add.graphics();
  paintBlockBody(body, width, height, blockColors[block.color], 3, 0.82);

  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.3);
  shine.fillRoundedRect(
    -width * 0.37,
    -height * 0.36,
    width * 0.53,
    Math.max(6, height * 0.12),
    Math.max(3, radius * 0.35),
  );
  shine.fillStyle(0xffffff, 0.14);
  shine.fillCircle(width * 0.29, -height * 0.27, Math.max(3, radius * 0.23));

  const symbolPlate = scene.add.circle(
    0,
    0,
    Math.max(16, Math.min(24, Math.min(width, height) * 0.32)),
    0xffffff,
    0.18,
  ).setStrokeStyle(1, 0xffffff, 0.34);
  const symbol = scene.add.text(0, 0, blockSymbols[block.color], {
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSize: `${Math.max(20, Math.min(34, Math.min(width, height) * 0.5))}px`,
    fontStyle: "bold",
    stroke: "#493f64",
    strokeThickness: 4,
  }).setOrigin(0.5);

  const view = scene.add.container(0, 0, [
    shadow,
    body,
    shine,
    symbolPlate,
    symbol,
  ]) as BlockView;
  view.blockId = block.id;
  view.shadow = shadow;
  view.blockBody = body;
  view.blockColor = blockColors[block.color];
  view.blockWidth = width;
  view.blockHeight = height;
  view.setSize(Math.max(44, width), Math.max(44, height));
  return view;
}

export function paintBlockBody(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  color: number,
  strokeWidth: number,
  strokeAlpha: number,
): void {
  const radius = blockRadius(width, height);
  graphics.clear();
  graphics.fillStyle(color, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  graphics.lineStyle(strokeWidth, 0xffffff, strokeAlpha);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  graphics.lineStyle(1, visualPalette.ink, 0.13);
  graphics.strokeRoundedRect(
    -width / 2 + 4,
    -height / 2 + 4,
    width - 8,
    height - 8,
    Math.max(6, radius - 4),
  );
}

export function restoreBlockStroke(
  view: BlockView,
  strokeWidth = 3,
  strokeAlpha = 0.82,
): void {
  paintBlockBody(
    view.blockBody,
    view.blockWidth,
    view.blockHeight,
    view.blockColor,
    strokeWidth,
    strokeAlpha,
  );
}

function blockRadius(width: number, height: number): number {
  return Math.max(10, Math.min(18, Math.min(width, height) * 0.23));
}
