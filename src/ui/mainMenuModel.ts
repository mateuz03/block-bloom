import type { Level } from "../game/simulation/puzzle";
import {
  bestMovesFor,
  type PuzzleProgress,
} from "../storage/puzzleProgress";

export type MenuLevelItem = {
  id: string;
  number: number;
  name: string;
  unlocked: boolean;
  completed: boolean;
  current: boolean;
  bestMoves?: number;
};

export type MenuChapterItem = {
  number: number;
  name: string;
  startLevel: number;
  endLevel: number;
  completedLevels: number;
  totalLevels: number;
  unlocked: boolean;
  current: boolean;
};

export type MainMenuModel = {
  currentLevelId: string;
  currentLevelNumber: number;
  currentLevelName: string;
  highestUnlockedNumber: number;
  totalLevels: number;
  chapters: MenuChapterItem[];
  levels: MenuLevelItem[];
};

const chapterSize = 15;
const chapterNames = [
  "Primeiros brotos",
  "Raízes cruzadas",
  "Grande floração",
  "Cruzamento final",
  "Jardim secreto",
  "Novos horizontes",
];

export function createMainMenuModel(
  progress: PuzzleProgress,
  catalog: Level[],
  allowLocked: boolean,
): MainMenuModel {
  const first = catalog[0];
  if (!first) throw new Error("O catálogo de fases está vazio.");

  const currentIndex = Math.max(
    0,
    catalog.findIndex((level) => level.id === progress.currentLevelId),
  );
  const highestIndex = Math.max(
    0,
    catalog.findIndex(
      (level) => level.id === progress.highestUnlockedLevelId,
    ),
  );
  const safeCurrentIndex = allowLocked
    ? currentIndex
    : Math.min(currentIndex, highestIndex);
  const currentLevel = catalog[safeCurrentIndex] ?? first;
  const chapters: MenuChapterItem[] = [];

  for (let startIndex = 0; startIndex < catalog.length; startIndex += chapterSize) {
    const chapterLevels = catalog.slice(startIndex, startIndex + chapterSize);
    const chapterNumber = chapters.length + 1;
    const endIndex = startIndex + chapterLevels.length;
    chapters.push({
      number: chapterNumber,
      name: chapterNames[chapterNumber - 1] ?? `Jardim ${chapterNumber}`,
      startLevel: startIndex + 1,
      endLevel: endIndex,
      completedLevels: chapterLevels.filter(
        (level) => bestMovesFor(progress, level) !== undefined,
      ).length,
      totalLevels: chapterLevels.length,
      unlocked: allowLocked || startIndex <= highestIndex,
      current: safeCurrentIndex >= startIndex && safeCurrentIndex < endIndex,
    });
  }

  return {
    currentLevelId: currentLevel.id,
    currentLevelNumber: safeCurrentIndex + 1,
    currentLevelName: currentLevel.name,
    highestUnlockedNumber: highestIndex + 1,
    totalLevels: catalog.length,
    chapters,
    levels: catalog.map((level, index) => {
      const bestMoves = bestMovesFor(progress, level);
      return {
        id: level.id,
        number: index + 1,
        name: level.name,
        unlocked: allowLocked || index <= highestIndex,
        completed: bestMoves !== undefined,
        current: index === safeCurrentIndex,
        bestMoves,
      };
    }),
  };
}

export function canSelectMenuLevel(
  progress: PuzzleProgress,
  levelId: string,
  catalog: Level[],
  allowLocked: boolean,
): boolean {
  const targetIndex = catalog.findIndex((level) => level.id === levelId);
  const highestIndex = catalog.findIndex(
    (level) => level.id === progress.highestUnlockedLevelId,
  );

  return (
    targetIndex >= 0 &&
    highestIndex >= 0 &&
    (allowLocked || targetIndex <= highestIndex)
  );
}
