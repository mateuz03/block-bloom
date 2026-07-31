import Phaser from "phaser";
import { emitPuzzleState, gameEvents } from "../../game/events";
import type { GameAction } from "../../game/input/actions";
import {
  COLS,
  ROWS,
  canPlace,
  cloneBlocks,
  levels,
  matchingExit,
  type Block,
  type ColorId,
  type Exit,
} from "../../game/simulation/puzzle";

const colors: Record<ColorId, number> = {
  coral: 0xff6b66,
  blue: 0x5796ff,
  yellow: 0xffc94a,
  mint: 0x55d6a5,
};

type BlockView = Phaser.GameObjects.Container & { blockId: string };

export class GameScene extends Phaser.Scene {
  private levelIndex = Math.min(Number(localStorage.getItem("block-bloom-level") ?? 0), levels.length - 1);
  private blocks: Block[] = [];
  private views = new Map<string, BlockView>();
  private board!: Phaser.GameObjects.Container;
  private tile = 60;
  private boardX = 0;
  private boardY = 0;
  private moves = 0;
  private won = false;
  private dragStart = { col: 0, row: 0 };
  private readonly actionListener = (event: CustomEvent<GameAction>) => {
    if (event.detail === "next-level") {
      this.levelIndex = this.levelIndex === levels.length - 1 ? 0 : this.levelIndex + 1;
      localStorage.setItem("block-bloom-level", String(this.levelIndex));
    } else if (event.detail === "previous-level") {
      this.levelIndex = this.levelIndex === 0 ? levels.length - 1 : this.levelIndex - 1;
      localStorage.setItem("block-bloom-level", String(this.levelIndex));
    }
    this.loadLevel();
  };

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.board = this.add.container();
    this.scale.on("resize", this.layout, this);
    gameEvents.addEventListener("game-action", this.actionListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.layout, this);
      gameEvents.removeEventListener("game-action", this.actionListener);
    });
    this.loadLevel();
  }

  private loadLevel(): void {
    this.board.removeAll(true);
    this.views.clear();
    this.blocks = cloneBlocks(levels[this.levelIndex]);
    this.moves = 0;
    this.won = false;
    this.drawBoard();
    this.publish();
  }

  private layout(): void {
    this.drawBoard();
  }

  private drawBoard(): void {
    this.board.removeAll(true);
    this.views.clear();
    const availableW = Math.min(this.scale.width - 36, 500);
    const availableH = Math.min(this.scale.height - 190, 680);
    this.tile = Math.floor(Math.min(availableW / COLS, availableH / ROWS));
    this.boardX = Math.round((this.scale.width - this.tile * COLS) / 2);
    this.boardY = Math.round((this.scale.height - this.tile * ROWS) / 2 + 28);
    this.board.setPosition(this.boardX, this.boardY);

    const shadow = this.add.rectangle(
      (COLS * this.tile) / 2,
      (ROWS * this.tile) / 2 + 8,
      COLS * this.tile + 18,
      ROWS * this.tile + 18,
      0x7b6f9d,
      0.18,
    ).setStrokeStyle(2, 0xffffff, 0.72);
    this.board.add(shadow);

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = this.add.rectangle(
          col * this.tile + this.tile / 2,
          row * this.tile + this.tile / 2,
          this.tile - 3,
          this.tile - 3,
          0xffffff,
          0.35,
        ).setStrokeStyle(1, 0x776b91, 0.13);
        this.board.add(cell);
      }
    }

    levels[this.levelIndex].exits.forEach((exit) => this.drawExit(exit));
    this.blocks.forEach((block) => this.createBlockView(block));
  }

  private drawExit(exit: Exit): void {
    const thickness = 12;
    const color = colors[exit.color];
    let x = 0;
    let y = 0;
    let width = thickness;
    let height = exit.length * this.tile - 8;
    if (exit.side === "top" || exit.side === "bottom") {
      width = exit.length * this.tile - 8;
      height = thickness;
      x = exit.start * this.tile + (exit.length * this.tile) / 2;
      y = exit.side === "top" ? -8 : ROWS * this.tile + 8;
    } else {
      x = exit.side === "left" ? -8 : COLS * this.tile + 8;
      y = exit.start * this.tile + (exit.length * this.tile) / 2;
    }
    const gate = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(3, 0xffffff, 0.8);
    this.board.add(gate);
  }

  private createBlockView(block: Block): void {
    const width = block.width * this.tile - 8;
    const height = block.height * this.tile - 8;
    const base = this.add.rectangle(0, 5, width, height, 0x3d3451, 0.28);
    const body = this.add.rectangle(0, 0, width, height, colors[block.color], 1)
      .setStrokeStyle(3, 0xffffff, 0.75);
    const shine = this.add.rectangle(
      -width * 0.2,
      -height * 0.27,
      width * 0.42,
      Math.max(5, height * 0.11),
      0xffffff,
      0.28,
    );
    const view = this.add.container(0, 0, [base, body, shine]) as BlockView;
    view.blockId = block.id;
    view.setSize(width, height);
    view.setInteractive({ draggable: true, useHandCursor: true });
    this.board.add(view);
    this.positionView(view, block);
    this.views.set(block.id, view);

    view.on("dragstart", () => {
      this.dragStart = { col: block.col, row: block.row };
      view.setDepth(20);
      this.tweens.add({ targets: view, scale: 1.05, duration: 100 });
    });
    view.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.moveWithoutCrossing(block, view, dragX, dragY);
    });
    view.on("dragend", () => this.finishDrag(block, view));
  }

  private moveWithoutCrossing(block: Block, view: BlockView, dragX: number, dragY: number): void {
    const minX = (block.width * this.tile) / 2;
    const maxX = COLS * this.tile - minX;
    const minY = (block.height * this.tile) / 2;
    const maxY = ROWS * this.tile - minY;
    const targetX = Phaser.Math.Clamp(dragX, minX, maxX);
    const targetY = Phaser.Math.Clamp(dragY, minY, maxY);
    const startX = view.x;
    const startY = view.y;
    const distance = Math.max(Math.abs(targetX - startX), Math.abs(targetY - startY));
    const steps = Math.max(1, Math.ceil(distance / Math.max(6, this.tile * 0.15)));
    let safeX = startX;
    let safeY = startY;

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const nextX = Phaser.Math.Linear(startX, targetX, progress);
      const nextY = Phaser.Math.Linear(startY, targetY, progress);

      if (!this.overlapsAnotherBlock(block, nextX, nextY)) {
        safeX = nextX;
        safeY = nextY;
        continue;
      }

      // Slide along the obstacle on the free axis instead of passing through it.
      if (!this.overlapsAnotherBlock(block, nextX, safeY)) {
        safeX = nextX;
      }
      if (!this.overlapsAnotherBlock(block, safeX, nextY)) {
        safeY = nextY;
      }
    }

    view.setPosition(safeX, safeY);
  }

  private overlapsAnotherBlock(block: Block, x: number, y: number): boolean {
    const halfWidth = (block.width * this.tile - 8) / 2;
    const halfHeight = (block.height * this.tile - 8) / 2;

    return this.blocks.some((other) => {
      if (other.id === block.id) return false;
      const otherView = this.views.get(other.id);
      if (!otherView || !otherView.active) return false;
      const otherHalfWidth = (other.width * this.tile - 8) / 2;
      const otherHalfHeight = (other.height * this.tile - 8) / 2;
      return (
        Math.abs(x - otherView.x) < halfWidth + otherHalfWidth &&
        Math.abs(y - otherView.y) < halfHeight + otherHalfHeight
      );
    });
  }

  private finishDrag(block: Block, view: BlockView): void {
    const col = Phaser.Math.Clamp(Math.round((view.x - (block.width * this.tile) / 2) / this.tile), 0, COLS - block.width);
    const row = Phaser.Math.Clamp(Math.round((view.y - (block.height * this.tile) / 2) / this.tile), 0, ROWS - block.height);
    const moved = col !== this.dragStart.col || row !== this.dragStart.row;
    if (canPlace(block, col, row, this.blocks)) {
      block.col = col;
      block.row = row;
      if (moved) this.moves += 1;
    }
    this.tweens.add({ targets: view, scale: 1, duration: 100 });
    view.setDepth(1);
    this.positionView(view, block, true);

    const exit = matchingExit(block, levels[this.levelIndex].exits);
    if (exit) this.clearBlock(block, view, exit);
    else this.publish();
  }

  private clearBlock(block: Block, view: BlockView, exit: Exit): void {
    this.blocks = this.blocks.filter((item) => item.id !== block.id);
    const offset = this.tile * 1.4;
    const target = {
      x: view.x + (exit.side === "left" ? -offset : exit.side === "right" ? offset : 0),
      y: view.y + (exit.side === "top" ? -offset : exit.side === "bottom" ? offset : 0),
      alpha: 0,
      scale: 0.7,
    };
    this.tweens.add({
      targets: view,
      ...target,
      duration: 260,
      ease: "Back.easeIn",
      onComplete: () => view.destroy(),
    });
    this.cameras.main.flash(100, 255, 255, 255, false);
    if ("vibrate" in navigator) navigator.vibrate(18);
    if (this.blocks.length === 0) {
      this.won = true;
      this.time.delayedCall(280, () => this.publish());
    } else {
      this.publish();
    }
  }

  private positionView(view: BlockView, block: Block, animate = false): void {
    const target = {
      x: block.col * this.tile + (block.width * this.tile) / 2,
      y: block.row * this.tile + (block.height * this.tile) / 2,
    };
    if (animate) this.tweens.add({ targets: view, ...target, duration: 150, ease: "Sine.easeOut" });
    else view.setPosition(target.x, target.y);
  }

  private publish(): void {
    emitPuzzleState({
      level: this.levelIndex + 1,
      totalLevels: levels.length,
      moves: this.moves,
      remaining: this.blocks.length,
      won: this.won,
    });
  }
}
