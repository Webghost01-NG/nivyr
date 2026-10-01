import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.integration.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
  },
});
