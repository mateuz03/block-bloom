import { emitGameAction, gameEvents, type PuzzleSnapshot } from "../game/events";

export function createHud(root: HTMLElement): void {
  root.innerHTML = `
    <header class="hud">
      <div class="brand"><i></i><span>BLOCK<br><strong>BLOOM</strong></span></div>
      <div class="level-selector" aria-label="Selecionar fase">
        <button class="level-arrow" data-previous aria-label="Fase anterior">&lsaquo;</button>
        <div class="level-chip"><small>FASE</small><strong data-level>1</strong><em data-level-name></em></div>
        <button class="level-arrow" data-next-level aria-label="Próxima fase">&rsaquo;</button>
      </div>
      <div class="hud__actions">
        <button class="icon-button" data-undo aria-label="Desfazer último movimento">&#8630;</button>
        <button class="icon-button" data-restart aria-label="Reiniciar fase">&#8634;</button>
      </div>
    </header>
    <aside class="moves">
      <small>MOVIMENTOS</small><strong data-moves>0</strong>
      <span>meta <b data-ideal>0</b></span>
    </aside>
    <section class="intro" data-intro>
      <p>PUZZLE DE CORES</p>
      <h1>Block Bloom</h1>
      <span>Arraste cada bloco até a saída da mesma cor.</span>
      <button data-start>Começar</button>
    </section>
    <section class="win" data-win>
      <div class="win__burst">&#10022;</div>
      <p>FASE CONCLUÍDA</p>
      <h2>Perfeito!</h2>
      <div class="win__stats" aria-label="Resultado da fase">
        <span><small>USADOS</small><strong data-final-moves>0</strong></span>
        <span><small>IDEAL</small><strong data-final-ideal>0</strong></span>
        <span><small>MELHOR</small><strong data-best>—</strong></span>
      </div>
      <button data-next>Próxima fase</button>
    </section>
    <div class="hint" data-hint>Arraste os blocos para fora pelas saídas coloridas</div>
  `;

  const intro = find<HTMLElement>(root, "[data-intro]");
  const win = find<HTMLElement>(root, "[data-win]");
  const level = find(root, "[data-level]");
  const levelName = find(root, "[data-level-name]");
  const moves = find(root, "[data-moves]");
  const ideal = find(root, "[data-ideal]");
  const finalMoves = find(root, "[data-final-moves]");
  const finalIdeal = find(root, "[data-final-ideal]");
  const best = find(root, "[data-best]");
  const next = find<HTMLButtonElement>(root, "[data-next]");
  const undo = find<HTMLButtonElement>(root, "[data-undo]");
  const restart = find<HTMLButtonElement>(root, "[data-restart]");
  const previous = find<HTMLButtonElement>(root, "[data-previous]");
  const nextLevel = find<HTMLButtonElement>(root, "[data-next-level]");

  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("capture") === "1") {
    intro.classList.add("hidden");
  }

  find<HTMLButtonElement>(root, "[data-start]").addEventListener("click", () => intro.classList.add("hidden"));
  undo.addEventListener("click", () => emitGameAction("undo"));
  restart.addEventListener("click", () => emitGameAction("restart"));
  previous.addEventListener("click", () => emitGameAction("previous-level"));
  nextLevel.addEventListener("click", () => emitGameAction("next-level"));
  next.addEventListener("click", () => emitGameAction("next-level"));

  gameEvents.addEventListener("puzzle-state", (event) => {
    const state: PuzzleSnapshot = event.detail;
    level.textContent = `${state.level}/${state.totalLevels}`;
    levelName.textContent = state.levelName;
    moves.textContent = String(state.moves);
    ideal.textContent = String(state.idealMoves);
    finalMoves.textContent = String(state.moves);
    finalIdeal.textContent = String(state.idealMoves);
    best.textContent = state.bestMoves === undefined ? "—" : String(state.bestMoves);
    win.classList.toggle("visible", state.won && !state.inputLocked);
    next.textContent = state.level === state.totalLevels ? "Jogar novamente" : "Próxima fase";
    undo.disabled = state.inputLocked || !state.canUndo;
    restart.disabled = state.inputLocked;
    previous.disabled = state.inputLocked || !state.canGoPrevious;
    nextLevel.disabled = state.inputLocked || !state.canGoNext;
    next.disabled = state.inputLocked;
  });
}

function find<T extends Element = Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento ausente: ${selector}`);
  return element;
}
