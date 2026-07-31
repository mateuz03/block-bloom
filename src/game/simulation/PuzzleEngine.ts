import {
  assertValidLevels,
  canPlace,
  cloneBlock,
  cloneLevel,
  matchingExit,
  reachablePlacements,
  type Block,
  type Exit,
  type Level,
} from "./puzzle";

export type PuzzleStatus = "playing" | "won";

export type PuzzleHistoryEntry = {
  blocks: Block[];
  moves: number;
  status: PuzzleStatus;
};

export type PuzzleState = {
  levelId: string;
  blocks: Block[];
  moves: number;
  status: PuzzleStatus;
  history: PuzzleHistoryEntry[];
};

export type PuzzleTransition = {
  changed: boolean;
  state: PuzzleState;
  exited?: { block: Block; exit: Exit };
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

  previewMove(blockId: string, col: number, row: number): MovePreview {
    if (this.currentState.status !== "playing") return { valid: false, exits: false };
    const level = this.requireLevel(this.currentState.levelId);
    const block = this.currentState.blocks.find((candidate) => candidate.id === blockId);
    if (!block || (block.col === col && block.row === row) || !canPlace(block, col, row, this.currentState.blocks, level.width, level.height)) {
      return { valid: false, exits: false };
    }
    const reachable = reachablePlacements(block, this.currentState.blocks, level.width, level.height)
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

    this.currentState = {
      levelId: this.currentState.levelId,
      blocks: nextBlocks,
      moves: this.currentState.moves + 1,
      status: nextBlocks.length === 0 ? "won" : "playing",
      history: [...this.currentState.history.map(cloneHistoryEntry), previous],
    };

    return {
      changed: true,
      state: this.state,
      ...(exit ? { exited: { block: cloneBlock(movedBlock), exit: { ...exit } } } : {}),
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
      history: this.currentState.history.slice(0, -1).map(cloneHistoryEntry),
    };
    return { changed: true, state: this.state };
  }

  private createState(levelId: string): PuzzleState {
    const level = this.requireLevel(levelId);
    return {
      levelId: level.id,
      blocks: level.blocks.map(cloneBlock),
      moves: 0,
      status: "playing",
      history: [],
    };
  }

  private requireLevel(levelId: string): Level {
    const level = this.catalog.find((candidate) => candidate.id === levelId);
    if (!level) throw new Error(`Fase desconhecida: ${levelId}`);
    return level;
  }

  private unchanged(): PuzzleTransition {
    return { changed: false, state: this.state };
  }
}

function toHistoryEntry(state: PuzzleState): PuzzleHistoryEntry {
  return { blocks: state.blocks.map(cloneBlock), moves: state.moves, status: state.status };
}

function cloneHistoryEntry(entry: PuzzleHistoryEntry): PuzzleHistoryEntry {
  return { blocks: entry.blocks.map(cloneBlock), moves: entry.moves, status: entry.status };
}

function cloneState(state: PuzzleState): PuzzleState {
  return {
    levelId: state.levelId,
    blocks: state.blocks.map(cloneBlock),
    moves: state.moves,
    status: state.status,
    history: state.history.map(cloneHistoryEntry),
  };
}
