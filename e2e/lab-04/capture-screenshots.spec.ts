import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const screenshotDir = path.resolve(__dirname, "../../artifacts/lab-04/screenshots");

test.describe("Automated Screenshot Capture for Lab 4 Report", () => {
  test.beforeAll(() => {
    // Ensure output directories exist
    fs.mkdirSync(path.join(screenshotDir, "actions-taken"), { recursive: true });
    fs.mkdirSync(path.join(screenshotDir, "resolution-gate"), { recursive: true });
    fs.mkdirSync(path.join(screenshotDir, "dashboards"), { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Capture Dashboards Across Viewports (Screen 8.1 & Screen 8.2)", async ({ page }) => {
    // -------------------------------------------------------------
    // Staff Dashboard
    // -------------------------------------------------------------
    await page.goto("/");
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome back, Alex Thompson!/i })).toBeVisible();

    // 1. Staff Dashboard Desktop (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/01-staff-dashboard-desktop.png"),
      fullPage: true,
    });

    // 2. Staff Dashboard Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/02-staff-dashboard-tablet.png"),
      fullPage: true,
    });

    // 3. Staff Dashboard Mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/03-staff-dashboard-mobile.png"),
      fullPage: true,
    });

    // Reset to Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // Urgent banner screenshot (if present, or capture card)
    const urgentBanner = page.getByTestId("urgent-tickets-banner");
    if (await urgentBanner.isVisible()) {
      await page.screenshot({
        path: path.join(screenshotDir, "dashboards/04-staff-dashboard-urgent-banner.png"),
        fullPage: true,
      });
    }

    // Staff logout
    await page.locator("#nav-logout-btn").click();

    // -------------------------------------------------------------
    // Requester Dashboard
    // -------------------------------------------------------------
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();
    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();
    await page.getByTestId("nav-dashboard").click();
    await expect(page.getByRole("heading", { name: /Welcome, Jennifer Anderson!/i })).toBeVisible();

    // 5. Requester Dashboard Desktop (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/05-requester-dashboard-desktop.png"),
      fullPage: true,
    });

    // 6. Requester Dashboard Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/06-requester-dashboard-tablet.png"),
      fullPage: true,
    });

    // 7. Requester Dashboard Mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/07-requester-dashboard-mobile.png"),
      fullPage: true,
    });

    // Reset to Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "dashboards/08-requester-dashboard-recent-requests.png"),
      fullPage: true,
    });

    await page.locator("#nav-logout-btn").click();
  });

  test("Capture Actions Taken and Resolution Gate Journey", async ({ page }) => {
    // 1. Requester creates ticket
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-create-ticket").click();
    const summary = `Screenshot Verification Ticket ${Date.now()}`;
    await page.locator("#categorySelect").selectOption({ index: 1 });
    await page.locator("#relatedSystemSelect").selectOption({ index: 1 });
    await page.locator("#prioritySelect").selectOption("HIGH");
    await page.locator("#ticketSummary").fill(summary);
    await page.locator("#ticketDescription").fill("Comprehensive multi-role E2E screenshot capture session.");
    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    const ticketNumberEl = page.locator('[data-testid="created-ticket-number"]');
    await expect(ticketNumberEl).toBeVisible();
    const ticketNum = (await ticketNumberEl.textContent())?.trim() || "";

    await page.locator("#nav-logout-btn").click();

    // 2. IT Staff opens ticket
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-staff-queue").click();
    await page.getByTestId("staff-search-input").fill(ticketNum);
    await page.getByText(ticketNum).first().click();

    await expect(page.getByRole("heading", { name: ticketNum })).toBeVisible();
    await expect(page.getByTestId("operational-control-panel")).toBeVisible();

    // Claim ticket and wait for assignment update
    const claimBtn = page.getByTestId("claim-ticket-btn");
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();
    await expect(page.getByText(/Assigned to You/i)).toBeVisible();

    await page.getByTestId("staff-status-select").selectOption("In Progress");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to In Progress/i)).toBeVisible();

    // Test Resolution Gate Warning
    await page.getByTestId("staff-status-select").selectOption("Resolved");
    await expect(page.getByTestId("resolution-gate-warning")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "resolution-gate/01-resolution-gate-warning-banner.png"),
      fullPage: true,
    });

    // Attempt blocked update
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByTestId("status-error-alert")).toBeVisible();
    await expect(page.getByTestId("status-error-alert")).toContainText(/Cannot advance ticket to Resolved or Closed/i);
    await page.screenshot({
      path: path.join(screenshotDir, "resolution-gate/02-resolution-attempt-blocked-error.png"),
      fullPage: true,
    });

    // Open Actions Taken Tab
    await page.getByTestId("tab-actions-taken").click();

    // Desktop view of Actions Taken tab
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/01-staff-actions-tab-desktop.png"),
      fullPage: true,
    });

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/02-staff-actions-tab-tablet.png"),
      fullPage: true,
    });

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/03-staff-actions-tab-mobile.png"),
      fullPage: true,
    });

    // Reset to Desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // Open Add Action Taken Modal
    await page.getByTestId("add-action-taken-btn").click();
    await expect(page.getByRole("heading", { name: /Record Action Taken/i })).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/04-add-action-modal-empty.png"),
      fullPage: true,
    });

    // Trigger validation error
    await page.getByTestId("action-description-input").fill("Configured VLAN tagging on uplink switch port.");
    await page.getByTestId("action-result-input").fill("VLAN 200 trunk active.");
    await page.getByTestId("action-followup-toggle").check();
    await page.getByTestId("submit-action-btn").click();
    await expect(page.getByTestId("action-modal-error")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/05-add-action-modal-validation-error.png"),
      fullPage: true,
    });

    // Complete form
    await page.getByTestId("action-followup-note-input").fill("Verify spanning tree convergence on secondary bridge within 2 hours.");
    await page.getByTestId("action-attachment-notes-input").fill("spanning_tree_topology.pdf");
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/06-add-action-modal-filled.png"),
      fullPage: true,
    });

    await page.getByTestId("submit-action-btn").click();
    await expect(page.getByRole("heading", { name: /Record Action Taken/i })).not.toBeVisible();

    // Action card created screenshot
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/07-action-card-created-with-followup.png"),
      fullPage: true,
    });

    // Advance to Resolved
    await page.getByTestId("staff-status-select").selectOption("Resolved");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to Resolved/i)).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "resolution-gate/03-ticket-successfully-resolved.png"),
      fullPage: true,
    });

    await page.locator("#nav-logout-btn").click();

    // Requester view
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-my-tickets").click();
    await expect(page.getByText(summary).first()).toBeVisible();
    await page.getByText(summary).first().click();

    // Toggle advisory resolved
    await page.getByTestId("resolve-indication-btn").click();
    await expect(page.getByText(/Problem Marked as Resolved by Requester/i)).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "resolution-gate/04-requester-advisory-resolved-toggle.png"),
      fullPage: true,
    });

    // Check Actions Taken tab in requester view
    await page.getByTestId("requester-tab-actions").click();
    await expect(page.getByTestId("actions-taken-section")).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "actions-taken/08-requester-read-only-actions-view.png"),
      fullPage: true,
    });

    await page.locator("#nav-logout-btn").click();

    // Staff closes ticket
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-staff-queue").click();
    await page.getByTestId("staff-search-input").fill(ticketNum);
    await page.getByText(ticketNum).first().click();

    await page.getByTestId("staff-status-select").selectOption("Closed");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to Closed/i)).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "resolution-gate/05-ticket-closed-final.png"),
      fullPage: true,
    });
  });
});
