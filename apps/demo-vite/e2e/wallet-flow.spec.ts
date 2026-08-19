import { expect, test } from "@playwright/test";

import {
  MOCK_ACCOUNT,
  MOCK_CONNECT_BUTTON,
  installMockEip6963Wallet,
} from "../../../tests/mock-eip6963";

test("connects and disconnects a discovered wallet", async ({ page }) => {
  await installMockEip6963Wallet(page, "success");
  await page.goto("/");

  await page.getByRole("button", { name: MOCK_CONNECT_BUTTON }).click();
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
  await expect(page.getByText(MOCK_ACCOUNT)).toBeVisible();

  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByRole("button", { name: MOCK_CONNECT_BUTTON })).toBeVisible();
});

test("recovers after the user rejects the first connection", async ({ page }) => {
  await installMockEip6963Wallet(page, "reject-once");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: MOCK_CONNECT_BUTTON });
  await connectButton.click();
  await expect(page.getByRole("alert")).toContainText("UserRejected");
  await expect(connectButton).toBeEnabled();

  await connectButton.click();
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
});

test("shows a pending connection and completes it", async ({ page }) => {
  await installMockEip6963Wallet(page, "pending");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: MOCK_CONNECT_BUTTON });
  await connectButton.click();
  await expect(connectButton).toBeDisabled();
  await expect(connectButton).toHaveAttribute("aria-busy", "true");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("mock-wallet:resolve-connect"));
  });
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
});

test("keeps the wallet flow usable on mobile", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await installMockEip6963Wallet(page, "success");
  await page.goto("/");

  const connectButton = page.getByRole("button", { name: MOCK_CONNECT_BUTTON });
  const box = await connectButton.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await connectButton.click();
  await expect(page.getByRole("heading", { name: "Mock Wallet" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
