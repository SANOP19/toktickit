import { test, expect } from "@playwright/test";

test.describe("Multi-Role Actions Taken Workflow (E2E-01)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("staff records action with follow-up validation and requester inspects in read-only mode", async ({
    page,
  }) => {
    // -------------------------------------------------------------------------
    // Phase 1: Requester creates a new IT Support Ticket
    // -------------------------------------------------------------------------
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();

    // Navigate to Create Ticket
    await page.getByTestId("nav-create-ticket").click();
    await expect(page.getByRole("heading", { name: /Create IT Support Ticket/i })).toBeVisible();

    const uniqueSummary = `E2E Actions Taken Journey ${Date.now()}`;
    await page.locator("#categorySelect").selectOption({ index: 1 });
    await page.locator("#relatedSystemSelect").selectOption({ index: 1 });
    await page.locator("#prioritySelect").selectOption("HIGH");
    await page.locator("#ticketSummary").fill(uniqueSummary);
    await page.locator("#ticketDescription").fill(
      "Requester reported sporadic network disconnects during large file transfers."
    );

    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    // Capture ticket number
    const ticketNumberEl = page.locator('[data-testid="created-ticket-number"]');
    await expect(ticketNumberEl).toBeVisible();
    const createdTicketNumber = (await ticketNumberEl.textContent())?.trim() || "";
    expect(createdTicketNumber).toMatch(/^TKT-2026-\d{6}$/);

    // Requester logs out
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 2: IT Staff logs in, opens ticket, tests validation, records action
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();
    await expect(page.getByTestId("nav-staff-queue")).toBeVisible();

    // Navigate to Staff Queue and search for ticket
    await page.getByTestId("nav-staff-queue").click();
    await page.getByTestId("staff-search-input").fill(createdTicketNumber);
    const ticketRow = page.getByText(createdTicketNumber).first();
    await expect(ticketRow).toBeVisible();

    // Open Staff Ticket Detail
    await ticketRow.click();
    await expect(page.getByRole("heading", { name: createdTicketNumber })).toBeVisible();
    await expect(page.getByTestId("operational-control-panel")).toBeVisible();

    // Claim ticket
    const claimBtn = page.getByTestId("claim-ticket-btn");
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();
    await expect(page.getByText(/Assigned to You/i)).toBeVisible();

    // Switch to Actions Taken tab
    const actionsTab = page.getByTestId("tab-actions-taken");
    await expect(actionsTab).toBeVisible();
    await actionsTab.click();

    // Verify empty state is displayed
    await expect(page.getByTestId("no-actions-taken-msg")).toBeVisible();
    await expect(page.getByText("No Actions Taken Recorded Yet")).toBeVisible();

    // Click Add Action Taken
    await page.getByTestId("add-action-taken-btn").click();

    // Verify modal appears
    await expect(page.getByRole("heading", { name: /Record Action Taken/i })).toBeVisible();

    // Trigger validation: enable follow-up without providing follow-up note
    await page.getByTestId("action-description-input").fill("Tested patch cable and inspected switch port 4 stats.");
    await page.getByTestId("action-result-input").fill("CRC errors observed on switch port buffer.");
    await page.getByTestId("action-followup-toggle").check();

    // Submit without note to test conditional validation
    await page.getByTestId("submit-action-btn").click();

    // Verify validation error
    const modalError = page.getByTestId("action-modal-error");
    await expect(modalError).toBeVisible();
    await expect(modalError).toContainText(/Follow-up note is mandatory/i);

    // Provide mandatory follow-up note and attachment reference
    await page.getByTestId("action-followup-note-input").fill("Schedule switch port optical module replacement within 24 hours.");
    await page.getByTestId("action-attachment-notes-input").fill("port4_crc_diagnostic.png");

    // Submit successfully
    await page.getByTestId("submit-action-btn").click();

    // Verify modal is closed
    await expect(page.getByRole("heading", { name: /Record Action Taken/i })).not.toBeVisible();

    // Verify Action card is rendered with all fields
    await expect(page.getByTestId("actions-taken-list")).toBeVisible();
    await expect(page.getByText("Tested patch cable and inspected switch port 4 stats.")).toBeVisible();
    await expect(page.getByText("CRC errors observed on switch port buffer.")).toBeVisible();
    await expect(page.getByText("Schedule switch port optical module replacement within 24 hours.")).toBeVisible();
    await expect(page.getByText("port4_crc_diagnostic.png")).toBeVisible();
    await expect(page.getByTestId("action-status-badge-completed")).toBeVisible();

    // Verify actions count badge updated to 1
    await expect(page.getByTestId("actions-count-badge")).toHaveText("1");

    // Staff logs out
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 3: Requester inspects ticket in read-only mode
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();

    // Navigate to My Tickets
    await page.getByTestId("nav-my-tickets").click();
    await expect(page.getByText(uniqueSummary).first()).toBeVisible();

    // Open ticket detail
    await page.getByText(uniqueSummary).first().click();
    await expect(page.getByRole("heading", { name: createdTicketNumber })).toBeVisible();

    // Switch to Actions Taken tab on requester view
    const requesterActionsTab = page.getByTestId("requester-tab-actions");
    await expect(requesterActionsTab).toBeVisible();
    await requesterActionsTab.click();

    // Verify Actions Taken section is rendered
    await expect(page.getByTestId("actions-taken-section")).toBeVisible();

    // Verify the action card is visible to requester
    await expect(page.getByText("Tested patch cable and inspected switch port 4 stats.")).toBeVisible();
    await expect(page.getByText("CRC errors observed on switch port buffer.")).toBeVisible();
    await expect(page.getByText("Schedule switch port optical module replacement within 24 hours.")).toBeVisible();

    // Verify Add/Edit buttons are STRICTLY hidden and not present in DOM
    await expect(page.getByTestId("add-action-taken-btn")).not.toBeVisible();
    await expect(page.getByTestId("empty-add-action-btn")).not.toBeVisible();
    await expect(page.locator('[data-testid^="edit-action-btn-"]')).toHaveCount(0);
  });
});
