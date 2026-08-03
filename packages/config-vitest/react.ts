// Self-reference rather than "./node": vitest loads this config through Node's
// native ESM, which won't resolve an extensionless relative TS path, and the
// repo bans explicit .ts suffixes in relative imports.
import nodeConfig from "@repo/config-vitest/node";
import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

const reactConfig = mergeConfig(
  nodeConfig,
  defineConfig({
    plugins: [react()],
    test: {
      css: false,
      environment: "jsdom",
      setupFiles: ["@repo/config-vitest/setup-react"],
    },
  }),
);

export default reactConfig;
