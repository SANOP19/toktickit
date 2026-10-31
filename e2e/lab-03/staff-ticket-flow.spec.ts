import { test, expect } from "@playwright/test";

test.describe("Multi-Role Ticket Lifecycle & Confidential Communications (E2E-02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("full operational ticket lifecycle across Requester and IT Staff personas", async ({
    page,
  }) => {
    // -------------------------------------------------------------------------
    // Phase 1: Requester creates a support ticket
    // -------------------------------------------------------------------------
    await page.goto("/");
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByText("👤 Jennifer Anderson")).toBeVisible();

    // Navigate to Create Ticket
    await page.getByTestId("nav-create-ticket").click();
    await expect(page.getByRole("heading", { name: /Create IT Support Ticket/i })).toBeVisible();

    const uniqueSummary = `E2E Network Interruption ${Date.now()}`;
    await page.locator("#categorySelect").selectOption({ index: 1 });
    await page.locator("#relatedSystemSelect").selectOption({ index: 1 });
    await page.locator("#prioritySelect").selectOption("HIGH");
    await page.locator("#ticketSummary").fill(uniqueSummary);
    await page.locator("#ticketDescription").fill(
      "Detailed description for multi-role end-to-end integration ticket test."
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
    // Phase 2: IT Staff claims ticket, updates priority, advances status, posts notes
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();
    await expect(page.getByTestId("nav-staff-queue")).toBeVisible();

    // Search for ticket in staff queue
    await page.getByTestId("staff-search-input").fill(createdTicketNumber);
    const ticketRow = page.getByText(createdTicketNumber).first();
    await expect(ticketRow).toBeVisible();

    // Open Staff Ticket Detail
    await ticketRow.click();
    await expect(page.getByRole("heading", { name: createdTicketNumber })).toBeVisible();
    await expect(page.getByTestId("operational-control-panel")).toBeVisible();

    // 1. Claim Ticket
    const claimBtn = page.getByTestId("claim-ticket-btn");
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await expect(page.getByText(/Assigned to You/i)).toBeVisible();
    }

    // 2. Adjust IT Priority
    await page.getByTestId("staff-priority-select").selectOption("URGENT");
    await expect(page.getByText(/Priority updated to URGENT/i)).toBeVisible();

    // 3. Status Transition: Open -> In Progress
    await page.getByTestId("staff-status-select").selectOption("In Progress");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to In Progress/i)).toBeVisible();

    // 4. Post Confidential Internal Note
    await page.getByTestId("tab-internal-notes").click();
    await expect(page.getByTestId("internal-notes-security-notice")).toBeVisible();
    const internalNoteText = `Internal diagnostic log: hardware replacement needed at ${Date.now()}`;
    await page.getByTestId("internal-note-input").fill(internalNoteText);
    await page.getByTestId("submit-internal-note-btn").click();
    await expect(page.getByText(internalNoteText)).toBeVisible();

    // 5. Post Public Comment
    await page.getByTestId("tab-public-comments").click();
    const publicCommentText = `Public update: technician dispatched for repair at ${Date.now()}`;
    await page.getByTestId("public-comment-input").fill(publicCommentText);
    await page.getByTestId("submit-public-comment-btn").click();
    await expect(page.getByText(publicCommentText)).toBeVisible();

    // IT Staff logs out
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 3: Requester verifies public comment, absence of internal notes, signals resolved
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("jennifer.a@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await page.getByTestId("nav-my-tickets").click();
    await page.getByPlaceholder(/Search by ticket number or summary/i).fill(createdTicketNumber);
    await page.getByText(createdTicketNumber).first().click();

    // Verify Public Comment is visible
    await expect(page.getByText(publicCommentText)).toBeVisible();

    // Verify Confidential Internal Note is NOT visible to Requester
    await expect(page.getByText(internalNoteText)).not.toBeVisible();
    await expect(page.getByText(/Confidential Internal Notes/i)).not.toBeVisible();

    // Signal "Problem Appears Resolved"
    const resolveBtn = page.getByTestId("resolve-indication-btn");
    await expect(resolveBtn).toBeVisible();
    await resolveBtn.click();
    await expect(page.getByText(/Undo \/ Problem Persists/i)).toBeVisible();

    // Requester logs out
    await page.locator("#nav-logout-btn").click();
    await expect(page.locator("#login-email-input")).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase 4: IT Staff sees resolution banner and closes ticket
    // -------------------------------------------------------------------------
    await page.locator("#login-email-input").fill("tech.alex@example.com");
    await page.locator("#login-password-input").fill("Password123!");
    await page.locator("#login-submit-button").click();

    await expect(page.getByRole("navigation").getByText("👤 Alex Thompson")).toBeVisible();
    await expect(page.getByTestId("nav-staff-queue")).toBeVisible();

    await page.getByTestId("staff-search-input").fill(createdTicketNumber);
    await page.getByText(createdTicketNumber).first().click();

    // Verify Requester Resolution Banner is displayed to Staff
    await expect(page.getByTestId("requester-resolved-banner")).toBeVisible();

    // Advance Status: In Progress -> Resolved
    await page.getByTestId("staff-status-select").selectOption("Resolved");
    await page.getByTestId("update-status-btn").click();
    await expect(page.getByText(/status advanced to Resolved/i)).toBeVisible();
  });
});
