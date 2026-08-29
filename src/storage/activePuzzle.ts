import type { PuzzleState } from "../game/simulation/PuzzleEngine";
import { normalizePuzzleState } from "../game/simulation/PuzzleStateValidation";
import type { Level } from "../game/simulation/puzzle";

export const ACTIVE_PUZZLE_VERSION = 1 as const;
export const ACTIVE_PUZZLE_KEY = "block-bloom:active-puzzle";
const MAX_SAVE_LENGTH = 1_000_000;

type SessionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type ActivePuzzleSession = {
  version: typeof ACTIVE_PUZZLE_VERSION;
  levelId: string;
  levelVersion: number;
  state: PuzzleState;
};

export function parseActivePuzzle(
  raw: string | null,
  catalog: Level[],
): ActivePuzzleSession | undefined {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== ACTIVE_PUZZLE_VERSION) {
      return undefined;
    }
    if (
      typeof value.levelId !== "string" ||
      !Number.isInteger(value.levelVersion)
    ) {
      return undefined;
    }

    const level = catalog.find((candidate) => candidate.id === value.levelId);
    if (!level || level.version !== value.levelVersion) return undefined;
    const state = normalizePuzzleState(value.state, level);
    if (!state || state.status !== "playing" || state.moves === 0) {
      return undefined;
    }

    return {
      version: ACTIVE_PUZZLE_VERSION,
      levelId: level.id,
      levelVersion: level.version,
      state,
    };
  } catch {
    return undefined;
  }
}

export function loadActivePuzzle(
  catalog: Level[],
  storage: SessionStorage = window.localStorage,
): ActivePuzzleSession | undefined {
  try {
    const raw = storage.getItem(ACTIVE_PUZZLE_KEY);
    const session = parseActivePuzzle(raw, catalog);
    if (!session && raw !== null) storage.removeItem(ACTIVE_PUZZLE_KEY);
    return session;
  } catch {
    return undefined;
  }
}

export function saveActivePuzzle(
  state: PuzzleState,
  catalog: Level[],
  storage: SessionStorage = window.localStorage,
): boolean {
  const level = catalog.find((candidate) => candidate.id === state.levelId);
  const normalized = level
    ? normalizePuzzleState(state, level)
    : undefined;
  if (!level || !normalized || normalized.status !== "playing" || normalized.moves === 0) {
    clearActivePuzzle(storage);
    return false;
  }

  const session: ActivePuzzleSession = {
    version: ACTIVE_PUZZLE_VERSION,
    levelId: level.id,
    levelVersion: level.version,
    state: normalized,
  };

  try {
    storage.setItem(ACTIVE_PUZZLE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearActivePuzzle(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  try {
    storage.removeItem(ACTIVE_PUZZLE_KEY);
  } catch {
    // A sessão é opcional; falhas de storage nunca interrompem o jogo.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
