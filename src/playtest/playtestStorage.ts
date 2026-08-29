import {
  PLAYTEST_DATA_VERSION,
  PLAYTEST_STORAGE_KEY,
  type PlaytestData,
  type PlaytestRun,
  type PlaytestRunStatus,
  type PlaytestSession,
} from "./playtestTypes";

export const MAX_PLAYTEST_RUNS = 500;
const MAX_PLAYTEST_SESSIONS = 100;
const MAX_SAVE_LENGTH = 2_000_000;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const MAX_COUNTER = 1_000_000_000;

export type PlaytestStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export function createEmptyPlaytestData(): PlaytestData {
  return {
    version: PLAYTEST_DATA_VERSION,
    sessions: [],
    runs: [],
  };
}

export function loadPlaytestData(
  levelIds: readonly string[],
  storage: PlaytestStorage = window.localStorage,
): PlaytestData {
  try {
    const raw = storage.getItem(PLAYTEST_STORAGE_KEY);
    if (!raw) return createEmptyPlaytestData();
    const parsed = parsePlaytestData(raw, levelIds);
    if (parsed) return parsed;
    storage.removeItem(PLAYTEST_STORAGE_KEY);
  } catch {
    // Playtest é opcional e nunca pode impedir o jogo de abrir.
  }
  return createEmptyPlaytestData();
}

export function savePlaytestData(
  data: PlaytestData,
  levelIds: readonly string[],
  storage: PlaytestStorage = window.localStorage,
): boolean {
  const normalized = normalizePlaytestData(data, levelIds);
  if (!normalized) return false;
  try {
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function clearPlaytestData(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  try {
    storage.removeItem(PLAYTEST_STORAGE_KEY);
  } catch {
    // O painel pode continuar vazio mesmo se o storage estiver indisponível.
  }
}

export function parsePlaytestData(
  raw: string,
  levelIds: readonly string[],
): PlaytestData | undefined {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return undefined;
  try {
    return normalizePlaytestData(JSON.parse(raw) as unknown, levelIds);
  } catch {
    return undefined;
  }
}

export function normalizePlaytestData(
  value: unknown,
  levelIds: readonly string[],
): PlaytestData | undefined {
  if (
    !isRecord(value) ||
    value.version !== PLAYTEST_DATA_VERSION ||
    !Array.isArray(value.sessions) ||
    !Array.isArray(value.runs)
  ) {
    return undefined;
  }

  const allowedLevels = new Set(levelIds);
  const sessions = value.sessions
    .map(normalizeSession)
    .filter((session): session is PlaytestSession => Boolean(session));
  const uniqueSessions = uniqueById(sessions).slice(-MAX_PLAYTEST_SESSIONS);
  const sessionIds = new Set(uniqueSessions.map((session) => session.id));
  const runs = value.runs
    .map((run) => normalizeRun(run, allowedLevels, sessionIds))
    .filter((run): run is PlaytestRun => Boolean(run))
    .slice(-MAX_PLAYTEST_RUNS);
  const referencedSessionIds = new Set(runs.map((run) => run.sessionId));
  const currentSessionId = typeof value.currentSessionId === "string" &&
      sessionIds.has(value.currentSessionId)
    ? value.currentSessionId
    : undefined;
  const retainedSessions = uniqueSessions.filter(
    (session) =>
      referencedSessionIds.has(session.id) || session.id === currentSessionId,
  );

  return {
    version: PLAYTEST_DATA_VERSION,
    ...(currentSessionId ? { currentSessionId } : {}),
    sessions: retainedSessions,
    runs,
  };
}

function normalizeSession(value: unknown): PlaytestSession | undefined {
  if (!isRecord(value) || !isSafeId(value.id)) return undefined;
  const startedAt = normalizeTimestamp(value.startedAt);
  if (startedAt === undefined) return undefined;
  const endedAt = normalizeOptionalTimestamp(value.endedAt);
  return {
    id: value.id,
    startedAt,
    ...(endedAt === undefined ? {} : { endedAt: Math.max(startedAt, endedAt) }),
  };
}

function normalizeRun(
  value: unknown,
  allowedLevels: ReadonlySet<string>,
  sessionIds: ReadonlySet<string>,
): PlaytestRun | undefined {
  if (
    !isRecord(value) ||
    !isSafeId(value.id) ||
    !isSafeId(value.sessionId) ||
    !sessionIds.has(value.sessionId) ||
    typeof value.levelId !== "string" ||
    !allowedLevels.has(value.levelId) ||
    !isRunStatus(value.status)
  ) {
    return undefined;
  }
  const startedAt = normalizeTimestamp(value.startedAt);
  if (startedAt === undefined) return undefined;
  const endedAt = normalizeOptionalTimestamp(value.endedAt);
  if (value.status !== "in-progress" && endedAt === undefined) return undefined;
  const firstBloomAtMs = normalizeOptionalCounter(value.firstBloomAtMs);
  const movesBeforeFirstBloom = normalizeOptionalCounter(
    value.movesBeforeFirstBloom,
  );
  const restartsBeforeFirstBloom = normalizeOptionalCounter(
    value.restartsBeforeFirstBloom,
  );
  return {
    id: value.id,
    sessionId: value.sessionId,
    levelId: value.levelId,
    levelVersion: Math.max(1, normalizeCounter(value.levelVersion)),
    runNumberForLevel: Math.max(
      1,
      normalizeCounter(value.runNumberForLevel),
    ),
    startedAt,
    ...(endedAt === undefined ? {} : { endedAt: Math.max(startedAt, endedAt) }),
    activeDurationMs: normalizeCounter(value.activeDurationMs),
    moves: normalizeCounter(value.moves),
    idealMoves: Math.max(1, normalizeCounter(value.idealMoves)),
    undoCount: normalizeCounter(value.undoCount),
    restartCount: normalizeCounter(value.restartCount),
    invalidDropCount: normalizeCounter(value.invalidDropCount),
    bloomCount: normalizeCounter(value.bloomCount),
    ...(firstBloomAtMs === undefined ? {} : { firstBloomAtMs }),
    ...(movesBeforeFirstBloom === undefined
      ? {}
      : { movesBeforeFirstBloom }),
    ...(restartsBeforeFirstBloom === undefined
      ? {}
      : { restartsBeforeFirstBloom }),
    status: value.status,
  };
}

function uniqueById<T extends { id: string }>(values: T[]): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
}

function normalizeCounter(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(MAX_COUNTER, Math.max(0, Math.floor(value)));
}

function normalizeOptionalCounter(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return normalizeCounter(value);
}

function normalizeTimestamp(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(MAX_TIMESTAMP, Math.max(0, Math.floor(value)));
}

function normalizeOptionalTimestamp(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return normalizeTimestamp(value);
}

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 160;
}

function isRunStatus(value: unknown): value is PlaytestRunStatus {
  return value === "in-progress" ||
    value === "completed" ||
    value === "abandoned";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
