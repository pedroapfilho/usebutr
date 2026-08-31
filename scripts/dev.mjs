import { spawnSync } from "node:child_process";

import { applyPortlessUrls } from "./portless-env.mjs";

const env = applyPortlessUrls({
  NEXT_PUBLIC_DEMO_URL: ["usebutr.demo-vite"],
  NEXT_PUBLIC_DOCS_URL: ["usebutr.docs"],
  VITE_DOCS_URL: ["usebutr.docs"],
  VITE_WEB_URL: ["usebutr.landing"],
});

const { status } = spawnSync("pnpm", ["exec", "turbo", "run", "dev"], {
  env,
  stdio: "inherit",
});

process.exit(status ?? 1);
