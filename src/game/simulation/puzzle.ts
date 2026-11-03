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
    | "incompatible-exit"
    | "overlapping-exit";
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
      { color: "mint", side: "right", start: 1, length: 2 },
      { color: "blue", side: "left", start: 3, length: 2 },
    ],
  },
  {
    id: "level-10",
    name: "Última manobra",
    width: 6,
    height: 6,
    idealMoves: 12,
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
      { color: "mint", side: "right", start: 1, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "blue", side: "left", start: 3, length: 2 },
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
      { id: "exit-mint-large", color: "mint", side: "right", start: 1, length: 2 },
      { id: "exit-blue-large", color: "blue", side: "left", start: 3, length: 2 },
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
  {
    id: "level-16",
    name: "Portões irmãos",
    width: 6,
    height: 6,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 4 },
      { id: "stopper-left", color: "yellow", col: 0, row: 4, width: 1, height: 1 },
      { id: "stopper-right", color: "coral", col: 5, row: 0, width: 1, height: 1 },
      { id: "gate-right", color: "mint", col: 4, row: 1, width: 1, height: 4 },
      { id: "cargo", color: "coral", col: 0, row: 1, width: 2, height: 2 },
      { id: "cargo-low", color: "mint", col: 1, row: 4, width: 2, height: 2 },
      { id: "guard", color: "yellow", col: 5, row: 2, width: 1, height: 1 },
    ],
    exits: [
      { color: "yellow", side: "left", start: 4, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 4, length: 1 },
      { color: "coral", side: "right", start: 1, length: 2 },
      { color: "mint", side: "right", start: 4, length: 2 },
      { color: "yellow", side: "bottom", start: 5, length: 1 },
    ],
  },
  {
    id: "level-17",
    name: "Portal duplo",
    width: 6,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 2, width: 1, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 2, row: 0, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 4, row: 0, width: 2, height: 2 },
      { id: "blue-stopper", color: "blue", col: 2, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 5, width: 1, height: 2 },
      { id: "mint-stopper", color: "mint", col: 5, row: 4, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 2, length: 1 },
      { color: "yellow", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "left", start: 0, length: 2 },
      { color: "blue", side: "top", start: 2, length: 1 },
      { color: "yellow", side: "top", start: 5, length: 1 },
      { color: "mint", side: "bottom", start: 5, length: 1 },
      { color: "blue", side: "right", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-duplo", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-duplo",
      removedByBloomId: "bloom-duplo",
      cells: Array.from({ length: 7 }, (_, row) => ({ col: 3, row })),
    }],
  },
  {
    id: "level-18",
    name: "Corredor alongado",
    width: 6,
    height: 7,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "mint-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "yellow-stopper", color: "yellow", col: 2, row: 6, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 5, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "mint-return", color: "mint", col: 0, row: 0, width: 1, height: 2 },
      { id: "blue-return", color: "blue", col: 5, row: 5, width: 1, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 3, length: 1 },
      { color: "yellow", side: "left", start: 6, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 5, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "mint", side: "right", start: 1, length: 2 },
      { color: "blue", side: "left", start: 4, length: 2 },
    ],
  },
  {
    id: "level-19",
    name: "Portal invertido",
    width: 6,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 2, row: 6, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 4, row: 5, width: 2, height: 2 },
      { id: "blue-stopper", color: "blue", col: 2, row: 2, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 1, width: 1, height: 2 },
      { id: "mint-stopper", color: "mint", col: 5, row: 3, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 4, length: 1 },
      { color: "yellow", side: "top", start: 2, length: 1 },
      { color: "mint", side: "left", start: 5, length: 2 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "yellow", side: "bottom", start: 5, length: 1 },
      { color: "mint", side: "top", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
    ],
    blooms: [{ id: "bloom-invertido", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-invertido",
      removedByBloomId: "bloom-invertido",
      cells: Array.from({ length: 7 }, (_, row) => ({ col: 3, row })),
    }],
  },
  {
    id: "level-20",
    name: "Cortina dupla",
    width: 7,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "mint-stopper", color: "mint", col: 2, row: 1, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 1, width: 2, height: 2 },
      { id: "yellow-stopper", color: "yellow", col: 4, row: 4, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 4, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 6, width: 2, height: 1 },
      { id: "blue-stopper", color: "blue", col: 3, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 2, length: 1 },
      { color: "yellow", side: "left", start: 1, length: 2 },
      { color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "right", start: 4, length: 2 },
      { color: "mint", side: "top", start: 0, length: 2 },
      { color: "blue", side: "top", start: 3, length: 1 },
    ],
    blooms: [{ id: "bloom-cortina", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-cortina",
      removedByBloomId: "bloom-cortina",
      cells: Array.from({ length: 7 }, (_, col) => ({ col, row: 3 })),
    }],
  },
  {
    id: "level-21",
    name: "Muro dividido",
    width: 7,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 2, row: 0, width: 1, height: 2 },
      { id: "coral-stopper", color: "coral", col: 6, row: 0, width: 1, height: 1 },
      { id: "mint-stopper", color: "mint", col: 0, row: 1, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 2, row: 5, width: 1, height: 2 },
      { id: "blue-stopper", color: "blue", col: 6, row: 4, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 4, width: 1, height: 1 },
      { id: "yellow-guard", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { color: "coral", side: "left", start: 0, length: 1 },
      { color: "blue", side: "right", start: 0, length: 2 },
      { color: "mint", side: "bottom", start: 0, length: 1 },
      { color: "mint", side: "right", start: 5, length: 2 },
      { color: "blue", side: "bottom", start: 6, length: 1 },
      { color: "yellow", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "bottom", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-upper", exitId: "exit-coral-bloom" },
    ],
    vines: [
      {
        id: "vine-upper",
        removedByBloomId: "bloom-upper",
        cells: [{ col: 3, row: 0 }, { col: 3, row: 1 }, { col: 3, row: 2 }],
      },
      {
        id: "vine-lower",
        removedByBloomId: "bloom-upper",
        cells: [{ col: 3, row: 4 }, { col: 3, row: 5 }, { col: 3, row: 6 }],
      },
    ],
  },
  {
    id: "level-22",
    name: "Faixa florida",
    width: 7,
    height: 6,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "mint-stopper", color: "mint", col: 2, row: 1, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 1, width: 2, height: 2 },
      { id: "yellow-stopper", color: "yellow", col: 4, row: 3, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
      { id: "blue-stopper", color: "blue", col: 3, row: 4, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 2, length: 1 },
      { color: "yellow", side: "left", start: 1, length: 2 },
      { color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "right", start: 3, length: 2 },
      { color: "mint", side: "top", start: 0, length: 2 },
      { color: "blue", side: "top", start: 3, length: 1 },
    ],
    blooms: [{ id: "bloom-faixa", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-faixa",
      removedByBloomId: "bloom-faixa",
      cells: [1, 2, 3, 4].map((col) => ({ col, row: 2 })),
    }],
  },
  {
    id: "level-23",
    name: "Salão alongado",
    width: 7,
    height: 6,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 3, row: 0, width: 1, height: 4 },
      { id: "mint-gate", color: "mint", col: 4, row: 1, width: 1, height: 4 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 4, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 6, row: 0, width: 1, height: 2 },
      { id: "mint-return", color: "mint", col: 0, row: 0, width: 1, height: 2 },
      { id: "blue-return", color: "blue", col: 6, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 3, length: 1 },
      { color: "mint", side: "top", start: 4, length: 1 },
      { color: "yellow", side: "left", start: 4, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "mint", side: "right", start: 1, length: 2 },
      { color: "blue", side: "bottom", start: 6, length: 1 },
    ],
  },
  {
    id: "level-24",
    name: "Recanto em L",
    width: 8,
    height: 6,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 3, width: 2, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 3, row: 5, width: 2, height: 1 },
      { id: "coral-stopper", color: "coral", col: 7, row: 2, width: 1, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 0, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { color: "yellow", side: "bottom", start: 3, length: 1 },
      { color: "coral", side: "left", start: 2, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 3, length: 1 },
      { color: "yellow", side: "top", start: 3, length: 2 },
    ],
    blooms: [{ id: "bloom-recanto", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-recanto",
      removedByBloomId: "bloom-recanto",
      cells: [
        { col: 4, row: 1 }, { col: 4, row: 2 }, { col: 4, row: 3 }, { col: 4, row: 4 },
        { col: 3, row: 4 }, { col: 2, row: 4 }, { col: 1, row: 4 },
      ],
    }],
  },
  {
    id: "level-25",
    name: "Claustro florido",
    width: 7,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 2, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
      { id: "blue-stopper", color: "blue", col: 1, row: 1, width: 1, height: 1 },
      { id: "mint-stopper", color: "mint", col: 5, row: 3, width: 1, height: 1 },
      { id: "mint-guard", color: "mint", col: 6, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { color: "yellow", side: "top", start: 5, length: 1 },
      { color: "blue", side: "bottom", start: 1, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
      { color: "mint", side: "bottom", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
    ],
    blooms: [
      { id: "bloom-north", exitId: "exit-coral-bloom" },
    ],
    vines: [
      {
        id: "vine-north",
        removedByBloomId: "bloom-north",
        cells: Array.from({ length: 5 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-south",
        removedByBloomId: "bloom-north",
        cells: [2, 3, 4, 5, 6].map((row) => ({ col: 3, row })),
      },
    ],
  },
  {
    id: "level-26",
    name: "Portas cruzadas",
    width: 6,
    height: 6,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 0, row: 2, width: 4, height: 1 },
      { id: "mint-gate", color: "mint", col: 0, row: 4, width: 4, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 5, row: 2, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 5, row: 4, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 0, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 4, row: 3, width: 1, height: 2 },
    ],
    exits: [
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "top", start: 0, length: 4 },
      { color: "yellow", side: "top", start: 5, length: 1 },
      { color: "coral", side: "right", start: 4, length: 1 },
      { color: "blue", side: "bottom", start: 0, length: 2 },
      { color: "yellow", side: "left", start: 3, length: 2 },
    ],
  },
  {
    id: "level-27",
    name: "Quatro vagas",
    width: 6,
    height: 7,
    idealMoves: 10,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "mint-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "yellow-stopper", color: "yellow", col: 2, row: 6, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 5, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 0, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 4, row: 0, width: 2, height: 2 },
      { id: "blue-cargo", color: "blue", col: 4, row: 5, width: 2, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "top", start: 3, length: 1 },
      { color: "yellow", side: "left", start: 6, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "right", start: 5, length: 2 },
      { color: "mint", side: "right", start: 1, length: 2 },
      { color: "yellow", side: "left", start: 0, length: 2 },
      { color: "blue", side: "left", start: 3, length: 2 },
    ],
  },
  {
    id: "level-28",
    name: "Rosácea",
    width: 7,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 3, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 6, row: 3, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 0, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 6, width: 2, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 3, row: 0, width: 1, height: 2 },
      { id: "blue-stopper", color: "blue", col: 5, row: 0, width: 1, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 3, length: 1 },
      { color: "yellow", side: "right", start: 3, length: 1 },
      { color: "blue", side: "right", start: 0, length: 1 },
      { color: "mint", side: "right", start: 6, length: 1 },
      { color: "yellow", side: "bottom", start: 3, length: 1 },
      { color: "blue", side: "top", start: 5, length: 1 },
      { color: "yellow", side: "top", start: 3, length: 1 },
    ],
    blooms: [
      { id: "bloom-west", exitId: "exit-coral-bloom" },
    ],
    vines: [
      {
        id: "vine-column",
        removedByBloomId: "bloom-west",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-row",
        removedByBloomId: "bloom-west",
        cells: [3, 4, 5].map((col) => ({ col, row: 3 })),
      },
    ],
  },
  {
    id: "level-29",
    name: "Baía partida",
    width: 7,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 3, row: 0, width: 1, height: 5 },
      { id: "mint-gate", color: "mint", col: 4, row: 1, width: 1, height: 5 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 5, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 3, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 3, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 0, width: 1, height: 2 },
      { id: "coral-guard", color: "coral", col: 2, row: 3, width: 1, height: 1 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 3, length: 1 },
      { color: "mint", side: "top", start: 4, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 3, length: 2 },
      { color: "yellow", side: "left", start: 3, length: 2 },
      { color: "mint", side: "right", start: 1, length: 2 },
    ],
  },
  {
    id: "level-30",
    name: "Baía larga",
    width: 8,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "blue-gate", color: "blue", col: 3, row: 0, width: 1, height: 5 },
      { id: "mint-gate", color: "mint", col: 4, row: 1, width: 1, height: 5 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 5, width: 1, height: 1 },
      { id: "coral-stopper", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "coral-guard", color: "coral", col: 2, row: 3, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 3, width: 2, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 6, row: 3, width: 2, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 0, width: 1, height: 2 },
    ],
    exits: [
      { color: "blue", side: "bottom", start: 3, length: 1 },
      { color: "mint", side: "top", start: 4, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "coral", side: "right", start: 0, length: 1 },
      { color: "coral", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 3, length: 2 },
      { color: "yellow", side: "left", start: 3, length: 2 },
      { color: "mint", side: "right", start: 1, length: 2 },
    ],
  },
  {
    id: "level-31",
    name: "Cerrado duplo",
    width: 6,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-gate", color: "blue", col: 4, row: 0, width: 1, height: 5 },
      { id: "yellow-stopper", color: "yellow", col: 4, row: 5, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 4, width: 1, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 0, width: 2, height: 1 },
      { id: "mint-stopper", color: "mint", col: 5, row: 3, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 5, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "bottom", start: 4, length: 1 },
      { color: "yellow", side: "left", start: 5, length: 1 },
      { color: "blue", side: "right", start: 4, length: 2 },
      { color: "mint", side: "right", start: 0, length: 1 },
      { color: "mint", side: "left", start: 3, length: 1 },
      { color: "yellow", side: "top", start: 5, length: 1 },
    ],
    blooms: [{ id: "bloom-cerrado", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-cerrado",
      removedByBloomId: "bloom-cerrado",
      cells: Array.from({ length: 6 }, (_, row) => ({ col: 3, row })),
    }],
  },
  {
    id: "level-32",
    name: "Vaga de pétala",
    width: 5,
    height: 6,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "helper", color: "mint", col: 4, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { color: "yellow", side: "left", start: 5, length: 1 },
      { id: "exit-bloom", color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { color: "mint", side: "left", start: 2, length: 2 },
    ],
    blooms: [{ id: "bloom-vacancy", exitId: "exit-bloom" }],
    vines: [{
      id: "vine-cargo-lane",
      removedByBloomId: "bloom-vacancy",
      cells: [{ col: 3, row: 4 }],
    }],
  },
  {
    id: "level-33",
    name: "Duas raízes",
    width: 7,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "first-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "second-flower", color: "yellow", col: 1, row: 5, width: 1, height: 1 },
      { id: "traveler", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "temporary-block", color: "mint", col: 3, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-first-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-second-bloom", color: "yellow", side: "right", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
      { color: "mint", side: "bottom", start: 3, length: 1 },
    ],
    blooms: [
      { id: "bloom-first-root", exitId: "exit-first-bloom" },
      { id: "bloom-second-root", exitId: "exit-second-bloom" },
    ],
    vines: [
      {
        id: "vine-first-wall",
        removedByBloomId: "bloom-first-root",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-second-wall",
        removedByBloomId: "bloom-second-root",
        cells: [{ col: 4, row: 2 }, { col: 4, row: 3 }],
      },
    ],
  },
  {
    id: "level-34",
    name: "Encruzilhada florida",
    width: 6,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "left-gate", color: "blue", col: 2, row: 0, width: 1, height: 5 },
      { id: "stopper", color: "yellow", col: 2, row: 5, width: 1, height: 1 },
      { id: "cargo", color: "coral", col: 0, row: 4, width: 2, height: 2 },
      { id: "right-gate", color: "mint", col: 3, row: 1, width: 1, height: 5 },
      { id: "return", color: "blue", col: 5, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { color: "yellow", side: "left", start: 5, length: 1 },
      { id: "exit-left-bloom", color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "coral", side: "right", start: 4, length: 2 },
      { id: "exit-right-bloom", color: "mint", side: "top", start: 3, length: 1 },
      { color: "blue", side: "left", start: 3, length: 2 },
    ],
    blooms: [
      { id: "bloom-left", exitId: "exit-left-bloom" },
      { id: "bloom-right", exitId: "exit-right-bloom" },
    ],
    vines: [
      {
        id: "vine-left-lane",
        removedByBloomId: "bloom-left",
        cells: [{ col: 1, row: 1 }, { col: 1, row: 2 }, { col: 1, row: 3 }],
      },
      {
        id: "vine-right-lane",
        removedByBloomId: "bloom-right",
        cells: [{ col: 4, row: 1 }, { col: 4, row: 2 }, { col: 4, row: 3 }],
      },
    ],
  },
  {
    id: "level-35",
    name: "Coração do jardim",
    width: 6,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 4, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "mint-helper", color: "mint", col: 1, row: 5, width: 1, height: 1 },
      { id: "coral-helper", color: "coral", col: 5, row: 0, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 4, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
      { color: "mint", side: "bottom", start: 1, length: 1 },
      { color: "coral", side: "top", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-first-root", exitId: "exit-coral-bloom" },
      { id: "bloom-second-root", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-first-route",
        removedByBloomId: "bloom-first-root",
        cells: [{ col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 }],
      },
      {
        id: "vine-second-route",
        removedByBloomId: "bloom-second-root",
        cells: [{ col: 3, row: 2 }, { col: 3, row: 3 }, { col: 3, row: 4 }],
      },
    ],
  },
  {
    id: "level-36",
    name: "Corredor de pétalas",
    width: 6,
    height: 6,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "first-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "second-flower", color: "yellow", col: 1, row: 4, width: 1, height: 1 },
      { id: "cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "helper", color: "mint", col: 1, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-first-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-second-bloom", color: "yellow", side: "left", start: 4, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 1, length: 1 },
    ],
    blooms: [
      { id: "bloom-first-gate", exitId: "exit-first-bloom" },
      { id: "bloom-second-gate", exitId: "exit-second-bloom" },
    ],
    vines: [
      {
        id: "vine-first-column",
        removedByBloomId: "bloom-first-gate",
        cells: Array.from({ length: 6 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-second-column",
        removedByBloomId: "bloom-second-gate",
        cells: Array.from({ length: 6 }, (_, row) => ({ col: 3, row })),
      },
    ],
  },
  {
    id: "level-37",
    name: "Pontes em flor",
    width: 7,
    height: 7,
    idealMoves: 3,
    version: 1,
    blocks: [
      { id: "first-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "second-flower", color: "yellow", col: 4, row: 3, width: 1, height: 1 },
      { id: "cargo", color: "blue", col: 0, row: 3, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-first-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-second-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "bottom", start: 0, length: 2 },
    ],
    blooms: [
      { id: "bloom-upper-bridge", exitId: "exit-first-bloom" },
      { id: "bloom-lower-bridge", exitId: "exit-second-bloom" },
    ],
    vines: [
      {
        id: "vine-upper-bridge",
        removedByBloomId: "bloom-upper-bridge",
        cells: Array.from({ length: 7 }, (_, col) => ({ col, row: 2 })),
      },
      {
        id: "vine-lower-bridge",
        removedByBloomId: "bloom-lower-bridge",
        cells: Array.from({ length: 7 }, (_, col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-38",
    name: "Encontro das raízes",
    width: 7,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "left-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "right-flower", color: "yellow", col: 5, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 4, row: 0, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-left-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-right-bloom", color: "yellow", side: "right", start: 1, length: 1 },
      { color: "blue", side: "right", start: 3, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-vertical-root", exitId: "exit-left-bloom" },
      { id: "bloom-horizontal-root", exitId: "exit-right-bloom" },
    ],
    vines: [
      {
        id: "vine-vertical-root",
        removedByBloomId: "bloom-vertical-root",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-horizontal-root",
        removedByBloomId: "bloom-horizontal-root",
        cells: Array.from({ length: 7 }, (_, col) => ({ col, row: 4 })).filter(({ col }) => col !== 2),
      },
    ],
  },
  {
    id: "level-39",
    name: "Três portais floridos",
    width: 7,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "first-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "second-flower", color: "yellow", col: 1, row: 4, width: 1, height: 1 },
      { id: "third-flower", color: "mint", col: 1, row: 6, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-first-bloom", color: "coral", side: "left", start: 0, length: 1 },
      { id: "exit-second-bloom", color: "yellow", side: "left", start: 4, length: 1 },
      { id: "exit-third-bloom", color: "mint", side: "left", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
    ],
    blooms: [
      { id: "bloom-first-portal", exitId: "exit-first-bloom" },
      { id: "bloom-second-portal", exitId: "exit-second-bloom" },
      { id: "bloom-third-portal", exitId: "exit-third-bloom" },
    ],
    vines: [
      {
        id: "vine-first-portal",
        removedByBloomId: "bloom-first-portal",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-second-portal",
        removedByBloomId: "bloom-second-portal",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 4, row })),
      },
      {
        id: "vine-third-portal",
        removedByBloomId: "bloom-third-portal",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 5, row })),
      },
    ],
  },
  {
    id: "level-40",
    name: "Grande travessia",
    width: 8,
    height: 7,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 2, row: 1, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 4, row: 1, width: 1, height: 1 },
      { id: "blue-flower", color: "blue", col: 7, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 0, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 2, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 4, length: 1 },
      { id: "exit-blue-bloom", color: "blue", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 3, length: 2 },
    ],
    blooms: [
      { id: "bloom-coral-crossing", exitId: "exit-coral-bloom" },
      { id: "bloom-yellow-crossing", exitId: "exit-yellow-bloom" },
      { id: "bloom-mint-crossing", exitId: "exit-mint-bloom" },
      { id: "bloom-blue-crossing", exitId: "exit-blue-bloom" },
    ],
    vines: [
      {
        id: "vine-coral-crossing",
        removedByBloomId: "bloom-coral-crossing",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 1, row: index + 2 })),
      },
      {
        id: "vine-yellow-crossing",
        removedByBloomId: "bloom-yellow-crossing",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 3, row: index + 2 })),
      },
      {
        id: "vine-mint-crossing",
        removedByBloomId: "bloom-mint-crossing",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 5, row: index + 2 })),
      },
      {
        id: "vine-blue-crossing",
        removedByBloomId: "bloom-blue-crossing",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 6, row: index + 2 })),
      },
    ],
  },
  {
    id: "level-41",
    name: "Ponte partida",
    width: 6,
    height: 6,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 4, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 1, length: 1 },
      { color: "blue", side: "top", start: 0, length: 4 },
    ],
    blooms: [
      { id: "bloom-left-bridge", exitId: "exit-coral-bloom" },
      { id: "bloom-right-bridge", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-left-bridge",
        removedByBloomId: "bloom-left-bridge",
        cells: Array.from({ length: 3 }, (_, col) => ({ col, row: 2 })),
      },
      {
        id: "vine-right-bridge",
        removedByBloomId: "bloom-right-bridge",
        cells: Array.from({ length: 3 }, (_, index) => ({ col: index + 3, row: 2 })),
      },
    ],
  },
  {
    id: "level-42",
    name: "Rotas cruzadas",
    width: 7,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 5, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 4, row: 0, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-vertical-root", exitId: "exit-coral-bloom" },
      { id: "bloom-horizontal-root", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-vertical-root",
        removedByBloomId: "bloom-vertical-root",
        cells: Array.from({ length: 7 }, (_, row) => ({ col: 2, row })),
      },
      {
        id: "vine-horizontal-root",
        removedByBloomId: "bloom-horizontal-root",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: index < 2 ? index : index + 1, row: 4 })),
      },
    ],
  },
  {
    id: "level-43",
    name: "Ponto de apoio",
    width: 7,
    height: 7,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 3, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 6, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "mint-helper", color: "mint", col: 2, row: 2, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 0, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 3, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
      { color: "mint", side: "bottom", start: 2, length: 1 },
    ],
    blooms: [
      { id: "bloom-first-gate", exitId: "exit-coral-bloom" },
      { id: "bloom-second-gate", exitId: "exit-yellow-bloom" },
      { id: "bloom-third-gate", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-first-gate",
        removedByBloomId: "bloom-first-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 1, row: index + 1 })),
      },
      {
        id: "vine-second-gate",
        removedByBloomId: "bloom-second-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 3, row: index + 1 })),
      },
      {
        id: "vine-third-gate",
        removedByBloomId: "bloom-third-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 5, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-44",
    name: "Corredores paralelos",
    width: 8,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 3, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 7, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 0, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 3, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-left-gate", exitId: "exit-coral-bloom" },
      { id: "bloom-center-gate", exitId: "exit-yellow-bloom" },
      { id: "bloom-right-gate", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-left-gate",
        removedByBloomId: "bloom-left-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-center-gate",
        removedByBloomId: "bloom-center-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 3, row: index + 1 })),
      },
      {
        id: "vine-right-gate",
        removedByBloomId: "bloom-right-gate",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 6, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-45",
    name: "Coração de pétalas",
    width: 8,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 2, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-flower", color: "blue", col: 7, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 0, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 2, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 5, length: 1 },
      { id: "exit-blue-bloom", color: "blue", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-coral-petal", exitId: "exit-coral-bloom" },
      { id: "bloom-yellow-petal", exitId: "exit-yellow-bloom" },
      { id: "bloom-mint-petal", exitId: "exit-mint-bloom" },
      { id: "bloom-blue-petal", exitId: "exit-blue-bloom" },
    ],
    vines: [
      {
        id: "vine-coral-petal",
        removedByBloomId: "bloom-coral-petal",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-yellow-petal",
        removedByBloomId: "bloom-yellow-petal",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 3, row: index + 1 })),
      },
      {
        id: "vine-mint-petal",
        removedByBloomId: "bloom-mint-petal",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
      {
        id: "vine-blue-petal",
        removedByBloomId: "bloom-blue-petal",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 6, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-46",
    name: "Raiz recém-aberta",
    width: 6,
    height: 6,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 2 },
    ],
    blooms: [{ id: "bloom-open-lane", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-open-lane",
      removedByBloomId: "bloom-open-lane",
      cells: Array.from({ length: 5 }, (_, index) => ({ col: 2, row: index + 1 })),
    }],
  },
  {
    id: "level-47",
    name: "Ponte dupla",
    width: 7,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 2 },
    ],
    blooms: [
      { id: "bloom-west-bridge", exitId: "exit-coral-bloom" },
      { id: "bloom-east-bridge", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-west-bridge",
        removedByBloomId: "bloom-west-bridge",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-east-bridge",
        removedByBloomId: "bloom-east-bridge",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-48",
    name: "Passagem tripla",
    width: 8,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 6, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 2 },
    ],
    blooms: [
      { id: "bloom-first-bridge", exitId: "exit-coral-bloom" },
      { id: "bloom-second-bridge", exitId: "exit-yellow-bloom" },
      { id: "bloom-third-bridge", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-first-bridge",
        removedByBloomId: "bloom-first-bridge",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-second-bridge",
        removedByBloomId: "bloom-second-bridge",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
      {
        id: "vine-third-bridge",
        removedByBloomId: "bloom-third-bridge",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 6, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-49",
    name: "Fila de travessia",
    width: 8,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 6, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 2 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-first-queue", exitId: "exit-coral-bloom" },
      { id: "bloom-second-queue", exitId: "exit-yellow-bloom" },
      { id: "bloom-third-queue", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-first-queue",
        removedByBloomId: "bloom-first-queue",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-second-queue",
        removedByBloomId: "bloom-second-queue",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
      {
        id: "vine-third-queue",
        removedByBloomId: "bloom-third-queue",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 6, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-50",
    name: "Cruzamento do jardim",
    width: 8,
    height: 7,
    idealMoves: 9,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 7, row: 0, width: 1, height: 1 },
      { id: "blue-upper-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-vertical-cargo", color: "mint", col: 7, row: 1, width: 1, height: 2 },
      { id: "blue-lower-cargo", color: "blue", col: 0, row: 4, width: 2, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 7, length: 1 },
      { color: "blue", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-vertical-west", exitId: "exit-coral-bloom" },
      { id: "bloom-vertical-east", exitId: "exit-yellow-bloom" },
      { id: "bloom-horizontal-crossing", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-vertical-west",
        removedByBloomId: "bloom-vertical-west",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-vertical-east",
        removedByBloomId: "bloom-vertical-east",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 5, row: index + 1 })),
      },
      {
        id: "vine-horizontal-crossing",
        removedByBloomId: "bloom-horizontal-crossing",
        cells: [0, 1, 3, 4, 6, 7].map((col) => ({ col, row: 3 })),
      },
    ],
  },
  {
    id: "level-51",
    name: "Raiz horizontal",
    width: 7,
    height: 6,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 2, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { color: "blue", side: "right", start: 3, length: 1 },
      { color: "yellow", side: "right", start: 5, length: 1 },
    ],
    blooms: [{ id: "bloom-horizontal-root", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-horizontal-root",
      removedByBloomId: "bloom-horizontal-root",
      cells: Array.from({ length: 4 }, (_, index) => ({ col: index + 2, row: 3 })),
    }],
  },
  {
    id: "level-52",
    name: "Flor sob pressão",
    width: 6,
    height: 6,
    idealMoves: 3,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 2, width: 1, height: 1 },
      { id: "blue-stopper", color: "blue", col: 2, row: 1, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 3, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "right", start: 1, length: 1 },
      { color: "mint", side: "right", start: 3, length: 1 },
    ],
    blooms: [{ id: "bloom-pressed-flower", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-cargo-lane",
      removedByBloomId: "bloom-pressed-flower",
      cells: Array.from({ length: 3 }, (_, index) => ({ col: index + 2, row: 3 })),
    }],
  },
  {
    id: "level-53",
    name: "Arcos paralelos",
    width: 7,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 0, row: 5, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 0, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "left", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-upper-arch", exitId: "exit-coral-bloom" },
      { id: "bloom-lower-arch", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-upper-arch",
        removedByBloomId: "bloom-upper-arch",
        cells: Array.from({ length: 4 }, (_, index) => ({ col: index + 2, row: 2 })),
      },
      {
        id: "vine-lower-arch",
        removedByBloomId: "bloom-lower-arch",
        cells: Array.from({ length: 4 }, (_, index) => ({ col: index + 2, row: 4 })),
      },
    ],
  },
  {
    id: "level-54",
    name: "Jardim em eixos",
    width: 7,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 6, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 5, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 4, row: 1, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 6, length: 1 },
      { color: "blue", side: "right", start: 5, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-vertical-axis", exitId: "exit-coral-bloom" },
      { id: "bloom-horizontal-axis", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-vertical-axis",
        removedByBloomId: "bloom-vertical-axis",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-horizontal-axis",
        removedByBloomId: "bloom-horizontal-axis",
        cells: [0, 1, 3, 4, 5].map((col) => ({ col, row: 3 })),
      },
    ],
  },
  {
    id: "level-55",
    name: "Malha das flores",
    width: 8,
    height: 8,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 7, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-vertical-cargo", color: "mint", col: 5, row: 1, width: 1, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 5, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-vertical-weave", exitId: "exit-coral-bloom" },
      { id: "bloom-upper-crossbar", exitId: "exit-yellow-bloom" },
      { id: "bloom-lower-crossbar", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-vertical-weave",
        removedByBloomId: "bloom-vertical-weave",
        cells: Array.from({ length: 7 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-upper-crossbar",
        removedByBloomId: "bloom-upper-crossbar",
        cells: [0, 1, 3, 4, 6, 7].map((col) => ({ col, row: 4 })),
      },
      {
        id: "vine-lower-crossbar",
        removedByBloomId: "bloom-lower-crossbar",
        cells: [3, 4, 5, 6].map((col) => ({ col, row: 6 })),
      },
    ],
  },
  {
    id: "level-56",
    name: "Coluna estreita",
    width: 5,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-narrow-column", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-narrow-column",
      removedByBloomId: "bloom-narrow-column",
      cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
    }],
  },
  {
    id: "level-57",
    name: "Faixas suspensas",
    width: 8,
    height: 5,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 3, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-suspended-bands", exitId: "exit-coral-bloom" }],
    vines: [
      {
        id: "vine-upper-band",
        removedByBloomId: "bloom-suspended-bands",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: index + 2, row: 2 })),
      },
      {
        id: "vine-lower-band",
        removedByBloomId: "bloom-suspended-bands",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: index + 2, row: 4 })),
      },
    ],
  },
  {
    id: "level-58",
    name: "Desfiladeiro alto",
    width: 6,
    height: 8,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "mint-tall-cargo", color: "mint", col: 4, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "bottom", start: 0, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-high-passage", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-high-passage",
      removedByBloomId: "bloom-high-passage",
      cells: Array.from({ length: 6 }, (_, index) => ({ col: index, row: 4 })),
    }],
  },
  {
    id: "level-59",
    name: "Encruzilhada em dois tempos",
    width: 7,
    height: 7,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 2, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 6, row: 4, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 1, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 4, length: 1 },
      { color: "blue", side: "right", start: 1, length: 1 },
    ],
    blooms: [
      { id: "bloom-lower-crossing", exitId: "exit-coral-bloom" },
      { id: "bloom-side-crossing", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-lower-crossing",
        removedByBloomId: "bloom-lower-crossing",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: index + 1, row: 3 })),
      },
      {
        id: "vine-side-crossing",
        removedByBloomId: "bloom-side-crossing",
        cells: Array.from({ length: 3 }, (_, index) => ({ col: 5, row: index })),
      },
    ],
  },
  {
    id: "level-60",
    name: "A última malha",
    width: 7,
    height: 8,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-tall-cargo", color: "mint", col: 3, row: 2, width: 1, height: 2 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 7, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 3, length: 1 },
      { color: "yellow", side: "right", start: 7, length: 1 },
    ],
    blooms: [
      { id: "bloom-west-barrier", exitId: "exit-coral-bloom" },
      { id: "bloom-east-barriers", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-west-barrier",
        removedByBloomId: "bloom-west-barrier",
        cells: Array.from({ length: 7 }, (_, index) => ({ col: 1, row: index + 1 })),
      },
      {
        id: "vine-east-barrier",
        removedByBloomId: "bloom-east-barriers",
        cells: Array.from({ length: 7 }, (_, index) => ({ col: 5, row: index + 1 })),
      },
      {
        id: "vine-crossbar",
        removedByBloomId: "bloom-east-barriers",
        cells: [0, 2, 3, 4, 6].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-61",
    name: "Corredor da raiz",
    width: 6,
    height: 7,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 3, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [{ id: "bloom-corridor-root", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-corridor-root",
      removedByBloomId: "bloom-corridor-root",
      cells: Array.from({ length: 6 }, (_, index) => ({ col: 3, row: index + 1 })),
    }],
  },
  {
    id: "level-62",
    name: "Canteiro em degraus",
    width: 7,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-upper-step", exitId: "exit-coral-bloom" },
      { id: "bloom-lower-step", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-upper-step",
        removedByBloomId: "bloom-upper-step",
        cells: [2, 3, 4].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-lower-step",
        removedByBloomId: "bloom-lower-step",
        cells: [2, 3, 4].map((col) => ({ col, row: 5 })),
      },
    ],
  },
  {
    id: "level-63",
    name: "Canal profundo",
    width: 6,
    height: 8,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "mint-tall-cargo", color: "mint", col: 4, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "bottom", start: 0, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-deep-canal", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-deep-canal",
      removedByBloomId: "bloom-deep-canal",
      cells: Array.from({ length: 6 }, (_, index) => ({ col: index, row: 4 })),
    }],
  },
  {
    id: "level-64",
    name: "Raízes alternadas",
    width: 8,
    height: 7,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 7, row: 5, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-upper-root", exitId: "exit-coral-bloom" },
      { id: "bloom-lower-root", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-upper-route",
        removedByBloomId: "bloom-upper-root",
        cells: [2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-lower-route",
        removedByBloomId: "bloom-lower-root",
        cells: [2, 3, 4, 5, 6].map((col) => ({ col, row: 5 })),
      },
    ],
  },
  {
    id: "level-65",
    name: "Teia de pétalas",
    width: 7,
    height: 7,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 2 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-stopper", color: "yellow", col: 3, row: 2, width: 1, height: 1 },
      { id: "mint-stopper", color: "mint", col: 0, row: 5, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 5, row: 6, width: 2, height: 1 },
      { id: "coral-stopper", color: "coral", col: 2, row: 2, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { color: "yellow", side: "right", start: 1, length: 1 },
      { color: "blue", side: "right", start: 2, length: 2 },
      { color: "mint", side: "bottom", start: 0, length: 1 },
      { color: "yellow", side: "bottom", start: 3, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
      { color: "yellow", side: "top", start: 5, length: 2 },
      { color: "coral", side: "bottom", start: 2, length: 1 },
    ],
    blooms: [
      { id: "bloom-west-petal", exitId: "exit-coral-bloom" },
    ],
    vines: [
      {
        id: "vine-west-petal",
        removedByBloomId: "bloom-west-petal",
        cells: [1, 2, 3, 4, 5].map((row) => ({ col: 1, row })),
      },
      {
        id: "vine-east-petal",
        removedByBloomId: "bloom-west-petal",
        cells: [2, 3, 4, 5].map((row) => ({ col: 5, row })),
      },
    ],
  },
  {
    id: "level-66",
    name: "Desfiladeiro estreito",
    width: 5,
    height: 8,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 1, height: 2 },
      { id: "mint-tall-cargo", color: "mint", col: 4, row: 5, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { color: "blue", side: "right", start: 3, length: 2 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-narrow-canyon", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-narrow-canyon",
      removedByBloomId: "bloom-narrow-canyon",
      cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
    }],
  },
  {
    id: "level-67",
    name: "Jardim em panorama",
    width: 9,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 8, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-tall-cargo", color: "mint", col: 8, row: 2, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 4, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 8, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 8, length: 1 },
    ],
    blooms: [
      { id: "bloom-panorama-west", exitId: "exit-coral-bloom" },
      { id: "bloom-panorama-east", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-panorama-west",
        removedByBloomId: "bloom-panorama-west",
        cells: Array.from({ length: 3 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
      {
        id: "vine-panorama-east",
        removedByBloomId: "bloom-panorama-east",
        cells: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-68",
    name: "Canal vertical",
    width: 6,
    height: 9,
    idealMoves: 5,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 4, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 2, row: 0, width: 1, height: 2 },
      { id: "mint-cargo", color: "mint", col: 5, row: 8, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 4, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 5, length: 1 },
    ],
    blooms: [{ id: "bloom-vertical-canal", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-vertical-canal",
      removedByBloomId: "bloom-vertical-canal",
      cells: [1, 2, 3, 4, 5].map((col) => ({ col, row: 4 })),
    }],
  },
  {
    id: "level-69",
    name: "Duas raízes paralelas",
    width: 7,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-parallel-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-parallel-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-parallel-blue",
        removedByBloomId: "bloom-parallel-blue",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-parallel-mint",
        removedByBloomId: "bloom-parallel-mint",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-70",
    name: "Três portais floridos",
    width: 8,
    height: 8,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 3, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 6, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 3, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-three-coral", exitId: "exit-coral-bloom" },
      { id: "bloom-three-yellow", exitId: "exit-yellow-bloom" },
      { id: "bloom-three-mint", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-three-coral",
        removedByBloomId: "bloom-three-coral",
        cells: [{ col: 4, row: 2 }],
      },
      {
        id: "vine-three-yellow",
        removedByBloomId: "bloom-three-yellow",
        cells: [{ col: 4, row: 4 }],
      },
      {
        id: "vine-three-mint",
        removedByBloomId: "bloom-three-mint",
        cells: [{ col: 4, row: 6 }],
      },
    ],
  },
  {
    id: "level-71",
    name: "Passagem estreita",
    width: 5,
    height: 9,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 0, row: 4, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 2, row: 1, width: 1, height: 2 },
      { id: "mint-cargo", color: "mint", col: 4, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "left", start: 4, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [{ id: "bloom-narrow-passage", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-narrow-passage",
      removedByBloomId: "bloom-narrow-passage",
      cells: [1, 2, 3, 4].map((col) => ({ col, row: 4 })),
    }],
  },
  {
    id: "level-72",
    name: "Trilha em cotovelo",
    width: 9,
    height: 6,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 4, row: 1, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 6, row: 2, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 2, height: 1 },
      { id: "mint-tall-cargo", color: "mint", col: 8, row: 0, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 4, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 2, length: 1 },
      { color: "blue", side: "right", start: 3, length: 1 },
      { color: "mint", side: "bottom", start: 8, length: 1 },
    ],
    blooms: [
      { id: "bloom-elbow-west", exitId: "exit-coral-bloom" },
      { id: "bloom-elbow-east", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-elbow-west",
        removedByBloomId: "bloom-elbow-west",
        cells: [
          ...[2, 3, 4, 5, 6].map((col) => ({ col, row: 3 })),
          { col: 7, row: 2 },
        ],
      },
      {
        id: "vine-elbow-east",
        removedByBloomId: "bloom-elbow-east",
        cells: [{ col: 7, row: 3 }, { col: 7, row: 4 }],
      },
    ],
  },
  {
    id: "level-73",
    name: "Canal suspenso",
    width: 7,
    height: 9,
    idealMoves: 3,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 3, row: 1, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 3, row: 2, width: 1, height: 2 },
      { id: "mint-cargo", color: "mint", col: 6, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 3, length: 1 },
      { color: "blue", side: "bottom", start: 3, length: 1 },
      { color: "mint", side: "bottom", start: 6, length: 1 },
    ],
    blooms: [{ id: "bloom-suspended-canal", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-suspended-canal",
      removedByBloomId: "bloom-suspended-canal",
      cells: [1, 2, 3, 4, 5].map((col) => ({ col, row: 4 })),
    }],
  },
  {
    id: "level-74",
    name: "Pontes espelhadas",
    width: 7,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-bridge-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-bridge-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-bridge-blue",
        removedByBloomId: "bloom-bridge-blue",
        cells: [{ col: 3, row: 2 }],
      },
      {
        id: "vine-bridge-mint",
        removedByBloomId: "bloom-bridge-mint",
        cells: [{ col: 3, row: 4 }],
      },
    ],
  },
  {
    id: "level-75",
    name: "Malha tripla",
    width: 8,
    height: 8,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 3, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 3, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-triple-coral", exitId: "exit-coral-bloom" },
      { id: "bloom-triple-yellow", exitId: "exit-yellow-bloom" },
      { id: "bloom-triple-mint", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-triple-blue",
        removedByBloomId: "bloom-triple-coral",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-triple-mint",
        removedByBloomId: "bloom-triple-yellow",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 4 })),
      },
      {
        id: "vine-triple-yellow",
        removedByBloomId: "bloom-triple-mint",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 6 })),
      },
    ],
  },
  {
    id: "level-76",
    name: "Mural de raízes",
    width: 7,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 6, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 3, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "bottom", start: 4, length: 1 },
      { color: "blue", side: "right", start: 3, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-mural-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-mural-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-mural-blue",
        removedByBloomId: "bloom-mural-blue",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-mural-mint",
        removedByBloomId: "bloom-mural-mint",
        cells: Array.from({ length: 5 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-77",
    name: "Jardim panorâmico",
    width: 9,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 8, row: 1, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 2, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 2, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 4, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "right", start: 1, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-panorama-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-panorama-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-panorama-blue",
        removedByBloomId: "bloom-panorama-blue",
        cells: [2, 3, 4, 5, 6, 7].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-panorama-mint",
        removedByBloomId: "bloom-panorama-mint",
        cells: [2, 3, 4, 5, 6, 7].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-78",
    name: "Escada vertical",
    width: 7,
    height: 9,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 2, row: 1, width: 1, height: 2 },
      { id: "mint-tall-cargo", color: "mint", col: 4, row: 4, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { color: "blue", side: "bottom", start: 2, length: 1 },
      { color: "mint", side: "bottom", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-stair-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-stair-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-stair-blue",
        removedByBloomId: "bloom-stair-blue",
        cells: [0, 1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 3 })),
      },
      {
        id: "vine-stair-mint",
        removedByBloomId: "bloom-stair-mint",
        cells: [0, 1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 6 })),
      },
    ],
  },
  {
    id: "level-79",
    name: "Cruzamento de canais",
    width: 8,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-channel-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-channel-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-channel-blue",
        removedByBloomId: "bloom-channel-blue",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-channel-mint",
        removedByBloomId: "bloom-channel-mint",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-80",
    name: "Coroa das três rotas",
    width: 8,
    height: 8,
    idealMoves: 7,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 4, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 6, row: 7, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 6, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 4, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "bottom", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
      { color: "yellow", side: "right", start: 6, length: 1 },
    ],
    blooms: [
      { id: "bloom-crown-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-crown-mint", exitId: "exit-yellow-bloom" },
      { id: "bloom-crown-yellow", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-crown-blue",
        removedByBloomId: "bloom-crown-blue",
        cells: [2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-crown-mint",
        removedByBloomId: "bloom-crown-mint",
        cells: [2, 3, 4, 5, 6].map((col) => ({ col, row: 4 })),
      },
      {
        id: "vine-crown-yellow",
        removedByBloomId: "bloom-crown-yellow",
        cells: [2, 3, 4, 5, 6].map((col) => ({ col, row: 6 })),
      },
    ],
  },
  {
    id: "level-81",
    name: "Colunas estreitas",
    width: 6,
    height: 8,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 7, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 5, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "bottom", start: 5, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 5, length: 1 },
    ],
    blooms: [
      { id: "bloom-column-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-column-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-column-blue",
        removedByBloomId: "bloom-column-blue",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 2, row: index + 1 })),
      },
      {
        id: "vine-column-mint",
        removedByBloomId: "bloom-column-mint",
        cells: Array.from({ length: 6 }, (_, index) => ({ col: 4, row: index + 1 })),
      },
    ],
  },
  {
    id: "level-82",
    name: "Faixas panorâmicas",
    width: 9,
    height: 6,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 4, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 7, row: 5, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 4, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "bottom", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-panorama-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-panorama-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-panorama-blue",
        removedByBloomId: "bloom-panorama-blue",
        cells: [1, 2, 3, 4, 5, 6, 7].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-panorama-mint",
        removedByBloomId: "bloom-panorama-mint",
        cells: [1, 2, 3, 4, 5, 6, 7].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-83",
    name: "Travessia suspensa",
    width: 7,
    height: 9,
    idealMoves: 4,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 3, row: 0, width: 1, height: 1 },
      { id: "blue-tall-cargo", color: "blue", col: 1, row: 2, width: 1, height: 2 },
      { id: "mint-tall-cargo", color: "mint", col: 5, row: 5, width: 1, height: 2 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 3, length: 1 },
      { color: "blue", side: "bottom", start: 1, length: 1 },
      { color: "mint", side: "bottom", start: 5, length: 1 },
    ],
    blooms: [{ id: "bloom-suspended-crossing", exitId: "exit-coral-bloom" }],
    vines: [{
      id: "vine-suspended-crossing",
      removedByBloomId: "bloom-suspended-crossing",
      cells: [0, 1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 4 })),
    }],
  },
  {
    id: "level-84",
    name: "Raiz em cotovelo",
    width: 8,
    height: 7,
    idealMoves: 6,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 2, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 6, row: 6, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 4, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 2, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "bottom", start: 6, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 4, length: 1 },
    ],
    blooms: [
      { id: "bloom-elbow-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-elbow-mint", exitId: "exit-yellow-bloom" },
    ],
    vines: [
      {
        id: "vine-elbow-blue",
        removedByBloomId: "bloom-elbow-blue",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-elbow-connector",
        removedByBloomId: "bloom-elbow-blue",
        cells: [{ col: 3, row: 3 }],
      },
      {
        id: "vine-elbow-mint",
        removedByBloomId: "bloom-elbow-mint",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 4 })),
      },
    ],
  },
  {
    id: "level-85",
    name: "Quatro jardins",
    width: 8,
    height: 8,
    idealMoves: 8,
    version: 1,
    blocks: [
      { id: "coral-flower", color: "coral", col: 1, row: 0, width: 1, height: 1 },
      { id: "blue-flower", color: "blue", col: 3, row: 0, width: 1, height: 1 },
      { id: "yellow-flower", color: "yellow", col: 5, row: 0, width: 1, height: 1 },
      { id: "mint-flower", color: "mint", col: 7, row: 0, width: 1, height: 1 },
      { id: "blue-cargo", color: "blue", col: 0, row: 2, width: 1, height: 1 },
      { id: "mint-cargo", color: "mint", col: 0, row: 3, width: 1, height: 1 },
      { id: "yellow-cargo", color: "yellow", col: 0, row: 5, width: 1, height: 1 },
      { id: "coral-cargo", color: "coral", col: 0, row: 7, width: 1, height: 1 },
    ],
    exits: [
      { id: "exit-coral-bloom", color: "coral", side: "top", start: 1, length: 1 },
      { id: "exit-blue-bloom", color: "blue", side: "top", start: 3, length: 1 },
      { id: "exit-yellow-bloom", color: "yellow", side: "top", start: 5, length: 1 },
      { id: "exit-mint-bloom", color: "mint", side: "top", start: 7, length: 1 },
      { color: "blue", side: "right", start: 2, length: 1 },
      { color: "mint", side: "right", start: 3, length: 1 },
      { color: "yellow", side: "right", start: 5, length: 1 },
      { color: "coral", side: "right", start: 7, length: 1 },
    ],
    blooms: [
      { id: "bloom-four-blue", exitId: "exit-coral-bloom" },
      { id: "bloom-four-mint", exitId: "exit-blue-bloom" },
      { id: "bloom-four-yellow", exitId: "exit-yellow-bloom" },
      { id: "bloom-four-coral", exitId: "exit-mint-bloom" },
    ],
    vines: [
      {
        id: "vine-four-blue",
        removedByBloomId: "bloom-four-blue",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 2 })),
      },
      {
        id: "vine-four-mint",
        removedByBloomId: "bloom-four-mint",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 3 })),
      },
      {
        id: "vine-four-yellow",
        removedByBloomId: "bloom-four-yellow",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 5 })),
      },
      {
        id: "vine-four-coral",
        removedByBloomId: "bloom-four-coral",
        cells: [1, 2, 3, 4, 5, 6].map((col) => ({ col, row: 7 })),
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

    for (let i = 0; i < level.exits.length; i += 1) {
      for (let j = i + 1; j < level.exits.length; j += 1) {
        const first = level.exits[i];
        const second = level.exits[j];
        if (first.side !== second.side) continue;
        const overlaps = first.start < second.start + second.length && first.start + first.length > second.start;
        if (overlaps) {
          issues.push({
            code: "overlapping-exit",
            levelId,
            message: `Saídas ${first.color}-${first.side} e ${second.color}-${second.side} ocupam as mesmas células da borda.`,
          });
        }
      }
    }

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
