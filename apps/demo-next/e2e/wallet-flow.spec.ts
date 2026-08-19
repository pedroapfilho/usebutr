import { expect, test } from "@playwright/test";

import { installMockEip6963Wallet } from "../../../tests/mock-eip6963";

const CONNECT_BUTTON_NAME = "Mock Wallet, evm";

test("keeps the pending connection visible until the wallet responds", async ({ page }) => {
  await installMockEip6963Wallet(page, "pending");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: CONNECT_BUTTON_NAME });
  await connectButton.click();
  await expect(connectButton).toBeDisabled();
  await expect(connectButton).toHaveAttribute("aria-busy", "true");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("mock-wallet:resolve-connect"));
  });
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
});

test("connects and disconnects without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await installMockEip6963Wallet(page, "success");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: CONNECT_BUTTON_NAME });
  const box = await connectButton.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await connectButton.click();
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(connectButton).toBeVisible();
});
