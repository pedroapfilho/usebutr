import { defineConfig, devices } from "@playwright/test";

// Local dev binds each demo to its framework default port (see each
// app's `dev` script). CI builds and serves on a separate set of ports
// (`vite preview` / `next start`) so the two modes don't fight over the
// same numbers. Exported so individual tests can `goto(viteUrl + '/path')`
// or build project-specific helpers without re-deriving the URL.
export const viteUrl = process.env.CI ? "http://127.0.0.1:4173" : "http://localhost:5173";
export const nextUrl = process.env.CI ? "http://127.0.0.1:3000" : "http://localhost:3000";
export const tanstackStartUrl = process.env.CI
  ? "http://127.0.0.1:4174"
  : "http://localhost:3001";
// demo-expo-web doesn't have a CI server wired yet (see webServer block
// below). `undefined` so callers handle the local-only case explicitly.
export const expoUrl = process.env.CI ? undefined : "http://localhost:8081";

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
    // demo-expo-web: deferred until the static-export server story is
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
        // demo-expo-web: `expo export --platform web` lands a static site
        // in `apps/demo-expo-web/dist/`. Serving it in CI needs a static
        // server (`npx serve`, `http-server`, etc.) we haven't pinned.
        // Wire when there's an Expo-specific E2E test that needs it.
      ]
    : [],

  workers: process.env.CI ? 1 : undefined,
});
