import { test, expect } from "@playwright/test";

test.describe("Operational Dashboards & Interactive Drill-Down (E2E-03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("IT Staff Dashboard renders 5 KPI cards and supports drill-down to filtered queue", async ({
    page,
  }) => {
    // Log in as IT Staff
    await page.goto("/");
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();

    // Verify on Dashboard
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome back, Alex Thompson!/i })).toBeVisible();

    // Verify all 5 Operational KPI cards
    await expect(page.getByTestId("kpi-card-new")).toBeVisible();
    await expect(page.getByTestId("kpi-card-open")).toBeVisible();
    await expect(page.getByTestId("kpi-card-in-progress")).toBeVisible();
    await expect(page.getByTestId("kpi-card-waiting-for-requester")).toBeVisible();
    await expect(page.getByTestId("kpi-card-my-assigned")).toBeVisible();

    // Verify Refresh button
    const refreshBtn = page.getByTestId("btn-refresh-dashboard");
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();

    // Test Drill-down: Click 'New' KPI card
    await page.getByTestId("kpi-card-new").click();

    // Verify navigation to Staff Queue container
    await expect(page.getByTestId("staff-ticket-queue-container")).toBeVisible();

    // Return to Dashboard
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome back, Alex Thompson!/i })).toBeVisible();

    // Test Drill-down: Click 'In Progress' KPI card
    await page.getByTestId("kpi-card-in-progress").click();
    await expect(page.getByTestId("staff-ticket-queue-container")).toBeVisible();

    // Logout
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();
  });

  test("Requester Dashboard renders 4 KPI cards and supports drill-down to personal tickets", async ({
    page,
  }) => {
    // Log in as Requester
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();

    // Navigate to Dashboard
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome, Jennifer Anderson!/i })).toBeVisible();

    // Verify all 4 Personal KPI cards
    await expect(page.getByTestId("kpi-card-my-open")).toBeVisible();
    await expect(page.getByTestId("kpi-card-in-progress")).toBeVisible();
    await expect(page.getByTestId("kpi-card-resolved")).toBeVisible();
    await expect(page.getByTestId("kpi-card-closed")).toBeVisible();

    // Verify Quick Action buttons
    await expect(page.getByTestId("quick-btn-create-ticket")).toBeVisible();
    await expect(page.getByTestId("quick-btn-view-my-tickets")).toBeVisible();

    // Test Drill-down: Click 'My Open Tickets' KPI card
    await page.getByTestId("kpi-card-my-open").click();

    // Verify navigation to My Tickets
    await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();
    await expect(page.getByTestId("active-requester-name")).toBeVisible();

    // Return to Dashboard
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome, Jennifer Anderson!/i })).toBeVisible();

    // Test Drill-down: Click 'Resolved' KPI card
    await page.getByTestId("kpi-card-resolved").click();
    await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();

    // Logout
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();
  });
});
