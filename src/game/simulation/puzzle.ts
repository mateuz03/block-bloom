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
  color: ColorId;
  side: Side;
  start: number;
  length: number;
};

export type Level = {
  id: string;
  name: string;
  width: number;
  height: number;
  blocks: Block[];
  exits: Exit[];
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
    | "missing-color-exit"
    | "incompatible-exit";
  levelId: string;
  message: string;
};

export const levels: Level[] = [
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

export function cloneBlock(block: Block): Block {
  return { ...block };
}

export function cloneLevel(level: Level): Level {
  return {
    ...level,
    blocks: level.blocks.map(cloneBlock),
    exits: level.exits.map((exit) => ({ ...exit })),
  };
}

export function canPlace(block: Block, col: number, row: number, blocks: Block[], width: number, height: number): boolean {
  if (!Number.isInteger(col) || !Number.isInteger(row)) return false;
  if (col < 0 || row < 0 || col + block.width > width || row + block.height > height) return false;
  return !blocks.some(
    (other) =>
      other.id !== block.id &&
      col < other.col + other.width &&
      col + block.width > other.col &&
      row < other.row + other.height &&
      row + block.height > other.row,
  );
}

export function reachablePlacements(block: Block, blocks: Block[], width: number, height: number): Array<{ col: number; row: number }> {
  const queue = [{ col: block.col, row: block.row }];
  const visited = new Set([`${block.col},${block.row}`]);
  const result: Array<{ col: number; row: number }> = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const [dx, dy] of directions) {
      const next = { col: current.col + dx, row: current.row + dy };
      const key = `${next.col},${next.row}`;
      if (visited.has(key) || !canPlace(block, next.col, next.row, blocks, width, height)) continue;
      visited.add(key);
      queue.push(next);
      result.push(next);
    }
  }
  return result;
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

    level.exits.forEach((exit, index) => {
      if (!Number.isInteger(exit.start) || !Number.isInteger(exit.length) || exit.length <= 0) {
        issues.push({ code: "invalid-exit", levelId, message: `Saída ${index} possui geometria inválida.` });
        return;
      }
      const limit = exit.side === "top" || exit.side === "bottom" ? level.width : level.height;
      if (exit.start < 0 || exit.start + exit.length > limit) {
        issues.push({ code: "exit-out-of-bounds", levelId, message: `Saída ${index} está fora dos limites da borda.` });
      }
    });

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
