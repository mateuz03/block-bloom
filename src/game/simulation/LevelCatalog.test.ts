import { describe, expect, it } from "vitest";
import { solveLevel } from "./PuzzleSolver";
import { levels, validateLevels } from "./puzzle";

describe("catálogo vertical slice", () => {
  it("contém exatamente 15 fases estruturalmente válidas", () => {
    expect(levels).toHaveLength(15);
    expect(validateLevels(levels)).toEqual([]);
  });

  it("preserva os mínimos comprovados das fases 1–10", () => {
    expect(levels.slice(0, 10).map((level) => level.idealMoves)).toEqual([1, 2, 2, 3, 4, 5, 5, 8, 10, 10]);
  });

  for (const level of levels) {
    it(`${level.id} possui solução e mínimo comprovado`, () => {
      const result = solveLevel(level);
      console.info(`[solver] ${level.id}: solved=${result.solved} minimum=${result.minimumMoves ?? "n/a"} visited=${result.visitedStates} exhausted=${result.exhausted}`);
      expect(result.solved).toBe(true);
      expect(result.exhausted).toBe(false);
      expect(result.minimumMoves).toBe(level.idealMoves);
      expect(result.solution).toHaveLength(level.idealMoves);
    }, 120_000);
  }

  it("as fases de estacionamento exigem movimentos além de remover cada bloco", () => {
    for (const level of levels.slice(4, 10)) {
      const result = solveLevel(level);
      expect(level.idealMoves).toBeGreaterThan(level.blocks.length);
      expect(result.solution.some((move) => !move.exited)).toBe(true);
    }
  });

  it("as fases 14 e 15 preservam estacionamento temporário", () => {
    for (const level of levels.slice(13, 15)) {
      const result = solveLevel(level);
      expect(level.idealMoves).toBeGreaterThan(level.blocks.length);
      expect(result.solution.some((move) => !move.exited)).toBe(true);
    }
  });

  it("a fase 4 exige liberar o bloqueador antes do corredor", () => {
    const result = solveLevel(levels[3]);
    expect(result.solution.map((move) => move.blockId)).toEqual(["stopper", "gate", "cargo"]);
    expect(result.solution.every((move) => move.exited)).toBe(true);
  });
});
