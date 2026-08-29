import { describe, expect, it, vi } from "vitest";
import { defaultGameSettings } from "../storage/gameSettings";
import {
  GameAudioController,
  type AudioBackend,
} from "./gameAudio";

const createBackend = (): AudioBackend => ({
  unlock: vi.fn(),
  setMusicEnabled: vi.fn(),
  play: vi.fn(),
  suspend: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
});

describe("GameAudioController", () => {
  it("aplica música separadamente dos efeitos sonoros", () => {
    const backend = createBackend();
    const controller = new GameAudioController(
      backend,
      defaultGameSettings(),
    );

    controller.configure({
      ...defaultGameSettings(),
      musicEnabled: false,
      soundEffectsEnabled: true,
    });
    controller.play("snap");

    expect(backend.setMusicEnabled).toHaveBeenLastCalledWith(false);
    expect(backend.play).toHaveBeenCalledWith("snap");
  });

  it("não toca efeitos quando eles estão desativados", () => {
    const backend = createBackend();
    const controller = new GameAudioController(backend, {
      ...defaultGameSettings(),
      soundEffectsEnabled: false,
    });

    controller.play("invalid");

    expect(backend.play).not.toHaveBeenCalled();
  });

  it("encaminha desbloqueio, ciclo de vida e destruição", () => {
    const backend = createBackend();
    const controller = new GameAudioController(
      backend,
      defaultGameSettings(),
    );

    controller.unlock();
    controller.suspend();
    controller.resume();
    controller.destroy();

    expect(backend.unlock).toHaveBeenCalledOnce();
    expect(backend.suspend).toHaveBeenCalledOnce();
    expect(backend.resume).toHaveBeenCalledOnce();
    expect(backend.destroy).toHaveBeenCalledOnce();
  });
});
