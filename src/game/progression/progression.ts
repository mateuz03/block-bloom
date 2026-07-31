import { isSkinId, skinCatalog, type SkinId } from "../content/skins";

export type MissionMetric = "dodges" | "crystals" | "score";

export type MissionId = "dodge-12" | "collect-3" | "score-120";

export type MissionDefinition = {
  id: MissionId;
  label: string;
  metric: MissionMetric;
  target: number;
  reward: number;
};

export type MissionSnapshot = MissionDefinition & {
  progress: number;
  completed: boolean;
};

export type RunStats = {
  score: number;
  crystals: number;
  dodges: number;
};

export type ProgressionState = {
  walletCrystals: number;
  unlockedSkins: SkinId[];
  selectedSkin: SkinId;
  completedMissionIds: MissionId[];
};

export type ProgressionAction =
  | { type: "buy-skin"; skinId: SkinId }
  | { type: "select-skin"; skinId: SkinId };

export const missionCatalog: MissionDefinition[] = [
  {
    id: "dodge-12",
    label: "Desvie de 12 blocos",
    metric: "dodges",
    target: 12,
    reward: 10,
  },
  {
    id: "collect-3",
    label: "Colete 3 cristais",
    metric: "crystals",
    target: 3,
    reward: 12,
  },
  {
    id: "score-120",
    label: "Faça 120 pontos",
    metric: "score",
    target: 120,
    reward: 18,
  },
];

export function createDefaultProgression(): ProgressionState {
  return {
    walletCrystals: 0,
    unlockedSkins: ["mint"],
    selectedSkin: "mint",
    completedMissionIds: [],
  };
}

export function normalizeProgression(value: unknown): ProgressionState {
  const fallback = createDefaultProgression();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<ProgressionState>;
  const unlockedSkins = Array.isArray(candidate.unlockedSkins)
    ? candidate.unlockedSkins.filter((skinId): skinId is SkinId => typeof skinId === "string" && isSkinId(skinId))
    : fallback.unlockedSkins;
  const completedMissionIds = Array.isArray(candidate.completedMissionIds)
    ? candidate.completedMissionIds.filter(isMissionId)
    : fallback.completedMissionIds;
  const selectedSkin =
    typeof candidate.selectedSkin === "string" &&
    isSkinId(candidate.selectedSkin) &&
    unlockedSkins.includes(candidate.selectedSkin)
      ? candidate.selectedSkin
      : fallback.selectedSkin;

  return {
    walletCrystals: Math.max(0, Math.floor(Number(candidate.walletCrystals) || 0)),
    unlockedSkins: Array.from(new Set<SkinId>(["mint", ...unlockedSkins])),
    selectedSkin,
    completedMissionIds: Array.from(new Set<MissionId>(completedMissionIds)),
  };
}

export function createMissionSnapshots(progression: ProgressionState, stats: RunStats): MissionSnapshot[] {
  return missionCatalog.map((mission) => {
    const progress = Math.min(mission.target, getMissionValue(mission.metric, stats));
    const completed = progression.completedMissionIds.includes(mission.id) || progress >= mission.target;

    return {
      ...mission,
      progress: completed ? mission.target : progress,
      completed,
    };
  });
}

export function awardRunProgression(
  progression: ProgressionState,
  stats: RunStats,
): {
  progression: ProgressionState;
  earnedCrystals: number;
  completedMissionIds: MissionId[];
} {
  let earnedCrystals = Math.max(0, stats.crystals);
  const completedMissionIds = new Set(progression.completedMissionIds);
  const newlyCompleted: MissionId[] = [];

  for (const mission of missionCatalog) {
    if (completedMissionIds.has(mission.id)) {
      continue;
    }

    if (getMissionValue(mission.metric, stats) >= mission.target) {
      completedMissionIds.add(mission.id);
      newlyCompleted.push(mission.id);
      earnedCrystals += mission.reward;
    }
  }

  return {
    progression: {
      ...progression,
      walletCrystals: progression.walletCrystals + earnedCrystals,
      completedMissionIds: missionCatalog
        .filter((mission) => completedMissionIds.has(mission.id))
        .map((mission) => mission.id),
    },
    earnedCrystals,
    completedMissionIds: newlyCompleted,
  };
}

export function unlockSkin(
  progression: ProgressionState,
  skinId: SkinId,
): { progression: ProgressionState; changed: boolean } {
  const skin = skinCatalog.find((candidate) => candidate.id === skinId);
  if (!skin || progression.unlockedSkins.includes(skinId)) {
    return { progression: selectSkin(progression, skinId).progression, changed: progression.selectedSkin !== skinId };
  }

  if (progression.walletCrystals < skin.cost) {
    return { progression, changed: false };
  }

  return {
    progression: {
      ...progression,
      walletCrystals: progression.walletCrystals - skin.cost,
      unlockedSkins: [...progression.unlockedSkins, skinId],
      selectedSkin: skinId,
    },
    changed: true,
  };
}

export function selectSkin(
  progression: ProgressionState,
  skinId: SkinId,
): { progression: ProgressionState; changed: boolean } {
  if (!progression.unlockedSkins.includes(skinId) || progression.selectedSkin === skinId) {
    return { progression, changed: false };
  }

  return {
    progression: {
      ...progression,
      selectedSkin: skinId,
    },
    changed: true,
  };
}

export function parseProgressionAction(action: string): ProgressionAction | undefined {
  const [type, skinId] = action.split(":");
  if ((type === "buy-skin" || type === "select-skin") && skinId && isSkinId(skinId)) {
    return { type, skinId };
  }

  return undefined;
}

function getMissionValue(metric: MissionMetric, stats: RunStats): number {
  if (metric === "crystals") {
    return stats.crystals;
  }

  if (metric === "dodges") {
    return stats.dodges;
  }

  return stats.score;
}

function isMissionId(value: unknown): value is MissionId {
  return typeof value === "string" && missionCatalog.some((mission) => mission.id === value);
}
