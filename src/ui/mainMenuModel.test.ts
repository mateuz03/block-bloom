import { describe, expect, it } from "vitest";
import { levels } from "../game/simulation/puzzle";
import {
  SAVE_VERSION,
  createDefaultProgress,
  loadPuzzleProgress,
  type PuzzleProgress,
} from "../storage/puzzleProgress";
import {
  canSelectMenuLevel,
  createMainMenuModel,
} from "./mainMenuModel";

const progressAtThree = (): PuzzleProgress => ({
  version: SAVE_VERSION,
  currentLevelId: "level-2",
  highestUnlockedLevelId: "level-3",
  bestMoves: {
    "level-1": { moves: 1, levelVersion: levels[0].version },
  },
});

describe("mainMenuModel", () => {
  it("apresenta fase atual, progresso e recordes existentes", () => {
    const model = createMainMenuModel(progressAtThree(), levels, false);

    expect(model.currentLevelNumber).toBe(2);
    expect(model.highestUnlockedNumber).toBe(3);
    expect(model.totalLevels).toBe(15);
    expect(model.levels[0]).toMatchObject({
      completed: true,
      bestMoves: 1,
    });
  });

  it("bloqueia fases acima da maior desbloqueada em produção", () => {
    const progress = progressAtThree();

    expect(canSelectMenuLevel(progress, "level-3", levels, false)).toBe(true);
    expect(canSelectMenuLevel(progress, "level-4", levels, false)).toBe(false);
    expect(canSelectMenuLevel(progress, "level-15", levels, true)).toBe(true);
  });

  it("recusa IDs inexistentes", () => {
    expect(
      canSelectMenuLevel(progressAtThree(), "level-inexistente", levels, true),
    ).toBe(false);
  });

  it("usa fallback seguro quando o save está inválido", () => {
    const progress = loadPuzzleProgress(levels, {
      getItem: () => "{save-invalido",
    });
    const model = createMainMenuModel(progress, levels, false);

    expect(model.currentLevelId).toBe("level-1");
    expect(model.highestUnlockedNumber).toBe(1);
  });

  it("não altera o progresso ao apenas construir a Home", () => {
    const progress = createDefaultProgress(levels);
    const before = JSON.stringify(progress);

    createMainMenuModel(progress, levels, false);

    expect(JSON.stringify(progress)).toBe(before);
  });
});
