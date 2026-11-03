import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    minify: mode === "release" || mode === "playtest" ? "esbuild" : false,
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  preview: {
    host: "127.0.0.1",
    port: 8080,
  },
}));
