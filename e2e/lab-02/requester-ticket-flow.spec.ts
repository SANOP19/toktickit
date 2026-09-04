import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("Requester End-to-End User Journey (E2E-01)", () => {
  test("complete requester journey from selection, ticket creation, list filtering, detail inspection, to attachment soft-removal", async ({
    page,
  }) => {
    // 1. Visit Application Home
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("IT Service Desk");

    // 2. Open Development Requester Selection & Select "Jennifer Anderson"
    const changeRequesterBtn = page.getByRole("button", { name: /Change Requester/i });
    if (await changeRequesterBtn.isVisible()) {
      await changeRequesterBtn.click();
      await expect(page.getByText(/Select Development Requester/i)).toBeVisible();
      await page.locator("select").selectOption({ label: "Jennifer Anderson (jennifer.a@example.com)" });
      await page.getByRole("button", { name: /Select & Continue/i }).click();
    }

    // 3. Navigate to "Create Ticket"
    await page.getByRole("button", { name: /Create Ticket/i }).first().click();
    await expect(page.getByText(/Create IT Support Ticket/i)).toBeVisible();

    // 4. Fill in Ticket Information
    await page.locator("#categorySelect").selectOption({ label: "Hardware" });
    await page.locator("#relatedSystemSelect").selectOption({ label: "Corporate Laptop" });
    await page.locator("#prioritySelect").selectOption("HIGH");

    const uniqueSummary = `E2E Laptop Display Failure ${Date.now()}`;
    await page.locator("#summaryInput").fill(uniqueSummary);
    await page.locator("#descriptionInput").fill(
      "Screen flickers uncontrollably when connected to external monitor via HDMI dock."
    );

    // 5. Submit the Ticket
    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    // 6. Verify Ticket Creation Confirmation and Ticket Number format
    const ticketNumberElement = page.locator('[data-testid="created-ticket-number"]');
    await expect(ticketNumberElement).toBeVisible();
    const createdTicketNumber = (await ticketNumberElement.textContent())?.trim() || "";
    expect(createdTicketNumber).toMatch(/^TKT-2026-\d{6}$/);

    // 7. Click "View in My Tickets" to return to list
    await page.getByRole("button", { name: /View in My Tickets/i }).click();
    await expect(page.getByPlaceholder(/Search by ticket number or summary/i)).toBeVisible();

    // 8. Search for the newly created ticket
    await page.locator("#ticketSearchInput").fill(createdTicketNumber);
    await expect(page.getByText(createdTicketNumber)).toBeVisible();
    await expect(page.getByText(uniqueSummary)).toBeVisible();

    // 9. Open Ticket Detail View
    await page.getByText(createdTicketNumber).click();
    await expect(page.getByRole("heading", { name: createdTicketNumber })).toBeVisible();
    await expect(page.getByText(uniqueSummary)).toBeVisible();

    // 10. Prepare and Upload a Dummy PNG Attachment
    const dummyPngPath = path.resolve(process.cwd(), "e2e-test-upload.png");
    const fakePng = Buffer.from("89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489", "hex");
    fs.writeFileSync(dummyPngPath, fakePng);

    try {
      const fileInput = page.locator("#attachment-upload-input");
      await fileInput.setInputFiles(dummyPngPath);

      // Verify attachment appears in Active Attachments list
      await expect(page.getByText("e2e-test-upload.png")).toBeVisible();

      // 11. Soft-remove Attachment
      await page.getByRole("button", { name: /Remove/i }).click();
      await expect(page.getByText(/Confirm Attachment Removal/i)).toBeVisible();

      const reasonTextarea = page.locator("#removal-reason-input");
      await reasonTextarea.fill("Outdated screenshot replaced by user");

      await page.getByRole("button", { name: /Confirm Removal/i }).click();

      // Verify attachment moves to Removed Attachments (Audit History)
      await expect(page.getByText(/Removed Attachments \(Audit History\)/i)).toBeVisible();
      await expect(page.getByText(/Reason: Outdated screenshot replaced by user/i)).toBeVisible();
      await expect(page.getByText(/Download Disabled/i)).toBeVisible();
    } finally {
      if (fs.existsSync(dummyPngPath)) {
        fs.unlinkSync(dummyPngPath);
      }
    }

    // 12. Navigate back to My Tickets
    await page.getByRole("button", { name: /Back to My Tickets/i }).click();
    await expect(page.getByPlaceholder(/Search by ticket number or summary/i)).toBeVisible();
  });
});
