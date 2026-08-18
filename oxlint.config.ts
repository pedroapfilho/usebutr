import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  ignorePatterns: ["apps/demo-with-polkadot/.papi/**"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "new-cap": [
          "error",
          {
            capIsNewExceptions: ["Geist", "Geist_Mono", "Inter", "Scalar"],
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
    {
      files: ["apps/docs/proxy.ts"],
      rules: {
        "prefer-string-raw": "off",
      },
    },
    {
      files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
      rules: {
        "number-literal-case": "off",
      },
    },
    {
      files: ["**/src/**/*.ts", "**/src/**/*.tsx", "apps/**/*.ts", "apps/**/*.tsx"],
      rules: {
        "callback-return": "off",
        "no-console": "off",
        "no-underscore-dangle": "off",
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
