import {
  PLAYTEST_DATA_VERSION,
  PLAYTEST_EXPORT_FORMAT,
  type PlaytestData,
  type PlaytestExport,
  type PlaytestLevelReference,
  type PlaytestRun,
} from "./playtestTypes";

export const MIN_DIAGNOSTIC_SAMPLE = 3;
export const DIFFICULTY_JUMP_RATIO = 1.75;

export type EfficiencyDistribution = {
  ideal: number;
  upTo25Percent: number;
  from25To50Percent: number;
  from50To100Percent: number;
  aboveDouble: number;
};

export type PlaytestDiagnosticFlag =
  | "time-jump"
  | "restart-high"
  | "moves-high"
  | "abandonment-high";

export type PlaytestLevelReport = {
  levelId: string;
  levelNumber: number;
  name: string;
  idealMoves: number;
  hasBloom: boolean;
  runs: number;
  completions: number;
  abandons: number;
  inProgress: number;
  completionRate: number | undefined;
  averageDurationMs: number | undefined;
  medianDurationMs: number | undefined;
  averageMoves: number | undefined;
  movesPerIdeal: number | undefined;
  averageUndo: number;
  averageRestart: number;
  averageInvalidDrops: number;
  averageFirstBloomAtMs: number | undefined;
  averageMovesBeforeFirstBloom: number | undefined;
  averageRestartsBeforeFirstBloom: number | undefined;
  firstAttempts: number;
  replays: number;
  efficiency: EfficiencyDistribution;
  flags: PlaytestDiagnosticFlag[];
  diagnostic: string[];
};

export type PlaytestReport = {
  sessions: number;
  runs: number;
  completedRuns: number;
  totalActiveDurationMs: number;
  levels: PlaytestLevelReport[];
  attention: PlaytestLevelReport[];
  bloomOnboarding: PlaytestLevelReport[];
};

export function createPlaytestReport(
  data: PlaytestData,
  catalog: readonly PlaytestLevelReference[],
): PlaytestReport {
  const reports = catalog.map((level, index) =>
    createLevelReport(level, index, data.runs));

  for (let index = 1; index < reports.length; index += 1) {
    const previous = reports[index - 1];
    const current = reports[index];
    if (
      previous.runs >= MIN_DIAGNOSTIC_SAMPLE &&
      current.runs >= MIN_DIAGNOSTIC_SAMPLE &&
      previous.medianDurationMs !== undefined &&
      previous.medianDurationMs > 0 &&
      current.medianDurationMs !== undefined &&
      current.medianDurationMs / previous.medianDurationMs >
        DIFFICULTY_JUMP_RATIO
    ) {
      current.flags.push("time-jump");
      current.diagnostic.push(
        `tempo mediano ${(current.medianDurationMs / previous.medianDurationMs).toFixed(1)}x maior que a fase anterior`,
      );
    }
  }

  return {
    sessions: data.sessions.length,
    runs: data.runs.length,
    completedRuns: data.runs.filter((run) => run.status === "completed").length,
    totalActiveDurationMs: data.runs.reduce(
      (total, run) => total + run.activeDurationMs,
      0,
    ),
    levels: reports,
    attention: reports.filter((report) => report.flags.length > 0),
    bloomOnboarding: reports.filter((report) => report.hasBloom),
  };
}

export function createPlaytestDiagnosticText(report: PlaytestReport): string {
  const lines = [
    "BLOCK BLOOM — DIAGNÓSTICO LOCAL DE BALANCEAMENTO",
    `Sessões: ${report.sessions} | Runs: ${report.runs} | Conclusões: ${report.completedRuns}`,
    "",
  ];
  if (report.attention.length === 0) {
    lines.push(
      "Nenhuma fase possui amostra suficiente e sinais acima das heurísticas atuais.",
    );
  } else {
    for (const level of report.attention) {
      lines.push(
        `Fase ${level.levelNumber} — ${level.name}`,
        ...level.diagnostic.map((item) => `- ${item}.`),
        "Recomendação: investigar em playtest visual antes de alterar a fase.",
        "",
      );
    }
  }
  lines.push(
    `Heurísticas: mínimo ${MIN_DIAGNOSTIC_SAMPLE} runs; salto de tempo acima de ${DIFFICULTY_JUMP_RATIO}x; restart médio ≥ 1; movimentos/ideal > 1,5; abandono ≥ 40%.`,
  );
  return lines.join("\n").trim();
}

export function serializePlaytestExport(
  data: PlaytestData,
  exportedAt = Date.now(),
): string {
  const payload: PlaytestExport = {
    format: PLAYTEST_EXPORT_FORMAT,
    version: PLAYTEST_DATA_VERSION,
    exportedAt,
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export function mean(values: readonly number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function median(values: readonly number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function createLevelReport(
  level: PlaytestLevelReference,
  index: number,
  allRuns: readonly PlaytestRun[],
): PlaytestLevelReport {
  const runs = allRuns.filter((run) => run.levelId === level.id);
  const completed = runs.filter((run) => run.status === "completed");
  const abandoned = runs.filter((run) => run.status === "abandoned");
  const terminal = runs.filter((run) => run.status !== "in-progress");
  const bloomRuns = runs.filter((run) => run.firstBloomAtMs !== undefined);
  const averageMoves = mean(completed.map((run) => run.moves));
  const averageRestart = mean(runs.map((run) => run.restartCount)) ?? 0;
  const abandonmentRate = terminal.length === 0
    ? undefined
    : abandoned.length / terminal.length;
  const movesPerIdeal = averageMoves === undefined
    ? undefined
    : averageMoves / level.idealMoves;
  const flags: PlaytestDiagnosticFlag[] = [];
  const diagnostic: string[] = [];

  if (runs.length >= MIN_DIAGNOSTIC_SAMPLE) {
    if (averageRestart >= 1) {
      flags.push("restart-high");
      diagnostic.push(`restart médio ${formatDecimal(averageRestart)}`);
    }
    if (movesPerIdeal !== undefined && movesPerIdeal > 1.5) {
      flags.push("moves-high");
      diagnostic.push(
        `movimentos ${formatDecimal(movesPerIdeal)}x acima do ideal`,
      );
    }
    if (abandonmentRate !== undefined && abandonmentRate >= 0.4) {
      flags.push("abandonment-high");
      diagnostic.push(
        `abandono ${Math.round(abandonmentRate * 100)}%`,
      );
    }
  }

  return {
    levelId: level.id,
    levelNumber: index + 1,
    name: level.name,
    idealMoves: level.idealMoves,
    hasBloom: level.hasBloom,
    runs: runs.length,
    completions: completed.length,
    abandons: abandoned.length,
    inProgress: runs.length - terminal.length,
    completionRate: terminal.length === 0
      ? undefined
      : completed.length / terminal.length,
    averageDurationMs: mean(terminal.map((run) => run.activeDurationMs)),
    medianDurationMs: median(terminal.map((run) => run.activeDurationMs)),
    averageMoves,
    movesPerIdeal,
    averageUndo: mean(runs.map((run) => run.undoCount)) ?? 0,
    averageRestart,
    averageInvalidDrops: mean(runs.map((run) => run.invalidDropCount)) ?? 0,
    averageFirstBloomAtMs: mean(
      bloomRuns.flatMap((run) =>
        run.firstBloomAtMs === undefined ? [] : [run.firstBloomAtMs]),
    ),
    averageMovesBeforeFirstBloom: mean(
      bloomRuns.flatMap((run) =>
        run.movesBeforeFirstBloom === undefined
          ? []
          : [run.movesBeforeFirstBloom]),
    ),
    averageRestartsBeforeFirstBloom: mean(
      bloomRuns.flatMap((run) =>
        run.restartsBeforeFirstBloom === undefined
          ? []
          : [run.restartsBeforeFirstBloom]),
    ),
    firstAttempts: runs.filter((run) => run.runNumberForLevel === 1).length,
    replays: runs.filter((run) => run.runNumberForLevel > 1).length,
    efficiency: efficiencyDistribution(completed),
    flags,
    diagnostic,
  };
}

function efficiencyDistribution(
  runs: readonly PlaytestRun[],
): EfficiencyDistribution {
  const result: EfficiencyDistribution = {
    ideal: 0,
    upTo25Percent: 0,
    from25To50Percent: 0,
    from50To100Percent: 0,
    aboveDouble: 0,
  };
  for (const run of runs) {
    const ratio = run.moves / run.idealMoves;
    if (ratio <= 1) result.ideal += 1;
    else if (ratio <= 1.25) result.upTo25Percent += 1;
    else if (ratio <= 1.5) result.from25To50Percent += 1;
    else if (ratio <= 2) result.from50To100Percent += 1;
    else result.aboveDouble += 1;
  }
  return result;
}

function formatDecimal(value: number): string {
  return value.toFixed(1).replace(".0", "").replace(".", ",");
}
