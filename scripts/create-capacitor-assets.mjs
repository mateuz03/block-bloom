import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("../node_modules/.pnpm/node_modules/sharp");
const assetDir = path.resolve("assets");

await mkdir(assetDir, { recursive: true });

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="196" fill="#101114"/>
  <circle cx="512" cy="512" r="318" fill="#171a1f"/>
  <path d="M238 392h548v86H238zM238 546h548v86H238z" fill="#46f0b1"/>
  <circle cx="424" cy="435" r="78" fill="#ffcb4d"/>
  <circle cx="606" cy="589" r="78" fill="#ff4f88"/>
  <path d="M512 110 566 240H458L512 110ZM512 914 458 784H566L512 914Z" fill="#6be7ff"/>
</svg>`;

const foregroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="292" fill="#171a1f"/>
  <path d="M260 398h504v82H260zM260 544h504v82H260z" fill="#46f0b1"/>
  <circle cx="424" cy="439" r="74" fill="#ffcb4d"/>
  <circle cx="606" cy="585" r="74" fill="#ff4f88"/>
  <path d="M512 132 562 252H462L512 132ZM512 892 462 772H562L512 892Z" fill="#6be7ff"/>
</svg>`;

const backgroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#101114"/>
</svg>`;

const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#101114"/>
  <g opacity="0.28" stroke="#6be7ff" stroke-width="4">
    <path d="M-180 0 520 2732"/>
    <path d="M180 0 880 2732"/>
    <path d="M540 0 1240 2732"/>
    <path d="M900 0 1600 2732"/>
    <path d="M1260 0 1960 2732"/>
    <path d="M1620 0 2320 2732"/>
    <path d="M1980 0 2680 2732"/>
  </g>
  <circle cx="1366" cy="1366" r="500" fill="#171a1f"/>
  <path d="M914 1240h904v104H914zM914 1488h904v104H914z" fill="#46f0b1"/>
  <circle cx="1218" cy="1292" r="98" fill="#ffcb4d"/>
  <circle cx="1514" cy="1540" r="98" fill="#ff4f88"/>
  <text x="1366" y="1958" fill="#f4f7fb" font-family="Arial, sans-serif" font-size="140" font-weight="800" text-anchor="middle">Block Bloom</text>
</svg>`;

await Promise.all([
  sharp(Buffer.from(iconSvg)).png().toFile(path.join(assetDir, "icon-only.png")),
  sharp(Buffer.from(foregroundSvg)).png().toFile(path.join(assetDir, "icon-foreground.png")),
  sharp(Buffer.from(backgroundSvg)).png().toFile(path.join(assetDir, "icon-background.png")),
  sharp(Buffer.from(splashSvg)).png().toFile(path.join(assetDir, "splash.png")),
  sharp(Buffer.from(splashSvg)).png().toFile(path.join(assetDir, "splash-dark.png")),
]);

console.log(`Generated Capacitor assets in ${assetDir}`);
