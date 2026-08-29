import { describe, expect, it } from "vitest";
import { isPlaytestMode } from "./playtestMode";

describe("playtest mode", () => {
  it("habilita somente com valor explícito", () => {
    expect(isPlaytestMode("true")).toBe(true);
    expect(isPlaytestMode(true)).toBe(true);
    expect(isPlaytestMode("false")).toBe(false);
    expect(isPlaytestMode(undefined)).toBe(false);
  });
});
