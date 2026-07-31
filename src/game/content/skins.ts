export const skinCatalog = [
  {
    id: "mint",
    name: "Mint",
    cost: 0,
    core: 0x46f0b1,
    halo: 0x46f0b1,
    eye: 0x101114,
    cssColor: "#46f0b1",
  },
  {
    id: "pulse",
    name: "Pulse",
    cost: 18,
    core: 0xff4f88,
    halo: 0xffcb4d,
    eye: 0x101114,
    cssColor: "#ff4f88",
  },
  {
    id: "volt",
    name: "Volt",
    cost: 36,
    core: 0xffcb4d,
    halo: 0x6be7ff,
    eye: 0x101114,
    cssColor: "#ffcb4d",
  },
  {
    id: "ghost",
    name: "Ghost",
    cost: 60,
    core: 0xf4f7fb,
    halo: 0x6be7ff,
    eye: 0x101114,
    cssColor: "#f4f7fb",
  },
] as const;

export type SkinId = (typeof skinCatalog)[number]["id"];
export type Skin = (typeof skinCatalog)[number];

const fallbackSkin = skinCatalog[0];

export function getSkin(skinId: SkinId): Skin {
  return skinCatalog.find((skin) => skin.id === skinId) ?? fallbackSkin;
}

export function isSkinId(value: string): value is SkinId {
  return skinCatalog.some((skin) => skin.id === value);
}
