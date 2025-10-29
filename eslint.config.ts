// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/*.config.js", "./components/ui"],
    rules: {
      semi: "error",
    },
  },
]);
