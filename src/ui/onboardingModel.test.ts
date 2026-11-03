import { describe, expect, it } from "vitest";
import { nextTutorial, type OnboardingSnapshot } from "./onboardingModel";

const snapshot = (
  overrides: Partial<OnboardingSnapshot> = {},
): OnboardingSnapshot => ({
  levelId: "level-2",
  moves: 0,
  canUndo: false,
  won: false,
  ...overrides,
});

describe("nextTutorial", () => {
  it("ensina o arraste somente no início da primeira fase", () => {
    expect(nextTutorial(snapshot({ levelId: "level-1" }), [])).toBe("basics");
    expect(nextTutorial(snapshot({ levelId: "level-1", moves: 1 }), [])).toBeUndefined();
    expect(nextTutorial(snapshot({ levelId: "level-1" }), ["basics"])).toBeUndefined();
  });

  it("prioriza a explicação das flores na fase 11", () => {
    expect(nextTutorial(snapshot({ levelId: "level-11", canUndo: true }), [])).toBe("bloom");
  });

  it("apresenta o undo quando ele se torna utilizável", () => {
    expect(nextTutorial(snapshot({ canUndo: true }), [])).toBe("undo");
    expect(nextTutorial(snapshot({ canUndo: true }), ["undo"])).toBeUndefined();
  });

  it("não mostra instruções após a conclusão", () => {
    expect(nextTutorial(snapshot({ canUndo: true, won: true }), [])).toBeUndefined();
  });
});
