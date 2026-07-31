import { emitGameAction, gameEvents, type PuzzleSnapshot } from "../game/events";

export function createHud(root: HTMLElement): void {
  root.innerHTML = `
    <header class="hud">
      <div class="brand"><i></i><span>BLOCK<br><strong>BLOOM</strong></span></div>
      <div class="level-selector" aria-label="Selecionar fase">
        <button class="level-arrow" data-previous aria-label="Fase anterior">‹</button>
        <div class="level-chip"><small>FASE</small><strong data-level>1</strong></div>
        <button class="level-arrow" data-next-level aria-label="Próxima fase">›</button>
      </div>
      <button class="icon-button" data-restart aria-label="Reiniciar fase">↻</button>
    </header>
    <aside class="moves"><small>MOVIMENTOS</small><strong data-moves>0</strong></aside>
    <section class="intro" data-intro>
      <p>PUZZLE DE CORES</p>
      <h1>Block Bloom</h1>
      <span>Arraste cada bloco até a saída da mesma cor.</span>
      <button data-start>Começar</button>
    </section>
    <section class="win" data-win>
      <div class="win__burst">✦</div>
      <p>FASE CONCLUÍDA</p>
      <h2>Perfeito!</h2>
      <span><strong data-final-moves>0</strong> movimentos</span>
      <button data-next>Próxima fase</button>
    </section>
    <div class="hint" data-hint>Arraste os blocos para fora pelas saídas coloridas</div>
  `;

  const intro = find<HTMLElement>(root, "[data-intro]");
  const win = find<HTMLElement>(root, "[data-win]");
  const level = find(root, "[data-level]");
  const moves = find(root, "[data-moves]");
  const finalMoves = find(root, "[data-final-moves]");
  const next = find<HTMLButtonElement>(root, "[data-next]");
  let latest: PuzzleSnapshot | undefined;

  find<HTMLButtonElement>(root, "[data-start]").addEventListener("click", () => {
    intro.classList.add("hidden");
  });
  find<HTMLButtonElement>(root, "[data-restart]").addEventListener("click", () => emitGameAction("restart"));
  find<HTMLButtonElement>(root, "[data-previous]").addEventListener("click", () => emitGameAction("previous-level"));
  find<HTMLButtonElement>(root, "[data-next-level]").addEventListener("click", () => emitGameAction("next-level"));
  next.addEventListener("click", () => emitGameAction("next-level"));

  gameEvents.addEventListener("puzzle-state", (event) => {
    latest = event.detail;
    level.textContent = `${latest.level}/${latest.totalLevels}`;
    moves.textContent = String(latest.moves);
    finalMoves.textContent = String(latest.moves);
    win.classList.toggle("visible", latest.won);
    next.textContent = latest.level === latest.totalLevels ? "Jogar novamente" : "Próxima fase";
  });
}

function find<T extends Element = Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento ausente: ${selector}`);
  return element;
}
