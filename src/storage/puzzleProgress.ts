import type { Level } from "../game/simulation/puzzle";

export const SAVE_VERSION = 2;
const progressKey = "block-bloom:progress";
const legacyLevelKey = "block-bloom-level";

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export type BestMoveRecord = {
  moves: number;
  levelVersion: number;
};

export type PuzzleProgress = {
  version: typeof SAVE_VERSION;
  currentLevelId: string;
  highestUnlockedLevelId: string;
  bestMoves: Record<string, BestMoveRecord>;
};

export function createDefaultProgress(catalog: Level[]): PuzzleProgress {
  const first = catalog[0];
  if (!first) throw new Error("O catálogo de fases está vazio.");
  return {
    version: SAVE_VERSION,
    currentLevelId: first.id,
    highestUnlockedLevelId: first.id,
    bestMoves: {},
  };
}

export function parseSavedProgress(raw: string | null, catalog: Level[]): PuzzleProgress | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return undefined;

    if (value.version === SAVE_VERSION) return normalizeVersionTwo(value, catalog);
    if (value.version === 1 && typeof value.levelId === "string") {
      return migrateLevelId(value.levelId, catalog);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function loadPuzzleProgress(catalog: Level[], storage: StorageReader = window.localStorage): PuzzleProgress {
  const fallback = createDefaultProgress(catalog);
  try {
    const saved = parseSavedProgress(storage.getItem(progressKey), catalog);
    if (saved) return saved;

    const legacyValue = storage.getItem(legacyLevelKey);
    const legacyIndex = legacyValue === null ? Number.NaN : Number(legacyValue);
    if (Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex < catalog.length) {
      return migrateLevelId(catalog[legacyIndex].id, catalog) ?? fallback;
    }
  } catch {
    // Storage can be unavailable in privacy modes; use a fresh save safely.
  }
  return fallback;
}

export function savePuzzleProgress(progress: PuzzleProgress, catalog: Level[], storage: StorageWriter = window.localStorage): void {
  const normalized = normalizeVersionTwo(progress as unknown as Record<string, unknown>, catalog);
  if (!normalized) return;
  try {
    storage.setItem(progressKey, JSON.stringify(normalized));
  } catch {
    // Progress is optional; quota or privacy errors must not interrupt gameplay.
  }
}

export function completeLevel(progress: PuzzleProgress, levelId: string, moves: number, catalog: Level[]): PuzzleProgress {
  const levelIndex = catalog.findIndex((level) => level.id === levelId);
  if (levelIndex < 0 || !Number.isInteger(moves) || moves <= 0) return cloneProgress(progress);

  const level = catalog[levelIndex];
  const previousBest = progress.bestMoves[levelId];
  const bestMoves = { ...progress.bestMoves };
  if (!previousBest || previousBest.levelVersion !== level.version || moves < previousBest.moves) {
    bestMoves[levelId] = { moves, levelVersion: level.version };
  }

  const highestIndex = Math.max(0, catalog.findIndex((candidate) => candidate.id === progress.highestUnlockedLevelId));
  const unlockedIndex = Math.max(highestIndex, Math.min(levelIndex + 1, catalog.length - 1));
  return {
    version: SAVE_VERSION,
    currentLevelId: progress.currentLevelId,
    highestUnlockedLevelId: catalog[unlockedIndex].id,
    bestMoves,
  };
}

export function selectProgressLevel(progress: PuzzleProgress, levelId: string, catalog: Level[], allowLocked: boolean): PuzzleProgress {
  const targetIndex = catalog.findIndex((level) => level.id === levelId);
  const highestIndex = catalog.findIndex((level) => level.id === progress.highestUnlockedLevelId);
  if (targetIndex < 0 || (!allowLocked && targetIndex > highestIndex)) return cloneProgress(progress);
  return { ...cloneProgress(progress), currentLevelId: levelId };
}

export function bestMovesFor(progress: PuzzleProgress, level: Level): number | undefined {
  const record = progress.bestMoves[level.id];
  return record?.levelVersion === level.version ? record.moves : undefined;
}

function normalizeVersionTwo(value: Record<string, unknown>, catalog: Level[]): PuzzleProgress | undefined {
  const currentLevelId = typeof value.currentLevelId === "string" ? value.currentLevelId : "";
  const highestUnlockedLevelId = typeof value.highestUnlockedLevelId === "string" ? value.highestUnlockedLevelId : "";
  const currentIndex = catalog.findIndex((level) => level.id === currentLevelId);
  const highestIndex = catalog.findIndex((level) => level.id === highestUnlockedLevelId);
  if (currentIndex < 0 || highestIndex < 0) return undefined;

  const safeCurrentIndex = Math.min(currentIndex, highestIndex);
  const bestMoves: Record<string, BestMoveRecord> = {};
  if (isRecord(value.bestMoves)) {
    for (const level of catalog) {
      const candidate = value.bestMoves[level.id];
      if (!isRecord(candidate)) continue;
      const moves = Number(candidate.moves);
      const levelVersion = Number(candidate.levelVersion);
      if (Number.isInteger(moves) && moves > 0 && levelVersion === level.version) {
        bestMoves[level.id] = { moves, levelVersion };
      }
    }
  }

  return {
    version: SAVE_VERSION,
    currentLevelId: catalog[safeCurrentIndex].id,
    highestUnlockedLevelId: catalog[highestIndex].id,
    bestMoves,
  };
}

function migrateLevelId(levelId: string, catalog: Level[]): PuzzleProgress | undefined {
  const index = catalog.findIndex((level) => level.id === levelId);
  if (index < 0) return undefined;
  return {
    version: SAVE_VERSION,
    currentLevelId: levelId,
    highestUnlockedLevelId: levelId,
    bestMoves: {},
  };
}

function cloneProgress(progress: PuzzleProgress): PuzzleProgress {
  return {
    ...progress,
    bestMoves: Object.fromEntries(Object.entries(progress.bestMoves).map(([id, record]) => [id, { ...record }])),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
