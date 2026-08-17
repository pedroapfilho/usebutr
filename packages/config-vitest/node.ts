import { defineConfig } from "vitest/config";

const nodeConfig = defineConfig({
  test: {
    coverage: {
      exclude: [
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js,mjs,cjs}",
        "**/*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
        // Nothing below emits executable JS, so a coverage percentage over it is
        // not a statement about tested behaviour: barrels are re-exports,
        // signer-augmentation is a bare `declare module`, and the
        // wallet-standard-types modules are type declarations.
        "**/src/index.ts",
        "**/src/signer-augmentation.ts",
        "**/src/wallet-standard-types.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        branches: 60,
        functions: 70,
        lines: 78,
        statements: 78,
      },
    },
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});

export default nodeConfig;
