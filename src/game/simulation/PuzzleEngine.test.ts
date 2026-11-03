import { describe, expect, it } from "vitest";
import {
  completeLevel,
  loadPuzzleProgress,
  parseSavedProgress,
  selectProgressLevel,
} from "../../storage/puzzleProgress";
import { PuzzleEngine } from "./PuzzleEngine";
import { levels, validateLevels, type Level } from "./puzzle";

describe("PuzzleEngine", () => {
  it("cria estado defensivo para a fase escolhida", () => {
    const engine = new PuzzleEngine(levels, "level-1");
    const state = engine.state;
    expect(state).toMatchObject({ levelId: "level-1", moves: 0, status: "playing", history: [] });
    expect(state.blocks).toHaveLength(1);
    state.blocks[0].col = 99;
    expect(engine.state.blocks[0].col).toBe(1);
  });

  it("remove bloco na saída e restaura tudo com undo", () => {
    const engine = new PuzzleEngine(levels, "level-1");
    const transition = engine.moveBlock("coral", 1, 0);
    expect(transition.changed).toBe(true);
    expect(transition.exited?.block.id).toBe("coral");
    expect(transition.state).toMatchObject({ moves: 1, status: "won", blocks: [] });
    expect(transition.state.history).toHaveLength(1);

    const undo = engine.undo();
    expect(undo.state).toMatchObject({ moves: 0, status: "playing" });
    expect(undo.state.blocks[0]).toMatchObject({ id: "coral", col: 1, row: 2 });
  });

  it("rejeita sobreposição e destino inalcançável através de uma barreira", () => {
    const engine = new PuzzleEngine(levels, "level-3");
    expect(engine.moveBlock("cargo", 2, 2).changed).toBe(false);
    expect(engine.moveBlock("cargo", 3, 2).changed).toBe(false);
    expect(engine.state).toMatchObject({ moves: 0, history: [] });
  });

  it("marca vitória apenas quando o último bloco sai", () => {
    const catalog: Level[] = [{
      id: "single",
      name: "Single",
      width: 4,
      height: 4,
      idealMoves: 1,
      version: 1,
      blocks: [{ id: "only", color: "mint", col: 1, row: 2, width: 1, height: 1 }],
      exits: [{ color: "mint", side: "left", start: 2, length: 1 }],
    }];
    const engine = new PuzzleEngine(catalog, "single");
    expect(engine.moveBlock("only", 0, 2).state).toMatchObject({ status: "won", blocks: [] });
    expect(engine.moveBlock("only", 1, 2).changed).toBe(false);
  });

  it("reinicia e troca de fase limpando histórico", () => {
    const engine = new PuzzleEngine(levels, "level-1");
    engine.moveBlock("coral", 1, 0);
    expect(engine.restart()).toMatchObject({ levelId: "level-1", moves: 0, status: "playing", history: [] });
    expect(engine.loadLevel("level-2")).toMatchObject({ levelId: "level-2", moves: 0, status: "playing", history: [] });
    expect(() => engine.loadLevel("missing")).toThrow("Fase desconhecida");
  });

  it("restaura uma partida validada e mantém o Undo funcional", () => {
    const source = new PuzzleEngine(levels, "level-2");
    source.moveBlock("blue", 0, 2);
    const restored = new PuzzleEngine(levels, "level-2");

    expect(restored.restoreState(source.state)).toEqual(source.state);
    expect(restored.undo().state).toMatchObject({
      levelId: "level-2",
      moves: 0,
      status: "playing",
    });
  });

  it("recusa restauração adulterada sem alterar o estado atual", () => {
    const engine = new PuzzleEngine(levels, "level-2");
    const invalid = engine.state;
    invalid.blocks[0].col = 99;

    expect(() => engine.restoreState(invalid)).toThrow("Estado salvo inválido");
    expect(engine.state).toMatchObject({ levelId: "level-2", moves: 0 });
  });
});

describe("validação estrutural", () => {
  it("detecta IDs, metadados, limites, sobreposição e saídas inválidas", () => {
    const invalid: Level[] = [
      {
        id: "bad",
        name: "Bad",
        width: 6,
        height: 8,
        idealMoves: 0,
        version: 1,
        blocks: [
          { id: "same", color: "coral", col: -1, row: 0, width: 2, height: 1 },
          { id: "same", color: "coral", col: 0, row: 0, width: 1, height: 1 },
          { id: "yellow", color: "yellow", col: 4, row: 7, width: 3, height: 1 },
          { id: "geometry", color: "mint", col: 0, row: 3, width: 0, height: 1 },
        ],
        exits: [
          { color: "coral", side: "top", start: 5, length: 2 },
          { color: "coral", side: "left", start: 0, length: 2 },
          { color: "mint", side: "right", start: 0, length: 0 },
        ],
      },
      { id: "bad", name: "Duplicate", width: 6, height: 8, idealMoves: 1, version: 1, blocks: [], exits: [] },
    ];

    const codes = new Set(validateLevels(invalid).map((issue) => issue.code));
    for (const code of [
      "duplicate-level-id",
      "duplicate-block-id",
      "invalid-level-metadata",
      "invalid-block",
      "block-out-of-bounds",
      "initial-overlap",
      "invalid-exit",
      "exit-out-of-bounds",
      "missing-color-exit",
      "incompatible-exit",
    ]) expect(codes.has(code as never)).toBe(true);
  });
});

describe("progressão persistida", () => {
  it("migra save v1 e o índice legado", () => {
    expect(parseSavedProgress('{"version":1,"levelId":"level-3"}', levels)).toMatchObject({
      version: 2,
      currentLevelId: "level-3",
      highestUnlockedLevelId: "level-3",
    });
    const storage = {
      getItem: (key: string) => key === "block-bloom-level" ? "4" : null,
    };
    expect(loadPuzzleProgress(levels, storage)).toMatchObject({ currentLevelId: "level-5", highestUnlockedLevelId: "level-5" });
  });

  it("rejeita save corrompido e impede currentLevel acima do desbloqueio", () => {
    expect(parseSavedProgress("{invalid", levels)).toBeUndefined();
    const parsed = parseSavedProgress(JSON.stringify({
      version: 2,
      currentLevelId: "level-10",
      highestUnlockedLevelId: "level-2",
      bestMoves: { "level-1": { moves: -3, levelVersion: 1 } },
    }), levels);
    expect(parsed).toMatchObject({ currentLevelId: "level-2", highestUnlockedLevelId: "level-2", bestMoves: {} });
  });

  it("salva o melhor resultado, desbloqueia a próxima e bloqueia saltos em produção", () => {
    const base = loadPuzzleProgress(levels, { getItem: () => null });
    const completed = completeLevel(base, "level-1", 3, levels);
    expect(completed).toMatchObject({ highestUnlockedLevelId: "level-2" });
    expect(completed.bestMoves["level-1"].moves).toBe(3);
    expect(completeLevel(completed, "level-1", 5, levels).bestMoves["level-1"].moves).toBe(3);
    expect(selectProgressLevel(completed, "level-5", levels, false).currentLevelId).toBe("level-1");
    expect(selectProgressLevel(completed, "level-5", levels, true).currentLevelId).toBe("level-5");
  });
});
