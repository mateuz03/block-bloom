import {
  gameEvents,
  type AppNavigation,
  type SystemBackRequest,
} from "../game/events";
import type { PlaytestController } from "../playtest/PlaytestController";
import type {
  PlaytestLevelReport,
  PlaytestReport,
} from "../playtest/playtestReport";

const panelCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createPlaytestPanel(
  root: HTMLElement,
  playtest: PlaytestController,
): () => void {
  panelCleanupByRoot.get(root)?.();
  const controller = new AbortController();
  const { signal } = controller;
  const homeActions = find<HTMLElement>(root, ".home-actions");
  const gameRoot = document.querySelector<HTMLElement>("#game-root");
  let destroyed = false;
  let open = false;
  let clearPending = false;
  const previousInert = new Map<HTMLElement, boolean>();

  const launch = document.createElement("button");
  launch.type = "button";
  launch.className = "playtest-launch";
  launch.textContent = "Painel de Teste";
  launch.setAttribute("aria-haspopup", "dialog");
  homeActions.append(launch);

  const panel = document.createElement("section");
  panel.className = "playtest-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "playtest-panel-title");
  panel.innerHTML = `
    <header class="playtest-panel__header">
      <div>
        <small>FERRAMENTA LOCAL · BUILD DE TESTE</small>
        <h2 id="playtest-panel-title">PLAYTEST</h2>
      </div>
      <button type="button" data-playtest-close aria-label="Fechar painel">×</button>
    </header>

    <div class="playtest-panel__content">
      <section class="playtest-panel__summary" aria-label="Resumo geral">
        <div><small>Sessão atual</small><strong data-playtest-session>—</strong></div>
        <div><small>Sessões</small><strong data-playtest-sessions>0</strong></div>
        <div><small>Runs</small><strong data-playtest-runs>0</strong></div>
        <div><small>Conclusões</small><strong data-playtest-completed>0</strong></div>
        <div><small>Tempo ativo</small><strong data-playtest-time>0s</strong></div>
      </section>

      <div class="playtest-panel__actions" aria-label="Ações de playtest">
        <button type="button" data-playtest-new-session>Iniciar nova sessão</button>
        <button type="button" data-playtest-report>Relatório</button>
        <button type="button" data-playtest-export>Exportar JSON</button>
        <button type="button" data-playtest-copy>Copiar JSON</button>
        <button type="button" class="playtest-panel__danger" data-playtest-clear>Limpar dados</button>
        <button type="button" data-playtest-back>Voltar</button>
      </div>

      <p class="playtest-panel__privacy">
        Dados privados neste aparelho. Nenhum nome, e-mail, localização,
        identificador pessoal ou envio para servidor.
      </p>
      <p class="playtest-panel__status" data-playtest-status aria-live="polite"></p>
      <textarea class="playtest-panel__export-text" data-playtest-export-text readonly hidden aria-label="JSON exportável"></textarea>

      <div data-playtest-report-body tabindex="-1">
        <section class="playtest-panel__attention" aria-labelledby="playtest-attention-title">
          <h3 id="playtest-attention-title">ATENÇÃO</h3>
          <div data-playtest-attention></div>
        </section>

        <section class="playtest-panel__section" aria-labelledby="playtest-levels-title">
          <h3 id="playtest-levels-title">RELATÓRIO POR FASE</h3>
          <div class="playtest-level-list" data-playtest-levels></div>
        </section>

        <section class="playtest-panel__section" aria-labelledby="playtest-bloom-title">
          <h3 id="playtest-bloom-title">BLOOM ONBOARDING</h3>
          <div class="playtest-bloom-list" data-playtest-bloom></div>
        </section>

        <section class="playtest-panel__section" aria-labelledby="playtest-diagnostic-title">
          <h3 id="playtest-diagnostic-title">DIAGNÓSTICO AUTOMÁTICO</h3>
          <pre data-playtest-diagnostic></pre>
        </section>
      </div>
    </div>
  `;
  root.append(panel);

  const close = find<HTMLButtonElement>(panel, "[data-playtest-close]");
  const back = find<HTMLButtonElement>(panel, "[data-playtest-back]");
  const newSession = find<HTMLButtonElement>(panel, "[data-playtest-new-session]");
  const reportButton = find<HTMLButtonElement>(panel, "[data-playtest-report]");
  const exportButton = find<HTMLButtonElement>(panel, "[data-playtest-export]");
  const copyButton = find<HTMLButtonElement>(panel, "[data-playtest-copy]");
  const clearButton = find<HTMLButtonElement>(panel, "[data-playtest-clear]");
  const reportBody = find<HTMLElement>(panel, "[data-playtest-report-body]");
  const status = find<HTMLElement>(panel, "[data-playtest-status]");
  const exportText = find<HTMLTextAreaElement>(panel, "[data-playtest-export-text]");
  const sessionValue = find<HTMLElement>(panel, "[data-playtest-session]");
  const sessionsValue = find<HTMLElement>(panel, "[data-playtest-sessions]");
  const runsValue = find<HTMLElement>(panel, "[data-playtest-runs]");
  const completedValue = find<HTMLElement>(panel, "[data-playtest-completed]");
  const timeValue = find<HTMLElement>(panel, "[data-playtest-time]");
  const attention = find<HTMLElement>(panel, "[data-playtest-attention]");
  const levelList = find<HTMLElement>(panel, "[data-playtest-levels]");
  const bloomList = find<HTMLElement>(panel, "[data-playtest-bloom]");
  const diagnostic = find<HTMLElement>(panel, "[data-playtest-diagnostic]");

  const render = (): void => {
    const report = playtest.report();
    const currentSession = playtest.currentSession();
    sessionValue.textContent = currentSession
      ? `#${report.sessions}`
      : "automática ao jogar";
    sessionsValue.textContent = String(report.sessions);
    runsValue.textContent = String(report.runs);
    completedValue.textContent = String(report.completedRuns);
    timeValue.textContent = formatDuration(report.totalActiveDurationMs);
    renderAttention(attention, report);
    levelList.replaceChildren(...report.levels.map(createLevelCard));
    bloomList.replaceChildren(
      ...report.bloomOnboarding.map(createBloomCard),
    );
    diagnostic.textContent = playtest.diagnosticText();
  };

  const setBackgroundInert = (inert: boolean): void => {
    const elements = [
      ...(gameRoot ? [gameRoot] : []),
      ...Array.from(root.children).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== panel,
      ),
    ];
    if (inert) {
      for (const element of elements) {
        previousInert.set(element, element.hasAttribute("inert"));
        element.setAttribute("inert", "");
      }
      return;
    }
    for (const [element, wasInert] of previousInert) {
      element.toggleAttribute("inert", wasInert);
    }
    previousInert.clear();
  };

  const setOpen = (value: boolean): void => {
    if (open === value) return;
    open = value;
    clearPending = false;
    clearButton.textContent = "Limpar dados";
    exportText.hidden = true;
    panel.hidden = !open;
    setBackgroundInert(open);
    if (open) {
      render();
      queueMicrotask(() => close.focus());
    } else {
      queueMicrotask(() => launch.focus());
    }
  };

  launch.addEventListener("click", () => setOpen(true), { signal });
  close.addEventListener("click", () => setOpen(false), { signal });
  back.addEventListener("click", () => setOpen(false), { signal });

  newSession.addEventListener("click", () => {
    playtest.startNewSession();
    status.textContent = "Nova sessão iniciada. Entregue o aparelho ao próximo jogador.";
    render();
  }, { signal });

  reportButton.addEventListener("click", () => {
    render();
    reportBody.focus();
    reportBody.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, { signal });

  exportButton.addEventListener("click", () => {
    const json = playtest.exportJson();
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `block-bloom-playtest-${date}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    status.textContent = "Exportação JSON preparada. Se o download não abrir no celular, use Copiar JSON.";
  }, { signal });

  copyButton.addEventListener("click", async () => {
    const json = playtest.exportJson();
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(json);
      exportText.hidden = true;
      status.textContent = "JSON copiado para a área de transferência.";
    } catch {
      exportText.value = json;
      exportText.hidden = false;
      exportText.focus();
      exportText.select();
      status.textContent = "Cópia automática indisponível. O JSON está selecionado abaixo.";
    }
  }, { signal });

  clearButton.addEventListener("click", () => {
    if (!clearPending) {
      clearPending = true;
      clearButton.textContent = "Confirmar limpeza";
      status.textContent = "Toque novamente para apagar somente os dados de playtest.";
      return;
    }
    playtest.clear();
    clearPending = false;
    clearButton.textContent = "Limpar dados";
    status.textContent = "Dados de playtest removidos. Progresso e configurações foram preservados.";
    render();
  }, { signal });

  gameEvents.addEventListener("app-navigation", (
    event: CustomEvent<AppNavigation>,
  ) => {
    launch.hidden = event.detail.screen !== "home";
    if (event.detail.screen !== "home" && open) setOpen(false);
  }, { signal });

  gameEvents.addEventListener("system-back-request", (
    event: CustomEvent<SystemBackRequest>,
  ) => {
    if (open) event.detail.claim(200, () => setOpen(false));
  }, { signal });

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    if (open) setBackgroundInert(false);
    controller.abort();
    panel.remove();
    launch.remove();
    if (panelCleanupByRoot.get(root) === destroy) {
      panelCleanupByRoot.delete(root);
    }
  };
  panelCleanupByRoot.set(root, destroy);
  return destroy;
}

function renderAttention(root: HTMLElement, report: PlaytestReport): void {
  if (report.attention.length === 0) {
    root.textContent = report.runs < 3
      ? "Colete ao menos 3 runs por fase para ativar os diagnósticos."
      : "Nenhum sinal ultrapassou as heurísticas atuais.";
    return;
  }
  root.replaceChildren(
    ...report.attention.map((level) => {
      const item = document.createElement("article");
      const title = document.createElement("strong");
      title.textContent = `Fase ${level.levelNumber} — ${level.name}`;
      const text = document.createElement("span");
      text.textContent = level.diagnostic.join(" · ");
      item.append(title, text);
      return item;
    }),
  );
}

function createLevelCard(level: PlaytestLevelReport): HTMLElement {
  const card = document.createElement("article");
  card.className = "playtest-level-card";
  card.innerHTML = `
    <header><strong>FASE ${level.levelNumber}</strong><span>${level.name}</span></header>
    <dl>
      <div><dt>Runs</dt><dd>${level.runs}</dd></div>
      <div><dt>Conclusões</dt><dd>${level.completions}</dd></div>
      <div><dt>Abandonos</dt><dd>${level.abandons}</dd></div>
      <div><dt>Taxa</dt><dd>${formatPercent(level.completionRate)}</dd></div>
      <div><dt>Tempo médio</dt><dd>${formatOptionalDuration(level.averageDurationMs)}</dd></div>
      <div><dt>Mediana</dt><dd>${formatOptionalDuration(level.medianDurationMs)}</dd></div>
      <div><dt>Movimentos</dt><dd>${formatNumber(level.averageMoves)} / ${level.idealMoves}</dd></div>
      <div><dt>Mov./ideal</dt><dd>${formatRatio(level.movesPerIdeal)}</dd></div>
      <div><dt>Undo</dt><dd>${formatNumber(level.averageUndo)}</dd></div>
      <div><dt>Restart</dt><dd>${formatNumber(level.averageRestart)}</dd></div>
      <div><dt>Inválidos</dt><dd>${formatNumber(level.averageInvalidDrops)}</dd></div>
      <div><dt>1ª / replay</dt><dd>${level.firstAttempts} / ${level.replays}</dd></div>
    </dl>
    <p class="playtest-level-card__efficiency">
      Eficiência: ideal ${level.efficiency.ideal} · +25% ${level.efficiency.upTo25Percent} · +25–50% ${level.efficiency.from25To50Percent} · +50–100% ${level.efficiency.from50To100Percent} · &gt;2x ${level.efficiency.aboveDouble}
    </p>
  `;
  if (level.flags.length > 0) card.classList.add("playtest-level-card--attention");
  return card;
}

function createBloomCard(level: PlaytestLevelReport): HTMLElement {
  const card = document.createElement("article");
  card.innerHTML = `
    <strong>Fase ${level.levelNumber}</strong>
    <span>Primeira Bloom: ${formatOptionalDuration(level.averageFirstBloomAtMs)}</span>
    <span>Movimentos antes: ${formatNumber(level.averageMovesBeforeFirstBloom)}</span>
    <span>Restarts antes: ${formatNumber(level.averageRestartsBeforeFirstBloom)}</span>
  `;
  return card;
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatOptionalDuration(value: number | undefined): string {
  return value === undefined ? "—" : formatDuration(value);
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "—";
  return value.toFixed(1).replace(".0", "").replace(".", ",");
}

function formatRatio(value: number | undefined): string {
  return value === undefined ? "—" : `${formatNumber(value)}x`;
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? "—" : `${Math.round(value * 100)}%`;
}

function find<T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento ausente: ${selector}`);
  return element;
}
