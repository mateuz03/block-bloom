import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["android/**", "dist/**", "node_modules/**", "assets/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
      },
    },
  },
);
