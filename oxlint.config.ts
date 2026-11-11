import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";
import shadcn from "oxlint-config-awesomeness/shadcn";

export default defineConfig({
  extends: [awesomeness, shadcn],
  ignorePatterns: [
    ".github/ci/*.mjs",
    "apps/demo-expo-web/src/uniwind-types.d.ts",
    "apps/demo-with-polkadot/.papi/**",
  ],
  overrides: [
    {
      files: ["apps/demo-{vite,tanstack-start,with-*}/src/**/*.tsx"],
      rules: {
        "no-img-element": "off",
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
  rules: {
    "shadcn/no-restyle": [
      "error",
      {
        allow: ["layout"],
        contracts: [
          {
            allow: ["layout", "gap-*"],
            pattern: "^PopoverTrigger$",
          },
        ],
      },
    ],
  },
});
