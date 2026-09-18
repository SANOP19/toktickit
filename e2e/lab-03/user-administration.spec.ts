import { test, expect } from "@playwright/test";

test.describe("Administrator User Management & Safety Guards (E2E-03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("admin user provisioning, role editing, self-deactivation protection, and password reset", async ({
    page,
  }) => {
    // -------------------------------------------------------------------------
    // 1. Administrator logs in
    // -------------------------------------------------------------------------
    await page.goto("/");
    await page.locator("#login-email-input").fill("admin.john@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 John Smith")).toBeVisible();
    await expect(page.getByTestId("nav-user-management")).toBeVisible();
    await page.getByTestId("nav-user-management").click();

    await expect(page.getByTestId("admin-users-table")).toBeVisible();
    await expect(page.getByRole("heading", { name: /User Management/i })).toBeVisible();

    // -------------------------------------------------------------------------
    // 2. Create a new user account (AC-10, BR-21)
    // -------------------------------------------------------------------------
    const uniqueEmail = `e2e.staff.${Date.now()}@example.com`;
    await page.getByRole("button", { name: /Create User/i }).click();
    await expect(page.getByTestId("create-user-modal")).toBeVisible();

    await page.getByTestId("create-user-name").fill("E2E Support Specialist");
    await page.getByTestId("create-user-email").fill(uniqueEmail);
    await page.getByTestId("create-user-role").selectOption("IT_STAFF");
    await page.getByTestId("create-user-password").fill("InitialSecret123!");
    await page.getByTestId("submit-create-user-btn").click();

    // Modal closes and success alert appears
    await expect(page.getByTestId("create-user-modal")).not.toBeVisible();
    await expect(page.getByText(/created successfully/i)).toBeVisible();

    // Verify user appears in table
    await page.getByTestId("admin-search-input").fill(uniqueEmail);
    await expect(page.getByTestId("admin-users-table").getByText(uniqueEmail)).toBeVisible();
    await expect(page.getByTestId("admin-users-table").getByText("E2E Support Specialist")).toBeVisible();

    // -------------------------------------------------------------------------
    // 3. Edit user profile
    // -------------------------------------------------------------------------
    const editBtn = page.locator("tr", { hasText: uniqueEmail }).getByRole("button", { name: /Edit/i });
    await editBtn.click();
    await expect(page.getByTestId("edit-user-modal")).toBeVisible();

    await page.getByTestId("edit-user-name").fill("E2E Support Specialist (Senior)");
    await page.getByTestId("submit-edit-user-btn").click();

    await expect(page.getByTestId("edit-user-modal")).not.toBeVisible();
    await expect(page.getByTestId("admin-users-table").getByText("E2E Support Specialist (Senior)")).toBeVisible();

    // -------------------------------------------------------------------------
    // 4. Verify Self-Deactivation Guard (BR-18, AC-11)
    // -------------------------------------------------------------------------
    // Search for logged-in Admin (John Smith)
    await page.getByTestId("admin-search-input").fill("admin.john@example.com");
    await expect(page.getByText("admin.john@example.com")).toBeVisible();

    const editSelfBtn = page.locator("tr", { hasText: "admin.john@example.com" }).getByRole("button", { name: /Edit/i });
    await editSelfBtn.click();

    await expect(page.getByTestId("edit-user-modal")).toBeVisible();
    // Safety guard notice is displayed and active toggle is hidden/disabled
    await expect(page.getByTestId("self-deactivation-notice")).toBeVisible();
    await expect(page.getByTestId("self-deactivation-notice")).toContainText("Self-Deactivation Guard");
    await expect(page.getByTestId("edit-user-active")).not.toBeVisible();

    await page.getByTestId("cancel-edit-user-btn").click();
    await expect(page.getByTestId("edit-user-modal")).not.toBeVisible();

    // -------------------------------------------------------------------------
    // 5. Password Reset Workflow (BR-21)
    // -------------------------------------------------------------------------
    await page.getByTestId("admin-search-input").fill(uniqueEmail);
    const resetPwdBtn = page.locator("tr", { hasText: uniqueEmail }).getByRole("button", { name: /Reset Pass/i });
    await resetPwdBtn.click();

    await expect(page.getByTestId("reset-password-modal")).toBeVisible();
    await page.getByTestId("reset-password-input").fill("NewResetPass123!");
    await page.getByTestId("submit-reset-password-btn").click();

    await expect(page.getByTestId("reset-password-modal")).not.toBeVisible();
    await expect(page.getByText(/Password reset for/i)).toBeVisible();
  });
});
