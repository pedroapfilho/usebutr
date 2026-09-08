import { expect, test } from "@playwright/test";

import { installMockEip6963Wallet } from "../../../tests/mock-eip6963";

test("keeps transfer actions gated while changing direction without connected wallets", async ({
  page,
}) => {
  await page.goto("/");
  const swap = page.getByRole("button", { exact: true, name: "Swap" });
  await expect(swap).toBeDisabled();
  await expect(page.getByText("Connect and activate a EVM wallet above")).toBeVisible();

  await page.getByRole("button", { name: "Swap source and destination" }).click();
  await expect(page.getByLabel("Source chain")).toHaveValue("Solana");
  await expect(page.getByLabel("Destination chain")).toHaveValue("Sepolia");
  await expect(page.getByText("Connect and activate a SVM wallet above")).toBeVisible();
  await expect(swap).toBeDisabled();
  await expect(page.getByRole("button", { name: "Retry attestation" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Mint on/ })).toHaveCount(0);
});

test("shows pending wallet work and completes the connection", async ({ page }) => {
  await installMockEip6963Wallet(page, "pending");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: "Mock Wallet" });
  await connectButton.click();
  await expect(connectButton).toBeDisabled();
  await expect(connectButton).toHaveAttribute("aria-busy", "true");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("mock-wallet:resolve-connect"));
  });
  await expect(page.getByText("Mock Wallet")).toBeVisible();
  await expect(page.getByText("Connect and activate a SVM wallet above")).toBeVisible();
});

test("recovers after rejection and disconnects on mobile", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await installMockEip6963Wallet(page, "reject-once");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: "Mock Wallet" });
  const box = await connectButton.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await connectButton.click();
  await expect(page.getByRole("alert")).toContainText("UserRejected");
  await expect(connectButton).toBeEnabled();

  await connectButton.click();
  await expect(page.getByText("Mock Wallet")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(connectButton).toBeVisible();
});
