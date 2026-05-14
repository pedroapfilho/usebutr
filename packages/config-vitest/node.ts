import { defineConfig } from "vitest/config";

const nodeConfig = defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: [
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js,mjs,cjs}",
        "**/*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
    },
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});

export default nodeConfig;
