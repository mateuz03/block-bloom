export const TUTORIAL_PROGRESS_KEY = "block-bloom:tutorial-progress";
export const TUTORIAL_PROGRESS_VERSION = 1 as const;

export type TutorialId = "basics" | "undo" | "bloom";

export type TutorialProgress = {
  version: typeof TUTORIAL_PROGRESS_VERSION;
  seen: TutorialId[];
};

type TutorialStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const tutorialIds = new Set<TutorialId>(["basics", "undo", "bloom"]);

export function defaultTutorialProgress(): TutorialProgress {
  return { version: TUTORIAL_PROGRESS_VERSION, seen: [] };
}

export function loadTutorialProgress(
  storage: TutorialStorage = window.localStorage,
): TutorialProgress {
  try {
    const raw = storage.getItem(TUTORIAL_PROGRESS_KEY);
    if (!raw) return defaultTutorialProgress();
    const parsed = parseTutorialProgress(raw);
    if (parsed) return parsed;
    storage.removeItem(TUTORIAL_PROGRESS_KEY);
  } catch {
    // Mantém as dicas disponíveis quando o storage não puder ser acessado.
  }
  return defaultTutorialProgress();
}

export function saveTutorialProgress(
  progress: TutorialProgress,
  storage: TutorialStorage = window.localStorage,
): void {
  const normalized = normalizeTutorialProgress(progress);
  try {
    storage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify(normalized));
  } catch {
    // O onboarding continua funcionando durante a sessão atual.
  }
}

export function markTutorialSeen(
  progress: TutorialProgress,
  tutorialId: TutorialId,
): TutorialProgress {
  if (progress.seen.includes(tutorialId)) {
    return normalizeTutorialProgress(progress);
  }
  return normalizeTutorialProgress({
    ...progress,
    seen: [...progress.seen, tutorialId],
  });
}

export function resetTutorialProgress(
  storage: TutorialStorage = window.localStorage,
): TutorialProgress {
  try {
    storage.removeItem(TUTORIAL_PROGRESS_KEY);
  } catch {
    // O estado padrão ainda pode ser aplicado nesta sessão.
  }
  return defaultTutorialProgress();
}

export function parseTutorialProgress(
  raw: string,
): TutorialProgress | undefined {
  if (raw.length > 10_000) return undefined;
  try {
    const value = JSON.parse(raw) as unknown;
    if (
      !isRecord(value) ||
      value.version !== TUTORIAL_PROGRESS_VERSION ||
      !Array.isArray(value.seen)
    ) {
      return undefined;
    }
    return normalizeTutorialProgress(value);
  } catch {
    return undefined;
  }
}

function normalizeTutorialProgress(
  value: unknown,
): TutorialProgress {
  if (
    !isRecord(value) ||
    value.version !== TUTORIAL_PROGRESS_VERSION ||
    !Array.isArray(value.seen)
  ) {
    return defaultTutorialProgress();
  }

  const seen: TutorialId[] = [];
  for (const tutorialId of value.seen) {
    if (
      typeof tutorialId === "string" &&
      tutorialIds.has(tutorialId as TutorialId) &&
      !seen.includes(tutorialId as TutorialId)
    ) {
      seen.push(tutorialId as TutorialId);
    }
  }
  return { version: TUTORIAL_PROGRESS_VERSION, seen };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
