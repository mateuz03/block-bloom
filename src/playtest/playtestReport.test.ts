import { describe, expect, it } from "vitest";
import {
  createPlaytestDiagnosticText,
  createPlaytestReport,
  mean,
  median,
} from "./playtestReport";
import {
  PLAYTEST_DATA_VERSION,
  type PlaytestData,
  type PlaytestRun,
} from "./playtestTypes";

const catalog = [
  { id: "level-1", name: "Uma", version: 1, idealMoves: 2, hasBloom: false },
  { id: "level-2", name: "Duas", version: 1, idealMoves: 4, hasBloom: false },
  { id: "level-11", name: "Bloom", version: 1, idealMoves: 2, hasBloom: true },
];

const createRun = (
  id: string,
  levelId: string,
  overrides: Partial<PlaytestRun> = {},
): PlaytestRun => ({
  id,
  sessionId: "session-1",
  levelId,
  levelVersion: 1,
  runNumberForLevel: 1,
  startedAt: 0,
  endedAt: 1000,
  activeDurationMs: 1000,
  moves: 2,
  idealMoves: levelId === "level-2" ? 4 : 2,
  undoCount: 0,
  restartCount: 0,
  invalidDropCount: 0,
  bloomCount: 0,
  status: "completed",
  ...overrides,
});

const dataWith = (runs: PlaytestRun[]): PlaytestData => ({
  version: PLAYTEST_DATA_VERSION,
  currentSessionId: "session-1",
  sessions: [{ id: "session-1", startedAt: 0 }],
  runs,
});

describe("playtestReport", () => {
  it("calcula média e mediana sem biblioteca externa", () => {
    expect(mean([2, 4, 9])).toBe(5);
    expect(median([9, 2, 4])).toBe(4);
    expect(median([2, 4, 8, 10])).toBe(6);
  });

  it("calcula taxa de conclusão ignorando interrupções ambíguas", () => {
    const report = createPlaytestReport(dataWith([
      createRun("1", "level-1"),
      createRun("2", "level-1", { status: "abandoned" }),
      createRun("3", "level-1", { status: "in-progress", endedAt: undefined }),
    ]), catalog).levels[0];

    expect(report).toMatchObject({
      runs: 3,
      completions: 1,
      abandons: 1,
      inProgress: 1,
      completionRate: 0.5,
    });
  });

  it("distribui eficiência por faixas", () => {
    const report = createPlaytestReport(dataWith([
      createRun("1", "level-1", { moves: 2 }),
      createRun("2", "level-1", { moves: 2 }),
      createRun("3", "level-1", { moves: 3 }),
      createRun("4", "level-1", { moves: 4 }),
      createRun("5", "level-1", { moves: 5 }),
    ]), catalog).levels[0];

    expect(report.efficiency).toEqual({
      ideal: 2,
      upTo25Percent: 0,
      from25To50Percent: 1,
      from50To100Percent: 1,
      aboveDouble: 1,
    });
  });

  it("só cria flags com amostra mínima", () => {
    const twoRuns = createPlaytestReport(dataWith([
      createRun("1", "level-1", { status: "abandoned", restartCount: 4 }),
      createRun("2", "level-1", { status: "abandoned", restartCount: 4 }),
    ]), catalog).levels[0];
    const threeRuns = createPlaytestReport(dataWith([
      createRun("1", "level-1", { status: "abandoned", restartCount: 4 }),
      createRun("2", "level-1", { status: "abandoned", restartCount: 4 }),
      createRun("3", "level-1", { status: "abandoned", restartCount: 4 }),
    ]), catalog).levels[0];

    expect(twoRuns.flags).toEqual([]);
    expect(threeRuns.flags).toContain("restart-high");
    expect(threeRuns.flags).toContain("abandonment-high");
  });

  it("detecta salto de tempo acima de 1,75x entre fases consecutivas", () => {
    const report = createPlaytestReport(dataWith([
      ...[1, 2, 3].map((id) => createRun(`a-${id}`, "level-1", { activeDurationMs: 1000 })),
      ...[1, 2, 3].map((id) => createRun(`b-${id}`, "level-2", { activeDurationMs: 2000 })),
    ]), catalog);

    expect(report.levels[1].flags).toContain("time-jump");
    expect(report.attention).toContain(report.levels[1]);
  });

  it("agrega métricas de primeira Bloom", () => {
    const bloom = createPlaytestReport(dataWith([
      createRun("1", "level-11", {
        firstBloomAtMs: 3000,
        movesBeforeFirstBloom: 1,
        restartsBeforeFirstBloom: 0,
        bloomCount: 1,
      }),
      createRun("2", "level-11", {
        firstBloomAtMs: 5000,
        movesBeforeFirstBloom: 3,
        restartsBeforeFirstBloom: 2,
        bloomCount: 1,
      }),
    ]), catalog).bloomOnboarding[0];

    expect(bloom).toMatchObject({
      averageFirstBloomAtMs: 4000,
      averageMovesBeforeFirstBloom: 2,
      averageRestartsBeforeFirstBloom: 1,
    });
  });

  it("gera recomendação diagnóstica sem alterar fases", () => {
    const report = createPlaytestReport(dataWith([
      createRun("1", "level-1", { restartCount: 2 }),
      createRun("2", "level-1", { restartCount: 2 }),
      createRun("3", "level-1", { restartCount: 2 }),
    ]), catalog);

    expect(createPlaytestDiagnosticText(report)).toContain(
      "investigar em playtest visual antes de alterar a fase",
    );
  });
});
