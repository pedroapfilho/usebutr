import libraryConfig from "@repo/config-vitest/library";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  libraryConfig,
  defineConfig({
    test: {
      setupFiles: ["./src/__tests__/setup.ts"],
    },
  }),
);
