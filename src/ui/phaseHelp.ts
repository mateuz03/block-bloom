import { playGameSound } from "../audio/gameAudio";
import {
  emitPhaseHintOpened,
  emitSystemBackRequest,
  emitUiInputBlock,
  gameEvents,
  type AppNavigation,
  type AppScreen,
  type PuzzleSnapshot,
  type SystemBackRequest,
  type UiInputBlock,
} from "../game/events";
import { getPhaseHint } from "../game/content/phaseHints";

const phaseHelpCleanupByRoot = new WeakMap<HTMLElement, () => void>();

export function createPhaseHelp(root: HTMLElement): () => void {
  phaseHelpCleanupByRoot.get(root)?.();
  const controller = new AbortController();
  const { signal } = controller;
  let screen: AppScreen = "home";
  let snapshot: PuzzleSnapshot | undefined;
  let open = false;
  let externallyBlocked = false;
  let destroyed = false;
  let background: HTMLElement[] = [];
  const previousInert = new Map<HTMLElement, boolean>();

  const layer = document.createElement("div");
  layer.className = "phase-help-layer";
  layer.innerHTML = `
    <button
      type="button"
      class="phase-help-button"
      data-phase-help-button
      aria-label="Pedir uma dica para esta fase"
      aria-haspopup="dialog"
      aria-controls="phase-help-dialog"
      hidden
    >
      <span aria-hidden="true">?</span>
    </button>

    <section
      class="phase-help-dialog"
      id="phase-help-dialog"
      data-phase-help-dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby="phase-help-title"
      hidden
    >
      <div class="phase-help-dialog__flower" aria-hidden="true">✦</div>
      <small>DICA OPCIONAL · FASE <b data-phase-help-level></b></small>
      <h2 id="phase-help-title" data-phase-help-title></h2>
      <p data-phase-help-copy></p>
      <span>A dica orienta a estratégia, mas não revela a sequência completa.</span>
      <button type="button" data-phase-help-close>Voltar ao puzzle</button>
    </section>
  `;
  root.append(layer);

  const gameRoot = find<HTMLElement>(document, "#game-root");
  const button = find<HTMLButtonElement>(layer, "[data-phase-help-button]");
  const dialog = find<HTMLElement>(layer, "[data-phase-help-dialog]");
  const closeButton = find<HTMLButtonElement>(layer, "[data-phase-help-close]");
  const levelNumber = find<HTMLElement>(layer, "[data-phase-help-level]");
  const title = find<HTMLElement>(layer, "[data-phase-help-title]");
  const copy = find<HTMLElement>(layer, "[data-phase-help-copy]");

  const setInert = (element: HTMLElement, inert: boolean): void => {
    element.toggleAttribute("inert", inert);
  };

  const setBackgroundInert = (inert: boolean): void => {
    if (inert) {
      background = [
        gameRoot,
        ...Array.from(root.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child !== layer,
        ),
      ];
      background.forEach((element) => {
        previousInert.set(element, element.hasAttribute("inert"));
        setInert(element, true);
      });
      return;
    }
    background.forEach((element) => {
      setInert(element, previousInert.get(element) ?? false);
    });
    previousInert.clear();
    background = [];
  };

  const renderButton = (): void => {
    const visible =
      screen === "game" &&
      Boolean(snapshot) &&
      !snapshot?.won &&
      Boolean(snapshot && getPhaseHint(snapshot.levelId));
    button.hidden = !visible || open;
    button.disabled = Boolean(snapshot?.inputLocked || externallyBlocked);
  };

  const setOpen = (nextOpen: boolean, restoreFocus = true): void => {
    if (open === nextOpen) return;
    open = nextOpen;
    layer.classList.toggle("phase-help-layer--open", open);
    dialog.hidden = !open;
    setInert(dialog, !open);
    setBackgroundInert(open);
    emitUiInputBlock({ source: "phase-hint", blocked: open });
    renderButton();

    if (open) {
      queueMicrotask(() => {
        if (!destroyed && open) closeButton.focus();
      });
    } else if (restoreFocus && !button.hidden) {
      queueMicrotask(() => {
        if (!destroyed && !open) button.focus();
      });
    }
  };

  button.addEventListener("click", () => {
    if (!snapshot || button.disabled) return;
    const hint = getPhaseHint(snapshot.levelId);
    if (!hint) return;
    playGameSound("ui");
    levelNumber.textContent = String(snapshot.level);
    title.textContent = snapshot.levelName;
    copy.textContent = hint;
    emitPhaseHintOpened(snapshot.levelId);
    setOpen(true);
  }, { signal });

  closeButton.addEventListener("click", () => {
    playGameSound("ui");
    setOpen(false);
  }, { signal });

  layer.addEventListener("click", (event) => {
    if (open && event.target === layer) setOpen(false);
  }, { signal });

  window.addEventListener("keydown", (event) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      emitSystemBackRequest();
    }
    if (event.key === "Tab") {
      event.preventDefault();
      closeButton.focus();
    }
  }, { signal });

  gameEvents.addEventListener("puzzle-state", (event) => {
    snapshot = { ...event.detail };
    if (snapshot.won && open) setOpen(false, false);
    renderButton();
  }, { signal });

  gameEvents.addEventListener("app-navigation", (
    event: CustomEvent<AppNavigation>,
  ) => {
    const navigation = event.detail;
    screen = navigation.screen;
    if (screen !== "game" && open) setOpen(false, false);
    if (
      navigation.screen === "game" &&
      snapshot?.levelId !== navigation.levelId
    ) {
      snapshot = undefined;
    }
    renderButton();
  }, { signal });

  gameEvents.addEventListener("ui-input-block", (
    event: CustomEvent<UiInputBlock>,
  ) => {
    if (event.detail.source === "phase-hint") return;
    externallyBlocked = event.detail.blocked;
    renderButton();
  }, { signal });

  gameEvents.addEventListener("system-back-request", (
    event: CustomEvent<SystemBackRequest>,
  ) => {
    if (open) event.detail.claim(90, () => setOpen(false));
  }, { signal });

  setInert(dialog, true);
  renderButton();

  const destroy = (): void => {
    if (destroyed) return;
    if (open) setOpen(false, false);
    destroyed = true;
    controller.abort();
    layer.remove();
    if (phaseHelpCleanupByRoot.get(root) === destroy) {
      phaseHelpCleanupByRoot.delete(root);
    }
  };
  phaseHelpCleanupByRoot.set(root, destroy);
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
