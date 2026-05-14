import { defineConfig, mergeConfig } from "vitest/config";
import nodeConfig from "@repo/config-vitest/node";

export default mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      setupFiles: ["./src/__tests__/setup.ts"],
    },
  }),
);
