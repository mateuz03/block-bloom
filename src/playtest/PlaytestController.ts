import {
  gameEvents,
  type AppLifecycleChange,
  type AppNavigation,
  type AppScreen,
  type PuzzleInteraction,
  type PuzzleSnapshot,
} from "../game/events";
import { levels } from "../game/simulation/puzzle";
import { PlaytestRecorder } from "./PlaytestRecorder";
import {
  createPlaytestDiagnosticText,
  createPlaytestReport,
  serializePlaytestExport,
} from "./playtestReport";
import type {
  PlaytestData,
  PlaytestLevelReference,
  PlaytestSession,
} from "./playtestTypes";

export type PlaytestController = {
  snapshot: () => PlaytestData;
  currentSession: () => PlaytestSession | undefined;
  startNewSession: () => PlaytestSession;
  clear: () => void;
  exportJson: () => string;
  diagnosticText: () => string;
  report: () => ReturnType<typeof createPlaytestReport>;
  destroy: () => void;
};

let activeControllerCleanup: (() => void) | undefined;

export function createPlaytestController(): PlaytestController {
  activeControllerCleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const catalog: PlaytestLevelReference[] = levels.map((level) => ({
    id: level.id,
    name: level.name,
    version: level.version,
    idealMoves: level.idealMoves,
    hasBloom: (level.blooms?.length ?? 0) > 0,
  }));
  const recorder = new PlaytestRecorder(catalog);
  let screen: AppScreen = "home";
  let latestSnapshot: PuzzleSnapshot | undefined;
  let destroyed = false;

  const beginWhenPlayable = (snapshot: PuzzleSnapshot): void => {
    if (screen !== "game" || snapshot.inputLocked || snapshot.won) return;
    const active = recorder.activeRun();
    if (active && active.levelId !== snapshot.levelId) recorder.abandon();
    if (!recorder.activeRun()) {
      recorder.beginRun(snapshot.levelId, snapshot.moves);
    } else {
      recorder.syncMoves(snapshot.moves);
      recorder.resume();
    }
  };

  gameEvents.addEventListener("app-navigation", (
    event: CustomEvent<AppNavigation>,
  ) => {
    if (screen === "game" && event.detail.screen !== "game") {
      recorder.abandon();
    }
    if (
      screen === "game" &&
      event.detail.screen === "game" &&
      event.detail.levelId !== recorder.activeRun()?.levelId
    ) {
      recorder.abandon();
    }
    screen = event.detail.screen;
  }, { signal });

  gameEvents.addEventListener("puzzle-state", (
    event: CustomEvent<PuzzleSnapshot>,
  ) => {
    latestSnapshot = { ...event.detail };
    beginWhenPlayable(event.detail);
    if (event.detail.won && recorder.activeRun()) {
      recorder.complete(event.detail.moves);
    }
  }, { signal });

  gameEvents.addEventListener("puzzle-interaction", (
    event: CustomEvent<PuzzleInteraction>,
  ) => {
    const interaction = event.detail;
    const active = recorder.activeRun();
    if (screen !== "game" || !active || active.levelId !== interaction.levelId) {
      return;
    }
    if (interaction.type === "invalid-drop") {
      recorder.recordInvalidDrop();
      return;
    }
    if (interaction.type === "undo") {
      recorder.recordUndo(interaction.moves);
      return;
    }
    if (interaction.type === "restart") {
      recorder.recordRestart(interaction.moves);
      return;
    }
    recorder.recordMove(
      interaction.moves,
      interaction.activatedBloomCount,
    );
    if (interaction.won) recorder.complete(interaction.moves);
  }, { signal });

  const pause = (): void => recorder.pause();
  const resume = (): void => {
    if (screen !== "game") return;
    if (latestSnapshot) beginWhenPlayable(latestSnapshot);
  };
  const lifecycle = (
    event: CustomEvent<AppLifecycleChange>,
  ): void => {
    if (event.detail.active) resume();
    else pause();
  };
  gameEvents.addEventListener(
    "app-lifecycle-change",
    lifecycle,
    { signal },
  );

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    recorder.dispose();
    controller.abort();
    if (activeControllerCleanup === destroy) activeControllerCleanup = undefined;
  };
  activeControllerCleanup = destroy;

  return {
    snapshot: () => recorder.snapshot(),
    currentSession: () => recorder.currentSession(),
    startNewSession: () => recorder.startNewSession(),
    clear: () => recorder.clear(),
    exportJson: () => serializePlaytestExport(recorder.snapshot()),
    diagnosticText: () => createPlaytestDiagnosticText(
      createPlaytestReport(recorder.snapshot(), catalog),
    ),
    report: () => createPlaytestReport(recorder.snapshot(), catalog),
    destroy,
  };
}
