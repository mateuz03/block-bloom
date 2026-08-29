import {
  emitAppNavigation,
  emitSettingsPanelRequest,
  gameEvents,
  type AppNavigation,
  type AppScreen,
  type SystemBackRequest,
} from "../game/events";
import { levels } from "../game/simulation/puzzle";
import { playHaptic } from "../platform/haptics";
import { playGameSound } from "../audio/gameAudio";
import {
  loadGameSettings,
  type GameSettings,
} from "../storage/gameSettings";
import {
  loadPuzzleProgress,
} from "../storage/puzzleProgress";
import {
  clearActivePuzzle,
  loadActivePuzzle,
} from "../storage/activePuzzle";
import {
  canSelectMenuLevel,
  createMainMenuModel,
} from "./mainMenuModel";

const menuCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createMainMenu(root: HTMLElement): () => void {
  menuCleanupByRoot.get(root)?.();

  const controller = new AbortController();
  const { signal } = controller;
  const allowLockedLevels = import.meta.env.DEV;
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let settings = loadGameSettings();
  let progress = loadPuzzleProgress(levels);
  let currentScreen: AppScreen = "home";
  let destroyed = false;

  const layer = document.createElement("div");
  layer.className = "menu-layer";
  layer.innerHTML = `
    <section class="home-screen" data-home-screen aria-labelledby="home-title">
      <button
        type="button"
        class="menu-settings"
        data-home-settings
        aria-label="Abrir configurações"
        aria-controls="settings-panel"
      >
        &#9881;
      </button>

      <div class="home-content">
        <div class="home-identity">
          <p class="home-eyebrow">PUZZLE DE JARDIM</p>
          <h1 class="home-logo" id="home-title">
            <span>BLOCK</span>
            <strong>BLOOM</strong>
          </h1>

          <div class="bloom-mark" aria-hidden="true">
            <i class="bloom-mark__petal bloom-mark__petal--top"></i>
            <i class="bloom-mark__petal bloom-mark__petal--right"></i>
            <i class="bloom-mark__petal bloom-mark__petal--bottom"></i>
            <i class="bloom-mark__petal bloom-mark__petal--left"></i>
            <i class="bloom-mark__block"></i>
            <i class="bloom-mark__leaf bloom-mark__leaf--left"></i>
            <i class="bloom-mark__leaf bloom-mark__leaf--right"></i>
          </div>
        </div>

        <div class="home-actions">
          <button type="button" class="continue-button" data-continue>
            Continuar
          </button>
          <p class="continue-level">
            Fase <strong data-current-level>1</strong>
            <span data-current-name></span>
          </p>

          <button
            type="button"
            class="restart-current-button"
            data-restart-current
            hidden
          >
            Recomeçar fase
          </button>

          <button type="button" class="levels-button" data-show-levels>
            Fases
          </button>

          <p class="home-progress" aria-live="polite">
            <strong data-unlocked-count>1</strong>
            <span>/</span>
            <span data-total-levels>15</span>
            <small>desbloqueadas</small>
          </p>
        </div>
      </div>

      <div class="home-garden" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i>
      </div>
    </section>

    <section
      class="level-select-screen"
      data-level-select-screen
      aria-labelledby="level-select-title"
      hidden
    >
      <header class="level-select-header">
        <button type="button" class="back-button" data-levels-back>
          <span aria-hidden="true">&lsaquo;</span>
          Início
        </button>
        <div>
          <small>SEU JARDIM</small>
          <h2 id="level-select-title">Escolha uma fase</h2>
        </div>
      </header>

      <div class="level-grid" data-level-grid></div>
      <p class="level-select-note">
        Conclua uma fase para desbloquear a próxima.
      </p>
    </section>
  `;
  root.append(layer);

  const home = find<HTMLElement>(layer, "[data-home-screen]");
  const levelSelect = find<HTMLElement>(
    layer,
    "[data-level-select-screen]",
  );
  const continueButton = find<HTMLButtonElement>(layer, "[data-continue]");
  const showLevelsButton = find<HTMLButtonElement>(
    layer,
    "[data-show-levels]",
  );
  const restartCurrentButton = find<HTMLButtonElement>(
    layer,
    "[data-restart-current]",
  );
  const settingsButton = find<HTMLButtonElement>(
    layer,
    "[data-home-settings]",
  );
  const backButton = find<HTMLButtonElement>(layer, "[data-levels-back]");
  const currentLevel = find<HTMLElement>(layer, "[data-current-level]");
  const currentName = find<HTMLElement>(layer, "[data-current-name]");
  const unlockedCount = find<HTMLElement>(layer, "[data-unlocked-count]");
  const totalLevels = find<HTMLElement>(layer, "[data-total-levels]");
  const levelGrid = find<HTMLElement>(layer, "[data-level-grid]");

  const setElementInert = (
    element: HTMLElement,
    inert: boolean,
  ): void => {
    element.toggleAttribute("inert", inert);
  };

  const updateMotionPreference = (): void => {
    root.classList.toggle(
      "reduce-effects",
      settings.reducedEffects || reducedMotionQuery.matches,
    );
  };

  const renderProgress = (): void => {
    progress = loadPuzzleProgress(levels);
    const model = createMainMenuModel(
      progress,
      levels,
      allowLockedLevels,
    );
    const activeSession = loadActivePuzzle(levels);
    const canResume =
      activeSession?.levelId === model.currentLevelId;

    currentLevel.textContent = String(model.currentLevelNumber);
    currentName.textContent = canResume
      ? `Partida salva · ${activeSession.state.moves} movimentos`
      : model.currentLevelName;
    restartCurrentButton.hidden = !canResume;
    restartCurrentButton.disabled = !canResume;
    setElementInert(restartCurrentButton, !canResume);
    unlockedCount.textContent = String(model.highestUnlockedNumber);
    totalLevels.textContent = String(model.totalLevels);
    levelGrid.replaceChildren(
      ...model.levels.map((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "level-card";
        button.dataset.levelId = item.id;
        button.disabled = !item.unlocked;
        button.classList.toggle("level-card--completed", item.completed);
        button.classList.toggle("level-card--current", item.current);
        button.classList.toggle("level-card--locked", !item.unlocked);
        if (item.current) button.setAttribute("aria-current", "step");
        button.setAttribute(
          "aria-label",
          item.unlocked
            ? `Fase ${item.number}, ${item.name}${
                item.bestMoves === undefined
                  ? ""
                  : `, melhor resultado ${item.bestMoves} movimentos`
              }`
            : `Fase ${item.number} bloqueada`,
        );

        const number = document.createElement("strong");
        number.textContent = String(item.number);
        const status = document.createElement("span");
        status.textContent = !item.unlocked
          ? "🔒"
          : item.completed
            ? `✓ ${item.bestMoves}`
            : item.current
              ? "Atual"
              : item.name;
        status.setAttribute("aria-hidden", "true");
        button.append(number, status);
        return button;
      }),
    );
  };

  const applyScreen = (
    navigation: AppNavigation,
    restoreFocus: boolean,
  ): void => {
    currentScreen = navigation.screen;
    root.dataset.appScreen = currentScreen;

    const showHome = currentScreen === "home";
    const showLevelSelect = currentScreen === "level-select";
    home.hidden = !showHome;
    levelSelect.hidden = !showLevelSelect;
    setElementInert(home, !showHome);
    setElementInert(levelSelect, !showLevelSelect);

    if (showHome || showLevelSelect) renderProgress();
    if (!restoreFocus) return;

    queueMicrotask(() => {
      if (destroyed) return;
      if (showHome) continueButton.focus();
      if (showLevelSelect) backButton.focus();
    });
  };

  const navigate = (navigation: AppNavigation): void => {
    emitAppNavigation(navigation);
  };

  const playSelectionFeedback = (): void => {
    playGameSound("ui");
    playHaptic("ui", settings.vibrationEnabled);
  };

  continueButton.addEventListener(
    "click",
    () => {
      renderProgress();
      const model = createMainMenuModel(
        progress,
        levels,
        allowLockedLevels,
      );
      playSelectionFeedback();
      navigate({
        screen: "game",
        levelId: model.currentLevelId,
        mode: "continue",
      });
    },
    { signal },
  );

  restartCurrentButton.addEventListener(
    "click",
    () => {
      const model = createMainMenuModel(
        progress,
        levels,
        allowLockedLevels,
      );
      clearActivePuzzle();
      playSelectionFeedback();
      navigate({
        screen: "game",
        levelId: model.currentLevelId,
        mode: "restart",
      });
    },
    { signal },
  );

  showLevelsButton.addEventListener(
    "click",
    () => {
      playSelectionFeedback();
      navigate({ screen: "level-select" });
    },
    { signal },
  );

  settingsButton.addEventListener(
    "click",
    () => {
      playSelectionFeedback();
      emitSettingsPanelRequest({ open: true, source: "home" });
    },
    { signal },
  );

  backButton.addEventListener(
    "click",
    () => {
      playSelectionFeedback();
      navigate({ screen: "home" });
    },
    { signal },
  );

  levelGrid.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("[data-level-id]");
      const levelId = button?.dataset.levelId;
      if (!button || button.disabled || !levelId) return;

      progress = loadPuzzleProgress(levels);
      if (
        !canSelectMenuLevel(
          progress,
          levelId,
          levels,
          allowLockedLevels,
        )
      ) {
        return;
      }

      playSelectionFeedback();
      navigate({ screen: "game", levelId, mode: "restart" });
    },
    { signal },
  );

  const navigationListener = (
    event: CustomEvent<AppNavigation>,
  ): void => {
    applyScreen(event.detail, true);
  };

  const settingsListener = (
    event: CustomEvent<GameSettings>,
  ): void => {
    settings = { ...event.detail };
    updateMotionPreference();
  };

  const systemBackListener = (
    event: CustomEvent<SystemBackRequest>,
  ): void => {
    if (currentScreen === "home") return;
    event.detail.claim(10, () => navigate({ screen: "home" }));
  };

  const reducedMotionListener = (): void => {
    updateMotionPreference();
  };

  gameEvents.addEventListener(
    "app-navigation",
    navigationListener,
    { signal },
  );
  gameEvents.addEventListener(
    "game-settings",
    settingsListener,
    { signal },
  );
  gameEvents.addEventListener(
    "system-back-request",
    systemBackListener,
    { signal },
  );
  reducedMotionQuery.addEventListener("change", reducedMotionListener);

  updateMotionPreference();
  applyScreen({ screen: "home" }, false);

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    reducedMotionQuery.removeEventListener("change", reducedMotionListener);
    layer.remove();
    root.classList.remove("reduce-effects");
    delete root.dataset.appScreen;

    if (menuCleanupByRoot.get(root) === destroy) {
      menuCleanupByRoot.delete(root);
    }
  };

  menuCleanupByRoot.set(root, destroy);
  return destroy;
}

function find<T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento ausente: ${selector}`);
  return element;
}
