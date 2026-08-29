import { describe, expect, it } from "vitest";
import { PlaytestRecorder } from "./PlaytestRecorder";

const catalog = [
  {
    id: "level-1",
    name: "Primeira flor",
    version: 1,
    idealMoves: 1,
    hasBloom: false,
  },
  {
    id: "level-11",
    name: "Primeiro desabrochar",
    version: 1,
    idealMoves: 2,
    hasBloom: true,
  },
];

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const createHarness = () => {
  let now = 0;
  let id = 0;
  const recorder = new PlaytestRecorder(catalog, {
    now: () => now,
    createId: () => `id-${++id}`,
    storage: createMemoryStorage(),
  });
  return {
    recorder,
    advance: (milliseconds: number) => {
      now += milliseconds;
    },
  };
};

describe("PlaytestRecorder", () => {
  it("cria sessão e inicia run somente quando solicitado", () => {
    const { recorder } = createHarness();

    expect(recorder.snapshot().runs).toHaveLength(0);
    const run = recorder.beginRun("level-1");

    expect(recorder.currentSession()).toBeDefined();
    expect(run).toMatchObject({
      levelId: "level-1",
      idealMoves: 1,
      runNumberForLevel: 1,
      status: "in-progress",
    });
  });

  it("registra Undo, Restart e tentativa inválida separadamente", () => {
    const { recorder } = createHarness();
    recorder.beginRun("level-1");

    recorder.recordUndo(0);
    recorder.recordRestart(0);
    recorder.recordInvalidDrop();

    expect(recorder.activeRun()).toMatchObject({
      undoCount: 1,
      restartCount: 1,
      invalidDropCount: 1,
    });
  });

  it("registra primeira Bloom com tempo, movimentos e restarts anteriores", () => {
    const { recorder, advance } = createHarness();
    recorder.beginRun("level-11");
    recorder.recordRestart(0);
    advance(2500);

    recorder.recordMove(2, 1);
    recorder.recordMove(3, 1);

    expect(recorder.activeRun()).toMatchObject({
      bloomCount: 2,
      firstBloomAtMs: 2500,
      movesBeforeFirstBloom: 1,
      restartsBeforeFirstBloom: 1,
    });
  });

  it("conclui uma run preservando movimentos e duração ativa", () => {
    const { recorder, advance } = createHarness();
    recorder.beginRun("level-1");
    advance(1200);
    recorder.recordMove(1, 0);
    advance(300);

    const completed = recorder.complete(1);

    expect(completed).toMatchObject({
      status: "completed",
      moves: 1,
      activeDurationMs: 1500,
      endedAt: 1500,
    });
    expect(recorder.activeRun()).toBeUndefined();
  });

  it("marca abandono explícito", () => {
    const { recorder, advance } = createHarness();
    recorder.beginRun("level-1");
    advance(900);

    expect(recorder.abandon()).toMatchObject({
      status: "abandoned",
      activeDurationMs: 900,
    });
  });

  it("não conta o período em background como tempo ativo", () => {
    const { recorder, advance } = createHarness();
    recorder.beginRun("level-1");
    advance(1000);
    recorder.pause();
    advance(5000);
    recorder.resume();
    advance(1000);

    expect(recorder.complete(1)?.activeDurationMs).toBe(2000);
  });

  it("iniciar nova sessão abandona a run ativa e reinicia a contagem por fase", () => {
    const { recorder } = createHarness();
    recorder.beginRun("level-1");
    recorder.startNewSession();
    const next = recorder.beginRun("level-1");

    expect(recorder.snapshot().runs[0].status).toBe("abandoned");
    expect(next?.runNumberForLevel).toBe(1);
    expect(recorder.snapshot().sessions).toHaveLength(2);
  });

  it("mantém runs interrompidas como in-progress ao encerrar tecnicamente", () => {
    const { recorder, advance } = createHarness();
    recorder.beginRun("level-1");
    advance(500);

    recorder.dispose();

    expect(recorder.snapshot().runs[0]).toMatchObject({
      status: "in-progress",
      activeDurationMs: 500,
    });
  });

  it("preserva a sessão em memória quando o localStorage falha", () => {
    const recorder = new PlaytestRecorder(catalog, {
      now: () => 100,
      createId: (() => {
        let id = 0;
        return () => `memory-${++id}`;
      })(),
      storage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
        removeItem: () => undefined,
      },
    });

    recorder.beginRun("level-1");

    expect(recorder.activeRun()?.levelId).toBe("level-1");
  });
});
