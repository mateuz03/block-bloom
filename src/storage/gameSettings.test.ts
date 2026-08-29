import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGameSettings,
  loadGameSettings,
  saveGameSettings,
  updateGameSettings,
} from "./gameSettings";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gameSettings", () => {
  it("inicia com som ligado", () => {
    expect(defaultGameSettings().soundEffectsEnabled).toBe(true);
  });

  it("preserva as mesmas preferências entre Home e gameplay", () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });
    const changed = updateGameSettings(defaultGameSettings(), {
      musicEnabled: false,
      soundEffectsEnabled: false,
      vibrationEnabled: false,
      reducedEffects: true,
    });

    saveGameSettings(changed);

    expect(loadGameSettings()).toEqual(changed);
  });

  it("migra preferências antigas preservando vibração e efeitos visuais", () => {
    const localStorage = createMemoryStorage();
    localStorage.setItem("block-bloom:settings", JSON.stringify({
      version: 1,
      vibrationEnabled: false,
      reducedEffects: true,
    }));
    vi.stubGlobal("window", { localStorage });

    expect(loadGameSettings()).toEqual({
      version: 2,
      musicEnabled: true,
      soundEffectsEnabled: true,
      vibrationEnabled: false,
      reducedEffects: true,
    });
  });

  it("usa fallback seguro para configuração inválida", () => {
    const localStorage = createMemoryStorage();
    localStorage.setItem("block-bloom:settings", "{inválido");
    vi.stubGlobal("window", { localStorage });

    expect(loadGameSettings()).toEqual(defaultGameSettings());
  });
});
