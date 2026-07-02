import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage redirects to sign-in", async ({ page }) => {
    const response = await page.goto("/");
    // Should redirect to sign-in since not authenticated
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("text=Welcome back")).toBeVisible();
    await expect(page.locator("text=Sign in")).toBeVisible();
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("text=Create account")).toBeVisible();
  });
});
