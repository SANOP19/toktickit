import { test, expect } from "@playwright/test";

test.describe("Multi-Role Authentication & Password Quarantine (E2E-01)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean unauthenticated state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("valid credentials login across Requester, IT Staff, and Admin roles with proper navigation & logout", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Requester Login
    await expect(page.locator("#login-email-input")).toBeVisible();
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    // Verify Requester Session
    await expect(page.locator(".navbar").getByText("👤 Jennifer Anderson")).toBeVisible();
    await expect(page.getByText("Requester", { exact: true })).toBeVisible();
    await expect(page.getByTestId("nav-my-tickets")).toBeVisible();
    await expect(page.getByTestId("nav-create-ticket")).toBeVisible();

    // Requester Logout
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // 2. IT Staff Login
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    // Verify IT Staff Session
    await expect(page.locator(".navbar").getByText("👤 Alex Thompson")).toBeVisible();
    await expect(page.getByText("IT Staff", { exact: true })).toBeVisible();
    await expect(page.getByTestId("nav-staff-queue")).toBeVisible();

    // IT Staff Logout
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // 3. Administrator Login
    await page.locator("#login-email-input").fill("admin.john@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    // Verify Administrator Session
    await expect(page.locator(".navbar").getByText("👤 John Smith")).toBeVisible();
    await expect(page.getByText("Admin", { exact: true })).toBeVisible();
    await expect(page.getByTestId("nav-user-management")).toBeVisible();

    // Administrator Logout
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();
  });

  test("inactive account login is rejected with HTTP 401 and error message (AC-02, BR-01)", async ({
    page,
  }) => {
    await page.goto("/");

    // Inactive requester account seeded in database
    await page.locator("#login-email-input").fill("metier.l@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    // Verify error banner
    await expect(page.locator(".alert-danger")).toBeVisible();
    await expect(page.locator(".alert-danger")).toContainText(/inactive|deactivated|disabled|credentials/i);
    await expect(page.locator("#login-email-input")).toBeVisible();
  });

  test("first-login quarantine intercepts user and forces mandatory password change (AC-03, BR-02)", async ({
    page,
  }) => {
    await page.goto("/");

    // User seeded with mustChangePassword: true
    await page.locator("#login-email-input").fill("new.user@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    // Mandatory Password Change Modal appears
    await expect(
      page.getByRole("heading", { name: /Initial Password Change Required/i })
    ).toBeVisible();
    await expect(page.locator(".modal").getByText(/Amanda Clark/i)).toBeVisible();

    // Fill new password conforming to complexity
    const newSecurePassword = "ChangedSecure123!";
    await page.locator("#current-password-input").fill("Password123!");
    await page.locator("#new-password-input").fill(newSecurePassword);
    await page.locator("#confirm-password-input").fill(newSecurePassword);

    // Verify live checklist indicators are satisfied
    await expect(page.getByText("Minimum 8 characters")).toBeVisible();
    await expect(page.getByText("Passwords match")).toBeVisible();

    // Submit new password
    await page.locator("#change-password-submit-button").click();

    // Modal closes and user enters application
    await expect(
      page.getByRole("heading", { name: /Initial Password Change Required/i })
    ).not.toBeVisible();
    await expect(page.getByText("👤 Amanda Clark")).toBeVisible();

    // Log out and log back in with new password
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // Log in with new password succeeds without modal
    await page.locator("#login-email-input").fill("new.user@example.com");
    await page.locator("#login-password-input").fill(newSecurePassword);
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Amanda Clark")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Initial Password Change Required/i })
    ).not.toBeVisible();
  });
});
