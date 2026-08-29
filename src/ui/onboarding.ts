import { playGameSound } from "../audio/gameAudio";
import {
  gameEvents,
  type AppNavigation,
  type AppScreen,
  type PuzzleSnapshot,
  type UiInputBlock,
} from "../game/events";
import type { GameAction } from "../game/input/actions";
import {
  loadTutorialProgress,
  markTutorialSeen,
  saveTutorialProgress,
  type TutorialId,
} from "../storage/tutorialProgress";
import { nextTutorial } from "./onboardingModel";

type TutorialContent = {
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  target?: string;
};

const tutorials: Record<TutorialId, TutorialContent> = {
  basics: {
    icon: "↔",
    eyebrow: "PRIMEIROS PASSOS",
    title: "Arraste para combinar",
    body: "Leve a peça ◆ até a saída com o mesmo símbolo.",
  },
  undo: {
    icon: "↶",
    eyebrow: "DICA RÁPIDA",
    title: "Você pode voltar",
    body: "Use ↶ para desfazer o último movimento.",
    target: "[data-undo]",
  },
  bloom: {
    icon: "✿",
    eyebrow: "NOVO NO JARDIM",
    title: "Faça a flor despertar",
    body: "Uma saída florida remove as vinhas ligadas a ela.",
  },
};

const onboardingCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createOnboarding(root: HTMLElement): () => void {
  onboardingCleanupByRoot.get(root)?.();
  const controller = new AbortController();
  const { signal } = controller;
  let progress = loadTutorialProgress();
  let currentScreen: AppScreen = "home";
  let snapshot: PuzzleSnapshot | undefined;
  let activeTutorial: TutorialId | undefined;
  let inputBlocked = false;
  let destroyed = false;

  const layer = document.createElement("div");
  layer.className = "tutorial-layer";
  layer.innerHTML = `
    <aside
      class="tutorial-card"
      data-tutorial-card
      role="status"
      aria-live="polite"
      hidden
    >
      <span class="tutorial-card__icon" data-tutorial-icon aria-hidden="true"></span>
      <span class="tutorial-card__copy">
        <small data-tutorial-eyebrow></small>
        <strong data-tutorial-title></strong>
        <span data-tutorial-body></span>
      </span>
      <button type="button" data-tutorial-dismiss aria-label="Entendi, fechar dica">
        Entendi
      </button>
    </aside>
  `;
  root.append(layer);

  const card = find<HTMLElement>(layer, "[data-tutorial-card]");
  const icon = find<HTMLElement>(layer, "[data-tutorial-icon]");
  const eyebrow = find<HTMLElement>(layer, "[data-tutorial-eyebrow]");
  const title = find<HTMLElement>(layer, "[data-tutorial-title]");
  const body = find<HTMLElement>(layer, "[data-tutorial-body]");
  const dismiss = find<HTMLButtonElement>(layer, "[data-tutorial-dismiss]");

  const clearTarget = (): void => {
    root.querySelectorAll(".tutorial-target").forEach((element) => {
      element.classList.remove("tutorial-target");
    });
  };

  const hide = (): void => {
    activeTutorial = undefined;
    card.hidden = true;
    root.classList.remove("tutorial-active");
    clearTarget();
  };

  const complete = (tutorialId: TutorialId): void => {
    progress = markTutorialSeen(progress, tutorialId);
    saveTutorialProgress(progress);
    hide();
  };

  const show = (tutorialId: TutorialId): void => {
    if (activeTutorial === tutorialId && !card.hidden) return;
    const content = tutorials[tutorialId];
    activeTutorial = tutorialId;
    icon.textContent = content.icon;
    eyebrow.textContent = content.eyebrow;
    title.textContent = content.title;
    body.textContent = content.body;
    card.hidden = false;
    root.classList.add("tutorial-active");
    clearTarget();
    if (content.target) {
      root.querySelector<HTMLElement>(content.target)?.classList.add(
        "tutorial-target",
      );
    }
  };

  const evaluate = (): void => {
    if (
      inputBlocked ||
      currentScreen !== "game" ||
      !snapshot
    ) {
      hide();
      return;
    }

    if (activeTutorial === "basics" && snapshot.moves > 0) {
      complete("basics");
    }
    if (
      activeTutorial === "bloom" &&
      snapshot.levelId === "level-11" &&
      snapshot.moves > 0
    ) {
      complete("bloom");
    }
    if (snapshot.won) {
      if (activeTutorial) complete(activeTutorial);
      else hide();
      return;
    }

    const tutorialId = nextTutorial(snapshot, progress.seen);
    if (tutorialId) show(tutorialId);
    else hide();
  };

  dismiss.addEventListener("click", () => {
    if (!activeTutorial) return;
    playGameSound("ui");
    complete(activeTutorial);
  }, { signal });

  gameEvents.addEventListener("puzzle-state", (event) => {
    snapshot = { ...event.detail };
    evaluate();
  }, { signal });
  gameEvents.addEventListener("app-navigation", (
    event: CustomEvent<AppNavigation>,
  ) => {
    if (
      event.detail.screen === "game" &&
      snapshot?.levelId !== event.detail.levelId
    ) {
      snapshot = undefined;
    }
    currentScreen = event.detail.screen;
    evaluate();
  }, { signal });
  gameEvents.addEventListener("ui-input-block", (
    event: CustomEvent<UiInputBlock>,
  ) => {
    inputBlocked = event.detail.blocked;
    evaluate();
  }, { signal });
  gameEvents.addEventListener("game-action", (
    event: CustomEvent<GameAction>,
  ) => {
    if (event.detail === "undo" && activeTutorial === "undo") {
      complete("undo");
    }
  }, { signal });
  gameEvents.addEventListener("tutorial-reset", () => {
    progress = loadTutorialProgress();
    hide();
    evaluate();
  }, { signal });

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    clearTarget();
    root.classList.remove("tutorial-active");
    layer.remove();
    if (onboardingCleanupByRoot.get(root) === destroy) {
      onboardingCleanupByRoot.delete(root);
    }
  };
  onboardingCleanupByRoot.set(root, destroy);
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
