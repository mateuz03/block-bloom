import type { PuzzleSnapshot } from "../game/events";
import type { TutorialId } from "../storage/tutorialProgress";

export type OnboardingSnapshot = Pick<
  PuzzleSnapshot,
  "levelId" | "moves" | "canUndo" | "won"
>;

/**
 * Decide qual dica contextual deve aparecer sem depender do DOM ou do Phaser.
 * A ordem evita que uma dica genérica cubra uma introdução específica da fase.
 */
export function nextTutorial(
  snapshot: OnboardingSnapshot,
  seen: readonly TutorialId[],
): TutorialId | undefined {
  if (snapshot.won) return undefined;

  if (
    !seen.includes("basics") &&
    snapshot.levelId === "level-1" &&
    snapshot.moves === 0
  ) {
    return "basics";
  }

  if (
    !seen.includes("bloom") &&
    snapshot.levelId === "level-11" &&
    snapshot.moves === 0
  ) {
    return "bloom";
  }

  if (!seen.includes("undo") && snapshot.canUndo) {
    return "undo";
  }

  return undefined;
}
