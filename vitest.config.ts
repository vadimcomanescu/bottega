import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "acceptance/generated/**/*.test.ts"],
    setupFiles: ["./handlers/commission-lock-handlers.ts"],
  },
});
