import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  // polkadot-api generates descriptor bundles that must stay tracked in git
  // (required by the runtime) but contain auto-generated, non-standard JS/TS
  // that would fail every lint rule. Exclude them the same way we treat any
  // other generated dist artefact.
  ignorePatterns: ["apps/demo-with-polkadot/.papi/**"],
  overrides: [
    // `new-cap` enforces `new` for PascalCase callables, but several frameworks
    // expose factory functions whose names are PascalCase by convention:
    //   - `Inter` / `Geist` / etc. from `next/font/google`
    //   - `Scalar` from `@scalar/hono-api-reference`
    // The rule supports an exception list — keep it here (not in awesomeness)
    // because the set is repo-specific.
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
    // TanStack Start scaffold generates PascalCase component files (Header.tsx,
    // Footer.tsx, ThemeToggle.tsx) — kebab-case enforcement does not apply there.
    {
      files: ["apps/demo-tanstack-start/src/components/**/*.tsx"],
      rules: {
        "filename-case": "off",
      },
    },
    // next/no-img-element only applies to Next.js apps — disable it for Vite-
    // and TanStack Start-based demos where next/image is not available.
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
    // metro.config.js is a CommonJS Expo Metro configuration file — Metro does
    // not support ESM config, so `require()` calls here are unavoidable. Scope
    // the exception tightly to this one file.
    {
      files: ["apps/demo-expo-web/metro.config.js"],
      rules: {
        "no-require-imports": "off",
        "prefer-node-protocol": "off",
      },
    },
    // proxy.ts's matcher must be a plain string literal — Next 16 statically
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
    // butr is a published library that has no shared logger to inject. It uses
    // `console.warn` / `console.error` in error paths (storage failures,
    // connector restoration failures, devtools-only diagnostics) so consumers
    // can see them without us swallowing the error. Same reason for `_`-prefixed
    // internal store methods: a long-standing Zustand convention that keeps
    // implementation details out of the public surface area.
    //
    // The demo apps follow the same conventions: `console.log` in onConnect /
    // onDisconnect / onReset callbacks is the whole point of those demos (showing
    // the callbacks fire), and `_`-prefixed fallow type-markers are intentional.
    {
      files: [
        // oxlint runs per-package as `oxlint src` (cwd = package dir), so
        // override globs must be `**/`-anchored — repo-root-prefixed or bare
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
        // chains") and must keep executing afterward to send the transaction —
        // returning at the call site would abort the operation.
        "callback-return": "off",
      },
    },
    // Demo apps are intentionally standalone — each demo is a self-contained
    // reference users read top-to-bottom. We accept the duplication and the
    // resulting file length over extracting a shared scaffold. (Recorded in
    // docs/adr/0001-demos-stay-standalone.md.)
    {
      files: ["apps/demo-*/src/**/*.tsx", "apps/demo-*/src/**/*.ts"],
      rules: {
        "max-lines": "off",
      },
    },
  ],
});
