import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@mailrith/public-api": path.join(root, "packages/public-api/src/index.ts"),
      "@mailrith/sdk": path.join(root, "packages/sdk/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/**/src/**/*.{test,spec}.ts",
      "tests/**/*.{test,spec}.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**"],
    clearMocks: true,
    restoreMocks: true,
  },
});
