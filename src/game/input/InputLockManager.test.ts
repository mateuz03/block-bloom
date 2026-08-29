import { describe, expect, it } from "vitest";
import { InputLockManager } from "./InputLockManager";

describe("InputLockManager", () => {
  it("mantém a entrada bloqueada enquanto existir qualquer motivo", () => {
    const locks = new InputLockManager(["transition"]);
    locks.lock("settings");

    expect(locks.unlock("transition")).toBe(true);
    expect(locks.locked).toBe(true);
    expect(locks.has("settings")).toBe(true);
  });

  it("não duplica motivos e só libera o motivo solicitado", () => {
    const locks = new InputLockManager();

    expect(locks.lock("background")).toBe(true);
    expect(locks.lock("background")).toBe(false);
    expect(locks.unlock("settings")).toBe(false);
    expect(locks.locked).toBe(true);
    expect(locks.unlock("background")).toBe(true);
    expect(locks.locked).toBe(false);
  });

  it("reinicia com um conjunto conhecido", () => {
    const locks = new InputLockManager(["background"]);
    locks.reset(["transition"]);

    expect(locks.has("background")).toBe(false);
    expect(locks.has("transition")).toBe(true);
  });

  it("não libera o canvas enquanto a navegação está sobre o jogo", () => {
    const locks = new InputLockManager(["transition", "navigation"]);

    locks.unlock("transition");

    expect(locks.locked).toBe(true);
    expect(locks.has("navigation")).toBe(true);
  });
});
