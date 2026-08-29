import type { ColorId } from "../../game/simulation/puzzle";

export const blockColors: Record<ColorId, number> = {
  coral: 0xff6b66,
  blue: 0x5796ff,
  yellow: 0xffc94a,
  mint: 0x55d6a5,
};

export const blockShadows: Record<ColorId, number> = {
  coral: 0xc74f52,
  blue: 0x3971cb,
  yellow: 0xd69e2e,
  mint: 0x36a77f,
};

export const bloomPetalColors: Record<ColorId, number> = {
  coral: 0xffaaa6,
  blue: 0xaac9ff,
  yellow: 0xffe08a,
  mint: 0x9de7ca,
};

export const blockSymbols: Record<ColorId, string> = {
  coral: "◆",
  blue: "●",
  yellow: "★",
  mint: "▲",
};

export const visualPalette = {
  ink: 0x493f64,
  boardEdge: 0x756a91,
  boardSurface: 0xf8f5ff,
  cellLight: 0xffffff,
  cellShade: 0xeee9fa,
  valid: 0x55d6a5,
  invalid: 0xff6b66,
  bloomLeaf: 0x76bf93,
} as const;
