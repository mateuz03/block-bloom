import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { emitAppLifecycleChange } from "../game/events";

export type AppStatePlugin = {
  addListener: (
    eventName: "appStateChange",
    listener: (state: { isActive: boolean }) => void,
  ) => Promise<{ remove: () => Promise<void> }>;
};

export type AppLifecycleEnvironment = {
  windowTarget: EventTarget;
  documentTarget: EventTarget;
  isDocumentHidden: () => boolean;
};

const browserEnvironment = (): AppLifecycleEnvironment => ({
  windowTarget: window,
  documentTarget: document,
  isDocumentHidden: () => document.hidden,
});

const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

let activeLifecycleCleanup: (() => void) | undefined;

/**
 * Consolida o ciclo de vida nativo e o Page Visibility API em uma única
 * transição deduplicada. Os consumidores não precisam conhecer Capacitor.
 */
export function createAppLifecycle(
  plugin: AppStatePlugin = App,
  nativeEnabled = isNativePlatform(),
  environment: AppLifecycleEnvironment = browserEnvironment(),
): () => void {
  activeLifecycleCleanup?.();

  let destroyed = false;
  let active = !environment.isDocumentHidden();
  emitAppLifecycleChange(active);

  const publish = (nextActive: boolean): void => {
    if (destroyed || nextActive === active) return;
    active = nextActive;
    emitAppLifecycleChange(active);
  };

  const pause = (): void => publish(false);
  const resume = (): void => {
    if (!environment.isDocumentHidden()) publish(true);
  };
  const visibility = (): void => {
    publish(!environment.isDocumentHidden());
  };

  environment.windowTarget.addEventListener("blur", pause);
  environment.windowTarget.addEventListener("focus", resume);
  environment.windowTarget.addEventListener("pagehide", pause);
  environment.windowTarget.addEventListener("pageshow", resume);
  environment.documentTarget.addEventListener("visibilitychange", visibility);
  environment.documentTarget.addEventListener("freeze", pause);
  environment.documentTarget.addEventListener("resume", resume);

  const nativeRegistration = nativeEnabled
    ? plugin.addListener("appStateChange", (state) => {
        publish(state.isActive);
      })
    : undefined;

  void nativeRegistration?.catch((error: unknown) => {
    console.error("Não foi possível observar o estado do aplicativo.", error);
  });

  const cleanup = (): void => {
    if (destroyed) return;
    destroyed = true;
    environment.windowTarget.removeEventListener("blur", pause);
    environment.windowTarget.removeEventListener("focus", resume);
    environment.windowTarget.removeEventListener("pagehide", pause);
    environment.windowTarget.removeEventListener("pageshow", resume);
    environment.documentTarget.removeEventListener(
      "visibilitychange",
      visibility,
    );
    environment.documentTarget.removeEventListener("freeze", pause);
    environment.documentTarget.removeEventListener("resume", resume);
    void nativeRegistration
      ?.then((listener) => listener.remove())
      .catch((error: unknown) => {
        console.error(
          "Não foi possível remover o observador do aplicativo.",
          error,
        );
      });
    if (activeLifecycleCleanup === cleanup) {
      activeLifecycleCleanup = undefined;
    }
  };

  activeLifecycleCleanup = cleanup;
  return cleanup;
}
