import type {
  PuzzleHistoryEntry,
  PuzzleState,
  PuzzleStatus,
} from "./PuzzleEngine";
import {
  activeVineCells,
  cloneBlock,
  type Block,
  type Level,
} from "./puzzle";

const MAX_SAVED_MOVES = 1_000;

type PuzzleFrame = {
  blocks: Block[];
  moves: number;
  status: PuzzleStatus;
  activatedBloomIds: string[];
  removedVineIds: string[];
};

export function normalizePuzzleState(
  value: unknown,
  level: Level,
): PuzzleState | undefined {
  if (!isRecord(value) || value.levelId !== level.id) return undefined;
  const moves = readInteger(value.moves, 0, MAX_SAVED_MOVES);
  if (moves === undefined || !Array.isArray(value.history)) return undefined;
  if (value.history.length !== moves) return undefined;

  const history: PuzzleHistoryEntry[] = [];
  for (let index = 0; index < value.history.length; index += 1) {
    const frame = normalizeFrame(value.history[index], level, index);
    if (!frame || frame.status !== "playing") return undefined;
    history.push(frame);
  }

  const current = normalizeFrame(value, level, moves);
  if (!current) return undefined;
  const frames: PuzzleFrame[] = [...history, current];
  if (!hasCoherentTransitions(frames)) return undefined;

  return {
    levelId: level.id,
    blocks: current.blocks.map(cloneBlock),
    moves,
    status: current.status,
    activatedBloomIds: [...current.activatedBloomIds],
    removedVineIds: [...current.removedVineIds],
    history: history.map(cloneFrame),
  };
}

function normalizeFrame(
  value: unknown,
  level: Level,
  expectedMoves: number,
): PuzzleFrame | undefined {
  if (!isRecord(value) || value.moves !== expectedMoves) return undefined;
  const status = value.status;
  if (status !== "playing" && status !== "won") return undefined;

  const activatedBloomIds = normalizeIds(
    value.activatedBloomIds,
    new Set((level.blooms ?? []).map((bloom) => bloom.id)),
  );
  const removedVineIds = normalizeIds(
    value.removedVineIds,
    new Set((level.vines ?? []).map((vine) => vine.id)),
  );
  if (!activatedBloomIds || !removedVineIds) return undefined;

  const activated = new Set(activatedBloomIds);
  const removedVines = new Set(removedVineIds);
  const vinesAreCoherent = (level.vines ?? []).every(
    (vine) =>
      !removedVines.has(vine.id) || activated.has(vine.removedByBloomId),
  );
  if (!vinesAreCoherent) return undefined;

  const blocks = normalizeBlocks(value.blocks, level, removedVineIds);
  if (!blocks) return undefined;
  if (status === "won" ? blocks.length !== 0 : blocks.length === 0) {
    return undefined;
  }

  return {
    blocks,
    moves: expectedMoves,
    status,
    activatedBloomIds,
    removedVineIds,
  };
}

function normalizeBlocks(
  value: unknown,
  level: Level,
  removedVineIds: string[],
): Block[] | undefined {
  if (!Array.isArray(value) || value.length > level.blocks.length) {
    return undefined;
  }

  const initialById = new Map(level.blocks.map((block) => [block.id, block]));
  const activeVines = new Set(
    activeVineCells(level, removedVineIds).map(
      (cell) => `${cell.col}:${cell.row}`,
    ),
  );
  const occupied = new Set<string>();
  const seen = new Set<string>();
  const blocks: Block[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.id !== "string") {
      return undefined;
    }
    const initial = initialById.get(candidate.id);
    if (!initial || seen.has(initial.id)) return undefined;
    if (
      candidate.color !== initial.color ||
      candidate.width !== initial.width ||
      candidate.height !== initial.height
    ) {
      return undefined;
    }
    const col = readInteger(candidate.col, 0, level.width - initial.width);
    const row = readInteger(candidate.row, 0, level.height - initial.height);
    if (col === undefined || row === undefined) return undefined;

    for (let y = row; y < row + initial.height; y += 1) {
      for (let x = col; x < col + initial.width; x += 1) {
        const key = `${x}:${y}`;
        if (occupied.has(key) || activeVines.has(key)) return undefined;
        occupied.add(key);
      }
    }

    seen.add(initial.id);
    blocks.push({ ...cloneBlock(initial), col, row });
  }

  return blocks;
}

function normalizeIds(
  value: unknown,
  allowed: Set<string>,
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: string[] = [];
  const seen = new Set<string>();
  for (const id of value) {
    if (typeof id !== "string" || !allowed.has(id) || seen.has(id)) {
      return undefined;
    }
    seen.add(id);
    result.push(id);
  }
  return result;
}

function hasCoherentTransitions(frames: PuzzleFrame[]): boolean {
  for (let index = 1; index < frames.length; index += 1) {
    const previous = frames[index - 1];
    const current = frames[index];
    if (!isSubset(previous.activatedBloomIds, current.activatedBloomIds)) {
      return false;
    }
    if (!isSubset(previous.removedVineIds, current.removedVineIds)) {
      return false;
    }

    const previousById = new Map(
      previous.blocks.map((block) => [block.id, block]),
    );
    const currentById = new Map(
      current.blocks.map((block) => [block.id, block]),
    );
    const removedCount = [...previousById.keys()].filter(
      (id) => !currentById.has(id),
    ).length;
    if (
      removedCount > 1 ||
      [...currentById.keys()].some((id) => !previousById.has(id))
    ) {
      return false;
    }

    const movedCount = [...currentById].filter(([id, block]) => {
      const before = previousById.get(id);
      return before && (before.col !== block.col || before.row !== block.row);
    }).length;
    if (removedCount + movedCount !== 1) return false;

    const gainedBloom =
      current.activatedBloomIds.length > previous.activatedBloomIds.length;
    const removedVine =
      current.removedVineIds.length > previous.removedVineIds.length;
    if ((gainedBloom || removedVine) && removedCount !== 1) return false;
  }
  return true;
}

function isSubset(previous: string[], current: string[]): boolean {
  const currentSet = new Set(current);
  return previous.every((id) => currentSet.has(id));
}

function cloneFrame(frame: PuzzleFrame): PuzzleHistoryEntry {
  return {
    blocks: frame.blocks.map(cloneBlock),
    moves: frame.moves,
    status: frame.status,
    activatedBloomIds: [...frame.activatedBloomIds],
    removedVineIds: [...frame.removedVineIds],
  };
}

function readInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
