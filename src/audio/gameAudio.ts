import {
  gameEvents,
  type AppLifecycleChange,
} from "../game/events";
import {
  loadGameSettings,
  type GameSettings,
} from "../storage/gameSettings";

export type GameSound =
  | "ui"
  | "pickup"
  | "slide"
  | "snap"
  | "invalid"
  | "exit"
  | "bloom"
  | "victory";

type Tone = {
  frequency: number;
  endFrequency?: number;
  delay?: number;
  duration: number;
  volume: number;
  type: OscillatorType;
};

const soundProfiles: Record<GameSound, Tone[]> = {
  ui: [
    { frequency: 520, endFrequency: 650, duration: 0.055, volume: 0.08, type: "sine" },
  ],
  pickup: [
    { frequency: 310, endFrequency: 470, duration: 0.09, volume: 0.1, type: "sine" },
  ],
  slide: [
    { frequency: 430, endFrequency: 480, duration: 0.035, volume: 0.035, type: "sine" },
  ],
  snap: [
    { frequency: 390, endFrequency: 470, duration: 0.075, volume: 0.08, type: "triangle" },
    { frequency: 620, delay: 0.035, duration: 0.09, volume: 0.055, type: "sine" },
  ],
  invalid: [
    { frequency: 175, endFrequency: 105, duration: 0.15, volume: 0.075, type: "sawtooth" },
  ],
  exit: [
    { frequency: 440, endFrequency: 540, duration: 0.11, volume: 0.07, type: "triangle" },
    { frequency: 660, delay: 0.07, duration: 0.14, volume: 0.075, type: "sine" },
    { frequency: 880, delay: 0.14, duration: 0.17, volume: 0.055, type: "sine" },
  ],
  bloom: [
    { frequency: 523.25, duration: 0.18, volume: 0.06, type: "sine" },
    { frequency: 659.25, delay: 0.06, duration: 0.2, volume: 0.065, type: "sine" },
    { frequency: 783.99, delay: 0.12, duration: 0.24, volume: 0.06, type: "triangle" },
  ],
  victory: [
    { frequency: 523.25, duration: 0.22, volume: 0.065, type: "triangle" },
    { frequency: 659.25, delay: 0.08, duration: 0.24, volume: 0.065, type: "triangle" },
    { frequency: 783.99, delay: 0.16, duration: 0.28, volume: 0.07, type: "sine" },
    { frequency: 1046.5, delay: 0.25, duration: 0.38, volume: 0.055, type: "sine" },
  ],
};

export type AudioBackend = {
  unlock: () => void;
  setMusicEnabled: (enabled: boolean) => void;
  play: (sound: GameSound) => void;
  suspend: () => void;
  resume: () => void;
  destroy: () => void;
};

export class GameAudioController {
  private settings: GameSettings;

  constructor(
    private readonly backend: AudioBackend,
    initialSettings: GameSettings,
  ) {
    this.settings = { ...initialSettings };
    this.backend.setMusicEnabled(this.settings.musicEnabled);
  }

  configure(settings: GameSettings): void {
    this.settings = { ...settings };
    this.backend.setMusicEnabled(settings.musicEnabled);
  }

  unlock(): void {
    this.backend.unlock();
  }

  play(sound: GameSound): void {
    if (!this.settings.soundEffectsEnabled) return;
    this.backend.play(sound);
  }

  suspend(): void {
    this.backend.suspend();
  }

  resume(): void {
    this.backend.resume();
  }

  destroy(): void {
    this.backend.destroy();
  }
}

class WebAudioBackend implements AudioBackend {
  private context?: AudioContext;
  private effectsGain?: GainNode;
  private musicGain?: GainNode;
  private musicNodes: AudioScheduledSourceNode[] = [];
  private musicConnections: AudioNode[] = [];
  private unlocked = false;
  private musicEnabled = false;
  private suspended = false;

  unlock(): void {
    this.unlocked = true;
    const context = this.ensureContext();
    if (!context) return;
    void context.resume().then(() => this.startMusic()).catch(() => undefined);
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
      return;
    }
    this.startMusic();
  }

  play(sound: GameSound): void {
    this.unlock();
    const context = this.context;
    if (!context || !this.effectsGain || this.suspended) return;
    const schedule = (): void => {
      if (!this.context || !this.effectsGain || this.suspended) return;
      const now = this.context.currentTime;
      for (const tone of soundProfiles[sound]) {
        this.scheduleTone(this.context, this.effectsGain, now, tone);
      }
    };
    if (context.state === "running") schedule();
    else void context.resume().then(schedule).catch(() => undefined);
  }

  suspend(): void {
    this.suspended = true;
    if (this.context?.state === "running") {
      void this.context.suspend().catch(() => undefined);
    }
  }

  resume(): void {
    this.suspended = false;
    if (!this.unlocked || !this.context) return;
    void this.context.resume().then(() => this.startMusic()).catch(() => undefined);
  }

  destroy(): void {
    this.stopMusic();
    const context = this.context;
    this.context = undefined;
    this.effectsGain = undefined;
    this.musicGain = undefined;
    if (context && context.state !== "closed") {
      void context.close().catch(() => undefined);
    }
  }

  private ensureContext(): AudioContext | undefined {
    if (this.context) return this.context;
    const audioWindow = window as Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor =
      window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) return undefined;

    try {
      this.context = new AudioContextConstructor();
      this.effectsGain = this.context.createGain();
      this.effectsGain.gain.value = 0.42;
      this.effectsGain.connect(this.context.destination);
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 0.035;
      this.musicGain.connect(this.context.destination);
      return this.context;
    } catch {
      return undefined;
    }
  }

  private startMusic(): void {
    if (
      !this.musicEnabled ||
      !this.unlocked ||
      this.suspended ||
      this.musicNodes.length > 0
    ) {
      return;
    }
    const context = this.ensureContext();
    const destination = this.musicGain;
    if (!context || !destination || context.state !== "running") return;

    const chord = [130.81, 164.81, 196];
    chord.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = [0.34, 0.13, 0.1][index];
      oscillator.connect(gain).connect(destination);
      oscillator.start();
      this.musicNodes.push(oscillator);
      this.musicConnections.push(gain);
    });

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.075;
    lfoGain.gain.value = 0.007;
    lfo.connect(lfoGain).connect(destination.gain);
    lfo.start();
    this.musicNodes.push(lfo);
    this.musicConnections.push(lfoGain);
  }

  private stopMusic(): void {
    for (const node of this.musicNodes) {
      try {
        node.stop();
      } catch {
        // O nó pode já ter sido encerrado pelo navegador.
      }
      node.disconnect();
    }
    for (const node of this.musicConnections) node.disconnect();
    this.musicNodes = [];
    this.musicConnections = [];
  }

  private scheduleTone(
    context: AudioContext,
    destination: AudioNode,
    baseTime: number,
    tone: Tone,
  ): void {
    const start = baseTime + (tone.delay ?? 0);
    const end = start + tone.duration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    if (tone.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, end);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
  }
}

let activeAudio: GameAudioController | undefined;
let activeAudioCleanup: (() => void) | undefined;

export function createGameAudio(): () => void {
  activeAudioCleanup?.();
  const controller = new GameAudioController(
    new WebAudioBackend(),
    loadGameSettings(),
  );
  activeAudio = controller;
  const abortController = new AbortController();
  const { signal } = abortController;

  const unlock = (): void => controller.unlock();
  const handleLifecycle = (
    event: CustomEvent<AppLifecycleChange>,
  ): void => {
    if (event.detail.active) controller.resume();
    else controller.suspend();
  };
  const handleSettings = (event: CustomEvent<GameSettings>): void => {
    controller.configure(event.detail);
  };

  window.addEventListener("pointerdown", unlock, { signal, passive: true });
  window.addEventListener("keydown", unlock, { signal });
  gameEvents.addEventListener("game-settings", handleSettings, { signal });
  gameEvents.addEventListener(
    "app-lifecycle-change",
    handleLifecycle,
    { signal },
  );

  const cleanup = (): void => {
    abortController.abort();
    controller.destroy();
    if (activeAudio === controller) activeAudio = undefined;
    if (activeAudioCleanup === cleanup) activeAudioCleanup = undefined;
  };
  activeAudioCleanup = cleanup;
  return cleanup;
}

export function playGameSound(sound: GameSound): void {
  activeAudio?.play(sound);
}
