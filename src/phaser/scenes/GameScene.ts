import Phaser from "phaser";
import { playGameSound } from "../../audio/gameAudio";
import {
  emitPuzzleInteraction,
  emitPuzzleState,
  gameEvents,
  isAppLifecycleActive,
  type AppLifecycleChange,
  type AppNavigation,
  type UiInputBlock,
} from "../../game/events";
import {
  DragController,
  type DragSnapshot,
} from "../../game/input/DragController";
import {
  InputLockManager,
  type InputLockReason,
} from "../../game/input/InputLockManager";
import { playHaptic } from "../../platform/haptics";
import {
  loadGameSettings,
  type GameSettings,
} from "../../storage/gameSettings";
import type { GameAction } from "../../game/input/actions";
import { PuzzleEngine } from "../../game/simulation/PuzzleEngine";
import {
  activeVineCells,
  levels,
  type Block,
  type BloomTrigger,
  type Cell,
  type Exit,
  type Vine,
} from "../../game/simulation/puzzle";
import {
  bestMovesFor,
  completeLevel,
  loadPuzzleProgress,
  savePuzzleProgress,
  selectProgressLevel,
  type PuzzleProgress,
} from "../../storage/puzzleProgress";
import {
  clearActivePuzzle,
  loadActivePuzzle,
  saveActivePuzzle,
} from "../../storage/activePuzzle";
import {
  createExitPresentation,
  drawBoardSurface,
  drawGardenBackdrop,
  setExitRestingState,
  type ExitView,
} from "../presentation/BoardPresentation";
import {
  createBlockPresentation,
  restoreBlockStroke,
  type BlockView,
} from "../presentation/BlockPresentation";
import {
  spawnCompletionPetals,
  spawnExitBloom,
} from "../presentation/FeedbackPresentation";
import { blockColors } from "../presentation/visualTheme";

type VineView = Phaser.GameObjects.Container & { vineId: string };

type DropFeedback = "valid" | "invalid" | "exit";
type BoardLayout = {
  tile: number;
  x: number;
  y: number;
};

export class GameScene extends Phaser.Scene {
  private engine!: PuzzleEngine;
  private progress!: PuzzleProgress;
  private views = new Map<string, BlockView>();
  private exitViews: ExitView[] = [];
  private bloomViews = new Map<string, ExitView>();
  private vineViews = new Map<string, VineView>();
  private ephemeralEffects = new Set<Phaser.GameObjects.GameObject>();
  private blockedCells: Cell[] = [];
  private backdrop!: Phaser.GameObjects.Container;
  private board!: Phaser.GameObjects.Container;
  private dropPreview?: Phaser.GameObjects.Rectangle;
  private dropFeedback?: DropFeedback;
  private lastPreviewCell?: string;
  private tile = 60;
  private readonly dragController = new DragController();
  private readonly inputLocks = new InputLockManager([
    "transition",
    "navigation",
  ]);
  private activeDragPointer?: Phaser.Input.Pointer;
  private unlockTimer?: Phaser.Time.TimerEvent;
  private transitionVersion = 0;
  private settings!: GameSettings;
  private reducedMotionQuery?: MediaQueryList;
  private reducedMotion = false;
  private readonly allowLockedLevels = import.meta.env.DEV;
  private readonly registerEffect = (
    effect: Phaser.GameObjects.GameObject,
  ): void => {
    this.ephemeralEffects.add(effect);
    effect.once("destroy", () => this.ephemeralEffects.delete(effect));
  };

  private get inputLocked(): boolean {
    return this.inputLocks.locked;
  }

  private readonly settingsListener = (
    event: CustomEvent<GameSettings>,
  ): void => {
    this.settings = { ...event.detail };
    this.updateReducedMotionPreference();
  };

  private readonly reducedMotionListener = (): void => {
    this.updateReducedMotionPreference();
  };

  private readonly uiInputBlockListener = (
    event: CustomEvent<UiInputBlock>,
  ): void => {
    this.setInputLock(event.detail.source, event.detail.blocked);
  };

  private readonly appNavigationListener = (
    event: CustomEvent<AppNavigation>,
  ): void => {
    if (event.detail.screen === "game") {
      this.enterGameplay(event.detail.levelId, event.detail.mode);
      return;
    }

    this.leaveGameplay();
  };

  private readonly appLifecycleListener = (
    event: CustomEvent<AppLifecycleChange>,
  ): void => {
    if (!event.detail.active) {
      this.persistActivePuzzle();
      this.setInputLock("background", true);
      return;
    }

    this.resumeFromInterruption();
  };

  private readonly handlePointerCancel = (): void => {
    this.cancelActiveDrag();
  };

  private readonly actionListener = (event: CustomEvent<GameAction>) => {
    if (this.inputLocked) return;
    if (event.detail === "undo") {
      if (this.engine.state.history.length === 0) return;
      this.rebuildLocked(() => {
        const transition = this.engine.undo();
        if (transition.changed) {
          emitPuzzleInteraction({
            type: "undo",
            levelId: transition.state.levelId,
            moves: transition.state.moves,
          });
        }
        this.persistActivePuzzle();
        return transition;
      });
      return;
    }
    if (event.detail === "restart") {
      this.rebuildLocked(() => {
        const state = this.engine.restart();
        emitPuzzleInteraction({
          type: "restart",
          levelId: state.levelId,
          moves: state.moves,
        });
        clearActivePuzzle();
        return state;
      });
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
      clearActivePuzzle();
      return this.engine.loadLevel(selected.currentLevelId);
    });
  };

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.inputLocks.reset(["transition", "navigation"]);
    if (!isAppLifecycleActive()) this.inputLocks.lock("background");
    this.dragController.cancel();
    this.activeDragPointer = undefined;
    this.progress = loadPuzzleProgress(levels);
    if (this.allowLockedLevels) {
      const requestedLevelId = new URLSearchParams(window.location.search).get("level");
      if (requestedLevelId) this.progress = selectProgressLevel(this.progress, requestedLevelId, levels, true);
    }
    this.engine = new PuzzleEngine(levels, this.progress.currentLevelId);
    this.settings = loadGameSettings();
    this.reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    this.updateReducedMotionPreference();
    this.reducedMotionQuery.addEventListener(
      "change",
      this.reducedMotionListener,
    );
    this.backdrop = this.add.container().setDepth(-20);
    this.board = this.add.container().setDepth(1);
    this.scale.on("resize", this.handleViewportChange, this);
    window.addEventListener("orientationchange", this.handleOrientationChange);
    window.addEventListener("pointercancel", this.handlePointerCancel);
    gameEvents.addEventListener("game-action", this.actionListener);
    gameEvents.addEventListener("game-settings", this.settingsListener);
    gameEvents.addEventListener("ui-input-block", this.uiInputBlockListener);
    gameEvents.addEventListener("app-navigation", this.appNavigationListener);
    gameEvents.addEventListener(
      "app-lifecycle-change",
      this.appLifecycleListener,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroyScene, this);
    this.drawGardenBackdrop();
    this.drawBoard();
    this.setInputLocked(false);
  }

  private drawGardenBackdrop(): void {
    drawGardenBackdrop(this, this.backdrop);
  }

  private drawBoard(): void {
  this.clearEphemeralEffects();
  this.board.removeAll(true);
  this.views.clear();
  this.exitViews = [];
  this.bloomViews.clear();
  this.vineViews.clear();

  const level = this.engine.currentLevel;
  const state = this.engine.state;
  this.blockedCells = activeVineCells(level, state.removedVineIds);
  const layout = this.calculateBoardLayout(
    level.width,
    level.height,
  );

  this.tile = layout.tile;
  this.board.setPosition(layout.x, layout.y);

    drawBoardSurface(
      this,
      this.board,
      level.width,
      level.height,
      this.tile,
    );

    for (const vine of level.vines ?? []) {
      if (!state.removedVineIds.includes(vine.id)) this.drawVine(vine);
    }
    level.exits.forEach((exit) => this.drawExit(exit));
    this.dropPreview = this.add.rectangle(0, 0, this.tile - 8, this.tile - 8, 0x55d6a5, 0.18)
      .setStrokeStyle(3, 0xffffff, 0.9)
      .setDepth(5)
      .setVisible(false);
    this.board.add(this.dropPreview);
    state.blocks.forEach((block) => this.createBlockView(block));
    this.applyInputState();
  }

  private drawVine(vine: Vine): void {
    const graphics = this.add.graphics();
    const inset = Math.max(5, Math.round(this.tile * 0.1));
    const leafSize = Math.max(6, Math.round(this.tile * 0.16));
    graphics.fillStyle(0x397f62, 0.94);
    graphics.lineStyle(Math.max(2, this.tile * 0.06), 0xffffff, 0.32);

    for (const cell of vine.cells) {
      const x = cell.col * this.tile + inset;
      const y = cell.row * this.tile + this.tile * 0.37;
      const width = this.tile - inset * 2;
      const height = Math.max(10, this.tile * 0.26);
      graphics.fillRoundedRect(x, y, width, height, height / 2);
      graphics.strokeRoundedRect(x, y, width, height, height / 2);
      graphics.fillStyle(0x8ce0a9, 0.95);
      graphics.fillEllipse(x + width * 0.32, y - leafSize * 0.12, leafSize, leafSize * 0.65);
      graphics.fillEllipse(x + width * 0.68, y + height + leafSize * 0.12, leafSize, leafSize * 0.65);
      graphics.fillStyle(0x397f62, 0.94);
    }

    const marker = this.add.text(
      vine.cells[0].col * this.tile + this.tile / 2,
      vine.cells[0].row * this.tile + this.tile / 2,
      "⌁",
      {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: `${Math.max(16, this.tile * 0.3)}px`,
        fontStyle: "bold",
        stroke: "#285944",
        strokeThickness: 3,
      },
    ).setOrigin(0.5);
    const view = this.add.container(0, 0, [graphics, marker]) as VineView;
    view.vineId = vine.id;
    view.setDepth(3);
    this.board.add(view);
    this.vineViews.set(vine.id, view);
  }

  private drawExit(exit: Exit): void {
    const level = this.engine.currentLevel;
    const blooms = exit.id
      ? (level.blooms ?? []).filter((bloom) => bloom.exitId === exit.id)
      : [];
    const opened = blooms.some((bloom) =>
      this.engine.state.activatedBloomIds.includes(bloom.id));
    const view = createExitPresentation(
      this,
      this.board,
      exit,
      level.width,
      level.height,
      this.tile,
      opened,
    );
    this.exitViews.push(view);
    blooms.forEach((bloom) => this.bloomViews.set(bloom.id, view));
  }

  private createBlockView(block: Block): void {
    const view = createBlockPresentation(this, block, this.tile);
    view.setInteractive({ draggable: true, useHandCursor: true });
    this.board.add(view);
    this.positionView(view, block);
    this.views.set(block.id, view);

    view.on("dragstart", (pointer: Phaser.Input.Pointer) => this.startDrag(block.id, view, pointer));
    view.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const session = this.dragController.sessionFor(block.id, pointer.id);
      if (this.inputLocked || !session) return;
      this.moveWithoutCrossing(session.snapshot, view, dragX, dragY);
      this.updateDropPreview(session.snapshot.block, view, session.snapshot);
    });
    view.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (this.ownsDrag(block.id, pointer)) this.finishDrag(block.id, view, pointer);
    });
  }

  private restoreBlockStroke(
    view: BlockView,
    strokeWidth: number,
    strokeAlpha: number,
  ): void {
    restoreBlockStroke(view, strokeWidth, strokeAlpha);
  }

  private startDrag(
  blockId: string,
  view: BlockView,
  pointer: Phaser.Input.Pointer,
): void {
  if (this.inputLocked || this.dragController.active) {
    this.stopPointerDrag(pointer);
    return;
  }

  const state = this.engine.state;
  const level = this.engine.currentLevel;
  const block = state.blocks.find(
    (candidate) => candidate.id === blockId,
  );

  if (!block) return;

  const started = this.dragController.begin(blockId, pointer.id, {
    block,
    blocks: state.blocks,
    blockedCells: this.blockedCells,
    levelWidth: level.width,
    levelHeight: level.height,
  });

  if (!started) {
    this.stopPointerDrag(pointer);
    return;
  }

  this.activeDragPointer = pointer;

  this.dropFeedback = undefined;
  this.lastPreviewCell = undefined;
  playGameSound("pickup");
  playHaptic("pickup", this.settings.vibrationEnabled);

  view.setDepth(20);

  this.tweens.killTweensOf([
    view,
    view.shadow,
    view.blockBody,
  ]);

  this.tweens.add({
    targets: view,
    scale: 1.045,
    duration: this.duration(90),
    ease: "Sine.easeOut",
  });

  this.tweens.add({
    targets: view.shadow,
    y: 9,
    alpha: 0.56,
    duration: this.duration(90),
    ease: "Sine.easeOut",
  });

  this.restoreBlockStroke(view, 4, 0.95);

  this.highlightCompatibleExits(block);
  const session = this.dragController.sessionFor(blockId, pointer.id);
  if (session) this.updateDropPreview(block, view, session.snapshot);
}

  private ownsDrag(blockId: string, pointer: Phaser.Input.Pointer): boolean {
    return !this.inputLocked && this.dragController.owns(blockId, pointer.id);
  }

  private finishDrag(
  blockId: string,
  view: BlockView,
  pointer: Phaser.Input.Pointer,
): void {
  const session = this.dragController.finish(blockId, pointer.id);

  this.activeDragPointer = undefined;

  if (!session) {
    this.hideDragFeedback();
    return;
  }

  const { block, levelWidth, levelHeight } = session.snapshot;

  this.setInputLocked(true);

  const col = Phaser.Math.Clamp(
    Math.round(
      (
        view.x -
        (block.width * this.tile) / 2
      ) / this.tile,
    ),
    0,
    levelWidth - block.width,
  );

  const row = Phaser.Math.Clamp(
    Math.round(
      (
        view.y -
        (block.height * this.tile) / 2
      ) / this.tile,
    ),
    0,
    levelHeight - block.height,
  );

  const transition =
    this.engine.moveBlock(
      blockId,
      col,
      row,
    );

  if (transition.changed) {
    emitPuzzleInteraction({
      type: "move",
      levelId: transition.state.levelId,
      moves: transition.state.moves,
      activatedBloomCount: transition.activatedBlooms.length,
      won: transition.state.status === "won",
    });
  } else if (col !== block.col || row !== block.row) {
    emitPuzzleInteraction({
      type: "invalid-drop",
      levelId: transition.state.levelId,
    });
  }

  if (transition.changed) this.persistActivePuzzle();

  this.blockedCells = activeVineCells(
    this.engine.currentLevel,
    transition.state.removedVineIds,
  );

  const authoritativeBlock =
    transition.exited?.block ??
    transition.state.blocks.find(
      (candidate) =>
        candidate.id === blockId,
    ) ??
    block;

  if (
    transition.state.status === "won" &&
    transition.changed
  ) {
    this.progress = completeLevel(
      this.progress,
      transition.state.levelId,
      transition.state.moves,
      levels,
    );

    savePuzzleProgress(
      this.progress,
      levels,
    );
  }

  this.tweens.killTweensOf([
    view,
    view.shadow,
    view.blockBody,
  ]);

  const snapTarget =
    this.blockPosition(
      authoritativeBlock,
    );

  if (!transition.changed) {
    this.animateInvalidDrop(
      view,
      snapTarget,
    );

    return;
  }

  if (transition.exited) {
    view.setDepth(1);

    this.tweens.add({
      targets: view,
      ...snapTarget,
      scale: 1,
      duration: this.duration(130),
      ease: "Sine.easeOut",
      onComplete: () => {
        this.restoreBlockAppearance(
          view,
        );

        this.animateExit(
          view,
          transition.exited!.exit,
          transition.state.status ===
            "won",
          transition.activatedBlooms,
          transition.removedVines,
        );
      },
    });

    return;
  }

  this.animateValidDrop(
    view,
    snapTarget,
  );
}

  private animateInvalidDrop(
  view: BlockView,
  target: { x: number; y: number },
): void {
  const distance = Math.max(
    4,
    Math.min(8, this.tile * 0.1),
  );
  playGameSound("invalid");
  playHaptic("invalid", this.settings.vibrationEnabled);

  view.setDepth(1);

  if (this.reducedMotion) {
    view
      .setPosition(target.x, target.y)
      .setScale(1);

    view.shadow
      .setY(5)
      .setAlpha(0.38);

    this.restoreBlockStroke(view, 3, 0.78);

    this.hideDragFeedback();
    this.setInputLocked(false);
    return;
  }

  this.cameras.main.shake(
    55,
    0.0012,
  );

  this.tweens.add({
    targets: view,
    x: target.x,
    y: target.y,
    scale: 1,
    duration: 110,
    ease: "Sine.easeOut",
    onComplete: () => {
      this.tweens.add({
        targets: view,
        x: {
          from: target.x - distance,
          to: target.x + distance,
        },
        duration: 45,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeInOut",
        onComplete: () => {
          view.setPosition(
            target.x,
            target.y,
          );

          this.restoreBlockAppearance(
            view,
          );

          this.hideDragFeedback();
          this.setInputLocked(false);
        },
      });
    },
  });
}

private animateValidDrop(
  view: BlockView,
  target: { x: number; y: number },
): void {
  playGameSound("snap");
  playHaptic("snap", this.settings.vibrationEnabled);
  view.setDepth(1);

  this.tweens.add({
    targets: view,
    ...target,
    scale: 1,
    duration: this.duration(130),
    ease: "Sine.easeOut",
    onComplete: () => {
      this.restoreBlockAppearance(view);

      if (this.reducedMotion) {
        this.hideDragFeedback();
        this.setInputLocked(false);
        return;
      }

      this.tweens.add({
        targets: view,
        scale: 0.96,
        duration: 52,
        ease: "Sine.easeIn",
        onComplete: () => {
          this.tweens.add({
            targets: view,
            scale: 1.03,
            duration: 62,
            ease: "Back.easeOut",
            onComplete: () => {
              this.tweens.add({
                targets: view,
                scale: 1,
                duration: 52,
                ease: "Sine.easeOut",
                onComplete: () => {
                  this.hideDragFeedback();
                  this.setInputLocked(false);
                },
              });
            },
          });
        },
      });
    },
  });
}

private restoreBlockAppearance(
  view: BlockView,
): void {
  view.setScale(1);

  view.shadow
    .setY(5)
    .setAlpha(0.38);

  this.restoreBlockStroke(view, 3, 0.78);
}
  private animateExit(
    view: BlockView,
    exit: Exit,
    completed: boolean,
    activatedBlooms: BloomTrigger[],
    removedVines: Vine[],
  ): void {
    this.hideDragFeedback();
    playGameSound("exit");
    playHaptic("exit", this.settings.vibrationEnabled);
    const exitView = this.findExitView(exit);
    if (exitView) {
      this.animateExitPortal(exitView);
      spawnExitBloom(
        this,
        this.board,
        exitView,
        this.tile,
        this.reducedMotion,
        this.registerEffect,
      );
    }
    this.time.delayedCall(this.duration(55), () => playGameSound("bloom"));
    const offset = this.tile * 1.4;
    this.tweens.add({
      targets: view,
      x: view.x + (exit.side === "left" ? -offset : exit.side === "right" ? offset : 0),
      y: view.y + (exit.side === "top" ? -offset : exit.side === "bottom" ? offset : 0),
      alpha: 0,
      scale: 0.7,
      delay: this.duration(55),
      duration: this.duration(245),
      ease: "Back.easeIn",
      onComplete: () => {
        this.views.delete(view.blockId);
        view.destroy();
        if (activatedBlooms.length > 0) {
          this.animateBloomEffects(activatedBlooms, removedVines, completed);
        } else {
          if (exitView) this.relaxExitPortal(exitView);
          this.finishExitFeedback(completed);
        }
      },
    });
  }

  private animateExitPortal(view: ExitView): void {
    this.tweens.killTweensOf([
      view.flower,
      view.halo,
      view.center,
      view.symbol,
      ...view.petals,
    ]);
    const duration = this.duration(155);
    for (const petal of view.petals) {
      this.tweens.add({
        targets: petal,
        x: Number(petal.getData("openX")),
        y: Number(petal.getData("openY")),
        scale: 1,
        alpha: 0.98,
        duration,
        ease: "Back.easeOut",
      });
    }
    this.tweens.add({
      targets: view.flower,
      scale: 1.1,
      duration: duration * 0.55,
      yoyo: true,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: view.halo,
      scale: 1.65,
      alpha: 0.04,
      duration: this.duration(240),
      ease: "Cubic.easeOut",
    });
    this.tweens.add({
      targets: view.center,
      scale: 1.3,
      duration: duration * 0.5,
      yoyo: true,
      ease: "Sine.easeOut",
    });
  }

  private relaxExitPortal(view: ExitView): void {
    if (!view.root.active || view.restingOpen) return;
    this.tweens.killTweensOf([
      view.flower,
      view.halo,
      view.center,
      ...view.petals,
    ]);
    view.flower.setScale(1);
    view.center.setScale(1);
    for (const petal of view.petals) {
      this.tweens.add({
        targets: petal,
        x: Number(petal.getData("closedX")),
        y: Number(petal.getData("closedY")),
        scale: 0.86,
        alpha: 0.96,
        duration: this.duration(125),
        ease: "Sine.easeOut",
      });
    }
    this.tweens.add({
      targets: view.halo,
      scale: 1,
      alpha: 0.1,
      duration: this.duration(125),
    });
  }

  private findExitView(exit: Exit): ExitView | undefined {
    return this.exitViews.find((view) =>
      view.exit.id === exit.id &&
      view.exit.side === exit.side &&
      view.exit.start === exit.start &&
      view.exit.length === exit.length &&
      view.exit.color === exit.color);
  }

  private animateBloomEffects(
    activatedBlooms: BloomTrigger[],
    removedVines: Vine[],
    completed: boolean,
  ): void {
    const bloomDuration = this.duration(180);
    for (const bloom of activatedBlooms) {
      const view = this.bloomViews.get(bloom.id);
      if (!view) continue;
      this.tweens.killTweensOf([
        view.flower,
        view.halo,
        view.center,
        view.symbol,
        ...view.petals,
      ]);
      setExitRestingState(view, true);
    }

    const vineTargets = removedVines
      .map((vine) => this.vineViews.get(vine.id))
      .filter((view): view is VineView => Boolean(view));
    const completeSequence = (): void => {
      for (const vine of removedVines) {
        const view = this.vineViews.get(vine.id);
        view?.destroy();
        this.vineViews.delete(vine.id);
      }
      this.finishExitFeedback(completed);
    };

    if (vineTargets.length === 0 || this.reducedMotion) {
      vineTargets.forEach((view) => view.setVisible(false));
      this.time.delayedCall(bloomDuration, completeSequence);
      return;
    }

    this.tweens.add({
      targets: vineTargets,
      alpha: 0,
      scale: 0.45,
      duration: 260,
      ease: "Cubic.easeIn",
      onComplete: completeSequence,
    });
  }

  private finishExitFeedback(completed: boolean): void {
    if (!completed) {
      this.setInputLocked(false);
      return;
    }

    playGameSound("victory");
    playHaptic("victory", this.settings.vibrationEnabled);
    this.celebrateCompletion();
    this.time.delayedCall(this.duration(280), () => this.setInputLocked(false));
  }

  private celebrateCompletion(): void {
    const level = this.engine.currentLevel;
    const centerX = this.board.x + (level.width * this.tile) / 2;
    const centerY = this.board.y + (level.height * this.tile) / 2;
    const radiusX = (level.width * this.tile) / 2 + 12;
    const radiusY = (level.height * this.tile) / 2 + 12;
    spawnCompletionPetals(
      this,
      centerX,
      centerY,
      radiusX,
      radiusY,
      this.tile,
      this.reducedMotion,
      this.registerEffect,
    );
  }

  private updateDropPreview(
  block: Block,
  view: BlockView,
  dragSnapshot?: DragSnapshot,
): void {
  if (!this.dropPreview) return;

  const levelWidth =
    dragSnapshot?.levelWidth ?? this.engine.currentLevel.width;
  const levelHeight =
    dragSnapshot?.levelHeight ?? this.engine.currentLevel.height;

  const col = Phaser.Math.Clamp(
    Math.round(
      (
        view.x -
        (block.width * this.tile) / 2
      ) / this.tile,
    ),
    0,
    levelWidth - block.width,
  );

  const row = Phaser.Math.Clamp(
    Math.round(
      (
        view.y -
        (block.height * this.tile) / 2
      ) / this.tile,
    ),
    0,
    levelHeight - block.height,
  );

  const preview = this.engine.previewMove(
    block.id,
    col,
    row,
  );

  const feedback: DropFeedback = preview.exits
    ? "exit"
    : preview.valid
      ? "valid"
      : "invalid";

  const previewCell = `${col}:${row}`;
  if (
    this.lastPreviewCell !== undefined &&
    previewCell !== this.lastPreviewCell
  ) {
    playGameSound("slide");
  }
  this.lastPreviewCell = previewCell;

  const color =
    feedback === "exit"
      ? blockColors[block.color]
      : feedback === "valid"
        ? 0x55d6a5
        : 0xff6b66;

  const width =
    block.width * this.tile - 8;

  const height =
    block.height * this.tile - 8;

  this.dropPreview
    .setPosition(
      col * this.tile +
        (block.width * this.tile) / 2,
      row * this.tile +
        (block.height * this.tile) / 2,
    )
    .setSize(width, height)
    .setDisplaySize(width, height)
    .setFillStyle(
      color,
      feedback === "exit"
        ? 0.38
        : feedback === "valid"
          ? 0.22
          : 0.15,
    )
    .setStrokeStyle(
      feedback === "exit" ? 4 : 3,
      feedback === "invalid"
        ? 0xff6b66
        : 0xffffff,
      0.96,
    )
    .setVisible(true);

  if (
    feedback !== this.dropFeedback &&
    !this.reducedMotion
  ) {
    this.tweens.killTweensOf(
      this.dropPreview,
    );

    this.dropPreview.setScale(0.94);

    this.tweens.add({
      targets: this.dropPreview,
      scale: 1,
      duration: 90,
      ease: "Back.easeOut",
    });
  } else {
    this.dropPreview.setScale(1);
  }

  this.dropFeedback = feedback;
}

  private highlightCompatibleExits(block: Block): void {
    const level = this.engine.currentLevel;
    const activeBloomIds = new Set(this.engine.state.activatedBloomIds);
    for (const view of this.exitViews) {
      if (!this.isCompatibleExit(block, view.exit)) continue;
      view.flower.setAlpha(1);
      view.symbol.setAlpha(1);
      if (!this.reducedMotion) {
        this.tweens.add({
          targets: view.flower,
          scale: 1.1,
          duration: 390,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        this.tweens.add({
          targets: view.halo,
          alpha: 0.3,
          scale: 1.18,
          duration: 390,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      } else {
        view.halo.setAlpha(0.3);
        view.center.setStrokeStyle(4, 0xffffff, 1);
      }

      const blooms = view.exit.id
        ? (level.blooms ?? []).filter((bloom) => bloom.exitId === view.exit.id && !activeBloomIds.has(bloom.id))
        : [];
      for (const bloom of blooms) {
        if (level.id === "level-11" && !this.reducedMotion) {
          for (const vine of level.vines ?? []) {
            if (vine.removedByBloomId !== bloom.id) continue;
            const vineView = this.vineViews.get(vine.id);
            if (vineView) {
              this.tweens.add({ targets: vineView, alpha: 0.68, duration: 300, yoyo: true, repeat: -1 });
            }
          }
        }
      }
    }
  }

  private isCompatibleExit(block: Block, exit: Exit): boolean {
    if (block.color !== exit.color) return false;
    return exit.side === "top" || exit.side === "bottom" ? block.width === exit.length : block.height === exit.length;
  }

  private hideDragFeedback(): void {
  this.dropFeedback = undefined;
  this.lastPreviewCell = undefined;

  if (this.dropPreview) {
    this.tweens.killTweensOf(
      this.dropPreview,
    );

    this.dropPreview
      .setScale(1)
      .setVisible(false);
  }

  for (const view of this.exitViews) {
    this.tweens.killTweensOf([
      view.flower,
      view.halo,
      view.center,
      view.symbol,
      ...view.petals,
    ]);
    setExitRestingState(view, view.restingOpen);
  }

  for (const view of this.vineViews.values()) {
    this.tweens.killTweensOf(view);
    view.setScale(1).setAlpha(1);
  }
}

  private moveWithoutCrossing(
    snapshot: DragSnapshot,
    view: BlockView,
    dragX: number,
    dragY: number,
  ): void {
    const { block, levelWidth, levelHeight } = snapshot;
    const minX = (block.width * this.tile) / 2;
    const maxX = levelWidth * this.tile - minX;
    const minY = (block.height * this.tile) / 2;
    const maxY = levelHeight * this.tile - minY;
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
      if (this.isDragPositionFree(snapshot, nextX, nextY)) {
        safeX = nextX;
        safeY = nextY;
        continue;
      }
      if (this.isDragPositionFree(snapshot, nextX, safeY)) safeX = nextX;
      if (this.isDragPositionFree(snapshot, safeX, nextY)) safeY = nextY;
    }
    view.setPosition(safeX, safeY);
  }

  private overlapsAnotherBlock(snapshot: DragSnapshot, x: number, y: number): boolean {
    const { block } = snapshot;
    const halfWidth = (block.width * this.tile - 8) / 2;
    const halfHeight = (block.height * this.tile - 8) / 2;
    return snapshot.blocks.some((other) => {
      if (other.id === block.id) return false;
      const otherView = this.views.get(other.id);
      if (!otherView?.active) return false;
      return (
        Math.abs(x - otherView.x) < halfWidth + (other.width * this.tile - 8) / 2 &&
        Math.abs(y - otherView.y) < halfHeight + (other.height * this.tile - 8) / 2
      );
    });
  }

  private isDragPositionFree(snapshot: DragSnapshot, x: number, y: number): boolean {
    return !this.overlapsAnotherBlock(snapshot, x, y) && !this.overlapsActiveVine(snapshot, x, y);
  }

  private overlapsActiveVine(snapshot: DragSnapshot, x: number, y: number): boolean {
    const { block } = snapshot;
    const halfWidth = (block.width * this.tile - 8) / 2;
    const halfHeight = (block.height * this.tile - 8) / 2;
    return snapshot.blockedCells.some((cell) => {
      const cellX = cell.col * this.tile + this.tile / 2;
      const cellY = cell.row * this.tile + this.tile / 2;
      return Math.abs(x - cellX) < halfWidth + this.tile / 2 && Math.abs(y - cellY) < halfHeight + this.tile / 2;
    });
  }

  private rebuildLocked(changeState: () => unknown): void {
    this.setInputLocked(true);
    this.tweens.killAll();
    changeState();
    this.drawBoard();
    this.scheduleUnlock(100);
  }

  private clearEphemeralEffects(): void {
    for (const effect of this.ephemeralEffects) {
      if (effect.active) effect.destroy();
    }
    this.ephemeralEffects.clear();
  }

  private enterGameplay(
    levelId: string,
    mode: "continue" | "restart",
  ): void {
    const selected = selectProgressLevel(
      this.progress,
      levelId,
      levels,
      this.allowLockedLevels,
    );
    const changedLevel =
      selected.currentLevelId !== this.progress.currentLevelId;

    this.setInputLock("navigation", true);
    this.rebuildLocked(() => {
      this.progress = selected;
      if (changedLevel) savePuzzleProgress(this.progress, levels);
      const saved = mode === "continue"
        ? loadActivePuzzle(levels)
        : undefined;
      if (
        saved?.levelId === selected.currentLevelId
      ) {
        try {
          return this.engine.restoreState(saved.state);
        } catch {
          clearActivePuzzle();
        }
      } else {
        clearActivePuzzle();
      }
      return this.engine.loadLevel(selected.currentLevelId);
    });
    this.setInputLock("navigation", false);
  }

  private leaveGameplay(): void {
    this.persistActivePuzzle();
    this.setInputLock("navigation", true);
    this.transitionVersion += 1;
    this.unlockTimer?.remove(false);
    this.unlockTimer = undefined;
    this.cancelActiveDrag();
    this.tweens.killAll();
    this.clearEphemeralEffects();
    this.hideDragFeedback();
    this.setInputLocked(false);
  }

  private persistActivePuzzle(): void {
    if (!this.engine) return;
    saveActivePuzzle(this.engine.state, levels);
  }

  private handleViewportChange(): void {
    if (!this.engine || !this.board) return;
    this.setInputLocked(true);
    this.tweens.killAll();
    this.drawGardenBackdrop();
    this.drawBoard();
    this.scheduleUnlock(80);
  }
private readonly handleOrientationChange = (): void => {
  window.requestAnimationFrame(() => {
    this.handleViewportChange();
  });
};

  private resumeFromInterruption(): void {
    if (!this.inputLocks.has("background")) return;
    this.handleViewportChange();
    this.setInputLock("background", false);
  }

  private cancelActiveDrag(): void {
  const session = this.dragController.cancel();
  if (!session) return;

  const view = this.views.get(
    session.blockId,
  );

  this.hideDragFeedback();
  if (this.activeDragPointer) {
    this.stopPointerDrag(this.activeDragPointer);
  }

  if (view?.active) {
    this.positionView(view, session.snapshot.block);
    this.restoreBlockAppearance(view);
    view.setDepth(1);
  }

  this.activeDragPointer = undefined;
}

  private stopPointerDrag(pointer: Phaser.Input.Pointer): void {
    try {
      this.input.setDragState(pointer, 0);
    } catch {
      // O Phaser pode já ter liberado o ponteiro durante resize ou rotação.
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
    this.setInputLock("transition", locked);
  }

  private setInputLock(reason: InputLockReason, locked: boolean): void {
    const wasLocked = this.inputLocked;
    const changed = locked
      ? this.inputLocks.lock(reason)
      : this.inputLocks.unlock(reason);

    if (!changed) return;
    if (!wasLocked && this.inputLocked) this.cancelActiveDrag();
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
  private calculateBoardLayout(
  levelWidth: number,
  levelHeight: number,
): BoardLayout {
  const viewportWidth = this.scale.width;
  const viewportHeight = this.scale.height;

  const hudBottom =
    document
      .querySelector<HTMLElement>(".hud")
      ?.getBoundingClientRect()
      .bottom ?? 84;

  const movesTop =
    document
      .querySelector<HTMLElement>(".moves")
      ?.getBoundingClientRect()
      .top ?? viewportHeight - 84;

  /*
   * Em telas baixas, reduzimos a margem para manter o tabuleiro
   * suficientemente grande. Em telas normais, usamos mais espaço
   * para que as saídas não encostem no HUD.
   */
  const outerGap = viewportHeight < 620 ? 14 : 22;

  const playfieldTop = Math.ceil(
    hudBottom + outerGap,
  );

  const playfieldBottom = Math.floor(
    movesTop - outerGap,
  );

  const playfieldHeight = Math.max(
    120,
    playfieldBottom - playfieldTop,
  );

  /*
   * As saídas e seus símbolos ficam parcialmente fora dos limites
   * da grade. Esta folga impede que sejam cortados pelas laterais.
   */
  const horizontalExitClearance =
    viewportWidth < 360 ? 68 : 76;

  const verticalExitClearance = 32;

  const maxBoardWidth = Math.max(
    1,
    Math.min(
      viewportWidth - horizontalExitClearance,
      500,
    ),
  );

  const maxBoardHeight = Math.max(
    1,
    playfieldHeight - verticalExitClearance,
  );

  const tile = Math.max(
    1,
    Math.floor(
      Math.min(
        maxBoardWidth / levelWidth,
        maxBoardHeight / levelHeight,
      ),
    ),
  );

  const boardWidth = tile * levelWidth;
  const boardHeight = tile * levelHeight;

  return {
    tile,
    x: Math.round(
      (viewportWidth - boardWidth) / 2,
    ),
    y: Math.round(
      playfieldTop +
        (playfieldHeight - boardHeight) / 2,
    ),
  };
}

  private updateReducedMotionPreference(): void {
    this.reducedMotion =
      Boolean(this.reducedMotionQuery?.matches) ||
      this.settings.reducedEffects;
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
    this.persistActivePuzzle();
    this.cancelActiveDrag();
    this.unlockTimer?.remove(false);
    this.clearEphemeralEffects();
    this.scale.off("resize", this.handleViewportChange, this);
    window.removeEventListener("orientationchange", this.handleOrientationChange);
    window.removeEventListener("pointercancel", this.handlePointerCancel);
    this.reducedMotionQuery?.removeEventListener(
      "change",
      this.reducedMotionListener,
    );
    gameEvents.removeEventListener("game-action", this.actionListener);
    gameEvents.removeEventListener("game-settings", this.settingsListener);
    gameEvents.removeEventListener("ui-input-block", this.uiInputBlockListener);
    gameEvents.removeEventListener("app-navigation", this.appNavigationListener);
    gameEvents.removeEventListener(
      "app-lifecycle-change",
      this.appLifecycleListener,
    );
  }
}
