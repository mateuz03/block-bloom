export const PLAYTEST_DATA_VERSION = 1 as const;
export const PLAYTEST_STORAGE_KEY = "block-bloom:playtest:v1";
export const PLAYTEST_EXPORT_FORMAT = "block-bloom-playtest" as const;

export type PlaytestRunStatus =
  | "in-progress"
  | "completed"
  | "abandoned";

export type PlaytestSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
};

export type PlaytestRun = {
  id: string;
  sessionId: string;
  levelId: string;
  levelVersion: number;
  runNumberForLevel: number;
  startedAt: number;
  endedAt?: number;
  activeDurationMs: number;
  moves: number;
  idealMoves: number;
  undoCount: number;
  restartCount: number;
  invalidDropCount: number;
  bloomCount: number;
  firstBloomAtMs?: number;
  movesBeforeFirstBloom?: number;
  restartsBeforeFirstBloom?: number;
  status: PlaytestRunStatus;
};

export type PlaytestData = {
  version: typeof PLAYTEST_DATA_VERSION;
  currentSessionId?: string;
  sessions: PlaytestSession[];
  runs: PlaytestRun[];
};

export type PlaytestLevelReference = {
  id: string;
  name: string;
  version: number;
  idealMoves: number;
  hasBloom: boolean;
};

export type PlaytestExport = {
  format: typeof PLAYTEST_EXPORT_FORMAT;
  version: typeof PLAYTEST_DATA_VERSION;
  exportedAt: number;
  data: PlaytestData;
};
