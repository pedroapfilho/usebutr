import { execFileSync } from "node:child_process";

import { defineConfig, devices } from "@playwright/test";

/**
 * Resolve a portless dev URL, falling back to `undefined` when portless
 * isn't running (CI) or the name isn't registered yet. Local dev uses
 * `https://<name>.localhost` via portless; CI binds to `127.0.0.1:<port>`.
 */
const getPortlessUrl = (name: string): string | undefined => {
  if (process.env.CI) {
    return undefined;
  }
  try {
    return execFileSync("portless", ["get", name], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
};

// Each butr demo has a portless name (registered by its `dev`/`start`
// script) and a CI port we'll bind to when portless isn't available.
// Keep the two side-by-side so the mapping is obvious.
const DEMOS = {
  expo: { ciPort: undefined, portlessName: "demo-expo.butr" },
  next: { ciPort: 3000, portlessName: "demo-next.butr" },
  tanstackStart: { ciPort: 4174, portlessName: "demo-tanstack-start.butr" },
  vite: { ciPort: 4173, portlessName: "demo-vite.butr" },
} as const;

const urlFor = (key: keyof typeof DEMOS): string | undefined => {
  const { ciPort, portlessName } = DEMOS[key];
  return getPortlessUrl(portlessName) ?? (ciPort ? `http://127.0.0.1:${ciPort}` : undefined);
};

// Exported so individual tests can `goto(viteUrl + '/path')` or build
// project-specific helpers without re-deriving the URL.
export const viteUrl = urlFor("vite") ?? "http://127.0.0.1:4173";
export const nextUrl = urlFor("next") ?? "http://127.0.0.1:3000";
export const tanstackStartUrl = urlFor("tanstackStart") ?? "http://127.0.0.1:4174";
// demo-expo doesn't have a CI port wired yet (see webServer block below).
// Use `?? undefined` so callers handle the local-only case explicitly.
export const expoUrl = urlFor("expo");

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,

  // One Playwright project per demo so tests can be scoped by app and
  // the HTML report shows results per-app. Wallet extensions only work
  // in Chromium (Chrome's packaging format), so Firefox/WebKit are
  // intentionally not configured — add them back when there's a
  // non-wallet test that benefits from cross-browser coverage.
  projects: [
    {
      name: "demo-vite",
      testDir: "./tests/e2e/demo-vite",
      use: { ...devices["Desktop Chrome"], baseURL: viteUrl },
    },
    {
      name: "demo-next",
      testDir: "./tests/e2e/demo-next",
      use: { ...devices["Desktop Chrome"], baseURL: nextUrl },
    },
    {
      name: "demo-tanstack-start",
      testDir: "./tests/e2e/demo-tanstack-start",
      use: { ...devices["Desktop Chrome"], baseURL: tanstackStartUrl },
    },
    // demo-expo: deferred until the static-export server story is
    // pinned (see webServer comment below).
  ],

  reporter: process.env.CI ? [["html", { open: "never" }]] : [["list"], ["html"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",

  use: {
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },

  // CI launches one server per demo in parallel.
  //
  // Two correctness rules carried forward from the previous config:
  //
  //   1. Run binaries from `node_modules/.bin/` directly. Wrapping any
  //      of these in `pnpm --filter ... run start` serializes them on
  //      pnpm's workspace state lock — the first webServer wins, the
  //      rest hang silently for the full timeout.
  //
  //   2. Pnpm hoists shared bins to the repo-root `node_modules/.bin/`.
  //      For Next we pass the app directory as a positional arg
  //      (`next start apps/demo-next`). For Vite we use `cwd` because
  //      `vite preview` discovers its config from the working
  //      directory.
  webServer: process.env.CI
    ? [
        {
          command: "../../node_modules/.bin/vite preview --port 4173 --host 127.0.0.1 --strictPort",
          cwd: "apps/demo-vite",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: viteUrl,
        },
        {
          command: "node_modules/.bin/next start apps/demo-next --port 3000 --hostname 127.0.0.1",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: nextUrl,
        },
        {
          command: "../../node_modules/.bin/vite preview --port 4174 --host 127.0.0.1 --strictPort",
          cwd: "apps/demo-tanstack-start",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: tanstackStartUrl,
        },
        // demo-expo: `expo export --platform web` lands a static site
        // in `apps/demo-expo/dist/`. Serving it in CI needs a static
        // server (`npx serve`, `http-server`, etc.) we haven't pinned.
        // Wire when there's an Expo-specific E2E test that needs it.
      ]
    : [],

  workers: process.env.CI ? 1 : undefined,
});
