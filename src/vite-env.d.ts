/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAYTEST_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  webkitAudioContext?: typeof AudioContext;
}
