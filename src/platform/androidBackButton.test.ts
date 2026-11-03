import { describe, expect, it, vi } from "vitest";
import {
  emitSystemBackRequest,
  gameEvents,
  type SystemBackRequest,
} from "../game/events";
import {
  createAndroidBackButton,
  type BackButtonPlugin,
} from "./androidBackButton";

const listenForBack = (
  listener: (event: CustomEvent<SystemBackRequest>) => void,
): (() => void) => {
  const controller = new AbortController();
  gameEvents.addEventListener("system-back-request", listener, {
    signal: controller.signal,
  });
  return () => controller.abort();
};

const createPlugin = () => {
  let backListener:
    | ((event: { canGoBack: boolean }) => void)
    | undefined;
  const remove = vi.fn(async () => undefined);
  const exitApp = vi.fn(async () => undefined);
  const addListener = vi.fn<BackButtonPlugin["addListener"]>(
    async (_eventName, listener) => {
      backListener = listener;
      return { remove };
    },
  );
  const plugin: BackButtonPlugin = { addListener, exitApp };

  return {
    plugin,
    remove,
    exitApp,
    pressBack: () => backListener?.({ canGoBack: false }),
  };
};

describe("system-back-request", () => {
  it("executa somente a ação de maior prioridade", () => {
    const actions: string[] = [];
    const stopMenu = listenForBack((event) => {
      event.detail.claim(10, () => actions.push("home"));
    });
    const stopModal = listenForBack((event) => {
      event.detail.claim(100, () => actions.push("settings"));
    });

    expect(emitSystemBackRequest()).toBe(true);
    expect(actions).toEqual(["settings"]);

    stopModal();
    stopMenu();
  });

  it("informa quando nenhuma camada consumiu o retorno", () => {
    expect(emitSystemBackRequest()).toBe(false);
  });
});

describe("createAndroidBackButton", () => {
  it("fecha o aplicativo apenas quando a interface não trata o retorno", async () => {
    const fake = createPlugin();
    const destroy = createAndroidBackButton(fake.plugin, true);
    await Promise.resolve();

    fake.pressBack();
    expect(fake.exitApp).toHaveBeenCalledOnce();

    destroy();
  });

  it("não fecha o aplicativo quando uma camada trata o retorno", async () => {
    const fake = createPlugin();
    const action = vi.fn();
    const stop = listenForBack((event) => {
      event.detail.claim(10, action);
    });
    const destroy = createAndroidBackButton(fake.plugin, true);
    await Promise.resolve();

    fake.pressBack();
    expect(action).toHaveBeenCalledOnce();
    expect(fake.exitApp).not.toHaveBeenCalled();

    destroy();
    stop();
  });

  it("não registra no navegador e remove o listener nativo ao destruir", async () => {
    const browser = createPlugin();
    createAndroidBackButton(browser.plugin, false)();
    expect(browser.plugin.addListener).not.toHaveBeenCalled();

    const native = createPlugin();
    const destroy = createAndroidBackButton(native.plugin, true);
    await Promise.resolve();
    destroy();
    await Promise.resolve();

    expect(native.remove).toHaveBeenCalledOnce();
    native.pressBack();
    expect(native.exitApp).not.toHaveBeenCalled();
  });
});
