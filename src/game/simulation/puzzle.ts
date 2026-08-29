export type ColorId = "coral" | "blue" | "yellow" | "mint";
export type Side = "top" | "right" | "bottom" | "left";

export type Block = {
  id: string;
  color: ColorId;
  col: number;
  row: number;
  width: number;
  height: number;
};

export type Exit = {
  id?: string;
  color: ColorId;
  side: Side;
  start: number;
  length: number;
};

export type Cell = {
  col: number;
  row: number;
};

export type BloomTrigger = {
  id: string;
  exitId: string;
};

export type Vine = {
  id: string;
  cells: Cell[];
  removedByBloomId: string;
};

export type Level = {
  id: string;
  name: string;
  width: number;
  height: number;
  blocks: Block[];
  exits: Exit[];
  blooms?: BloomTrigger[];
  vines?: Vine[];
  idealMoves: number;
  version: number;
};

export type LevelValidationIssue = {
  code:
    | "duplicate-level-id"
    | "duplicate-block-id"
    | "invalid-level-metadata"
    | "invalid-block"
    | "block-out-of-bounds"
    | "initial-overlap"
    | "invalid-exit"
    | "exit-out-of-bounds"
    | "duplicate-exit-id"
    | "duplicate-bloom-id"
    | "duplicate-vine-id"
    | "invalid-bloom-reference"
    | "invalid-vine-reference"
    | "invalid-vine-cell"
    | "duplicate-vine-cell"
    | "vine-overlap"
    | "vine-block-overlap"
    | "vine-exit-overlap"
    | "missing-color-exit"
    | "incompatible-exit";
  levelId: string;
  message: string;
};

const classicLevels: Level[] = [
  {
    id: "level-1",
    name: "Primeira flor",
    width: 5,
    height: 6,
    idealMoves: 1,
    version: 1,
    blocks: [{ id: "coral", color: "coral", col: 1, row: 2, width: 2, height: 1 }],
    exits: [{ color: "coral", side: "top", start: 1, length: 2 }],
  },
  {
    id: "level-2",
    name: "Duas direções",
    width: 5,
    height: 6,
    idealMoves: 2,
    version: 1,
    blocks: [
      { id: "blue", color: "blue", col: 1, row: 2, width: 1, height: 2 },
      { id: "yellow", color: "yellow", col: 2, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { color: "blue", side: "left", start: 2, length: 2 },
      { color: "yellow", side: "bottom", start: 2, length: 2 },
    ],
  },
  {
    id: "level-3",
    name: "Abra o caminho",
    width: 5,
    height: 6,
    idealMoves: 2,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "cargo", color: "coral", col: 0, row: 2, width: 2, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 2, length: 2 },
    ],
  },
  {
    id: "level-4",
    name: "Fila de saída",
    width: 5,
    height: 6,
    idealMoves: 3,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 2, width: 2, height: 2 },
    ],
    exits: [
      { color: "yellow", side: "right", start: 5, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 2, length: 2 },
    ],
  },
  {
    id: "level-5",
    name: "Estacionamento",
    width: 5,
    height: 6,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
    ],
    exits: [
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
    ],
  },
  {
    id: "level-6",
    name: "Trânsito cruzado",
    width: 5,
    height: 6,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "return", color: "mint", col: 4, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "mint", side: "left", start: 2, length: 2 },
    ],
  },
  {
    id: "level-7",
    name: "Curva apertada",
    width: 6,
    height: 6,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "gate", color: "mint", col: 0, row: 2, width: 5, height: 1 },
      { id: "stopper", color: "coral", col: 5, row: 2, width: 1, height: 1 },
      { id: "upper", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "lower", color: "blue", col: 1, row: 3, width: 2, height: 2 },
    ],
    exits: [
      { color: "coral", side: "top", start: 5, length: 1 },
      { color: "mint", side: "right", start: 2, length: 1 },
      { color: "yellow", side: "bottom", start: 4, length: 2 },
      { color: "blue", side: "top", start: 1, length: 2 },
    ],
  },
  {
    id: "level-8",
    name: "Duas vagas",
    width: 6,
    height: 6,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "left-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "right-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "left-stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "right-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "left-cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "right-cargo", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 3, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
    ],
  },
  {
    id: "level-9",
    name: "Espaço disputado",
    width: 6,
    height: 6,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "left-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "right-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "left-stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "right-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "left-cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "right-cargo", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "left-return", color: "mint", col: 0, row: 0, width: 1, height: 2 },
      { id: "right-return", color: "blue", col: 5, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 3, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "mint", side: "right", start: 0, length: 2 },
      { color: "blue", side: "left", start: 4, length: 2 },
    ],
  },
  {
    id: "level-10",
    name: "Última manobra",
    width: 6,
    height: 6,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "left-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "right-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "left-stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "right-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "left-lower", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "left-upper", color: "mint", col: 0, row: 0, width: 2, height: 2 },
      { id: "right-upper", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "right-lower", color: "blue", col: 4, row: 4, width: 2, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 3, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "mint", side: "right", start: 0, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "blue", side: "left", start: 4, length: 2 },
    ],
  },
];

const bloomLevels: Level[] = [
  {
    id: "level-11",
    name: "Primeiro desabrochar",
    width: 5,
    height: 6,
    idealMoves: 2,
    version: 1,
    blocks: [
      { id: "opener", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "cargo", color: "blue", col: 0, row: 3, width: 2, height: 2 },
    ],
    exits: [
      { id: "exit-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-cargo", color: "blue", side: "right", start: 3, length: 2 },
    ],
    blooms: [{ id: "bloom-first", exitId: "exit-bloom" }],
    vines: [{
      id: "vine-first",
      removedByBloomId: "bloom-first",
      cells: Array.from({ length: 6 }, (_, row) => ({ col: 2, row })),
    }],
  },
  {
    id: "level-12",
    name: "Caminho liberado",
    width: 6,
    height: 6,
    idealMoves: 2,
    version: 1,
    blocks: [
      { id: "opener", color: "mint", col: 4, row: 0, width: 1, height: 2 },
      { id: "cargo", color: "yellow", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-bloom", color: "mint", side: "right", start: 0, length: 2 },
      { id: "exit-cargo", color: "yellow", side: "right", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-path", exitId: "exit-bloom" }],
    vines: [{
      id: "vine-path",
      removedByBloomId: "bloom-path",
      cells: [
        { col: 3, row: 0 }, { col: 3, row: 1 }, { col: 3, row: 2 },
        { col: 3, row: 3 }, { col: 3, row: 4 }, { col: 3, row: 5 },
      ],
    }],
  },
  {
    id: "level-13",
    name: "Ordem das flores",
    width: 6,
    height: 6,
    idealMoves: 3,
    version: 1,
    blocks: [
      { id: "first", color: "yellow", col: 0, row: 1, width: 1, height: 1 },
      { id: "second", color: "blue", col: 3, row: 2, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 5, row: 4, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-first", color: "yellow", side: "top", start: 0, length: 1 },
      { id: "exit-second", color: "blue", side: "left", start: 2, length: 1 },
      { id: "exit-cargo", color: "coral", side: "left", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-first", exitId: "exit-first" },
      { id: "bloom-second", exitId: "exit-second" },
    ],
    vines: [
      {
        id: "vine-first",
        removedByBloomId: "bloom-first",
        cells: Array.from({ length: 6 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-second",
        removedByBloomId: "bloom-second",
        cells: Array.from({ length: 6 }, (_, row) => ({ col: 4, row })),
      },
    ],
  },
  {
    id: "level-14",
    name: "Jardim apertado",
    width: 5,
    height: 6,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
    ],
    exits: [
      { id: "exit-stopper", color: "yellow", side: "left", start: 5, length: 1 },
      { id: "exit-bloom", color: "blue", side: "bottom", start: 2, length: 1 },
      { id: "exit-cargo", color: "coral", side: "right", start: 4, length: 2 },
    ],
    blooms: [{ id: "bloom-garden", exitId: "exit-bloom" }],
    vines: [{
      id: "vine-garden",
      removedByBloomId: "bloom-garden",
      cells: [{ col: 3, row: 4 }],
    }],
  },
  {
    id: "level-15",
    name: "Jardim em plena floração",
    width: 6,
    height: 6,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "left-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "right-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "left-stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "right-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "left-cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "right-cargo", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "left-return", color: "mint", col: 0, row: 0, width: 1, height: 2 },
      { id: "right-return", color: "blue", col: 5, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-blue-bloom", color: "blue", side: "bottom", start: 2, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 3, length: 1 },
      { id: "exit-yellow-small", color: "yellow", side: "left", start: 5, length: 1 },
      { id: "exit-coral-small", color: "coral", side: "right", start: 0, length: 1 },
      { id: "exit-coral-large", color: "coral", side: "right", start: 4, length: 2 },
      { id: "exit-yellow-large", color: "yellow", side: "left", start: 0, length: 2 },
      { id: "exit-mint-large", color: "mint", side: "right", start: 0, length: 2 },
      { id: "exit-blue-large", color: "blue", side: "left", start: 4, length: 2 },
    ],
    blooms: [
      { id: "bloom-blue", exitId: "exit-blue-bloom" },
      { id: "bloom-mint", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-blue",
        removedByBloomId: "bloom-blue",
        cells: [{ col: 4, row: 4 }, { col: 4, row: 5 }],
      },
      {
        id: "vine-mint",
        removedByBloomId: "bloom-mint",
        cells: [{ col: 1, row: 0 }, { col: 1, row: 1 }],
      },
    ],
  },
];

export const levels: Level[] = [...classicLevels, ...bloomLevels];

export function cloneBlock(block: Block): Block {
  return { ...block };
}

export function cloneLevel(level: Level): Level {
  return {
    ...level,
    blocks: level.blocks.map(cloneBlock),
    exits: level.exits.map((exit) => ({ ...exit })),
    ...(level.blooms ? { blooms: level.blooms.map((bloom) => ({ ...bloom })) } : {}),
    ...(level.vines ? {
      vines: level.vines.map((vine) => ({
        ...vine,
        cells: vine.cells.map((cell) => ({ ...cell })),
      })),
    } : {}),
  };
}

export function canPlace(
  block: Block,
  col: number,
  row: number,
  blocks: Block[],
  width: number,
  height: number,
  blockedCells: Cell[] = [],
): boolean {
  if (!Number.isInteger(col) || !Number.isInteger(row)) return false;
  if (col < 0 || row < 0 || col + block.width > width || row + block.height > height) return false;
  if (blockedCells.some((cell) => cell.col >= col && cell.col < col + block.width && cell.row >= row && cell.row < row + block.height)) {
    return false;
  }
  return !blocks.some(
    (other) =>
      other.id !== block.id &&
      col < other.col + other.width &&
      col + block.width > other.col &&
      row < other.row + other.height &&
      row + block.height > other.row,
  );
}

export function reachablePlacements(
  block: Block,
  blocks: Block[],
  width: number,
  height: number,
  blockedCells: Cell[] = [],
): Cell[] {
  const queue = [{ col: block.col, row: block.row }];
  const visited = new Set([`${block.col},${block.row}`]);
  const result: Array<{ col: number; row: number }> = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const [dx, dy] of directions) {
      const next = { col: current.col + dx, row: current.row + dy };
      const key = `${next.col},${next.row}`;
      if (visited.has(key) || !canPlace(block, next.col, next.row, blocks, width, height, blockedCells)) continue;
      visited.add(key);
      queue.push(next);
      result.push(next);
    }
  }
  return result;
}

export function activeVines(level: Level, removedVineIds: readonly string[]): Vine[] {
  const removed = new Set(removedVineIds);
  return (level.vines ?? [])
    .filter((vine) => !removed.has(vine.id))
    .map((vine) => ({ ...vine, cells: vine.cells.map((cell) => ({ ...cell })) }));
}

export function activeVineCells(level: Level, removedVineIds: readonly string[]): Cell[] {
  return activeVines(level, removedVineIds).flatMap((vine) => vine.cells);
}

export function matchingExit(block: Block, exits: Exit[], width: number, height: number): Exit | undefined {
  return exits.find((exit) => {
    if (exit.color !== block.color) return false;
    if (exit.side === "top") return block.row === 0 && block.col === exit.start && block.width === exit.length;
    if (exit.side === "bottom") return block.row + block.height === height && block.col === exit.start && block.width === exit.length;
    if (exit.side === "left") return block.col === 0 && block.row === exit.start && block.height === exit.length;
    return block.col + block.width === width && block.row === exit.start && block.height === exit.length;
  });
}

export function validateLevels(catalog: Level[]): LevelValidationIssue[] {
  const issues: LevelValidationIssue[] = [];
  const levelIds = new Set<string>();

  for (const level of catalog) {
    const levelId = level.id || "<sem-id>";
    if (!level.id || levelIds.has(level.id)) {
      issues.push({ code: "duplicate-level-id", levelId, message: `ID de fase duplicado ou vazio: ${levelId}.` });
    }
    levelIds.add(level.id);

    if (![level.width, level.height, level.idealMoves, level.version].every(Number.isInteger) || level.width <= 0 || level.height <= 0 || level.idealMoves <= 0 || level.version <= 0) {
      issues.push({ code: "invalid-level-metadata", levelId, message: "Metadados numéricos da fase são inválidos." });
    }

    const blockIds = new Set<string>();
    level.blocks.forEach((block, index) => {
      if (!block.id || blockIds.has(block.id)) {
        issues.push({ code: "duplicate-block-id", levelId, message: `Bloco duplicado ou sem ID no índice ${index}.` });
      }
      blockIds.add(block.id);

      if (![block.col, block.row, block.width, block.height].every(Number.isInteger) || block.width <= 0 || block.height <= 0) {
        issues.push({ code: "invalid-block", levelId, message: `Bloco ${block.id} possui geometria inválida.` });
      } else if (block.col < 0 || block.row < 0 || block.col + block.width > level.width || block.row + block.height > level.height) {
        issues.push({ code: "block-out-of-bounds", levelId, message: `Bloco ${block.id} está fora do tabuleiro.` });
      }

      for (let otherIndex = index + 1; otherIndex < level.blocks.length; otherIndex += 1) {
        if (rectanglesOverlap(block, level.blocks[otherIndex])) {
          issues.push({ code: "initial-overlap", levelId, message: `Blocos ${block.id} e ${level.blocks[otherIndex].id} começam sobrepostos.` });
        }
      }
    });

    const exitIds = new Set<string>();
    level.exits.forEach((exit, index) => {
      if (exit.id !== undefined) {
        if (!exit.id.trim() || exitIds.has(exit.id)) {
          issues.push({ code: "duplicate-exit-id", levelId, message: `Saída ${index} possui ID vazio ou duplicado: ${exit.id || "<sem-id>"}.` });
        }
        exitIds.add(exit.id);
      }
      if (!Number.isInteger(exit.start) || !Number.isInteger(exit.length) || exit.length <= 0) {
        issues.push({ code: "invalid-exit", levelId, message: `Saída ${index} possui geometria inválida.` });
        return;
      }
      const limit = exit.side === "top" || exit.side === "bottom" ? level.width : level.height;
      if (exit.start < 0 || exit.start + exit.length > limit) {
        issues.push({ code: "exit-out-of-bounds", levelId, message: `Saída ${index} está fora dos limites da borda.` });
      }
    });

    const bloomIds = new Set<string>();
    for (const bloom of level.blooms ?? []) {
      if (!bloom.id.trim() || bloomIds.has(bloom.id)) {
        issues.push({ code: "duplicate-bloom-id", levelId, message: `Flor com ID vazio ou duplicado: ${bloom.id || "<sem-id>"}.` });
      }
      bloomIds.add(bloom.id);
      if (!bloom.exitId.trim() || !exitIds.has(bloom.exitId)) {
        issues.push({ code: "invalid-bloom-reference", levelId, message: `Flor ${bloom.id || "<sem-id>"} referencia a saída inexistente ${bloom.exitId || "<sem-id>"}.` });
      }
    }

    const vineIds = new Set<string>();
    const occupiedVineCells = new Map<string, string>();
    for (const vine of level.vines ?? []) {
      if (!vine.id.trim() || vineIds.has(vine.id)) {
        issues.push({ code: "duplicate-vine-id", levelId, message: `Vinha com ID vazio ou duplicado: ${vine.id || "<sem-id>"}.` });
      }
      vineIds.add(vine.id);
      if (!vine.removedByBloomId.trim() || !bloomIds.has(vine.removedByBloomId)) {
        issues.push({ code: "invalid-vine-reference", levelId, message: `Vinha ${vine.id || "<sem-id>"} referencia a flor inexistente ${vine.removedByBloomId || "<sem-id>"}.` });
      }

      const ownCells = new Set<string>();
      for (const cell of vine.cells) {
        const key = cellKey(cell);
        if (!Number.isInteger(cell.col) || !Number.isInteger(cell.row) || cell.col < 0 || cell.row < 0 || cell.col >= level.width || cell.row >= level.height) {
          issues.push({ code: "invalid-vine-cell", levelId, message: `Vinha ${vine.id} possui célula inválida (${cell.col}, ${cell.row}).` });
          continue;
        }
        if (ownCells.has(key)) {
          issues.push({ code: "duplicate-vine-cell", levelId, message: `Vinha ${vine.id} repete a célula (${cell.col}, ${cell.row}).` });
        }
        ownCells.add(key);
        const otherVineId = occupiedVineCells.get(key);
        if (otherVineId && otherVineId !== vine.id) {
          issues.push({ code: "vine-overlap", levelId, message: `Vinhas ${otherVineId} e ${vine.id} se sobrepõem em (${cell.col}, ${cell.row}).` });
        }
        occupiedVineCells.set(key, vine.id);

        const overlappingBlock = level.blocks.find((block) => cellInsideBlock(cell, block));
        if (overlappingBlock) {
          issues.push({ code: "vine-block-overlap", levelId, message: `Vinha ${vine.id} ocupa a célula inicial do bloco ${overlappingBlock.id} em (${cell.col}, ${cell.row}).` });
        }
        const blockedExit = level.exits.find((exit) => cellTouchesExit(cell, exit, level.width, level.height));
        if (blockedExit) {
          issues.push({ code: "vine-exit-overlap", levelId, message: `Vinha ${vine.id} bloqueia geometricamente a saída ${blockedExit.id ?? `${blockedExit.color}-${blockedExit.side}`} em (${cell.col}, ${cell.row}).` });
        }
      }
    }

    const requiredColors = new Set(level.blocks.map((block) => block.color));
    for (const color of requiredColors) {
      if (!level.exits.some((exit) => exit.color === color)) {
        issues.push({ code: "missing-color-exit", levelId, message: `Não existe saída para a cor ${color}.` });
      }
    }

    for (const block of level.blocks) {
      const compatible = level.exits.some((exit) => {
        if (exit.color !== block.color) return false;
        return exit.side === "top" || exit.side === "bottom" ? exit.length === block.width : exit.length === block.height;
      });
      if (!compatible) {
        issues.push({ code: "incompatible-exit", levelId, message: `Bloco ${block.id} não cabe em nenhuma saída da sua cor.` });
      }
    }
  }
  return issues;
}

export function assertValidLevels(catalog: Level[]): void {
  const issues = validateLevels(catalog);
  if (issues.length > 0) {
    throw new Error(`Catálogo de fases inválido:\n${issues.map((issue) => `- [${issue.code}] ${issue.levelId}: ${issue.message}`).join("\n")}`);
  }
}

function rectanglesOverlap(a: Block, b: Block): boolean {
  return a.col < b.col + b.width && a.col + a.width > b.col && a.row < b.row + b.height && a.row + a.height > b.row;
}

function cellKey(cell: Cell): string {
  return `${cell.col},${cell.row}`;
}

function cellInsideBlock(cell: Cell, block: Block): boolean {
  return cell.col >= block.col && cell.col < block.col + block.width && cell.row >= block.row && cell.row < block.row + block.height;
}

function cellTouchesExit(cell: Cell, exit: Exit, width: number, height: number): boolean {
  if (exit.side === "top") return cell.row === 0 && cell.col >= exit.start && cell.col < exit.start + exit.length;
  if (exit.side === "bottom") return cell.row === height - 1 && cell.col >= exit.start && cell.col < exit.start + exit.length;
  if (exit.side === "left") return cell.col === 0 && cell.row >= exit.start && cell.row < exit.start + exit.length;
  return cell.col === width - 1 && cell.row >= exit.start && cell.row < exit.start + exit.length;
}
