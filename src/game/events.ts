import type { GameSettings } from "../storage/gameSettings";
import type { GameAction } from "./input/actions";

export type PuzzleSnapshot = {
  level: number;
  levelId: string;
  levelName: string;
  totalLevels: number;
  moves: number;
  idealMoves: number;
  bestMoves?: number;
  remaining: number;
  won: boolean;
  canUndo: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  inputLocked: boolean;
};

export type UiInputBlock = {
  source: "settings" | "phase-hint";
  blocked: boolean;
};

export type PhaseHintOpened = {
  levelId: string;
};

export type InvalidDropFeedback = {
  reason: "blocked-by-vine" | "blocked-by-block" | "incompatible-exit";
};

export type PuzzleInteraction =
  | {
      type: "move";
      levelId: string;
      moves: number;
      activatedBloomCount: number;
      won: boolean;
    }
  | {
      type: "invalid-drop";
      levelId: string;
      reason: InvalidDropFeedback["reason"];
    }
  | {
      type: "undo";
      levelId: string;
      moves: number;
    }
  | {
      type: "restart";
      levelId: string;
      moves: number;
    };

export type AppScreen = "home" | "game" | "level-select";

export type AppNavigation =
  | { screen: "home" }
  | { screen: "level-select" }
  | {
      screen: "game";
      levelId: string;
      mode: "continue" | "restart";
    };

export type SettingsPanelRequest = {
  open: boolean;
  source: "home" | "game";
};

export type SystemBackRequest = {
  claim: (priority: number, action: () => void) => void;
};

export type AppLifecycleChange = {
  active: boolean;
};

type GameEventMap = {
  "game-action": CustomEvent<GameAction>;
  "puzzle-state": CustomEvent<PuzzleSnapshot>;
  "game-settings": CustomEvent<GameSettings>;
  "ui-input-block": CustomEvent<UiInputBlock>;
  "app-navigation": CustomEvent<AppNavigation>;
  "settings-panel-request": CustomEvent<SettingsPanelRequest>;
  "system-back-request": CustomEvent<SystemBackRequest>;
  "app-lifecycle-change": CustomEvent<AppLifecycleChange>;
  "tutorial-reset": CustomEvent<void>;
  "phase-hint-opened": CustomEvent<PhaseHintOpened>;
  "invalid-drop-feedback": CustomEvent<InvalidDropFeedback>;
  "puzzle-interaction": CustomEvent<PuzzleInteraction>;
};

class TypedGameEvents {
  private readonly target = new EventTarget();

  addEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (event: GameEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.target.addEventListener(
      type,
      listener as EventListener,
      options,
    );
  }

  removeEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (event: GameEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    this.target.removeEventListener(
      type,
      listener as EventListener,
      options,
    );
  }

  dispatch<K extends keyof GameEventMap>(
    type: K,
    detail: GameEventMap[K]["detail"],
  ): void {
    this.target.dispatchEvent(
      new CustomEvent(type, { detail }),
    );
  }
}

export const gameEvents = new TypedGameEvents();

let appLifecycleActive = true;

export const isAppLifecycleActive = (): boolean => appLifecycleActive;

export const emitGameAction = (action: GameAction): void => {
  gameEvents.dispatch("game-action", action);
};

export const emitPuzzleState = (snapshot: PuzzleSnapshot): void => {
  gameEvents.dispatch("puzzle-state", snapshot);
};

export const emitGameSettings = (settings: GameSettings): void => {
  gameEvents.dispatch("game-settings", settings);
};

export const emitUiInputBlock = (block: UiInputBlock): void => {
  gameEvents.dispatch("ui-input-block", block);
};

export const emitAppNavigation = (navigation: AppNavigation): void => {
  gameEvents.dispatch("app-navigation", navigation);
};

export const emitSettingsPanelRequest = (
  request: SettingsPanelRequest,
): void => {
  gameEvents.dispatch("settings-panel-request", request);
};

export const emitSystemBackRequest = (): boolean => {
  let selected:
    | { priority: number; action: () => void }
    | undefined;
  const request: SystemBackRequest = {
    claim: (priority, action) => {
      if (!selected || priority > selected.priority) {
        selected = { priority, action };
      }
    },
  };
  gameEvents.dispatch("system-back-request", request);
  if (!selected) return false;
  selected.action();
  return true;
};

export const emitAppLifecycleChange = (active: boolean): void => {
  appLifecycleActive = active;
  gameEvents.dispatch("app-lifecycle-change", { active });
};

export const emitTutorialReset = (): void => {
  gameEvents.dispatch("tutorial-reset", undefined);
};

export const emitPhaseHintOpened = (levelId: string): void => {
  gameEvents.dispatch("phase-hint-opened", { levelId });
};

export const emitInvalidDropFeedback = (
  reason: InvalidDropFeedback["reason"],
): void => {
  gameEvents.dispatch("invalid-drop-feedback", { reason });
};

export const emitPuzzleInteraction = (
  interaction: PuzzleInteraction,
): void => {
  gameEvents.dispatch("puzzle-interaction", interaction);
};
