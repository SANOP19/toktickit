import { test, expect } from "@playwright/test";

test.describe("Resolution Gate Enforcement & Status Workflow (E2E-02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("blocks resolution without actions taken, permits after action recorded, handles requester toggle and closure", async ({
    page,
  }) => {
    // -------------------------------------------------------------------------
    // Phase 1: Requester creates a new ticket
    // -------------------------------------------------------------------------
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();

    await page.getByTestId("nav-create-ticket").click();
    await expect(page.getByRole("heading", { name: /Create IT Support Ticket/i })).toBeVisible();

    const uniqueSummary = `E2E Resolution Gate Ticket ${Date.now()}`;
    await page.locator("#categorySelect").selectOption({ index: 1 });
    await page.locator("#relatedSystemSelect").selectOption({ index: 1 });
    await page.locator("#prioritySelect").selectOption("MEDIUM");
    await page.locator("#ticketSummary").fill(uniqueSummary);
    await page.locator("#ticketDescription").fill(
      "Test ticket to verify server-side Resolution Gate enforcement and lifecycle closure."
    );

    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    const ticketNumberEl = page.locator('[data-testid="created-ticket-number"]');
    await expect(ticketNumberEl).toBeVisible();
    const createdTicketNumber = (await ticketNumberEl.textContent())?.trim() || "";
    expect(createdTicketNumber).toMatch(/^TKT-2026-\d{6}$/);

    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 2: IT Staff attempts resolution with 0 actions -> BLOCKED
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();

    // Navigate to Staff Queue and search for ticket
    await page.getByTestId("nav-staff-queue").click();
    await page.getByTestId("staff-search-input").fill(createdTicketNumber);
    const ticketRow = page.getByText(createdTicketNumber).first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    await expect(page.getByRole("heading", { name: createdTicketNumber })).toBeVisible();
    await expect(page.getByTestId("operational-control-panel")).toBeVisible();

    // Claim ticket and wait for assignment update
    const claimBtn = page.getByTestId("claim-ticket-btn");
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();
    await expect(page.getByText(/Assigned to You/i)).toBeVisible();

    // Advance status to In Progress
    await page.getByTestId("staff-status-select").selectOption("In Progress");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to In Progress/i)).toBeVisible();

    // Now select "Resolved" in dropdown when 0 actions exist
    await page.getByTestId("staff-status-select").selectOption("Resolved");

    // Verify Resolution Gate warning banner is displayed
    const gateWarning = page.getByTestId("resolution-gate-warning");
    await expect(gateWarning).toBeVisible();
    await expect(gateWarning).toContainText(/Resolution Gate/i);
    await expect(gateWarning).toContainText(/At least 1 Action Taken must be recorded/i);

    // Attempt to click Update status anyway
    await page.getByTestId("update-status-btn").click();

    // Verify rejection from server: status-error-alert is displayed with server gate error
    const statusError = page.getByTestId("status-error-alert");
    await expect(statusError).toBeVisible();
    await expect(statusError).toContainText(/Cannot advance ticket to Resolved or Closed without at least one recorded Action Taken/i);

    // Verify current status remains "In Progress"
    await expect(page.getByText("In Progress").first()).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 3: Staff records an Action Taken to satisfy the gate
    // -------------------------------------------------------------------------
    await page.getByTestId("tab-actions-taken").click();
    await page.getByTestId("add-action-taken-btn").click();

    await page.getByTestId("action-description-input").fill("Configured QoS queue and replaced faulty Ethernet transceiver.");
    await page.getByTestId("action-result-input").fill("Bandwidth restored to 1000 Mbps with zero frame loss.");
    await page.getByTestId("submit-action-btn").click();

    // Verify modal closes and action appears
    await expect(page.getByTestId("action-status-badge-completed")).toBeVisible();

    // Now attempt status transition to "Resolved" again
    await page.getByTestId("staff-status-select").selectOption("Resolved");

    // Resolution Gate warning should NOT be visible now
    await expect(page.getByTestId("resolution-gate-warning")).not.toBeVisible();

    // Submit status transition
    await page.getByTestId("update-status-btn").click();

    // Verify success
    await expect(page.getByText(/status advanced to Resolved/i)).toBeVisible();

    // Staff logs out
    await page.locator("#nav-logout-btn").click();

    // -------------------------------------------------------------------------
    // Phase 4: Requester toggles advisory "Problem Appears Resolved" toggle
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-my-tickets").click();
    await expect(page.getByText(uniqueSummary).first()).toBeVisible();
    await page.getByText(uniqueSummary).first().click();

    // Check resolve indication section
    await expect(page.getByTestId("resolve-indication-section")).toBeVisible();
    const resolveToggleBtn = page.getByTestId("resolve-indication-btn");
    await expect(resolveToggleBtn).toContainText(/Problem Appears Resolved/i);

    // Requester confirms advisory resolution
    await resolveToggleBtn.click();
    await expect(page.getByText(/Problem Marked as Resolved by Requester/i)).toBeVisible();
    await expect(page.getByText("Requester Confirmed")).toBeVisible();

    // Requester logs out
    await page.locator("#nav-logout-btn").click();

    // -------------------------------------------------------------------------
    // Phase 5: Staff sees requester indication and completes formal closure
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-staff-queue").click();
    await page.getByTestId("staff-search-input").fill(createdTicketNumber);
    await page.getByText(createdTicketNumber).first().click();

    // Verify Requester Resolved banner is visible on staff detail view
    await expect(page.getByTestId("requester-resolved-banner")).toBeVisible();
    await expect(page.getByText(/has indicated that this issue appears resolved/i)).toBeVisible();

    // Advance status to Closed
    await page.getByTestId("staff-status-select").selectOption("Closed");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to Closed/i)).toBeVisible();

    // Verify Closed terminal status
    await expect(page.getByText(/Terminal Status \(Closed\)/i)).toBeVisible();
  });
});
