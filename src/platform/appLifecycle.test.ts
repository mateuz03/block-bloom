import { describe, expect, it, vi } from "vitest";
import {
  gameEvents,
  type AppLifecycleChange,
} from "../game/events";
import {
  createAppLifecycle,
  type AppLifecycleEnvironment,
  type AppStatePlugin,
} from "./appLifecycle";

const createHarness = () => {
  const windowTarget = new EventTarget();
  const documentTarget = new EventTarget();
  let hidden = false;
  let nativeListener:
    | ((state: { isActive: boolean }) => void)
    | undefined;
  const remove = vi.fn(async () => undefined);
  const addListener = vi.fn<AppStatePlugin["addListener"]>(
    async (_eventName, listener) => {
      nativeListener = listener;
      return { remove };
    },
  );
  const environment: AppLifecycleEnvironment = {
    windowTarget,
    documentTarget,
    isDocumentHidden: () => hidden,
  };

  return {
    environment,
    plugin: { addListener },
    remove,
    setHidden: (value: boolean) => {
      hidden = value;
      documentTarget.dispatchEvent(new Event("visibilitychange"));
    },
    blur: () => windowTarget.dispatchEvent(new Event("blur")),
    focus: () => windowTarget.dispatchEvent(new Event("focus")),
    freeze: () => documentTarget.dispatchEvent(new Event("freeze")),
    resume: () => documentTarget.dispatchEvent(new Event("resume")),
    setNativeActive: (isActive: boolean) => nativeListener?.({ isActive }),
  };
};

const captureLifecycle = (): {
  values: boolean[];
  stop: () => void;
} => {
  const values: boolean[] = [];
  const controller = new AbortController();
  gameEvents.addEventListener("app-lifecycle-change", (
    event: CustomEvent<AppLifecycleChange>,
  ) => values.push(event.detail.active), { signal: controller.signal });
  return { values, stop: () => controller.abort() };
};

describe("createAppLifecycle", () => {
  it("deduplica sinais web equivalentes de pausa e retorno", () => {
    const harness = createHarness();
    const captured = captureLifecycle();
    const destroy = createAppLifecycle(
      harness.plugin,
      false,
      harness.environment,
    );

    harness.blur();
    harness.freeze();
    harness.focus();

    expect(captured.values).toEqual([true, false, true]);

    destroy();
    captured.stop();
  });

  it("não retorna enquanto o documento permanece oculto", () => {
    const harness = createHarness();
    const captured = captureLifecycle();
    const destroy = createAppLifecycle(
      harness.plugin,
      false,
      harness.environment,
    );

    harness.setHidden(true);
    harness.focus();
    harness.resume();
    harness.setHidden(false);

    expect(captured.values).toEqual([true, false, true]);

    destroy();
    captured.stop();
  });

  it("encaminha o ciclo nativo e remove todos os listeners", async () => {
    const harness = createHarness();
    const captured = captureLifecycle();
    const destroy = createAppLifecycle(
      harness.plugin,
      true,
      harness.environment,
    );
    await Promise.resolve();

    harness.setNativeActive(false);
    harness.setNativeActive(true);
    expect(captured.values).toEqual([true, false, true]);

    destroy();
    await Promise.resolve();
    harness.blur();
    harness.setNativeActive(false);

    expect(harness.remove).toHaveBeenCalledOnce();
    expect(captured.values).toEqual([true, false, true]);
    captured.stop();
  });
});
