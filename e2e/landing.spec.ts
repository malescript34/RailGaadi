import { expect, test } from "@playwright/test";

test("landing page loads and exposes train search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /real-time railway journey intelligence/i })).toBeVisible();
  await expect(page.getByPlaceholder(/search by train number or name/i)).toBeVisible();
});
