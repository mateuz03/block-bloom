import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    postcss: {},
  },
  test: {
    testTimeout: 180_000,
    hookTimeout: 60_000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: false,
    maxConcurrency: 1,
  },
});
