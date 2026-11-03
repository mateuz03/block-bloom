import { playGameSound } from "../audio/gameAudio";
import { levels } from "../game/simulation/puzzle";
import {
  clearPlaytestMetrics,
  classifyPlaytestLevel,
  formatPlaytestReport,
  loadPlaytestMetrics,
  type LevelPlaytestMetrics,
} from "../storage/playtestMetrics";

const reportCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createPlaytestReport(root: HTMLElement): () => void {
  reportCleanupByRoot.get(root)?.();
  const controller = new AbortController();
  const { signal } = controller;
  const levelIds = levels.map((level) => level.id);
  const settingsHome = find<HTMLElement>(root, "[data-settings-home]");
  let resetPending = false;
  let destroyed = false;

  const details = document.createElement("details");
  details.className = "playtest-report";
  details.innerHTML = `
    <summary>Qualidade das fases</summary>
    <div class="playtest-report__body">
      <p>
        Contagens anônimas salvas somente neste aparelho. Use o relatório
        depois dos playtests para identificar fases difíceis.
      </p>
      <div class="playtest-report__summary" data-playtest-summary></div>
      <div class="playtest-report__levels" data-playtest-levels></div>
      <div class="playtest-report__actions">
        <button type="button" data-playtest-copy>Copiar relatório</button>
        <button type="button" data-playtest-clear>Limpar dados</button>
      </div>
      <small data-playtest-status aria-live="polite"></small>
    </div>
  `;
  settingsHome.before(details);

  const summary = find<HTMLElement>(details, "[data-playtest-summary]");
  const levelList = find<HTMLElement>(details, "[data-playtest-levels]");
  const copyButton = find<HTMLButtonElement>(details, "[data-playtest-copy]");
  const clearButton = find<HTMLButtonElement>(details, "[data-playtest-clear]");
  const status = find<HTMLElement>(details, "[data-playtest-status]");

  const render = (): void => {
    const metrics = loadPlaytestMetrics(levelIds);
    const played = levels.filter(
      (level) => (metrics.levels[level.id]?.starts ?? 0) > 0,
    );
    const totalStarts = played.reduce(
      (total, level) => total + metrics.levels[level.id].starts,
      0,
    );
    const totalCompletions = played.reduce(
      (total, level) => total + metrics.levels[level.id].completions,
      0,
    );

    summary.textContent = played.length === 0
      ? "Nenhuma fase testada ainda."
      : `${played.length} fases testadas · ${totalCompletions}/${totalStarts} tentativas concluídas`;
    levelList.replaceChildren(
      ...played.map((level) => {
        const item = metrics.levels[level.id];
        const number = levels.findIndex((candidate) => candidate.id === level.id) + 1;
        const row = document.createElement("div");
        row.className = "playtest-report__level";
        row.innerHTML = `
          <strong>Fase ${number}</strong>
          <span>${level.name}</span>
          <small>${qualitySummary(item)}</small>
        `;
        return row;
      }),
    );
  };

  details.addEventListener("toggle", () => {
    resetPending = false;
    clearButton.textContent = "Limpar dados";
    status.textContent = "";
    if (details.open) render();
  }, { signal });

  copyButton.addEventListener("click", async () => {
    playGameSound("ui");
    const report = formatPlaytestReport(
      loadPlaytestMetrics(levelIds),
      levels,
    );
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(report);
      status.textContent = "Relatório copiado. Você já pode colar e enviar.";
    } catch {
      status.textContent = "Não foi possível copiar neste aparelho.";
    }
  }, { signal });

  clearButton.addEventListener("click", () => {
    playGameSound("ui");
    if (!resetPending) {
      resetPending = true;
      clearButton.textContent = "Confirmar limpeza";
      status.textContent = "Toque novamente para apagar somente os dados de playtest.";
      return;
    }
    clearPlaytestMetrics();
    resetPending = false;
    clearButton.textContent = "Limpar dados";
    status.textContent = "Dados locais de playtest removidos.";
    render();
  }, { signal });

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    details.remove();
    if (reportCleanupByRoot.get(root) === destroy) {
      reportCleanupByRoot.delete(root);
    }
  };
  reportCleanupByRoot.set(root, destroy);
  return destroy;
}

function qualitySummary(item: LevelPlaytestMetrics): string {
  const completionRate = item.starts === 0
    ? 0
    : Math.round((item.completions / item.starts) * 100);
  const signal = classifyPlaytestLevel(item);
  const label = signal === "difficulty-signal"
    ? "possível pico"
    : signal === "stable"
      ? "amostra estável"
      : "coletando dados";
  return `${completionRate}% concluídas · ${item.restarts} reinícios · ${item.abandons} abandonos · ${item.hints} dicas · ${label}`;
}

function find<T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento ausente: ${selector}`);
  return element;
}
