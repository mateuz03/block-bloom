import {
  assertValidLevels,
  activeVineCells,
  canPlace,
  cloneBlock,
  cloneLevel,
  matchingExit,
  reachablePlacements,
  type Block,
  type BloomTrigger,
  type Exit,
  type Level,
  type Vine,
} from "./puzzle";
import { normalizePuzzleState } from "./PuzzleStateValidation";

export type PuzzleStatus = "playing" | "won";

export type PuzzleHistoryEntry = {
  blocks: Block[];
  moves: number;
  status: PuzzleStatus;
  activatedBloomIds: string[];
  removedVineIds: string[];
};

export type PuzzleState = {
  levelId: string;
  blocks: Block[];
  moves: number;
  status: PuzzleStatus;
  activatedBloomIds: string[];
  removedVineIds: string[];
  history: PuzzleHistoryEntry[];
};

export type PuzzleTransition = {
  changed: boolean;
  state: PuzzleState;
  exited?: { block: Block; exit: Exit };
  activatedBlooms: BloomTrigger[];
  removedVines: Vine[];
};

export type MovePreview = {
  valid: boolean;
  exits: boolean;
  block?: Block;
  exit?: Exit;
};

export class PuzzleEngine {
  private readonly catalog: Level[];
  private currentState: PuzzleState;

  constructor(catalog: Level[], initialLevelId: string) {
    assertValidLevels(catalog);
    this.catalog = catalog.map(cloneLevel);
    this.currentState = this.createState(initialLevelId);
  }

  get state(): PuzzleState {
    return cloneState(this.currentState);
  }

  get currentLevel(): Level {
    return cloneLevel(this.requireLevel(this.currentState.levelId));
  }

  loadLevel(levelId: string): PuzzleState {
    this.currentState = this.createState(levelId);
    return this.state;
  }

  restart(): PuzzleState {
    this.currentState = this.createState(this.currentState.levelId);
    return this.state;
  }

  restoreState(state: PuzzleState): PuzzleState {
    const level = this.requireLevel(state.levelId);
    const restored = normalizePuzzleState(state, level);
    if (!restored) {
      throw new Error(`Estado salvo inválido para a fase: ${level.id}`);
    }
    this.currentState = restored;
    return this.state;
  }

  previewMove(blockId: string, col: number, row: number): MovePreview {
    if (this.currentState.status !== "playing") return { valid: false, exits: false };
    const level = this.requireLevel(this.currentState.levelId);
    const block = this.currentState.blocks.find((candidate) => candidate.id === blockId);
    const blockedCells = activeVineCells(level, this.currentState.removedVineIds);
    if (!block || (block.col === col && block.row === row) || !canPlace(block, col, row, this.currentState.blocks, level.width, level.height, blockedCells)) {
      return { valid: false, exits: false };
    }
    const reachable = reachablePlacements(block, this.currentState.blocks, level.width, level.height, blockedCells)
      .some((placement) => placement.col === col && placement.row === row);
    if (!reachable) return { valid: false, exits: false };
    const moved = { ...block, col, row };
    const exit = matchingExit(moved, level.exits, level.width, level.height);
    return { valid: true, exits: Boolean(exit), block: cloneBlock(moved), ...(exit ? { exit: { ...exit } } : {}) };
  }

  moveBlock(blockId: string, col: number, row: number): PuzzleTransition {
    const preview = this.previewMove(blockId, col, row);
    if (!preview.valid || !preview.block) return this.unchanged();
    const movedBlock = preview.block;

    const previous = toHistoryEntry(this.currentState);
    let nextBlocks = this.currentState.blocks.map((candidate) => candidate.id === blockId ? movedBlock : cloneBlock(candidate));
    const exit = preview.exit;
    if (exit) nextBlocks = nextBlocks.filter((candidate) => candidate.id !== blockId);

    const level = this.requireLevel(this.currentState.levelId);
    const activatedSet = new Set(this.currentState.activatedBloomIds);
    const activatedBlooms = exit?.id
      ? (level.blooms ?? []).filter((bloom) => bloom.exitId === exit.id && !activatedSet.has(bloom.id))
      : [];
    activatedBlooms.forEach((bloom) => activatedSet.add(bloom.id));

    const removedSet = new Set(this.currentState.removedVineIds);
    const newlyActivatedIds = new Set(activatedBlooms.map((bloom) => bloom.id));
    const removedVines = (level.vines ?? []).filter(
      (vine) => newlyActivatedIds.has(vine.removedByBloomId) && !removedSet.has(vine.id),
    );
    removedVines.forEach((vine) => removedSet.add(vine.id));

    this.currentState = {
      levelId: this.currentState.levelId,
      blocks: nextBlocks,
      moves: this.currentState.moves + 1,
      status: nextBlocks.length === 0 ? "won" : "playing",
      activatedBloomIds: [...activatedSet],
      removedVineIds: [...removedSet],
      history: [...this.currentState.history.map(cloneHistoryEntry), previous],
    };

    return {
      changed: true,
      state: this.state,
      ...(exit ? { exited: { block: cloneBlock(movedBlock), exit: { ...exit } } } : {}),
      activatedBlooms: activatedBlooms.map((bloom) => ({ ...bloom })),
      removedVines: removedVines.map(cloneVine),
    };
  }

  undo(): PuzzleTransition {
    const previous = this.currentState.history[this.currentState.history.length - 1];
    if (!previous) return this.unchanged();

    this.currentState = {
      levelId: this.currentState.levelId,
      blocks: previous.blocks.map(cloneBlock),
      moves: previous.moves,
      status: previous.status,
      activatedBloomIds: [...previous.activatedBloomIds],
      removedVineIds: [...previous.removedVineIds],
      history: this.currentState.history.slice(0, -1).map(cloneHistoryEntry),
    };
    return { changed: true, state: this.state, activatedBlooms: [], removedVines: [] };
  }

  private createState(levelId: string): PuzzleState {
    const level = this.requireLevel(levelId);
    return {
      levelId: level.id,
      blocks: level.blocks.map(cloneBlock),
      moves: 0,
      status: "playing",
      activatedBloomIds: [],
      removedVineIds: [],
      history: [],
    };
  }

  private requireLevel(levelId: string): Level {
    const level = this.catalog.find((candidate) => candidate.id === levelId);
    if (!level) throw new Error(`Fase desconhecida: ${levelId}`);
    return level;
  }

  private unchanged(): PuzzleTransition {
    return { changed: false, state: this.state, activatedBlooms: [], removedVines: [] };
  }
}

function toHistoryEntry(state: PuzzleState): PuzzleHistoryEntry {
  return {
    blocks: state.blocks.map(cloneBlock),
    moves: state.moves,
    status: state.status,
    activatedBloomIds: [...state.activatedBloomIds],
    removedVineIds: [...state.removedVineIds],
  };
}

function cloneHistoryEntry(entry: PuzzleHistoryEntry): PuzzleHistoryEntry {
  return {
    blocks: entry.blocks.map(cloneBlock),
    moves: entry.moves,
    status: entry.status,
    activatedBloomIds: [...entry.activatedBloomIds],
    removedVineIds: [...entry.removedVineIds],
  };
}

function cloneState(state: PuzzleState): PuzzleState {
  return {
    levelId: state.levelId,
    blocks: state.blocks.map(cloneBlock),
    moves: state.moves,
    status: state.status,
    activatedBloomIds: [...state.activatedBloomIds],
    removedVineIds: [...state.removedVineIds],
    history: state.history.map(cloneHistoryEntry),
  };
}

function cloneVine(vine: Vine): Vine {
  return { ...vine, cells: vine.cells.map((cell) => ({ ...cell })) };
}
