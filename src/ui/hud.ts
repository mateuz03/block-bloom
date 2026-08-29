import {
  emitAppNavigation,
  emitGameAction,
  emitGameSettings,
  emitSystemBackRequest,
  emitTutorialReset,
  emitUiInputBlock,
  gameEvents,
  type AppNavigation,
  type PuzzleSnapshot,
  type SettingsPanelRequest,
  type SystemBackRequest,
} from "../game/events";
import {
  loadGameSettings,
  saveGameSettings,
  updateGameSettings,
} from "../storage/gameSettings";
import { playGameSound } from "../audio/gameAudio";
import { resetTutorialProgress } from "../storage/tutorialProgress";

/**
 * Garante que apenas uma instância do HUD exista para cada elemento raiz.
 * Isso também evita listeners duplicados durante HMR ou recriação da interface.
 */
const hudCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createHud(root: HTMLElement): () => void {
  hudCleanupByRoot.get(root)?.();

  const controller = new AbortController();
  const { signal } = controller;

  let destroyed = false;
  let winOpen = false;
  let settingsOpen = false;
  let tutorialReviewOpen = false;
  let settingsReturnTarget: "home" | "game" = "game";

  root.innerHTML = `
    <header class="hud" data-game-ui>
      <div class="brand">
        <i aria-hidden="true"></i>
        <span>BLOCK<br><strong>BLOOM</strong></span>
      </div>

      <div class="level-selector" aria-label="Selecionar fase">
        <button
          type="button"
          class="level-arrow"
          data-previous
          aria-label="Fase anterior"
        >
          &lsaquo;
        </button>

        <div class="level-chip">
          <small>FASE</small>
          <strong data-level>1</strong>
          <em data-level-name></em>
        </div>

        <button
          type="button"
          class="level-arrow"
          data-next-level
          aria-label="Próxima fase"
        >
          &rsaquo;
        </button>
      </div>

      <div class="hud__actions">
        <button
          type="button"
          class="icon-button"
          data-undo
          aria-label="Desfazer último movimento"
        >
          &#8630;
        </button>

        <button
          type="button"
          class="icon-button"
          data-restart
          aria-label="Reiniciar fase"
        >
          &#8634;
        </button>

        <button
          type="button"
          class="icon-button icon-button--settings"
          data-settings-button
          aria-label="Abrir configurações"
          aria-expanded="false"
          aria-controls="settings-panel"
        >
          &#9881;
        </button>
      </div>
    </header>

    <aside class="moves" data-game-ui>
      <small>MOVIMENTOS</small>
      <strong data-moves aria-live="polite">0</strong>
      <span>meta <b data-ideal>0</b></span>
    </aside>

    <section
      class="win"
      data-win
      data-game-ui
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
      aria-hidden="true"
    >
      <div class="win__flower" aria-hidden="true">
        <i></i><i></i><i></i><i></i><b></b>
      </div>

      <p>FASE CONCLUÍDA</p>
      <h2 id="win-title" data-win-title>Perfeito!</h2>

      <div class="win__stats" aria-label="Resultado da fase">
        <span>
          <small>USADOS</small>
          <strong data-final-moves>0</strong>
        </span>

        <span>
          <small>IDEAL</small>
          <strong data-final-ideal>0</strong>
        </span>

        <span>
          <small>MELHOR</small>
          <strong data-best>—</strong>
        </span>
      </div>

      <div class="win__actions">
        <button
          type="button"
          class="win__button win__button--secondary"
          data-replay
        >
          Repetir
        </button>

        <button
          type="button"
          class="win__button"
          data-next
        >
          Próxima fase
        </button>
      </div>
    </section>

    <section
      class="settings-panel"
      id="settings-panel"
      data-settings-panel
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      hidden
    >
      <header class="settings-panel__header">
        <div>
          <small>JOGO</small>
          <h2 id="settings-title">Configurações</h2>
        </div>

        <button
          type="button"
          class="settings-panel__close"
          data-settings-close
          aria-label="Fechar configurações"
        >
          &times;
        </button>
      </header>

      <label class="setting-row">
        <span>
          <strong>Música</strong>
          <small>Ambiente tranquilo durante o jogo</small>
        </span>

        <input
          type="checkbox"
          data-music-setting
        >

        <i aria-hidden="true"></i>
      </label>

      <label class="setting-row">
        <span>
          <strong>Som</strong>
          <small>Efeitos de blocos, flores e interface</small>
        </span>

        <input
          type="checkbox"
          data-sound-effects-setting
        >

        <i aria-hidden="true"></i>
      </label>

      <label class="setting-row">
        <span>
          <strong>Vibração</strong>
          <small>Feedback tátil em toques, encaixes e vitórias</small>
        </span>

        <input
          type="checkbox"
          data-vibration-setting
        >

        <i aria-hidden="true"></i>
      </label>

      <label class="setting-row">
        <span>
          <strong>Reduzir efeitos</strong>
          <small>Remove flashes, pulsos e movimentos extras</small>
        </span>

        <input
          type="checkbox"
          data-effects-setting
        >

        <i aria-hidden="true"></i>
      </label>

      <button
        type="button"
        class="settings-guide-button"
        data-tutorial-review-button
        aria-expanded="false"
        aria-controls="tutorial-review"
      >
        Como jogar
      </button>

      <section
        class="tutorial-review"
        id="tutorial-review"
        data-tutorial-review
        hidden
      >
        <div class="tutorial-review__item">
          <b aria-hidden="true">&#8596;</b>
          <span>
            <strong>Arraste e combine</strong>
            <small>Leve cada peça à saída com a mesma cor e símbolo.</small>
          </span>
        </div>

        <div class="tutorial-review__item">
          <b aria-hidden="true">&#8630;</b>
          <span>
            <strong>Desfaça sem medo</strong>
            <small>Use o botão de voltar para desfazer o último movimento.</small>
          </span>
        </div>

        <div class="tutorial-review__item">
          <b aria-hidden="true">&#10047;</b>
          <span>
            <strong>Flores e vinhas</strong>
            <small>Uma saída florida remove as vinhas ligadas a ela.</small>
          </span>
        </div>

        <button
          type="button"
          class="tutorial-reset-button"
          data-tutorial-reset
        >
          Refazer dicas guiadas
        </button>
        <small
          class="tutorial-reset-status"
          data-tutorial-reset-status
          aria-live="polite"
        ></small>
      </section>

      <button
        type="button"
        class="settings-home-button"
        data-settings-home
      >
        Voltar ao início
      </button>
    </section>
  `;

  const win = find<HTMLElement>(root, "[data-win]");
  const winTitle = find<HTMLElement>(root, "[data-win-title]");
  const settingsPanel = find<HTMLElement>(
    root,
    "[data-settings-panel]",
  );
  const gameRoot = find<HTMLElement>(document, "#game-root");
  const gameUiElements = Array.from(
    root.querySelectorAll<HTMLElement>("[data-game-ui]"),
  );
  let modalBackground: HTMLElement[] = [];
  const previousBackgroundInert = new Map<HTMLElement, boolean>();

  const level = find<HTMLElement>(root, "[data-level]");
  const levelName = find<HTMLElement>(root, "[data-level-name]");
  const moves = find<HTMLElement>(root, "[data-moves]");
  const ideal = find<HTMLElement>(root, "[data-ideal]");
  const finalMoves = find<HTMLElement>(
    root,
    "[data-final-moves]",
  );
  const finalIdeal = find<HTMLElement>(
    root,
    "[data-final-ideal]",
  );
  const best = find<HTMLElement>(root, "[data-best]");

  const next = find<HTMLButtonElement>(root, "[data-next]");
  const replay = find<HTMLButtonElement>(root, "[data-replay]");
  const undo = find<HTMLButtonElement>(root, "[data-undo]");
  const restart = find<HTMLButtonElement>(root, "[data-restart]");
  const previous = find<HTMLButtonElement>(
    root,
    "[data-previous]",
  );
  const nextLevel = find<HTMLButtonElement>(
    root,
    "[data-next-level]",
  );
  const settingsButton = find<HTMLButtonElement>(
    root,
    "[data-settings-button]",
  );
  const settingsClose = find<HTMLButtonElement>(
    root,
    "[data-settings-close]",
  );
  const settingsHome = find<HTMLButtonElement>(
    root,
    "[data-settings-home]",
  );
  const vibrationSetting = find<HTMLInputElement>(
    root,
    "[data-vibration-setting]",
  );
  const musicSetting = find<HTMLInputElement>(
    root,
    "[data-music-setting]",
  );
  const soundEffectsSetting = find<HTMLInputElement>(
    root,
    "[data-sound-effects-setting]",
  );
  const effectsSetting = find<HTMLInputElement>(
    root,
    "[data-effects-setting]",
  );
  const tutorialReviewButton = find<HTMLButtonElement>(
    root,
    "[data-tutorial-review-button]",
  );
  const tutorialReview = find<HTMLElement>(
    root,
    "[data-tutorial-review]",
  );
  const tutorialResetButton = find<HTMLButtonElement>(
    root,
    "[data-tutorial-reset]",
  );
  const tutorialResetStatus = find<HTMLElement>(
    root,
    "[data-tutorial-reset-status]",
  );

  let settings = loadGameSettings();

  musicSetting.checked = settings.musicEnabled;
  soundEffectsSetting.checked = settings.soundEffectsEnabled;
  vibrationSetting.checked = settings.vibrationEnabled;
  effectsSetting.checked = settings.reducedEffects;

  /**
   * Usa o atributo diretamente para continuar compatível com projetos
   * cujo TypeScript ainda não reconhece HTMLElement.inert.
   */
  const setElementInert = (
    element: HTMLElement,
    inert: boolean,
  ): void => {
    if (inert) {
      element.setAttribute("inert", "");
      return;
    }

    element.removeAttribute("inert");
  };

  const setTutorialReviewOpen = (open: boolean): void => {
    tutorialReviewOpen = open;
    tutorialReview.hidden = !open;
    setElementInert(tutorialReview, !open);
    tutorialReviewButton.setAttribute("aria-expanded", String(open));
    if (!open) tutorialResetStatus.textContent = "";
  };

  const focusStableControl = (): void => {
    if (destroyed) {
      return;
    }

    if (root.dataset.appScreen === "home") {
      root.querySelector<HTMLButtonElement>("[data-continue]")?.focus();
      return;
    }

    if (root.dataset.appScreen === "level-select") {
      root.querySelector<HTMLButtonElement>("[data-levels-back]")?.focus();
      return;
    }

    if (!restart.disabled) {
      restart.focus();
      return;
    }

    settingsButton.focus();
  };

  const setModalBackgroundInert = (inert: boolean): void => {
    if (inert) {
      modalBackground = [
        gameRoot,
        ...Array.from(root.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child !== settingsPanel,
        ),
      ];
      modalBackground.forEach((element) => {
        previousBackgroundInert.set(
          element,
          element.hasAttribute("inert"),
        );
        setElementInert(element, true);
      });
      return;
    }

    modalBackground.forEach((element) => {
      setElementInert(
        element,
        previousBackgroundInert.get(element) ?? false,
      );
    });
    previousBackgroundInert.clear();
    modalBackground = [];
  };

  const setSettingsOpen = (
    open: boolean,
    restoreFocus = true,
    returnTarget = settingsReturnTarget,
  ): void => {
    if (settingsOpen === open) return;

    const activeElementWasInside =
      document.activeElement !== null &&
      settingsPanel.contains(document.activeElement);

    settingsOpen = open;
    if (!open && tutorialReviewOpen) setTutorialReviewOpen(false);
    if (open) settingsReturnTarget = returnTarget;
    settingsPanel.hidden = !open;
    setElementInert(settingsPanel, !open);

    settingsButton.setAttribute(
      "aria-expanded",
      String(open),
    );

    if (open) {
      setModalBackgroundInert(true);
      emitUiInputBlock({ source: "settings", blocked: true });
      queueMicrotask(() => {
        if (!destroyed && settingsOpen) settingsClose.focus();
      });
      return;
    }

    setModalBackgroundInert(false);
    emitUiInputBlock({ source: "settings", blocked: false });

    if (restoreFocus && activeElementWasInside) {
      if (settingsReturnTarget === "home") {
        root.querySelector<HTMLButtonElement>("[data-home-settings]")?.focus();
      } else {
        settingsButton.focus();
      }
    }
  };

  const setGameplayUiVisible = (visible: boolean): void => {
    gameUiElements.forEach((element) => {
      element.hidden = !visible;
      setElementInert(element, !visible);
    });
    if (!visible) setWinOpen(false);
  };

  const setWinOpen = (open: boolean): void => {
    const wasOpen = winOpen;
    const activeElementWasInside =
      document.activeElement !== null &&
      win.contains(document.activeElement);

    winOpen = open;

    win.classList.toggle("visible", open);
    win.setAttribute("aria-hidden", String(!open));
    setElementInert(win, !open);

    if (open && !wasOpen) {
      if (settingsOpen) {
        setSettingsOpen(false, false);
      }

      queueMicrotask(() => {
        if (!destroyed && winOpen) {
          next.focus();
        }
      });

      return;
    }

    if (!open && wasOpen && activeElementWasInside) {
      queueMicrotask(focusStableControl);
    }
  };

  const saveSettingChanges = (): void => {
    settings = updateGameSettings(settings, {
      musicEnabled: musicSetting.checked,
      soundEffectsEnabled: soundEffectsSetting.checked,
      vibrationEnabled: vibrationSetting.checked,
      reducedEffects: effectsSetting.checked,
    });

    try {
      saveGameSettings(settings);
    } catch (error) {
      console.error(
        "Não foi possível salvar as configurações do jogo.",
        error,
      );
    }

    /*
     * Mesmo que a persistência falhe, a configuração continua sendo
     * aplicada durante a sessão atual.
     */
    emitGameSettings(settings);
  };

  const renderPuzzleState = (
    state: PuzzleSnapshot,
  ): void => {
    level.textContent = `${state.level}/${state.totalLevels}`;
    levelName.textContent = state.levelName;

    moves.textContent = String(state.moves);
    ideal.textContent = String(state.idealMoves);

    finalMoves.textContent = String(state.moves);
    finalIdeal.textContent = String(state.idealMoves);

    best.textContent =
      state.bestMoves === undefined
        ? "—"
        : String(state.bestMoves);

    const reachedIdeal =
      state.moves <= state.idealMoves;

    winTitle.textContent = reachedIdeal
      ? "Perfeito!"
      : "Muito bem!";

    win.classList.toggle("win--ideal", reachedIdeal);

    next.textContent =
      state.level === state.totalLevels
        ? "Jogar novamente"
        : "Próxima fase";

    undo.disabled =
      state.inputLocked || !state.canUndo;

    restart.disabled = state.inputLocked;
    replay.disabled = state.inputLocked;

    previous.disabled =
      state.inputLocked || !state.canGoPrevious;

    nextLevel.disabled =
      state.inputLocked || !state.canGoNext;

    next.disabled = state.inputLocked;

    const showWin =
      state.won && !state.inputLocked;

    setWinOpen(showWin);
  };

  const handlePuzzleState = (event: Event): void => {
    const puzzleEvent =
      event as CustomEvent<PuzzleSnapshot>;

    if (!puzzleEvent.detail) {
      console.warn(
        "Evento puzzle-state recebido sem snapshot.",
      );
      return;
    }

    renderPuzzleState(puzzleEvent.detail);
  };

  const handleAppNavigation = (
    event: CustomEvent<AppNavigation>,
  ): void => {
    setGameplayUiVisible(event.detail.screen === "game");
  };

  const handleSettingsRequest = (
    event: CustomEvent<SettingsPanelRequest>,
  ): void => {
    setSettingsOpen(
      event.detail.open,
      true,
      event.detail.source,
    );
  };

  const handleSystemBackRequest = (
    event: CustomEvent<SystemBackRequest>,
  ): void => {
    if (!settingsOpen) return;
    event.detail.claim(100, () => setSettingsOpen(false));
  };

  const handleKeyDown = (
    event: KeyboardEvent,
  ): void => {
    if (!settingsOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      emitSystemBackRequest();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      settingsPanel.querySelectorAll<HTMLElement>(
        "button, input, summary, [tabindex]:not([tabindex='-1'])",
      ),
    ).filter(
      (element) =>
        !element.matches(":disabled") && element.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  undo.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("undo");
    },
    { signal },
  );

  restart.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("restart");
    },
    { signal },
  );

  replay.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("restart");
    },
    { signal },
  );

  previous.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("previous-level");
    },
    { signal },
  );

  nextLevel.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("next-level");
    },
    { signal },
  );

  /*
   * A lógica do jogo deve interpretar "next-level" na última fase
   * como retorno à primeira fase, pois o botão mostra
   * "Jogar novamente".
   */
  next.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      emitGameAction("next-level");
    },
    { signal },
  );

  settingsButton.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      setSettingsOpen(!settingsOpen, true, "game");
    },
    { signal },
  );

  settingsClose.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      setSettingsOpen(false);
    },
    { signal },
  );

  settingsHome.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      setSettingsOpen(false, false);
      emitAppNavigation({ screen: "home" });
    },
    { signal },
  );

  tutorialReviewButton.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      setTutorialReviewOpen(!tutorialReviewOpen);
    },
    { signal },
  );

  tutorialResetButton.addEventListener(
    "click",
    () => {
      playGameSound("ui");
      resetTutorialProgress();
      emitTutorialReset();
      tutorialResetStatus.textContent =
        "As dicas guiadas serão mostradas novamente.";
    },
    { signal },
  );

  vibrationSetting.addEventListener(
    "change",
    saveSettingChanges,
    { signal },
  );

  musicSetting.addEventListener(
    "change",
    saveSettingChanges,
    { signal },
  );

  soundEffectsSetting.addEventListener(
    "change",
    () => {
      saveSettingChanges();
      playGameSound("ui");
    },
    { signal },
  );

  effectsSetting.addEventListener(
    "change",
    saveSettingChanges,
    { signal },
  );

  window.addEventListener(
    "keydown",
    handleKeyDown,
    { signal },
  );

  gameEvents.addEventListener(
    "puzzle-state",
    handlePuzzleState,
    { signal },
  );
  gameEvents.addEventListener(
    "app-navigation",
    handleAppNavigation,
    { signal },
  );
  gameEvents.addEventListener(
    "settings-panel-request",
    handleSettingsRequest,
    { signal },
  );
  gameEvents.addEventListener(
    "system-back-request",
    handleSystemBackRequest,
    { signal },
  );

  /*
   * Estado inicial dos componentes ocultos.
   */
  setElementInert(win, true);
  setElementInert(settingsPanel, true);
  setElementInert(tutorialReview, true);
  setGameplayUiVisible(false);

  /*
   * Aplica as configurações persistidas após os módulos do ciclo
   * síncrono atual terem oportunidade de registrar seus listeners.
   */
  queueMicrotask(() => {
    if (!destroyed) {
      emitGameSettings(settings);
    }
  });

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    if (settingsOpen) setSettingsOpen(false, false);
    destroyed = true;
    controller.abort();

    if (hudCleanupByRoot.get(root) === destroy) {
      hudCleanupByRoot.delete(root);
    }

    root.replaceChildren();
  };

  hudCleanupByRoot.set(root, destroy);

  return destroy;
}

function find<T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento ausente: ${selector}`);
  }

  return element;
}
