import { describe, expect, it } from "vitest";
import { PuzzleEngine } from "../game/simulation/PuzzleEngine";
import { levels } from "../game/simulation/puzzle";
import {
  ACTIVE_PUZZLE_KEY,
  clearActivePuzzle,
  loadActivePuzzle,
  parseActivePuzzle,
  saveActivePuzzle,
} from "./activePuzzle";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const partialLevelTwo = () => {
  const engine = new PuzzleEngine(levels, "level-2");
  const transition = engine.moveBlock("blue", 0, 2);
  expect(transition.changed).toBe(true);
  expect(transition.state.status).toBe("playing");
  return transition.state;
};

describe("activePuzzle", () => {
  it("salva e carrega uma partida parcial com histórico", () => {
    const storage = createMemoryStorage();
    const state = partialLevelTwo();

    expect(saveActivePuzzle(state, levels, storage)).toBe(true);
    expect(loadActivePuzzle(levels, storage)?.state).toEqual(state);
  });

  it("preserva flores ativadas e vinhas removidas ao restaurar", () => {
    const storage = createMemoryStorage();
    const source = new PuzzleEngine(levels, "level-11");
    const transition = source.moveBlock("opener", 0, 1);

    expect(transition.state).toMatchObject({
      status: "playing",
      moves: 1,
      activatedBloomIds: ["bloom-first"],
      removedVineIds: ["vine-first"],
    });
    expect(saveActivePuzzle(transition.state, levels, storage)).toBe(true);

    const session = loadActivePuzzle(levels, storage);
    const restored = new PuzzleEngine(levels, "level-11");
    expect(session).toBeDefined();
    restored.restoreState(session!.state);

    expect(restored.state).toMatchObject({
      moves: 1,
      activatedBloomIds: ["bloom-first"],
      removedVineIds: ["vine-first"],
    });
    expect(restored.previewMove("cargo", 3, 3)).toMatchObject({
      valid: true,
      exits: true,
    });
  });

  it("descarta JSON corrompido sem quebrar o carregamento", () => {
    const storage = createMemoryStorage();
    storage.setItem(ACTIVE_PUZZLE_KEY, "{inválido");

    expect(loadActivePuzzle(levels, storage)).toBeUndefined();
    expect(storage.getItem(ACTIVE_PUZZLE_KEY)).toBeNull();
  });

  it("rejeita sessão de uma versão antiga da fase", () => {
    const state = partialLevelTwo();
    const raw = JSON.stringify({
      version: 1,
      levelId: "level-2",
      levelVersion: 999,
      state,
    });

    expect(parseActivePuzzle(raw, levels)).toBeUndefined();
  });

  it("rejeita blocos adulterados, sobrepostos ou fora do tabuleiro", () => {
    const state = partialLevelTwo();
    const base = {
      version: 1,
      levelId: "level-2",
      levelVersion: 1,
      state,
    };
    const outside = structuredClone(base);
    outside.state.blocks[0].col = 99;
    const overlap = structuredClone(base);
    overlap.state.history[0].blocks[0].col =
      overlap.state.history[0].blocks[1].col;
    overlap.state.history[0].blocks[0].row =
      overlap.state.history[0].blocks[1].row;

    expect(parseActivePuzzle(JSON.stringify(outside), levels)).toBeUndefined();
    expect(parseActivePuzzle(JSON.stringify(overlap), levels)).toBeUndefined();
  });

  it("não mantém sessão inicial ou já concluída", () => {
    const storage = createMemoryStorage();
    const initial = new PuzzleEngine(levels, "level-1").state;
    const wonEngine = new PuzzleEngine(levels, "level-1");
    wonEngine.moveBlock("coral", 1, 0);

    expect(saveActivePuzzle(initial, levels, storage)).toBe(false);
    expect(saveActivePuzzle(wonEngine.state, levels, storage)).toBe(false);
    expect(storage.getItem(ACTIVE_PUZZLE_KEY)).toBeNull();
  });

  it("remove explicitamente a sessão", () => {
    const storage = createMemoryStorage();
    saveActivePuzzle(partialLevelTwo(), levels, storage);

    clearActivePuzzle(storage);

    expect(storage.getItem(ACTIVE_PUZZLE_KEY)).toBeNull();
  });
});
