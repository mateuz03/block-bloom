const SETTINGS_KEY = "block-bloom:settings";
const SETTINGS_VERSION = 2 as const;

export type GameSettings = {
  version: typeof SETTINGS_VERSION;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  vibrationEnabled: boolean;
  reducedEffects: boolean;
};

const DEFAULT_SETTINGS: GameSettings = {
  version: SETTINGS_VERSION,
  musicEnabled: true,
  soundEffectsEnabled: true,
  vibrationEnabled: true,
  reducedEffects: false,
};

export function defaultGameSettings(): GameSettings {
  return { ...DEFAULT_SETTINGS };
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return defaultGameSettings();
    }

    return normalizeGameSettings(JSON.parse(raw) as unknown);
  } catch {
    return defaultGameSettings();
  }
}

export function saveGameSettings(settings: GameSettings): void {
  const normalized = normalizeGameSettings(settings);

  try {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // O jogo continua com as preferências da sessão se o storage falhar.
  }
}

export function updateGameSettings(
  current: GameSettings,
  patch: Partial<Pick<
    GameSettings,
    | "musicEnabled"
    | "soundEffectsEnabled"
    | "vibrationEnabled"
    | "reducedEffects"
  >>,
): GameSettings {
  return normalizeGameSettings({
    ...current,
    ...patch,
  });
}

function normalizeGameSettings(value: unknown): GameSettings {
  if (
    !isRecord(value) ||
    (value.version !== 1 && value.version !== SETTINGS_VERSION)
  ) {
    return defaultGameSettings();
  }

  return {
    version: SETTINGS_VERSION,
    musicEnabled:
      typeof value.musicEnabled === "boolean"
        ? value.musicEnabled
        : DEFAULT_SETTINGS.musicEnabled,
    soundEffectsEnabled:
      typeof value.soundEffectsEnabled === "boolean"
        ? value.soundEffectsEnabled
        : DEFAULT_SETTINGS.soundEffectsEnabled,
    vibrationEnabled:
      typeof value.vibrationEnabled === "boolean"
        ? value.vibrationEnabled
        : DEFAULT_SETTINGS.vibrationEnabled,
    reducedEffects:
      typeof value.reducedEffects === "boolean"
        ? value.reducedEffects
        : DEFAULT_SETTINGS.reducedEffects,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
