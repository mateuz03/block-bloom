export const PLAYTEST_METRICS_KEY = "block-bloom:playtest-metrics";
export const PLAYTEST_METRICS_VERSION = 1 as const;

const MAX_SAVE_LENGTH = 250_000;
const MAX_COUNTER = 1_000_000_000;
const MAX_TIMESTAMP = 8_640_000_000_000_000;

type MetricsStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type LevelPlaytestMetrics = {
  starts: number;
  restarts: number;
  undos: number;
  hints: number;
  abandons: number;
  completions: number;
  totalCompletedMoves: number;
  totalCompletedDurationMs: number;
  bestCompletedMoves?: number;
  lastPlayedAt: number;
};

export type PlaytestMetrics = {
  version: typeof PLAYTEST_METRICS_VERSION;
  levels: Record<string, LevelPlaytestMetrics>;
};

export type PlaytestEvent =
  | { type: "start"; levelId: string }
  | { type: "restart"; levelId: string }
  | { type: "undo"; levelId: string }
  | { type: "hint"; levelId: string }
  | { type: "abandon"; levelId: string }
  | {
      type: "complete";
      levelId: string;
      moves: number;
      durationMs: number;
    };

export type PlaytestLevelReference = {
  id: string;
  name: string;
  idealMoves: number;
};

export type PlaytestQualitySignal =
  | "insufficient-data"
  | "stable"
  | "difficulty-signal";

export function defaultPlaytestMetrics(): PlaytestMetrics {
  return { version: PLAYTEST_METRICS_VERSION, levels: {} };
}

export function loadPlaytestMetrics(
  levelIds: readonly string[],
  storage: MetricsStorage = window.localStorage,
): PlaytestMetrics {
  try {
    const raw = storage.getItem(PLAYTEST_METRICS_KEY);
    if (!raw) return defaultPlaytestMetrics();
    const parsed = parsePlaytestMetrics(raw, levelIds);
    if (parsed) return parsed;
    storage.removeItem(PLAYTEST_METRICS_KEY);
  } catch {
    // A coleta local é opcional e nunca deve impedir uma partida.
  }
  return defaultPlaytestMetrics();
}

export function savePlaytestMetrics(
  metrics: PlaytestMetrics,
  levelIds: readonly string[],
  storage: MetricsStorage = window.localStorage,
): boolean {
  const normalized = normalizePlaytestMetrics(metrics, levelIds);
  try {
    storage.setItem(PLAYTEST_METRICS_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function clearPlaytestMetrics(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  try {
    storage.removeItem(PLAYTEST_METRICS_KEY);
  } catch {
    // O relatório pode continuar vazio mesmo quando o storage falhar.
  }
}

export function parsePlaytestMetrics(
  raw: string,
  levelIds: readonly string[],
): PlaytestMetrics | undefined {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return undefined;
  try {
    const value = JSON.parse(raw) as unknown;
    if (
      !isRecord(value) ||
      value.version !== PLAYTEST_METRICS_VERSION ||
      !isRecord(value.levels)
    ) {
      return undefined;
    }
    return normalizePlaytestMetrics(value, levelIds);
  } catch {
    return undefined;
  }
}

export function recordPlaytestEvent(
  metrics: PlaytestMetrics,
  event: PlaytestEvent,
  now = Date.now(),
): PlaytestMetrics {
  const current = metrics.levels[event.levelId] ?? emptyLevelMetrics();
  const next: LevelPlaytestMetrics = {
    ...current,
    lastPlayedAt: normalizeTimestamp(now),
  };

  switch (event.type) {
    case "start":
      next.starts = increment(current.starts);
      break;
    case "restart":
      next.restarts = increment(current.restarts);
      break;
    case "undo":
      next.undos = increment(current.undos);
      break;
    case "hint":
      next.hints = increment(current.hints);
      break;
    case "abandon":
      next.abandons = increment(current.abandons);
      break;
    case "complete": {
      const moves = normalizeCounter(event.moves);
      const durationMs = normalizeCounter(event.durationMs);
      next.completions = increment(current.completions);
      next.totalCompletedMoves = add(current.totalCompletedMoves, moves);
      next.totalCompletedDurationMs = add(
        current.totalCompletedDurationMs,
        durationMs,
      );
      next.bestCompletedMoves =
        current.bestCompletedMoves === undefined
          ? moves
          : Math.min(current.bestCompletedMoves, moves);
      break;
    }
  }

  return {
    version: PLAYTEST_METRICS_VERSION,
    levels: { ...metrics.levels, [event.levelId]: next },
  };
}

export function formatPlaytestReport(
  metrics: PlaytestMetrics,
  catalog: readonly PlaytestLevelReference[],
): string {
  const lines = [
    "BLOCK BLOOM — RELATÓRIO LOCAL DE PLAYTEST",
    "Os dados ficam somente neste aparelho e não identificam o jogador.",
    "",
  ];
  let hasData = false;

  catalog.forEach((level, index) => {
    const item = metrics.levels[level.id];
    if (!item || item.starts === 0) return;
    hasData = true;
    const completionRate = percentage(item.completions, item.starts);
    const averageMoves = average(item.totalCompletedMoves, item.completions);
    const averageSeconds = average(
      item.totalCompletedDurationMs / 1000,
      item.completions,
    );
    lines.push(
      `Fase ${index + 1} — ${level.name}`,
      `Inícios: ${item.starts} | Conclusões: ${item.completions} (${completionRate}) | Abandonos: ${item.abandons}`,
      `Reinícios: ${item.restarts} | Undo: ${item.undos} | Dicas: ${item.hints}`,
      `Movimentos: média ${averageMoves}, melhor ${item.bestCompletedMoves ?? "—"}, ideal ${level.idealMoves}`,
      `Tempo médio concluído: ${averageSeconds}s`,
      `Sinal: ${qualitySignalLabel(classifyPlaytestLevel(item))}`,
      "",
    );
  });

  if (!hasData) lines.push("Ainda não há partidas registradas.");
  return lines.join("\n").trim();
}

export function classifyPlaytestLevel(
  item: LevelPlaytestMetrics,
): PlaytestQualitySignal {
  if (item.starts < 3) return "insufficient-data";
  const completionRate = item.completions / item.starts;
  const frictionRate = (item.restarts + item.abandons) / item.starts;
  const hintRate = item.hints / item.starts;
  if (
    completionRate < 0.5 ||
    frictionRate >= 0.75 ||
    hintRate >= 0.5
  ) {
    return "difficulty-signal";
  }
  return "stable";
}

function normalizePlaytestMetrics(
  value: unknown,
  levelIds: readonly string[],
): PlaytestMetrics {
  if (!isRecord(value) || !isRecord(value.levels)) {
    return defaultPlaytestMetrics();
  }
  const levels: Record<string, LevelPlaytestMetrics> = {};
  for (const levelId of levelIds) {
    const item = value.levels[levelId];
    if (!isRecord(item)) continue;
    levels[levelId] = {
      starts: normalizeCounter(item.starts),
      restarts: normalizeCounter(item.restarts),
      undos: normalizeCounter(item.undos),
      hints: normalizeCounter(item.hints),
      abandons: normalizeCounter(item.abandons),
      completions: normalizeCounter(item.completions),
      totalCompletedMoves: normalizeCounter(item.totalCompletedMoves),
      totalCompletedDurationMs: normalizeCounter(
        item.totalCompletedDurationMs,
      ),
      ...(normalizeOptionalCounter(item.bestCompletedMoves) === undefined
        ? {}
        : {
            bestCompletedMoves: normalizeOptionalCounter(
              item.bestCompletedMoves,
            ),
          }),
      lastPlayedAt: normalizeTimestamp(item.lastPlayedAt),
    };
  }
  return { version: PLAYTEST_METRICS_VERSION, levels };
}

function emptyLevelMetrics(): LevelPlaytestMetrics {
  return {
    starts: 0,
    restarts: 0,
    undos: 0,
    hints: 0,
    abandons: 0,
    completions: 0,
    totalCompletedMoves: 0,
    totalCompletedDurationMs: 0,
    lastPlayedAt: 0,
  };
}

function normalizeCounter(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(MAX_COUNTER, Math.max(0, Math.floor(value)));
}

function normalizeOptionalCounter(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return normalizeCounter(value);
}

function normalizeTimestamp(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(MAX_TIMESTAMP, Math.max(0, Math.floor(value)));
}

function increment(value: number): number {
  return Math.min(MAX_COUNTER, value + 1);
}

function add(a: number, b: number): number {
  return Math.min(MAX_COUNTER, a + b);
}

function average(total: number, count: number): string {
  if (count === 0) return "—";
  return (total / count).toFixed(1).replace(".0", "");
}

function percentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function qualitySignalLabel(signal: PlaytestQualitySignal): string {
  if (signal === "difficulty-signal") return "possível pico de dificuldade";
  if (signal === "stable") return "sem sinal de dificuldade nesta amostra";
  return "colete ao menos 3 tentativas";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
