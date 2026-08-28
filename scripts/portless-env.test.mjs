import assert from "node:assert/strict";
import test from "node:test";

import { applyPortlessUrls } from "./portless-env.mjs";

await test("resolves scalar and comma-separated Portless URLs", () => {
  const env = {};
  applyPortlessUrls(
    { DEMO_URL: "usebutr.demo-vite", ORIGINS: ["usebutr.landing", "usebutr.docs"] },
    { env, resolveUrl: (name) => `https://branch.${name}.localhost` },
  );
  assert.deepEqual(env, {
    DEMO_URL: "https://branch.usebutr.demo-vite.localhost",
    ORIGINS: "https://branch.usebutr.landing.localhost,https://branch.usebutr.docs.localhost",
  });
});

await test("preserves explicitly configured environment values", () => {
  const env = { DEMO_URL: "https://demo.example.com" };
  applyPortlessUrls(
    { DEMO_URL: "usebutr.demo-vite" },
    {
      env,
      resolveUrl: () => {
        throw new Error("should not resolve an explicit value");
      },
    },
  );
  assert.equal(env.DEMO_URL, "https://demo.example.com");
});
