import Phaser from "phaser";
import { emitPuzzleState, gameEvents } from "../../game/events";
import type { GameAction } from "../../game/input/actions";
import { PuzzleEngine } from "../../game/simulation/PuzzleEngine";
import { levels, type Block, type ColorId, type Exit } from "../../game/simulation/puzzle";
import {
  bestMovesFor,
  completeLevel,
  loadPuzzleProgress,
  savePuzzleProgress,
  selectProgressLevel,
  type PuzzleProgress,
} from "../../storage/puzzleProgress";

const colors: Record<ColorId, number> = {
  coral: 0xff6b66,
  blue: 0x5796ff,
  yellow: 0xffc94a,
  mint: 0x55d6a5,
};

const symbols: Record<ColorId, string> = {
  coral: "◆",
  blue: "●",
  yellow: "★",
  mint: "▲",
};

type BlockView = Phaser.GameObjects.Container & { blockId: string };
type ActiveDrag = { blockId: string; pointer: Phaser.Input.Pointer };
type ExitView = { exit: Exit; body: Phaser.GameObjects.Rectangle; symbol: Phaser.GameObjects.Text };

export class GameScene extends Phaser.Scene {
  private engine!: PuzzleEngine;
  private progress!: PuzzleProgress;
  private views = new Map<string, BlockView>();
  private exitViews: ExitView[] = [];
  private board!: Phaser.GameObjects.Container;
  private dropPreview?: Phaser.GameObjects.Rectangle;
  private tile = 60;
  private inputLocked = true;
  private activeDrag?: ActiveDrag;
  private unlockTimer?: Phaser.Time.TimerEvent;
  private transitionVersion = 0;
  private reducedMotion = false;
  private readonly allowLockedLevels = import.meta.env.DEV;

  private readonly actionListener = (event: CustomEvent<GameAction>) => {
    if (this.inputLocked) return;
    if (event.detail === "undo") {
      if (this.engine.state.history.length === 0) return;
      this.rebuildLocked(() => this.engine.undo());
      return;
    }
    if (event.detail === "restart") {
      this.rebuildLocked(() => this.engine.restart());
      return;
    }

    const currentIndex = levels.findIndex((level) => level.id === this.engine.state.levelId);
    const direction = event.detail === "next-level" ? 1 : -1;
    const targetIndex = (currentIndex + direction + levels.length) % levels.length;
    const selected = selectProgressLevel(this.progress, levels[targetIndex].id, levels, this.allowLockedLevels);
    if (selected.currentLevelId === this.progress.currentLevelId) return;

    this.rebuildLocked(() => {
      this.progress = selected;
      savePuzzleProgress(this.progress, levels);
      return this.engine.loadLevel(selected.currentLevelId);
    });
  };

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.progress = loadPuzzleProgress(levels);
    if (this.allowLockedLevels) {
      const requestedLevelId = new URLSearchParams(window.location.search).get("level");
      if (requestedLevelId) this.progress = selectProgressLevel(this.progress, requestedLevelId, levels, true);
    }
    this.engine = new PuzzleEngine(levels, this.progress.currentLevelId);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.board = this.add.container();
    this.scale.on("resize", this.handleViewportChange, this);
    window.addEventListener("orientationchange", this.handleOrientationChange);
    gameEvents.addEventListener("game-action", this.actionListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroyScene, this);
    this.drawBoard();
    this.setInputLocked(false);
  }

  private drawBoard(): void {
    this.board.removeAll(true);
    this.views.clear();
    this.exitViews = [];
    const level = this.engine.currentLevel;
    // Reserve room for the exits and their symbols outside the board edge.
    const availableW = Math.min(this.scale.width - 72, 500);
    const availableH = Math.min(this.scale.height - 210, 680);
    this.tile = Math.floor(Math.min(availableW / level.width, availableH / level.height));
    const boardX = Math.round((this.scale.width - this.tile * level.width) / 2);
    const boardY = Math.round((this.scale.height - this.tile * level.height) / 2 + 28);
    this.board.setPosition(boardX, boardY);

    const shadow = this.add.rectangle(
      (level.width * this.tile) / 2,
      (level.height * this.tile) / 2 + 8,
      level.width * this.tile + 18,
      level.height * this.tile + 18,
      0x7b6f9d,
      0.18,
    ).setStrokeStyle(2, 0xffffff, 0.72);
    this.board.add(shadow);

    for (let row = 0; row < level.height; row += 1) {
      for (let col = 0; col < level.width; col += 1) {
        this.board.add(this.add.rectangle(
          col * this.tile + this.tile / 2,
          row * this.tile + this.tile / 2,
          this.tile - 3,
          this.tile - 3,
          0xffffff,
          0.35,
        ).setStrokeStyle(1, 0x776b91, 0.13));
      }
    }

    level.exits.forEach((exit) => this.drawExit(exit));
    this.dropPreview = this.add.rectangle(0, 0, this.tile - 8, this.tile - 8, 0x55d6a5, 0.18)
      .setStrokeStyle(3, 0xffffff, 0.9)
      .setDepth(5)
      .setVisible(false);
    this.board.add(this.dropPreview);
    this.engine.state.blocks.forEach((block) => this.createBlockView(block));
    this.applyInputState();
  }

  private drawExit(exit: Exit): void {
    const level = this.engine.currentLevel;
    const thickness = 14;
    let x: number;
    let y: number;
    let width = thickness;
    let height = exit.length * this.tile - 8;
    if (exit.side === "top" || exit.side === "bottom") {
      width = exit.length * this.tile - 8;
      height = thickness;
      x = exit.start * this.tile + (exit.length * this.tile) / 2;
      y = exit.side === "top" ? -8 : level.height * this.tile + 8;
    } else {
      x = exit.side === "left" ? -8 : level.width * this.tile + 8;
      y = exit.start * this.tile + (exit.length * this.tile) / 2;
    }
    const body = this.add.rectangle(x, y, width, height, colors[exit.color], 1).setStrokeStyle(3, 0xffffff, 0.82);
    const symbol = this.add.text(x, y, symbols[exit.color], {
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontSize: `${Math.max(15, Math.min(22, this.tile * 0.34))}px`,
      fontStyle: "bold",
      stroke: "#3e3652",
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.board.add([body, symbol]);
    this.exitViews.push({ exit, body, symbol });
  }

  private createBlockView(block: Block): void {
    const width = block.width * this.tile - 8;
    const height = block.height * this.tile - 8;
    const base = this.add.rectangle(0, 5, width, height, 0x3d3451, 0.28);
    const body = this.add.rectangle(0, 0, width, height, colors[block.color], 1).setStrokeStyle(3, 0xffffff, 0.75);
    const shine = this.add.rectangle(-width * 0.2, -height * 0.27, width * 0.42, Math.max(5, height * 0.11), 0xffffff, 0.28);
    const symbol = this.add.text(0, 0, symbols[block.color], {
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontSize: `${Math.max(20, Math.min(34, Math.min(width, height) * 0.52))}px`,
      fontStyle: "bold",
      stroke: "#3e3652",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const view = this.add.container(0, 0, [base, body, shine, symbol]) as BlockView;
    view.blockId = block.id;
    view.setSize(Math.max(44, width), Math.max(44, height));
    view.setInteractive({ draggable: true, useHandCursor: true });
    this.board.add(view);
    this.positionView(view, block);
    this.views.set(block.id, view);

    view.on("dragstart", (pointer: Phaser.Input.Pointer) => this.startDrag(block.id, view, pointer));
    view.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (!this.ownsDrag(block.id, pointer)) return;
      const current = this.engine.state.blocks.find((candidate) => candidate.id === block.id);
      if (!current) return;
      this.moveWithoutCrossing(current, view, dragX, dragY);
      this.updateDropPreview(current, view);
    });
    view.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (this.ownsDrag(block.id, pointer)) this.finishDrag(block.id, view);
    });
  }

  private startDrag(blockId: string, view: BlockView, pointer: Phaser.Input.Pointer): void {
    if (this.inputLocked || this.activeDrag) {
      this.stopPointerDrag(pointer);
      return;
    }
    const block = this.engine.state.blocks.find((candidate) => candidate.id === blockId);
    if (!block) return;
    this.activeDrag = { blockId, pointer };
    view.setDepth(20);
    this.tweens.killTweensOf(view);
    this.tweens.add({ targets: view, scale: 1.05, duration: this.duration(100) });
    this.highlightCompatibleExits(block);
    this.updateDropPreview(block, view);
  }

  private ownsDrag(blockId: string, pointer: Phaser.Input.Pointer): boolean {
    return !this.inputLocked && this.activeDrag?.blockId === blockId && this.activeDrag.pointer.id === pointer.id;
  }

  private finishDrag(blockId: string, view: BlockView): void {
    const block = this.engine.state.blocks.find((candidate) => candidate.id === blockId);
    this.activeDrag = undefined;
    this.hideDragFeedback();
    if (!block) return;
    this.setInputLocked(true);

    const level = this.engine.currentLevel;
    const col = Phaser.Math.Clamp(Math.round((view.x - (block.width * this.tile) / 2) / this.tile), 0, level.width - block.width);
    const row = Phaser.Math.Clamp(Math.round((view.y - (block.height * this.tile) / 2) / this.tile), 0, level.height - block.height);
    const transition = this.engine.moveBlock(blockId, col, row);
    const authoritativeBlock = transition.exited?.block ?? transition.state.blocks.find((candidate) => candidate.id === blockId) ?? block;

    if (transition.state.status === "won" && transition.changed) {
      this.progress = completeLevel(this.progress, transition.state.levelId, transition.state.moves, levels);
      savePuzzleProgress(this.progress, levels);
    }

    this.tweens.killTweensOf(view);
    view.setDepth(1);
    const snapTarget = this.blockPosition(authoritativeBlock);
    if (!transition.changed && !this.reducedMotion) this.cameras.main.shake(70, 0.0015);
    this.tweens.add({
      targets: view,
      ...snapTarget,
      scale: 1,
      duration: this.duration(150),
      ease: "Sine.easeOut",
      onComplete: () => {
        if (transition.exited) this.animateExit(view, transition.exited.exit, transition.state.status === "won");
        else {
          if (transition.changed && !this.reducedMotion) this.cameras.main.flash(55, 85, 214, 165, false);
          this.setInputLocked(false);
        }
      },
    });
  }

  private animateExit(view: BlockView, exit: Exit, completed: boolean): void {
    const offset = this.tile * 1.4;
    this.tweens.add({
      targets: view,
      x: view.x + (exit.side === "left" ? -offset : exit.side === "right" ? offset : 0),
      y: view.y + (exit.side === "top" ? -offset : exit.side === "bottom" ? offset : 0),
      alpha: 0,
      scale: 0.7,
      duration: this.duration(260),
      ease: "Back.easeIn",
      onComplete: () => {
        this.views.delete(view.blockId);
        view.destroy();
        if (!this.reducedMotion) this.cameras.main.flash(completed ? 220 : 100, 255, 255, 255, false);
        if ("vibrate" in navigator) navigator.vibrate(completed ? [25, 30, 45] : 18);
        this.setInputLocked(false);
      },
    });
  }

  private updateDropPreview(block: Block, view: BlockView): void {
    if (!this.dropPreview) return;
    const level = this.engine.currentLevel;
    const col = Phaser.Math.Clamp(Math.round((view.x - (block.width * this.tile) / 2) / this.tile), 0, level.width - block.width);
    const row = Phaser.Math.Clamp(Math.round((view.y - (block.height * this.tile) / 2) / this.tile), 0, level.height - block.height);
    const preview = this.engine.previewMove(block.id, col, row);
    const color = preview.exits ? colors[block.color] : preview.valid ? 0x55d6a5 : 0xff6b66;
    this.dropPreview
      .setPosition(col * this.tile + (block.width * this.tile) / 2, row * this.tile + (block.height * this.tile) / 2)
      .setSize(block.width * this.tile - 8, block.height * this.tile - 8)
      .setDisplaySize(block.width * this.tile - 8, block.height * this.tile - 8)
      .setFillStyle(color, preview.exits ? 0.34 : 0.2)
      .setStrokeStyle(preview.exits ? 4 : 3, preview.valid ? 0xffffff : 0xff6b66, 0.95)
      .setVisible(true);
  }

  private highlightCompatibleExits(block: Block): void {
    for (const view of this.exitViews) {
      if (!this.isCompatibleExit(block, view.exit)) continue;
      view.body.setAlpha(1);
      view.symbol.setAlpha(1);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: [view.body, view.symbol], scale: 1.12, duration: 420, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      } else {
        view.body.setStrokeStyle(4, 0xffffff, 1);
      }
    }
  }

  private isCompatibleExit(block: Block, exit: Exit): boolean {
    if (block.color !== exit.color) return false;
    return exit.side === "top" || exit.side === "bottom" ? block.width === exit.length : block.height === exit.length;
  }

  private hideDragFeedback(): void {
    this.dropPreview?.setVisible(false);
    for (const view of this.exitViews) {
      this.tweens.killTweensOf([view.body, view.symbol]);
      view.body.setScale(1).setAlpha(1).setStrokeStyle(3, 0xffffff, 0.82);
      view.symbol.setScale(1).setAlpha(1);
    }
  }

  private moveWithoutCrossing(block: Block, view: BlockView, dragX: number, dragY: number): void {
    const level = this.engine.currentLevel;
    const minX = (block.width * this.tile) / 2;
    const maxX = level.width * this.tile - minX;
    const minY = (block.height * this.tile) / 2;
    const maxY = level.height * this.tile - minY;
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
      if (!this.overlapsAnotherBlock(block, nextX, safeY)) safeX = nextX;
      if (!this.overlapsAnotherBlock(block, safeX, nextY)) safeY = nextY;
    }
    view.setPosition(safeX, safeY);
  }

  private overlapsAnotherBlock(block: Block, x: number, y: number): boolean {
    const halfWidth = (block.width * this.tile - 8) / 2;
    const halfHeight = (block.height * this.tile - 8) / 2;
    return this.engine.state.blocks.some((other) => {
      if (other.id === block.id) return false;
      const otherView = this.views.get(other.id);
      if (!otherView?.active) return false;
      return (
        Math.abs(x - otherView.x) < halfWidth + (other.width * this.tile - 8) / 2 &&
        Math.abs(y - otherView.y) < halfHeight + (other.height * this.tile - 8) / 2
      );
    });
  }

  private rebuildLocked(changeState: () => unknown): void {
    this.setInputLocked(true);
    this.cancelActiveDrag();
    this.tweens.killAll();
    changeState();
    this.drawBoard();
    this.scheduleUnlock(100);
  }

  private handleViewportChange(): void {
    if (!this.engine || !this.board) return;
    this.setInputLocked(true);
    this.cancelActiveDrag();
    this.tweens.killAll();
    this.drawBoard();
    this.scheduleUnlock(80);
  }

  private readonly handleOrientationChange = (): void => this.handleViewportChange();

  private cancelActiveDrag(): void {
    if (!this.activeDrag) return;
    this.hideDragFeedback();
    this.stopPointerDrag(this.activeDrag.pointer);
    this.activeDrag = undefined;
  }

  private stopPointerDrag(pointer: Phaser.Input.Pointer): void {
    try {
      this.input.setDragState(pointer, 0);
    } catch {
      // Phaser may already have released the pointer during resize/orientation changes.
    }
  }

  private scheduleUnlock(delay: number): void {
    const version = ++this.transitionVersion;
    this.unlockTimer?.remove(false);
    this.unlockTimer = this.time.delayedCall(this.duration(delay), () => {
      if (version === this.transitionVersion) this.setInputLocked(false);
    });
  }

  private setInputLocked(locked: boolean): void {
    this.inputLocked = locked;
    if (locked) this.cancelActiveDrag();
    this.applyInputState();
    this.publish();
  }

  private applyInputState(): void {
    for (const view of this.views.values()) {
      if (view.input) view.input.enabled = !this.inputLocked;
    }
  }

  private positionView(view: BlockView, block: Block): void {
    const target = this.blockPosition(block);
    view.setPosition(target.x, target.y);
  }

  private blockPosition(block: Block): { x: number; y: number } {
    return {
      x: block.col * this.tile + (block.width * this.tile) / 2,
      y: block.row * this.tile + (block.height * this.tile) / 2,
    };
  }

  private duration(milliseconds: number): number {
    return this.reducedMotion ? 0 : milliseconds;
  }

  private publish(): void {
    if (!this.engine || !this.progress) return;
    const state = this.engine.state;
    const levelIndex = levels.findIndex((level) => level.id === state.levelId);
    const level = levels[levelIndex];
    const highestIndex = levels.findIndex((candidate) => candidate.id === this.progress.highestUnlockedLevelId);
    emitPuzzleState({
      level: levelIndex + 1,
      levelId: level.id,
      levelName: level.name,
      totalLevels: levels.length,
      moves: state.moves,
      idealMoves: level.idealMoves,
      bestMoves: bestMovesFor(this.progress, level),
      remaining: state.blocks.length,
      won: state.status === "won",
      canUndo: state.history.length > 0,
      canGoPrevious: this.allowLockedLevels || levelIndex > 0,
      canGoNext: this.allowLockedLevels || levelIndex < highestIndex || (levelIndex === levels.length - 1 && state.status === "won"),
      inputLocked: this.inputLocked,
    });
  }

  private destroyScene(): void {
    this.cancelActiveDrag();
    this.unlockTimer?.remove(false);
    this.scale.off("resize", this.handleViewportChange, this);
    window.removeEventListener("orientationchange", this.handleOrientationChange);
    gameEvents.removeEventListener("game-action", this.actionListener);
  }
}
