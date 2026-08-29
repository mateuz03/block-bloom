import { describe, expect, it } from "vitest";
import {
  TUTORIAL_PROGRESS_KEY,
  defaultTutorialProgress,
  loadTutorialProgress,
  markTutorialSeen,
  parseTutorialProgress,
  resetTutorialProgress,
  saveTutorialProgress,
} from "./tutorialProgress";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

describe("tutorialProgress", () => {
  it("salva dicas vistas sem duplicação", () => {
    const storage = createMemoryStorage();
    let progress = markTutorialSeen(defaultTutorialProgress(), "basics");
    progress = markTutorialSeen(progress, "basics");
    progress = markTutorialSeen(progress, "undo");
    saveTutorialProgress(progress, storage);

    expect(loadTutorialProgress(storage)).toEqual({
      version: 1,
      seen: ["basics", "undo"],
    });
  });

  it("ignora IDs desconhecidos e descarta conteúdo corrompido", () => {
    expect(parseTutorialProgress(JSON.stringify({
      version: 1,
      seen: ["basics", "desconhecido", "basics"],
    }))).toEqual({ version: 1, seen: ["basics"] });
    expect(parseTutorialProgress("{inválido")).toBeUndefined();
    expect(parseTutorialProgress(JSON.stringify({
      version: 0,
      seen: ["basics"],
    }))).toBeUndefined();
  });

  it("remove progresso salvo ao solicitar revisão guiada", () => {
    const storage = createMemoryStorage();
    storage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify({
      version: 1,
      seen: ["basics", "undo", "bloom"],
    }));

    expect(resetTutorialProgress(storage)).toEqual({ version: 1, seen: [] });
    expect(storage.getItem(TUTORIAL_PROGRESS_KEY)).toBeNull();
  });
});
