import { test, expect } from "@playwright/test";
import path from "path";

const screenshotDir = path.resolve(__dirname, "../artifacts/lab-03/screenshots");

test.describe("Automated Screenshot Capture for Lab 3 Report", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Capture Authentication Screenshots", async ({ page }) => {
    // 1. Desktop Login Screen
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/01-login-screen-desktop.png"),
      fullPage: true,
    });

    // 2. Tablet Login Screen
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/02-login-screen-tablet.png"),
      fullPage: true,
    });

    // 3. Mobile Login Screen
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/03-login-screen-mobile.png"),
      fullPage: true,
    });

    // Reset to Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. Invalid Credentials Error
    await page.locator("#login-email-input").fill("nonexistent@example.com");
    await page.locator("#login-password-input").fill("WrongPassword123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".alert-danger")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/04-invalid-credentials-error.png"),
      fullPage: true,
    });

    // 5. Inactive Account Error
    await page.locator("#login-email-input").fill("metier.l@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".alert-danger")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/05-inactive-account-error.png"),
      fullPage: true,
    });

    // 6. First-Login Password Quarantine Modal
    // Provision a fresh user via admin to guarantee mustChangePassword: true
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
    await page.locator("#login-email-input").fill("admin.john@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".navbar").getByText("👤 John Smith")).toBeVisible();

    const quarantineEmail = `quarantine.${Date.now()}@example.com`;
    await page.getByTestId("nav-user-management").click();
    await page.getByRole("button", { name: /Create User/i }).click();
    await page.getByTestId("create-user-name").fill("Quarantine Test User");
    await page.getByTestId("create-user-email").fill(quarantineEmail);
    await page.getByTestId("create-user-role").selectOption("REQUESTER");
    await page.getByTestId("create-user-password").fill("InitialSecret123!");
    await page.getByTestId("submit-create-user-btn").click();
    await expect(page.getByTestId("create-user-modal")).not.toBeVisible();

    // Log out admin
    await page.locator("#nav-logout-btn").click();

    // Log in as newly created quarantined user
    await page.locator("#login-email-input").fill(quarantineEmail);
    await page.locator("#login-password-input").fill("InitialSecret123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByRole("heading", { name: /Initial Password Change Required/i })).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, "authentication/06-first-login-quarantine-modal.png"),
      fullPage: true,
    });

    // 7. Password Checklist Satisfied
    await page.locator("#current-password-input").fill("InitialSecret123!");
    await page.locator("#new-password-input").fill("ValidNewPassword123!");
    await page.locator("#confirm-password-input").fill("ValidNewPassword123!");
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/07-password-checklist-satisfied.png"),
      fullPage: true,
    });

    // Complete change
    await page.locator("#change-password-submit-button").click();
    await expect(page.getByRole("heading", { name: /Initial Password Change Required/i })).not.toBeVisible();
    await page.locator("#nav-logout-btn").click();

    // 8. Requester Authenticated Shell
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".navbar").getByText("👤 Jennifer Anderson")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/08-requester-authenticated-shell.png"),
      fullPage: true,
    });
    await page.locator("#nav-logout-btn").click();

    // 9. IT Staff Authenticated Shell
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/09-it-staff-authenticated-shell.png"),
      fullPage: true,
    });
    await page.locator("#nav-logout-btn").click();

    // 10. Administrator Authenticated Shell
    await page.locator("#login-email-input").fill("admin.john@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".navbar").getByText("👤 John Smith")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "authentication/10-admin-authenticated-shell.png"),
      fullPage: true,
    });
  });

  test("Capture Staff Ticket Queue Screenshots", async ({ page }) => {
    await page.goto("/");
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByTestId("nav-staff-queue")).toBeVisible();
    await page.getByTestId("nav-staff-queue").click();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible();

    // 1. Desktop Staff Queue
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-queue/01-staff-queue-desktop.png"),
      fullPage: true,
    });

    // 2. Tablet Staff Queue
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-queue/02-staff-queue-tablet.png"),
      fullPage: true,
    });

    // 3. Mobile Staff Queue
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-queue/03-staff-queue-mobile.png"),
      fullPage: true,
    });

    // Reset Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. Staff Queue Filter & Search Applied
    await page.getByTestId("staff-category-filter").selectOption({ index: 1 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-queue/04-staff-queue-search-filter.png"),
      fullPage: true,
    });

    // 5. Close-up on Badges & Table
    const tableEl = page.locator(".table-responsive");
    if (await tableEl.isVisible()) {
      await tableEl.screenshot({
        path: path.join(screenshotDir, "staff-queue/05-staff-queue-status-badges.png"),
      });
    }

    // 6. Pagination Bar
    const paginationEl = page.locator(".pagination");
    if (await paginationEl.isVisible()) {
      await paginationEl.screenshot({
        path: path.join(screenshotDir, "staff-queue/06-staff-queue-pagination.png"),
      });
    }
  });

  test("Capture Staff Ticket Detail Screenshots", async ({ page }) => {
    // Phase 1: Requester creates a ticket and marks it resolved
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".navbar").getByText("👤 Jennifer Anderson")).toBeVisible();

    await page.getByTestId("nav-create-ticket").click();
    const summary = `Screenshot Capture Ticket ${Date.now()}`;
    await page.locator("#categorySelect").selectOption({ index: 1 });
    await page.locator("#relatedSystemSelect").selectOption({ index: 1 });
    await page.locator("#prioritySelect").selectOption("HIGH");
    await page.locator("#ticketSummary").fill(summary);
    await page.locator("#ticketDescription").fill("Demonstration description for visual evidence capture.");
    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    const ticketNumberEl = page.locator('[data-testid="created-ticket-number"]');
    await expect(ticketNumberEl).toBeVisible();
    const ticketNo = (await ticketNumberEl.textContent())?.trim() || "";

    // Go to My Tickets and open Detail as Requester
    await page.getByTestId("nav-my-tickets").click();
    await page.getByPlaceholder(/Search by ticket number or summary/i).fill(ticketNo);
    await page.getByText(ticketNo).first().click();

    // Signal problem appears resolved
    await page.getByTestId("resolve-indication-btn").click();
    await expect(page.getByText(/Undo \/ Problem Persists/i)).toBeVisible();

    // Screenshot Requester Detail View
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/08-requester-ticket-detail-view.png"),
      fullPage: true,
    });

    // Log out Requester
    await page.locator("#nav-logout-btn").click();

    // Phase 2: Log in as IT Staff
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();

    await page.getByTestId("staff-search-input").fill(ticketNo);
    await page.getByText(ticketNo).first().click();
    await expect(page.getByRole("heading", { name: ticketNo })).toBeVisible();

    // 1. Desktop Ticket Detail
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/01-staff-ticket-detail-desktop.png"),
      fullPage: true,
    });

    // 2. Tablet Ticket Detail
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/02-staff-ticket-detail-tablet.png"),
      fullPage: true,
    });

    // 3. Mobile Ticket Detail
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/03-staff-ticket-detail-mobile.png"),
      fullPage: true,
    });

    // Reset Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. Operational Control Panel Close-up
    const panelEl = page.getByTestId("operational-control-panel");
    if (await panelEl.isVisible()) {
      await panelEl.screenshot({
        path: path.join(screenshotDir, "staff-ticket-detail/04-operational-control-panel.png"),
      });
    }

    // 5. Public Comments Tab
    await page.getByTestId("tab-public-comments").click();
    await page.getByTestId("public-comment-input").fill("Staff Public Comment: Troubleshooting started.");
    await page.getByTestId("submit-public-comment-btn").click();
    await expect(page.getByText("Staff Public Comment: Troubleshooting started.")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/05-public-comments-tab.png"),
      fullPage: true,
    });

    // 6. Confidential Internal Notes Tab
    await page.getByTestId("tab-internal-notes").click();
    await page.getByTestId("internal-note-input").fill("Confidential note: verified switch port configuration.");
    await page.getByTestId("submit-internal-note-btn").click();
    await expect(page.getByText("Confidential note: verified switch port configuration.")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "staff-ticket-detail/06-internal-notes-tab-confidential.png"),
      fullPage: true,
    });

    // 7. Requester Resolution Banner Close-up
    const bannerEl = page.getByTestId("requester-resolved-banner");
    if (await bannerEl.isVisible()) {
      await bannerEl.screenshot({
        path: path.join(screenshotDir, "staff-ticket-detail/07-requester-resolution-banner.png"),
      });
    }
  });

  test("Capture User Management Screenshots", async ({ page }) => {
    await page.goto("/");
    await page.locator("#login-email-input").fill("admin.john@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.locator(".navbar").getByText("👤 John Smith")).toBeVisible();
    await page.getByTestId("nav-user-management").click();
    await expect(page.getByRole("heading", { name: /User Management/i })).toBeVisible();

    // 1. Desktop User Management
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/01-user-management-desktop.png"),
      fullPage: true,
    });

    // 2. Tablet User Management
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/02-user-management-tablet.png"),
      fullPage: true,
    });

    // 3. Mobile User Management
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/03-user-management-mobile.png"),
      fullPage: true,
    });

    // Reset Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. Create User Modal
    await page.getByRole("button", { name: /Create User/i }).click();
    await expect(page.getByTestId("create-user-modal")).toBeVisible();
    await page.getByTestId("create-user-name").fill("Dev Specialist");
    await page.getByTestId("create-user-email").fill("dev.specialist@example.com");
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/04-create-user-modal.png"),
      fullPage: true,
    });
    await page.getByTestId("cancel-create-user-btn").click();
    await expect(page.getByTestId("create-user-modal")).not.toBeVisible();

    // 5. Edit User Modal
    const firstEditBtn = page.locator('button:has-text("Edit")').first();
    await firstEditBtn.click();
    await expect(page.getByTestId("edit-user-modal")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/05-edit-user-modal.png"),
      fullPage: true,
    });
    await page.getByTestId("cancel-edit-user-btn").click();
    await expect(page.getByTestId("edit-user-modal")).not.toBeVisible();

    // 6. Self-Deactivation Guard Alert (Edit John Smith)
    await page.getByTestId("admin-search-input").fill("admin.john@example.com");
    await page.locator("tr", { hasText: "admin.john@example.com" }).getByRole("button", { name: /Edit/i }).click();
    await expect(page.getByTestId("self-deactivation-notice")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/06-self-deactivation-guard-alert.png"),
      fullPage: true,
    });
    await page.getByTestId("cancel-edit-user-btn").click();
    await expect(page.getByTestId("edit-user-modal")).not.toBeVisible();

    // 7. Reset Password Modal
    await page.getByTestId("admin-search-input").fill("");
    const resetBtn = page.locator('button:has-text("Reset Pass")').first();
    await resetBtn.click();
    await expect(page.getByTestId("reset-password-modal")).toBeVisible();
    await page.getByTestId("reset-password-input").fill("TemporaryPass123!");
    await page.screenshot({
      path: path.join(screenshotDir, "user-management/07-reset-password-modal.png"),
      fullPage: true,
    });
    await page.getByTestId("cancel-reset-password-btn").click();
    await expect(page.getByTestId("reset-password-modal")).not.toBeVisible();
  });
});
