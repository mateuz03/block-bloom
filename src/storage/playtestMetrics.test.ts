import { describe, expect, it } from "vitest";
import {
  PLAYTEST_METRICS_KEY,
  clearPlaytestMetrics,
  classifyPlaytestLevel,
  defaultPlaytestMetrics,
  formatPlaytestReport,
  loadPlaytestMetrics,
  recordPlaytestEvent,
  savePlaytestMetrics,
} from "./playtestMetrics";

const levelIds = ["level-1", "level-2"];

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

describe("playtestMetrics", () => {
  it("registra tentativas, ajuda e conclusão sem dados pessoais", () => {
    let metrics = defaultPlaytestMetrics();
    metrics = recordPlaytestEvent(metrics, {
      type: "start",
      levelId: "level-1",
    }, 100);
    metrics = recordPlaytestEvent(metrics, {
      type: "restart",
      levelId: "level-1",
    }, 200);
    metrics = recordPlaytestEvent(metrics, {
      type: "hint",
      levelId: "level-1",
    }, 300);
    metrics = recordPlaytestEvent(metrics, {
      type: "complete",
      levelId: "level-1",
      moves: 3,
      durationMs: 12_000,
    }, 400);

    expect(metrics.levels["level-1"]).toMatchObject({
      starts: 1,
      restarts: 1,
      hints: 1,
      completions: 1,
      totalCompletedMoves: 3,
      totalCompletedDurationMs: 12_000,
      bestCompletedMoves: 3,
      lastPlayedAt: 400,
    });
  });

  it("valida o save e descarta fases desconhecidas", () => {
    const storage = createMemoryStorage();
    const metrics = recordPlaytestEvent(defaultPlaytestMetrics(), {
      type: "start",
      levelId: "level-1",
    });
    const withUnknown = recordPlaytestEvent(metrics, {
      type: "start",
      levelId: "unknown",
    });
    expect(savePlaytestMetrics(withUnknown, levelIds, storage)).toBe(true);
    expect(loadPlaytestMetrics(levelIds, storage).levels).toHaveProperty("level-1");
    expect(loadPlaytestMetrics(levelIds, storage).levels).not.toHaveProperty("unknown");

    storage.setItem(PLAYTEST_METRICS_KEY, "{corrompido");
    expect(loadPlaytestMetrics(levelIds, storage)).toEqual(
      defaultPlaytestMetrics(),
    );
  });

  it("gera relatório legível e permite limpar os dados", () => {
    const storage = createMemoryStorage();
    const metrics = recordPlaytestEvent(defaultPlaytestMetrics(), {
      type: "start",
      levelId: "level-1",
    });
    const report = formatPlaytestReport(metrics, [{
      id: "level-1",
      name: "Primeira flor",
      idealMoves: 1,
    }]);

    expect(report).toContain("Fase 1 — Primeira flor");
    expect(report).toContain("Inícios: 1");
    savePlaytestMetrics(metrics, levelIds, storage);
    clearPlaytestMetrics(storage);
    expect(storage.getItem(PLAYTEST_METRICS_KEY)).toBeNull();
  });

  it("só sinaliza possível pico depois de uma amostra mínima", () => {
    const base = {
      starts: 2,
      restarts: 2,
      undos: 0,
      hints: 1,
      abandons: 1,
      completions: 0,
      totalCompletedMoves: 0,
      totalCompletedDurationMs: 0,
      lastPlayedAt: 0,
    };
    expect(classifyPlaytestLevel(base)).toBe("insufficient-data");
    expect(classifyPlaytestLevel({ ...base, starts: 4 })).toBe(
      "difficulty-signal",
    );
    expect(classifyPlaytestLevel({
      ...base,
      starts: 4,
      restarts: 0,
      hints: 0,
      abandons: 0,
      completions: 4,
    })).toBe("stable");
  });
});
