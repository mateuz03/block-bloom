import type { GameAction } from "./input/actions";

export type PuzzleSnapshot = {
  level: number;
  totalLevels: number;
  moves: number;
  remaining: number;
  won: boolean;
};

type GameEventMap = {
  "game-action": CustomEvent<GameAction>;
  "puzzle-state": CustomEvent<PuzzleSnapshot>;
};

class TypedGameEvents {
  private readonly target = new EventTarget();

  addEventListener<K extends keyof GameEventMap>(type: K, listener: (event: GameEventMap[K]) => void): void {
    this.target.addEventListener(type, listener as EventListener);
  }

  removeEventListener<K extends keyof GameEventMap>(type: K, listener: (event: GameEventMap[K]) => void): void {
    this.target.removeEventListener(type, listener as EventListener);
  }

  dispatch<K extends keyof GameEventMap>(type: K, detail: GameEventMap[K]["detail"]): void {
    this.target.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export const gameEvents = new TypedGameEvents();
export const emitGameAction = (action: GameAction): void => gameEvents.dispatch("game-action", action);
export const emitPuzzleState = (snapshot: PuzzleSnapshot): void => gameEvents.dispatch("puzzle-state", snapshot);
