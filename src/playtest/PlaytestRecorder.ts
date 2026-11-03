import {
  clearPlaytestData,
  createEmptyPlaytestData,
  loadPlaytestData,
  normalizePlaytestData,
  savePlaytestData,
  type PlaytestStorage,
} from "./playtestStorage";
import {
  type PlaytestData,
  type PlaytestLevelReference,
  type PlaytestRun,
  type PlaytestSession,
} from "./playtestTypes";

export type PlaytestRecorderOptions = {
  now?: () => number;
  createId?: () => string;
  storage?: PlaytestStorage;
};

export class PlaytestRecorder {
  private data: PlaytestData;
  private activeRunId?: string;
  private activeSince?: number;
  private readonly levelIds: string[];
  private readonly now: () => number;
  private readonly createId: () => string;
  private readonly storage?: PlaytestStorage;

  constructor(
    private readonly catalog: readonly PlaytestLevelReference[],
    options: PlaytestRecorderOptions = {},
  ) {
    this.levelIds = catalog.map((level) => level.id);
    this.now = options.now ?? Date.now;
    this.createId = options.createId ?? createLocalId;
    this.storage = options.storage;
    this.data = this.storage
      ? loadPlaytestData(this.levelIds, this.storage)
      : loadPlaytestData(this.levelIds);
  }

  snapshot(): PlaytestData {
    return structuredClone(this.data);
  }

  currentSession(): PlaytestSession | undefined {
    const id = this.data.currentSessionId;
    const session = this.data.sessions.find((candidate) => candidate.id === id);
    return session ? { ...session } : undefined;
  }

  activeRun(): PlaytestRun | undefined {
    const run = this.mutableActiveRun();
    return run ? { ...run } : undefined;
  }

  startNewSession(): PlaytestSession {
    const now = this.now();
    if (this.mutableActiveRun()) this.finishActive("abandoned", now);
    const current = this.mutableCurrentSession();
    if (current && current.endedAt === undefined) current.endedAt = now;

    const session: PlaytestSession = {
      id: this.createId(),
      startedAt: now,
    };
    this.data.sessions.push(session);
    this.data.currentSessionId = session.id;
    this.persist();
    return { ...session };
  }

  beginRun(
    levelId: string,
    initialMoves = 0,
  ): PlaytestRun | undefined {
    const level = this.catalog.find((candidate) => candidate.id === levelId);
    if (!level) return undefined;

    const existing = this.mutableActiveRun();
    if (existing?.levelId === levelId && existing.status === "in-progress") {
      this.resume();
      return { ...existing };
    }
    if (existing) this.finishActive("abandoned", this.now());

    const session = this.ensureSession();
    const now = this.now();
    const runNumberForLevel = this.data.runs.filter(
      (run) => run.sessionId === session.id && run.levelId === levelId,
    ).length + 1;
    const run: PlaytestRun = {
      id: this.createId(),
      sessionId: session.id,
      levelId,
      levelVersion: level.version,
      runNumberForLevel,
      startedAt: now,
      activeDurationMs: 0,
      moves: normalizeCount(initialMoves),
      idealMoves: level.idealMoves,
      undoCount: 0,
      restartCount: 0,
      invalidDropCount: 0,
      bloomCount: 0,
      status: "in-progress",
    };
    this.data.runs.push(run);
    this.activeRunId = run.id;
    this.activeSince = now;
    this.persist();
    return { ...run };
  }

  syncMoves(moves: number): void {
    const run = this.mutableActiveRun();
    if (!run) return;
    run.moves = normalizeCount(moves);
  }

  recordUndo(moves: number): void {
    const run = this.mutableActiveRun();
    if (!run) return;
    this.flushActiveTime(this.now(), true);
    run.undoCount += 1;
    run.moves = normalizeCount(moves);
    this.persist();
  }

  recordRestart(moves: number): void {
    const run = this.mutableActiveRun();
    if (!run) return;
    this.flushActiveTime(this.now(), true);
    run.restartCount += 1;
    run.moves = normalizeCount(moves);
    this.persist();
  }

  recordInvalidDrop(): void {
    const run = this.mutableActiveRun();
    if (!run) return;
    this.flushActiveTime(this.now(), true);
    run.invalidDropCount += 1;
    this.persist();
  }

  recordMove(moves: number, activatedBloomCount: number): void {
    const run = this.mutableActiveRun();
    if (!run) return;
    const now = this.now();
    this.flushActiveTime(now, true);
    run.moves = normalizeCount(moves);
    const bloomCount = normalizeCount(activatedBloomCount);
    if (bloomCount > 0) {
      if (run.firstBloomAtMs === undefined) {
        run.firstBloomAtMs = run.activeDurationMs;
        run.movesBeforeFirstBloom = Math.max(0, run.moves - 1);
        run.restartsBeforeFirstBloom = run.restartCount;
      }
      run.bloomCount += bloomCount;
    }
    this.persist();
  }

  complete(moves: number): PlaytestRun | undefined {
    const run = this.mutableActiveRun();
    if (!run) return undefined;
    run.moves = normalizeCount(moves);
    return this.finishActive("completed", this.now());
  }

  abandon(): PlaytestRun | undefined {
    return this.finishActive("abandoned", this.now());
  }

  pause(): void {
    if (!this.mutableActiveRun() || this.activeSince === undefined) return;
    this.flushActiveTime(this.now(), false);
    this.persist();
  }

  resume(): void {
    if (!this.mutableActiveRun() || this.activeSince !== undefined) return;
    this.activeSince = this.now();
  }

  clear(): void {
    this.activeRunId = undefined;
    this.activeSince = undefined;
    this.data = createEmptyPlaytestData();
    if (this.storage) clearPlaytestData(this.storage);
    else clearPlaytestData();
  }

  dispose(): void {
    this.pause();
    this.activeRunId = undefined;
  }

  private ensureSession(): PlaytestSession {
    const current = this.mutableCurrentSession();
    if (current && current.endedAt === undefined) return current;
    return this.startNewSession();
  }

  private mutableCurrentSession(): PlaytestSession | undefined {
    return this.data.sessions.find(
      (session) => session.id === this.data.currentSessionId,
    );
  }

  private mutableActiveRun(): PlaytestRun | undefined {
    return this.data.runs.find(
      (run) => run.id === this.activeRunId && run.status === "in-progress",
    );
  }

  private finishActive(
    status: "completed" | "abandoned",
    now: number,
  ): PlaytestRun | undefined {
    const run = this.mutableActiveRun();
    if (!run) return undefined;
    this.flushActiveTime(now, false);
    run.status = status;
    run.endedAt = Math.max(run.startedAt, now);
    const result = { ...run };
    this.activeRunId = undefined;
    this.activeSince = undefined;
    this.persist();
    return result;
  }

  private flushActiveTime(now: number, continueRunning: boolean): void {
    const run = this.mutableActiveRun();
    if (!run || this.activeSince === undefined) return;
    run.activeDurationMs += Math.max(0, now - this.activeSince);
    this.activeSince = continueRunning ? now : undefined;
  }

  private persist(): void {
    this.data = normalizePlaytestData(this.data, this.levelIds) ??
      createEmptyPlaytestData();
    if (this.storage) {
      savePlaytestData(this.data, this.levelIds, this.storage);
      return;
    }
    savePlaytestData(this.data, this.levelIds);
  }
}

function normalizeCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
