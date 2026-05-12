import { expect, test } from "@playwright/test";

// Smoke spec: verifies the demo page renders and butr's discovery
// loop reaches a deterministic state without a wallet extension
// installed. We can't test real wallet flows here without a bundled
// extension (the wallet-extensions package wires that up but isn't
// loaded into this project yet); this test exists to catch
// regressions in the "no wallets detected" empty state, the
// hydration handshake, and the Tailwind asset pipeline.

test("demo-vite renders the empty-state copy and hydrates", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "butr · Vite" })).toBeVisible();

  // Without browser-wallet extensions installed, butr's discovery
  // resolves to zero adapters and the empty-state card renders.
  await expect(page.getByRole("heading", { name: "No wallets detected" })).toBeVisible();

  // Hydration handshake — the status pill flips from absent to "idle"
  // once `_hydrateWallets` resolves.
  await expect(page.locator("text=Status:")).toBeVisible();
});

test("install-wallet links point at canonical download URLs", async ({ page }) => {
  await page.goto("/");

  const metamaskLink = page.getByRole("link", { name: "MetaMask" });
  const phantomLink = page.getByRole("link", { name: "Phantom" });

  await expect(metamaskLink).toHaveAttribute("href", "https://metamask.io/download");
  await expect(phantomLink).toHaveAttribute("href", "https://phantom.app/download");
});
