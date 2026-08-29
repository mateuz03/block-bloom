import { describe, expect, it } from "vitest";
import { levels } from "../simulation/puzzle";
import { getPhaseHint, missingPhaseHintIds } from "./phaseHints";

describe("dicas opcionais das fases", () => {
  it("possui uma dica curta para todas as 15 fases", () => {
    expect(missingPhaseHintIds(levels)).toEqual([]);
    levels.forEach((level) => {
      const hint = getPhaseHint(level.id);
      expect(hint).toBeTruthy();
      expect(hint?.length).toBeLessThanOrEqual(140);
    });
  });

  it("não oferece conteúdo para uma fase inexistente", () => {
    expect(getPhaseHint("level-99")).toBeUndefined();
  });
});
