import {
  gameEvents,
  type AppNavigation,
  type AppScreen,
  type PhaseHintOpened,
  type PuzzleSnapshot,
} from "../game/events";
import type { GameAction } from "../game/input/actions";
import { levels } from "../game/simulation/puzzle";
import {
  loadPlaytestMetrics,
  recordPlaytestEvent,
  savePlaytestMetrics,
  type PlaytestEvent,
  type PlaytestMetrics,
} from "../storage/playtestMetrics";

type ActivePlaytestSession = {
  levelId: string;
  startedAt: number;
  snapshot: PuzzleSnapshot;
  completionRecorded: boolean;
};

let activeTrackerCleanup: (() => void) | undefined;

/**
 * Registra somente contagens locais por fase. Não envia rede, não usa IDs de
 * usuário e não interfere com o estado autoritativo do PuzzleEngine.
 */
export function createPlaytestTracker(): () => void {
  activeTrackerCleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const levelIds = levels.map((level) => level.id);
  let metrics: PlaytestMetrics = loadPlaytestMetrics(levelIds);
  let screen: AppScreen = "home";
  let session: ActivePlaytestSession | undefined;
  let destroyed = false;

  const record = (event: PlaytestEvent): void => {
    metrics = recordPlaytestEvent(metrics, event);
    savePlaytestMetrics(metrics, levelIds);
  };

  const finishSession = (): void => {
    if (
      session &&
      !session.completionRecorded &&
      !session.snapshot.won &&
      session.snapshot.moves > 0
    ) {
      record({ type: "abandon", levelId: session.levelId });
    }
    session = undefined;
  };

  const beginSession = (snapshot: PuzzleSnapshot): void => {
    session = {
      levelId: snapshot.levelId,
      startedAt: Date.now(),
      snapshot: { ...snapshot },
      completionRecorded: false,
    };
    record({ type: "start", levelId: snapshot.levelId });
  };

  gameEvents.addEventListener("app-navigation", (
    event: CustomEvent<AppNavigation>,
  ) => {
    if (
      screen === "game" &&
      (event.detail.screen !== "game" ||
        event.detail.levelId !== session?.levelId)
    ) {
      finishSession();
    }
    screen = event.detail.screen;
  }, { signal });

  gameEvents.addEventListener("puzzle-state", (
    event: CustomEvent<PuzzleSnapshot>,
  ) => {
    const snapshot = event.detail;
    if (screen !== "game") return;

    if (!session || session.levelId !== snapshot.levelId) {
      finishSession();
      beginSession(snapshot);
    }
    if (!session) return;
    session.snapshot = { ...snapshot };

    if (snapshot.won && !session.completionRecorded) {
      session.completionRecorded = true;
      record({
        type: "complete",
        levelId: snapshot.levelId,
        moves: snapshot.moves,
        durationMs: Date.now() - session.startedAt,
      });
    }
  }, { signal });

  gameEvents.addEventListener("game-action", (
    event: CustomEvent<GameAction>,
  ) => {
    if (screen !== "game" || !session) return;
    if (event.detail === "undo") {
      record({ type: "undo", levelId: session.levelId });
    }
    if (event.detail === "restart") {
      record({ type: "restart", levelId: session.levelId });
      record({ type: "start", levelId: session.levelId });
      session.startedAt = Date.now();
      session.completionRecorded = false;
    }
  }, { signal });

  gameEvents.addEventListener("phase-hint-opened", (
    event: CustomEvent<PhaseHintOpened>,
  ) => {
    if (screen !== "game" || event.detail.levelId !== session?.levelId) {
      return;
    }
    record({ type: "hint", levelId: event.detail.levelId });
  }, { signal });

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    if (activeTrackerCleanup === destroy) activeTrackerCleanup = undefined;
  };
  activeTrackerCleanup = destroy;
  return destroy;
}
