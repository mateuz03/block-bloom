export const COLS = 6;
export const ROWS = 8;

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
  name: string;
  blocks: Block[];
  exits: Exit[];
};

export const levels: Level[] = [
  {
    name: "Primeiros passos",
    blocks: [
      { id: "a", color: "coral", col: 2, row: 1, width: 2, height: 1 },
      { id: "b", color: "blue", col: 1, row: 4, width: 1, height: 2 },
      { id: "c", color: "yellow", col: 3, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { color: "coral", side: "top", start: 2, length: 2 },
      { color: "blue", side: "left", start: 4, length: 2 },
      { color: "yellow", side: "bottom", start: 3, length: 2 },
    ],
  },
  {
    name: "Cruzamento",
    blocks: [
      { id: "a", color: "mint", col: 2, row: 2, width: 2, height: 1 },
      { id: "b", color: "blue", col: 4, row: 3, width: 1, height: 2 },
      { id: "c", color: "coral", col: 1, row: 5, width: 2, height: 1 },
      { id: "d", color: "yellow", col: 3, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { color: "mint", side: "right", start: 1, length: 1 },
      { color: "blue", side: "top", start: 4, length: 1 },
      { color: "coral", side: "left", start: 5, length: 1 },
      { color: "yellow", side: "bottom", start: 3, length: 1 },
    ],
  },
  {
    name: "Quatro cantos",
    blocks: [
      { id: "a", color: "coral", col: 1, row: 1, width: 1, height: 2 },
      { id: "b", color: "blue", col: 4, row: 1, width: 1, height: 2 },
      { id: "c", color: "mint", col: 1, row: 5, width: 2, height: 1 },
      { id: "d", color: "yellow", col: 3, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { color: "coral", side: "left", start: 1, length: 2 },
      { color: "blue", side: "right", start: 1, length: 2 },
      { color: "mint", side: "bottom", start: 1, length: 2 },
      { color: "yellow", side: "bottom", start: 3, length: 2 },
    ],
  },
];

export const cloneBlocks = (level: Level): Block[] => level.blocks.map((block) => ({ ...block }));

export function canPlace(block: Block, col: number, row: number, blocks: Block[]): boolean {
  if (col < 0 || row < 0 || col + block.width > COLS || row + block.height > ROWS) return false;
  return !blocks.some(
    (other) =>
      other.id !== block.id &&
      col < other.col + other.width &&
      col + block.width > other.col &&
      row < other.row + other.height &&
      row + block.height > other.row,
  );
}

export function matchingExit(block: Block, exits: Exit[]): Exit | undefined {
  return exits.find((exit) => {
    if (exit.color !== block.color) return false;
    if (exit.side === "top") return block.row === 0 && block.col === exit.start && block.width === exit.length;
    if (exit.side === "bottom") return block.row + block.height === ROWS && block.col === exit.start && block.width === exit.length;
    if (exit.side === "left") return block.col === 0 && block.row === exit.start && block.height === exit.length;
    return block.col + block.width === COLS && block.row === exit.start && block.height === exit.length;
  });
}
