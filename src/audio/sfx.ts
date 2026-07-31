type SfxName = "start" | "switch" | "collect" | "crash" | "record" | "pause";

type Tone = {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
};

const soundMap: Record<SfxName, Tone[]> = {
  start: [
    { frequency: 420, duration: 0.06, type: "triangle", gain: 0.05 },
    { frequency: 620, duration: 0.08, delay: 0.06, type: "triangle", gain: 0.055 },
  ],
  switch: [{ frequency: 520, duration: 0.045, type: "square", gain: 0.035 }],
  collect: [
    { frequency: 760, duration: 0.055, type: "sine", gain: 0.05 },
    { frequency: 1140, duration: 0.07, delay: 0.045, type: "sine", gain: 0.045 },
  ],
  crash: [
    { frequency: 160, duration: 0.12, type: "sawtooth", gain: 0.07 },
    { frequency: 92, duration: 0.16, delay: 0.05, type: "square", gain: 0.05 },
  ],
  record: [
    { frequency: 660, duration: 0.07, type: "triangle", gain: 0.055 },
    { frequency: 880, duration: 0.07, delay: 0.065, type: "triangle", gain: 0.055 },
    { frequency: 1320, duration: 0.1, delay: 0.13, type: "triangle", gain: 0.05 },
  ],
  pause: [{ frequency: 280, duration: 0.07, type: "sine", gain: 0.035 }],
};

export class Sfx {
  private context?: AudioContext;

  play(name: SfxName): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    void context.resume();
    const now = context.currentTime;
    for (const tone of soundMap[name]) {
      const start = now + (tone.delay ?? 0);
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = tone.type ?? "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, tone.frequency * 0.82), start + tone.duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.04, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + tone.duration + 0.02);
    }
  }

  private getContext(): AudioContext | undefined {
    if (this.context) {
      return this.context;
    }

    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return undefined;
    }

    this.context = new AudioContextCtor();
    return this.context;
  }
}
