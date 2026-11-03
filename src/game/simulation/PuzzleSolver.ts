import {
  activeVineCells,
  cloneBlock,
  matchingExit,
  reachablePlacements,
  type Block,
  type Level,
} from "./puzzle";

export type SolverMove = {
  blockId: string;
  from: { col: number; row: number };
  to: { col: number; row: number };
  exited: boolean;
  activatedBloomIds: string[];
  removedVineIds: string[];
};

export type SolverResult = {
  solved: boolean;
  minimumMoves?: number;
  visitedStates: number;
  solution: SolverMove[];
  exhausted: boolean;
};

type SolverNode = {
  blocks: Array<Block | null>;
  moves: number;
  estimate: number;
  path: SolverMove[];
  activatedBloomIds: string[];
  removedVineIds: string[];
};

export function solveLevel(level: Level, maxVisitedStates = 500_000): SolverResult {
  const initial = level.blocks.map(cloneBlock);
  const queue = new MinHeap<SolverNode>((a, b) => a.estimate - b.estimate || a.moves - b.moves);
  queue.push({
    blocks: initial,
    moves: 0,
    estimate: initial.length,
    path: [],
    activatedBloomIds: [],
    removedVineIds: [],
  });
  const best = new Map<string, number>([[solverStateKey(initial, [], []), 0]]);
  let visitedStates = 0;

  while (queue.size > 0 && visitedStates < maxVisitedStates) {
    const node = queue.pop();
    if (!node) break;
    const key = solverStateKey(node.blocks, node.activatedBloomIds, node.removedVineIds);
    if (node.moves !== best.get(key)) continue;
    visitedStates += 1;

    const active = node.blocks.filter((block): block is Block => block !== null);
    if (active.length === 0) {
      return { solved: true, minimumMoves: node.moves, visitedStates, solution: node.path, exhausted: false };
    }

    node.blocks.forEach((block, blockIndex) => {
      if (!block) return;
      const blockedCells = activeVineCells(level, node.removedVineIds);
      for (const destination of reachablePlacements(block, active, level.width, level.height, blockedCells)) {
        const moved = { ...block, ...destination };
        const exit = matchingExit(moved, level.exits, level.width, level.height);
        const nextBlocks = node.blocks.map((candidate, index) => {
          if (index !== blockIndex) return candidate ? cloneBlock(candidate) : null;
          return exit ? null : moved;
        });
        const activatedSet = new Set(node.activatedBloomIds);
        const activatedBlooms = exit?.id
          ? (level.blooms ?? []).filter((bloom) => bloom.exitId === exit.id && !activatedSet.has(bloom.id))
          : [];
        activatedBlooms.forEach((bloom) => activatedSet.add(bloom.id));
        const nextActivatedBloomIds = [...activatedSet];

        const removedSet = new Set(node.removedVineIds);
        const activatedNow = new Set(activatedBlooms.map((bloom) => bloom.id));
        const removedVines = (level.vines ?? []).filter(
          (vine) => activatedNow.has(vine.removedByBloomId) && !removedSet.has(vine.id),
        );
        removedVines.forEach((vine) => removedSet.add(vine.id));
        const nextRemovedVineIds = [...removedSet];
        const nextMoves = node.moves + 1;
        const nextKey = solverStateKey(nextBlocks, nextActivatedBloomIds, nextRemovedVineIds);
        if ((best.get(nextKey) ?? Number.POSITIVE_INFINITY) <= nextMoves) continue;
        best.set(nextKey, nextMoves);
        const remaining = nextBlocks.reduce((count, candidate) => count + (candidate ? 1 : 0), 0);
        queue.push({
          blocks: nextBlocks,
          moves: nextMoves,
          estimate: nextMoves + remaining,
          activatedBloomIds: nextActivatedBloomIds,
          removedVineIds: nextRemovedVineIds,
          path: [...node.path, {
            blockId: block.id,
            from: { col: block.col, row: block.row },
            to: destination,
            exited: Boolean(exit),
            activatedBloomIds: activatedBlooms.map((bloom) => bloom.id),
            removedVineIds: removedVines.map((vine) => vine.id),
          }],
        });
      }
    });
  }

  return { solved: false, visitedStates, solution: [], exhausted: queue.size > 0 };
}

export function solverStateKey(
  blocks: Array<Block | null>,
  activatedBloomIds: readonly string[],
  removedVineIds: readonly string[],
): string {
  const blockState = blocks.map((block) => block ? `${block.col},${block.row}` : "x").join("|");
  return `${blockState};b:${[...activatedBloomIds].sort().join(",")};v:${[...removedVineIds].sort().join(",")}`;
}

class MinHeap<T> {
  private readonly values: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.values.length;
  }

  push(value: T): void {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.values[parent], value) <= 0) break;
      this.values[index] = this.values[parent];
      index = parent;
    }
    this.values[index] = value;
  }

  pop(): T | undefined {
    if (this.values.length === 0) return undefined;
    const root = this.values[0];
    const tail = this.values.pop();
    if (!tail || this.values.length === 0) return root;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= this.values.length) break;
      let child = left;
      if (right < this.values.length && this.compare(this.values[right], this.values[left]) < 0) child = right;
      if (this.compare(this.values[child], tail) >= 0) break;
      this.values[index] = this.values[child];
      index = child;
    }
    this.values[index] = tail;
    return root;
  }
}
