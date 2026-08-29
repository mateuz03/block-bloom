import { Capacitor } from "@capacitor/core";
import {
  Haptics,
  ImpactStyle,
  NotificationType,
} from "@capacitor/haptics";

export type HapticCue =
  | "ui"
  | "pickup"
  | "snap"
  | "invalid"
  | "exit"
  | "bloom"
  | "victory";

const webPatterns: Record<HapticCue, number | number[]> = {
  ui: 7,
  pickup: 8,
  snap: 12,
  invalid: [18, 28, 18],
  exit: 24,
  bloom: 24,
  victory: [24, 32, 46],
};

export type HapticBackend = {
  trigger: (cue: HapticCue) => void | Promise<void>;
};

export class HapticController {
  constructor(private readonly backend: HapticBackend) {}

  play(cue: HapticCue, enabled: boolean): void {
    if (!enabled) return;
    try {
      void Promise.resolve(this.backend.trigger(cue)).catch(() => undefined);
    } catch {
      // Feedback tátil é complementar e nunca bloqueia o puzzle.
    }
  }
}

const hapticController = new HapticController({ trigger: triggerHaptic });

/**
 * Dispara feedback tátil sem bloquear a jogabilidade.
 *
 * No aplicativo Capacitor, usa o motor háptico nativo. No navegador,
 * tenta usar a Vibration API como fallback. Falhas são ignoradas porque
 * feedback tátil é complementar e nunca deve interromper a partida.
 */
export function playHaptic(
  cue: HapticCue,
  enabled: boolean,
): void {
  hapticController.play(cue, enabled);
}

async function triggerHaptic(cue: HapticCue): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await triggerNativeHaptic(cue);
      return;
    }

    triggerWebHaptic(cue);
  } catch {
    // Em caso de falha do plugin, ainda tentamos o fallback do navegador.
    triggerWebHaptic(cue);
  }
}

async function triggerNativeHaptic(cue: HapticCue): Promise<void> {
  switch (cue) {
    case "ui":
    case "pickup":
    case "snap":
      await Haptics.impact({ style: ImpactStyle.Light });
      return;

    case "invalid":
      await Haptics.notification({
        type: NotificationType.Warning,
      });
      return;

    case "exit":
    case "bloom":
      await Haptics.impact({ style: ImpactStyle.Medium });
      return;

    case "victory":
      await Haptics.notification({
        type: NotificationType.Success,
      });
  }
}

function triggerWebHaptic(cue: HapticCue): void {
  if (!("vibrate" in navigator)) return;

  try {
    navigator.vibrate(webPatterns[cue]);
  } catch {
    // Alguns navegadores expõem a API, mas recusam a chamada.
  }
}
