import { defineConfig } from "@playwright/test";

const PORT = 4010;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const config = defineConfig({
  retries: 0,
  testDir: "./e2e",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `EXPOSE_TESTING_API=1 pnpm build && EXPOSE_TESTING_API=1 pnpm exec next start -p ${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: BASE_URL,
  },
  workers: 1,
});

export default config;
