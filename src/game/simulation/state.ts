import type { SkinId } from "../content/skins";
import {
  createDefaultProgression,
  createMissionSnapshots,
  type MissionId,
  type MissionSnapshot,
  type ProgressionState,
} from "../progression/progression";

export type GamePhase = "menu" | "playing" | "paused" | "gameover";

export type RunnerObject = {
  id: number;
  x: number;
  lane: number;
  passed: boolean;
};

export type Hazard = RunnerObject & {
  width: number;
  height: number;
};

export type Gem = RunnerObject & {
  radius: number;
};

export type RunnerState = {
  phase: GamePhase;
  highScore: number;
  runStartHighScore: number;
  score: number;
  bonusScore: number;
  distance: number;
  elapsed: number;
  speed: number;
  playerLane: number;
  nextId: number;
  seed: number;
  spawnTimer: number;
  gemTimer: number;
  combo: number;
  comboTimer: number;
  crystals: number;
  dodges: number;
  lastRunScore: number;
  lastRunCrystals: number;
  lastRunDodges: number;
  lastRunRewardCrystals: number;
  lastCompletedMissionIds: MissionId[];
  newRecord: boolean;
  progression: ProgressionState;
  hazards: Hazard[];
  gems: Gem[];
};

export type RunnerSnapshot = {
  phase: GamePhase;
  score: number;
  highScore: number;
  lastRunScore: number;
  lastRunCrystals: number;
  lastRunRewardCrystals: number;
  lastCompletedMissionIds: MissionId[];
  speed: number;
  elapsed: number;
  combo: number;
  crystals: number;
  dodges: number;
  newRecord: boolean;
  walletCrystals: number;
  selectedSkin: SkinId;
  unlockedSkins: SkinId[];
  missions: MissionSnapshot[];
};

export const runnerTuning = {
  playerXRatio: 0.24,
  laneRatios: [0.39, 0.61],
  playerRadius: 22,
  baseSpeed: 220,
  maxSpeed: 620,
  spawnXPadding: 80,
  minSpawnDelay: 0.62,
  maxSpawnDelay: 1.28,
  gemDelay: 1.3,
} as const;

export function createRunnerState(highScore = 0, progression = createDefaultProgression()): RunnerState {
  return {
    phase: "menu",
    highScore,
    runStartHighScore: highScore,
    score: 0,
    bonusScore: 0,
    distance: 0,
    elapsed: 0,
    speed: runnerTuning.baseSpeed,
    playerLane: 0,
    nextId: 1,
    seed: Date.now() >>> 0,
    spawnTimer: 0.6,
    gemTimer: 0.9,
    combo: 0,
    comboTimer: 0,
    crystals: 0,
    dodges: 0,
    lastRunScore: 0,
    lastRunCrystals: 0,
    lastRunDodges: 0,
    lastRunRewardCrystals: 0,
    lastCompletedMissionIds: [],
    newRecord: false,
    progression,
    hazards: [],
    gems: [],
  };
}

export function resetRun(state: RunnerState): RunnerState {
  const highScore = state.highScore;
  return {
    ...createRunnerState(highScore, state.progression),
    phase: "playing",
    runStartHighScore: highScore,
    seed: ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0,
  };
}

export function snapshotRunner(state: RunnerState): RunnerSnapshot {
  return {
    phase: state.phase,
    score: state.score,
    highScore: state.highScore,
    lastRunScore: state.lastRunScore,
    lastRunCrystals: state.lastRunCrystals,
    lastRunRewardCrystals: state.lastRunRewardCrystals,
    lastCompletedMissionIds: state.lastCompletedMissionIds,
    speed: state.speed,
    elapsed: state.elapsed,
    combo: state.combo,
    crystals: state.crystals,
    dodges: state.dodges,
    newRecord: state.newRecord,
    walletCrystals: state.progression.walletCrystals,
    selectedSkin: state.progression.selectedSkin,
    unlockedSkins: state.progression.unlockedSkins,
    missions: createMissionSnapshots(state.progression, {
      score: state.phase === "gameover" ? state.lastRunScore : state.score,
      crystals: state.phase === "gameover" ? state.lastRunCrystals : state.crystals,
      dodges: state.phase === "gameover" ? state.lastRunDodges : state.dodges,
    }),
  };
}
