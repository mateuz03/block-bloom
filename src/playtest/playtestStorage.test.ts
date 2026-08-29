import { describe, expect, it } from "vitest";
import {
  MAX_PLAYTEST_RUNS,
  clearPlaytestData,
  createEmptyPlaytestData,
  loadPlaytestData,
  parsePlaytestData,
  savePlaytestData,
} from "./playtestStorage";
import {
  PLAYTEST_DATA_VERSION,
  PLAYTEST_STORAGE_KEY,
  type PlaytestData,
  type PlaytestRun,
} from "./playtestTypes";

const levelIds = ["level-1", "level-11"];

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const createRun = (index: number): PlaytestRun => ({
  id: `run-${index}`,
  sessionId: "session-1",
  levelId: "level-1",
  levelVersion: 1,
  runNumberForLevel: index + 1,
  startedAt: index * 1000,
  endedAt: index * 1000 + 500,
  activeDurationMs: 500,
  moves: 1,
  idealMoves: 1,
  undoCount: 0,
  restartCount: 0,
  invalidDropCount: 0,
  bloomCount: 0,
  status: "completed",
});

describe("playtestStorage", () => {
  it("salva e carrega sessões e runs versionadas", () => {
    const storage = createMemoryStorage();
    const data: PlaytestData = {
      version: PLAYTEST_DATA_VERSION,
      currentSessionId: "session-1",
      sessions: [{ id: "session-1", startedAt: 10 }],
      runs: [createRun(0)],
    };

    expect(savePlaytestData(data, levelIds, storage)).toBe(true);
    expect(loadPlaytestData(levelIds, storage)).toEqual(data);
  });

  it("descarta schema inválido e versão desconhecida", () => {
    expect(parsePlaytestData("{}", levelIds)).toBeUndefined();
    expect(parsePlaytestData(JSON.stringify({
      version: 99,
      sessions: [],
      runs: [],
    }), levelIds)).toBeUndefined();
  });

  it("remove fases desconhecidas durante a validação", () => {
    const data: PlaytestData = {
      version: PLAYTEST_DATA_VERSION,
      currentSessionId: "session-1",
      sessions: [{ id: "session-1", startedAt: 10 }],
      runs: [{ ...createRun(0), levelId: "unknown" }],
    };
    const parsed = parsePlaytestData(JSON.stringify(data), levelIds);

    expect(parsed?.runs).toEqual([]);
  });

  it("mantém somente as 500 runs mais recentes", () => {
    const storage = createMemoryStorage();
    const data: PlaytestData = {
      version: PLAYTEST_DATA_VERSION,
      currentSessionId: "session-1",
      sessions: [{ id: "session-1", startedAt: 0 }],
      runs: Array.from({ length: MAX_PLAYTEST_RUNS + 5 }, (_, index) =>
        createRun(index)),
    };

    expect(savePlaytestData(data, levelIds, storage)).toBe(true);
    const loaded = loadPlaytestData(levelIds, storage);
    expect(loaded.runs).toHaveLength(MAX_PLAYTEST_RUNS);
    expect(loaded.runs[0].id).toBe("run-5");
  });

  it("limpa somente a chave de playtest", () => {
    const storage = createMemoryStorage();
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(createEmptyPlaytestData()));
    storage.setItem("block-bloom:progress", "progress");
    storage.setItem("block-bloom:settings", "settings");

    clearPlaytestData(storage);

    expect(storage.getItem(PLAYTEST_STORAGE_KEY)).toBeNull();
    expect(storage.getItem("block-bloom:progress")).toBe("progress");
    expect(storage.getItem("block-bloom:settings")).toBe("settings");
  });
});
