import { spawn } from "node:child_process";

import { applyPortlessUrls } from "./portless-env.mjs";

applyPortlessUrls({
  NEXT_PUBLIC_DEMO_URL: "usebutr.demo-vite",
  NEXT_PUBLIC_DOCS_URL: "usebutr.docs",
  VITE_DOCS_URL: "usebutr.docs",
  VITE_WEB_URL: "usebutr.landing",
});

const child = spawn("pnpm", ["exec", "turbo", "dev"], { env: process.env, stdio: "inherit" });
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
