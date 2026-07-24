import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  ignorePatterns: ["apps/demo-with-polkadot/.papi/**"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "new-cap": [
          "error",
          {
            capIsNewExceptions: ["Geist", "Inter", "Scalar"],
          },
        ],
      },
    },
    {
      files: ["apps/demo-tanstack-start/src/components/**/*.tsx"],
      rules: {
        "filename-case": "off",
      },
    },
    {
      files: [
        "apps/demo-vite/src/**/*.tsx",
        "apps/demo-tanstack-start/src/**/*.tsx",
        "apps/demo-with-viem/src/**/*.tsx",
        "apps/demo-with-wagmi/src/**/*.tsx",
        "apps/demo-with-solana-web3js/src/**/*.tsx",
        "apps/demo-with-solana-kit/src/**/*.tsx",
        "apps/demo-with-solana-wallet-adapter/src/**/*.tsx",
        "apps/demo-with-gill/src/**/*.tsx",
        "apps/demo-with-solana-framework-kit/src/**/*.tsx",
        "apps/demo-with-sui/src/**/*.tsx",
        "apps/demo-with-bitcoin/src/**/*.tsx",
        "apps/demo-wormhole-usdc/src/**/*.tsx",
        "apps/demo-with-polkadot/src/**/*.tsx",
      ],
      rules: {
        "no-img-element": "off",
      },
    },
    {
      files: ["apps/demo-expo-web/metro.config.js"],
      rules: {
        "no-require-imports": "off",
        "prefer-node-protocol": "off",
      },
    },
    // proxy.ts's matcher must be a plain string literal; Next 16 statically
    // extracts the `config` export and cannot parse a `String.raw` tagged
    // template, so `prefer-string-raw` is unworkable for this one file.
    {
      files: ["apps/docs/proxy.ts"],
      rules: {
        "prefer-string-raw": "off",
      },
    },
    // oxfmt always lowercases hex literals, while `number-literal-case` wants
    // uppercase. The two tools are in conflict: disable the oxlint rule for test
    // files where hex literals appear only as fixture values (not production code).
    {
      files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
      rules: {
        "number-literal-case": "off",
      },
    },
    {
      files: [
        // oxlint runs per-package as `oxlint src` (cwd = package dir), so
        // override globs must be `**/`-anchored; repo-root-prefixed or bare
        // `src/**` patterns silently never match. `**/src/**` covers every
        // first-party package's source uniformly.
        "**/src/**/*.ts",
        "**/src/**/*.tsx",
        "apps/**/*.ts",
        "apps/**/*.tsx",
      ],
      rules: {
        "no-console": "off",
        "no-underscore-dangle": "off",
        // `callback-return` (node plugin) targets Node-style error-first
        // callbacks whose call should be returned. butr's adapters take `cb`
        // as a fire-and-forget notification hook (e.g. "the wallet switched
        // chains") and must keep executing afterward to send the transaction;
        // returning at the call site would abort the operation.
        "callback-return": "off",
      },
    },
    {
      files: ["apps/demo-*/src/**/*.tsx", "apps/demo-*/src/**/*.ts"],
      rules: {
        "max-lines": "off",
      },
    },
  ],
});
