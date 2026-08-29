import { describe, expect, it, vi } from "vitest";
import { HapticController, type HapticBackend } from "./haptics";

describe("HapticController", () => {
  it("não chama o backend quando vibração está desligada", () => {
    const backend: HapticBackend = { trigger: vi.fn() };
    const controller = new HapticController(backend);

    controller.play("snap", false);

    expect(backend.trigger).not.toHaveBeenCalled();
  });

  it("encaminha uma única consequência tátil por evento", () => {
    const backend: HapticBackend = { trigger: vi.fn() };
    const controller = new HapticController(backend);

    controller.play("bloom", true);

    expect(backend.trigger).toHaveBeenCalledOnce();
    expect(backend.trigger).toHaveBeenCalledWith("bloom");
  });

  it("não propaga falhas síncronas do backend", () => {
    const controller = new HapticController({
      trigger: () => {
        throw new Error("indisponível");
      },
    });

    expect(() => controller.play("victory", true)).not.toThrow();
  });
});
