import nodeConfig from "@repo/config-vitest/node";
import { defineConfig, mergeConfig } from "vitest/config";
import zodCompiler from "zod-compiler/vite";

const libraryOverrides = defineConfig({
  plugins: [zodCompiler()],
  test: {
    coverage: {
      // Nothing below emits executable JS, so a coverage percentage over it is
      // not a statement about tested behaviour: barrels are re-exports,
      // signer-augmentation is a bare `declare module`, and the
      // wallet-standard-types modules are type declarations.
      exclude: [
        "**/src/index.ts",
        "**/src/signer-augmentation.ts",
        "**/src/wallet-standard-types.ts",
      ],
    },
  },
});

const libraryConfig = mergeConfig(nodeConfig, libraryOverrides);

export { libraryOverrides };

export default libraryConfig;
