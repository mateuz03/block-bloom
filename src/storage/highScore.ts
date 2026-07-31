const key = "neon-switch:high-score";

export function loadHighScore(): number {
  const raw = window.localStorage.getItem(key);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveHighScore(score: number): void {
  window.localStorage.setItem(key, String(Math.max(0, Math.floor(score))));
}
