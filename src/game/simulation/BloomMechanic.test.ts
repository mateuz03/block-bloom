import { describe, expect, it } from "vitest";
import { completeLevel, parseSavedProgress } from "../../storage/puzzleProgress";
import { PuzzleEngine } from "./PuzzleEngine";
import { solveLevel, solverStateKey } from "./PuzzleSolver";
import { levels, validateLevels, type Level } from "./puzzle";

const bloomLevel = levels[10];

describe("mecânica Bloom no PuzzleEngine", () => {
  it("mantém a vinha como bloqueio até a saída ativar a flor correta", () => {
    const engine = new PuzzleEngine(levels, "level-11");
    expect(engine.previewMove("cargo", 3, 3)).toMatchObject({ valid: false, exits: false });

    const transition = engine.moveBlock("opener", 0, 1);
    expect(transition).toMatchObject({
      changed: true,
      state: {
        moves: 1,
        status: "playing",
        activatedBloomIds: ["bloom-first"],
        removedVineIds: ["vine-first"],
      },
    });
    expect(transition.exited).toMatchObject({ block: { id: "opener" }, exit: { id: "exit-bloom" } });
    expect(transition.activatedBlooms.map((bloom) => bloom.id)).toEqual(["bloom-first"]);
    expect(transition.removedVines.map((vine) => vine.id)).toEqual(["vine-first"]);
    expect(engine.previewMove("cargo", 3, 3)).toMatchObject({ valid: true, exits: true });
  });

  it("ativa uma flor apenas uma vez e cada saída continua valendo um movimento", () => {
    const catalog: Level[] = [{
      id: "repeat-bloom",
      name: "Repeat",
      width: 4,
      height: 4,
      idealMoves: 2,
      version: 1,
      blocks: [
        { id: "first", color: "coral", col: 1, row: 0, width: 1, height: 1 },
        { id: "second", color: "coral", col: 1, row: 1, width: 1, height: 1 },
      ],
      exits: [{ id: "shared-exit", color: "coral", side: "left", start: 0, length: 1 }],
      blooms: [{ id: "shared-bloom", exitId: "shared-exit" }],
      vines: [{ id: "shared-vine", removedByBloomId: "shared-bloom", cells: [{ col: 3, row: 2 }] }],
    }];
    const engine = new PuzzleEngine(catalog, "repeat-bloom");
    const first = engine.moveBlock("first", 0, 0);
    const second = engine.moveBlock("second", 0, 0);
    expect(first.activatedBlooms).toHaveLength(1);
    expect(first.removedVines).toHaveLength(1);
    expect(second.activatedBlooms).toEqual([]);
    expect(second.removedVines).toEqual([]);
    expect(second.state).toMatchObject({ moves: 2, status: "won" });
  });

  it("undo, restart e troca de fase restauram o estado Bloom", () => {
    const engine = new PuzzleEngine(levels, "level-11");
    engine.moveBlock("opener", 0, 1);

    const undo = engine.undo();
    expect(undo.state).toMatchObject({
      moves: 0,
      activatedBloomIds: [],
      removedVineIds: [],
    });
    expect(undo.state.blocks.some((block) => block.id === "opener")).toBe(true);

    engine.moveBlock("opener", 0, 1);
    expect(engine.restart()).toMatchObject({ activatedBloomIds: [], removedVineIds: [], history: [] });
    expect(engine.loadLevel("level-12")).toMatchObject({
      levelId: "level-12",
      activatedBloomIds: [],
      removedVineIds: [],
      history: [],
    });
  });

  it("protege estado, histórico e dados Bloom contra mutação externa", () => {
    const engine = new PuzzleEngine(levels, "level-11");
    engine.moveBlock("opener", 0, 1);
    const state = engine.state;
    state.activatedBloomIds.push("external");
    state.removedVineIds.length = 0;
    state.history[0].activatedBloomIds.push("external-history");
    const level = engine.currentLevel;
    level.vines?.[0].cells.push({ col: 99, row: 99 });

    expect(engine.state.activatedBloomIds).toEqual(["bloom-first"]);
    expect(engine.state.removedVineIds).toEqual(["vine-first"]);
    expect(engine.state.history[0].activatedBloomIds).toEqual([]);
    expect(engine.currentLevel.vines?.[0].cells).toHaveLength(6);
  });

  it("mantém a vitória dependente somente da remoção de todos os blocos", () => {
    const engine = new PuzzleEngine(levels, "level-11");
    expect(engine.moveBlock("opener", 0, 1).state.status).toBe("playing");
    const victory = engine.moveBlock("cargo", 3, 3);
    expect(victory.state).toMatchObject({ status: "won", moves: 2, blocks: [] });
  });
});

describe("validação de dados Bloom", () => {
  it("mantém fases antigas sem Bloom válidas", () => {
    expect(validateLevels(levels.slice(0, 10))).toEqual([]);
  });

  it("rejeita IDs e referências inválidas de flores e vinhas", () => {
    const invalid: Level = {
      ...bloomLevel,
      id: "invalid-references",
      blocks: bloomLevel.blocks.map((block) => ({ ...block })),
      exits: bloomLevel.exits.map((exit) => ({ ...exit })),
      blooms: [
        { id: "same", exitId: "missing-exit" },
        { id: "same", exitId: "exit-bloom" },
      ],
      vines: [
        { id: "same-vine", removedByBloomId: "missing-bloom", cells: [{ col: 3, row: 2 }] },
        { id: "same-vine", removedByBloomId: "same", cells: [{ col: 4, row: 2 }] },
      ],
    };
    const codes = new Set(validateLevels([invalid]).map((issue) => issue.code));
    for (const code of ["duplicate-bloom-id", "duplicate-vine-id", "invalid-bloom-reference", "invalid-vine-reference"]) {
      expect(codes.has(code as never)).toBe(true);
    }
  });

  it("rejeita células fora, repetidas, sobrepostas, sobre blocos e saídas", () => {
    const invalid: Level = {
      ...bloomLevel,
      id: "invalid-cells",
      blocks: bloomLevel.blocks.map((block) => ({ ...block })),
      exits: bloomLevel.exits.map((exit) => ({ ...exit })),
      blooms: bloomLevel.blooms?.map((bloom) => ({ ...bloom })),
      vines: [
        {
          id: "vine-a",
          removedByBloomId: "bloom-first",
          cells: [{ col: -1, row: 0 }, { col: 1, row: 1 }, { col: 1, row: 1 }, { col: 0, row: 1 }],
        },
        {
          id: "vine-b",
          removedByBloomId: "bloom-first",
          cells: [{ col: 1, row: 1 }],
        },
      ],
    };
    const codes = new Set(validateLevels([invalid]).map((issue) => issue.code));
    for (const code of ["invalid-vine-cell", "duplicate-vine-cell", "vine-overlap", "vine-block-overlap", "vine-exit-overlap"]) {
      expect(codes.has(code as never)).toBe(true);
    }
  });
});

describe("solver e persistência com Bloom", () => {
  it("diferencia estados com a mesma geometria e Bloom diferente", () => {
    const blocks = bloomLevel.blocks.map((block) => ({ ...block }));
    expect(solverStateKey(blocks, [], [])).not.toBe(
      solverStateKey(blocks, ["bloom-first"], ["vine-first"]),
    );
  });

  it("resolve uma fase dependente de Bloom sem atravessar a vinha ativa", () => {
    const result = solveLevel(bloomLevel);
    expect(result).toMatchObject({ solved: true, minimumMoves: 2, exhausted: false });
    expect(result.solution.map((move) => move.blockId)).toEqual(["opener", "cargo"]);
    expect(result.solution[0]).toMatchObject({
      activatedBloomIds: ["bloom-first"],
      removedVineIds: ["vine-first"],
    });
  });

  it("preserva save até a fase 10 e desbloqueia a fase 11", () => {
    const previous = parseSavedProgress(JSON.stringify({
      version: 2,
      currentLevelId: "level-10",
      highestUnlockedLevelId: "level-10",
      bestMoves: { "level-10": { moves: 10, levelVersion: 1 } },
    }), levels);
    expect(previous).toMatchObject({ currentLevelId: "level-10", highestUnlockedLevelId: "level-10" });
    expect(previous?.bestMoves["level-10"].moves).toBe(10);

    const completed = completeLevel(previous!, "level-10", 10, levels);
    expect(completed.highestUnlockedLevelId).toBe("level-11");
    expect(completed.bestMoves["level-10"].moves).toBe(10);
  });
});
