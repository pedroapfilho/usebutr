import { defineConfig } from "@playwright/test";

const config = defineConfig({
  retries: 0,
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:3010",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm exec next start -p 3010",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:3010",
  },
  workers: 1,
});

export default config;
