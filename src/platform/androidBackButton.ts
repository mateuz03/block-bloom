import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { emitSystemBackRequest } from "../game/events";

export type BackButtonPlugin = {
  addListener: (
    eventName: "backButton",
    listener: (event: { canGoBack: boolean }) => void,
  ) => Promise<{ remove: () => Promise<void> }>;
  exitApp: () => Promise<void>;
};

const isNativeAndroid = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

export function createAndroidBackButton(
  plugin: BackButtonPlugin = App,
  enabled = isNativeAndroid(),
): () => void {
  if (!enabled) return () => undefined;

  let destroyed = false;
  const registration = plugin.addListener("backButton", () => {
    if (destroyed || emitSystemBackRequest()) return;

    void plugin.exitApp().catch((error: unknown) => {
      console.error("Não foi possível fechar o aplicativo.", error);
    });
  });

  void registration.catch((error: unknown) => {
    console.error("Não foi possível registrar o botão Voltar.", error);
  });

  return () => {
    if (destroyed) return;
    destroyed = true;
    void registration
      .then((listener) => listener.remove())
      .catch((error: unknown) => {
        console.error("Não foi possível remover o botão Voltar.", error);
      });
  };
}
