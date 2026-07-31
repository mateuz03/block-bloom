import { normalizeProgression, type ProgressionState } from "../game/progression/progression";

const key = "neon-switch:progression";

export function loadProgression(): ProgressionState {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return normalizeProgression(undefined);
  }

  try {
    return normalizeProgression(JSON.parse(raw));
  } catch {
    return normalizeProgression(undefined);
  }
}

export function saveProgression(progression: ProgressionState): void {
  window.localStorage.setItem(key, JSON.stringify(progression));
}
