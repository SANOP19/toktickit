import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketDetail from "../../src/components/TicketDetail";
import * as api from "../../src/api";

const mockRequester: api.RequesterUser = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.anderson@example.com",
};

const mockTicket: api.Ticket = {
  id: 42,
  ticketNumber: "TKT-2026-000042",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 7,
  summary: "Laptop battery drains quickly",
  description: "Battery discharges completely within 30 minutes of unplugging from charger.",
  requestedPriority: "HIGH",
  currentStatus: "New",
  createdAt: "2026-09-03T10:00:00.000Z",
  updatedAt: "2026-09-03T10:00:00.000Z",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  requester: mockRequester,
  attachments: [
    {
      id: 101,
      ticketId: 42,
      originalName: "battery_diagnostic.png",
      storageName: "battery_diagnostic_uuid.png",
      mimeType: "image/png",
      sizeBytes: 1048576,
      isRemoved: false,
      createdAt: "2026-09-03T10:05:00.000Z",
    },
  ],
};

describe("TicketDetail Component (UI-05, UI-06)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders ticket detail information, read-only fields, badges, and active attachments (UI-05, AC-03)", async () => {
    vi.spyOn(api, "getTicketDetail").mockResolvedValueOnce(mockTicket);

    render(<TicketDetail ticketId={42} currentRequester={mockRequester} onBack={() => {}} />);

    expect(await screen.findByRole("heading", { name: "TKT-2026-000042" })).toBeInTheDocument();
    expect(screen.getByText("Laptop battery drains quickly")).toBeInTheDocument();
    expect(
      screen.getByText("Battery discharges completely within 30 minutes of unplugging from charger.")
    ).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Corporate Laptop")).toBeInTheDocument();
    expect(screen.getByText("battery_diagnostic.png")).toBeInTheDocument();
    expect(screen.getByText(/1.0 MB/)).toBeInTheDocument();
  });

  it("opens soft-removal modal, validates reason length, and submits removal (UI-06, BR-11, AC-08)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getTicketDetail").mockResolvedValue(mockTicket);
    const softRemoveSpy = vi.spyOn(api, "softRemoveAttachment").mockResolvedValueOnce({
      ...mockTicket.attachments![0],
      isRemoved: true,
      removalReason: "Uploaded wrong screenshot by mistake",
      removedAt: "2026-09-03T10:10:00.000Z",
    });

    render(<TicketDetail ticketId={42} currentRequester={mockRequester} onBack={() => {}} />);

    const removeBtn = await screen.findByRole("button", { name: /Remove/i });
    await user.click(removeBtn);

    expect(screen.getByText(/Confirm Attachment Removal/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /Confirm Removal/i });
    const reasonInput = screen.getByLabelText(/Reason for Removal/i);

    // Try submitting with short reason (< 5 characters)
    await user.type(reasonInput, "bad");
    await user.click(confirmBtn);
    expect(
      screen.getByText(/Removal reason is required and must be at least 5 characters/i)
    ).toBeInTheDocument();
    expect(softRemoveSpy).not.toHaveBeenCalled();

    // Fill valid reason
    await user.clear(reasonInput);
    await user.type(reasonInput, "Uploaded wrong screenshot by mistake");
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(softRemoveSpy).toHaveBeenCalledWith(
        42,
        101,
        1,
        "Uploaded wrong screenshot by mistake"
      );
    });
  });

  it("displays an error alert when ticket detail loading fails or is forbidden (UI-05, AC-03)", async () => {
    vi.spyOn(api, "getTicketDetail").mockRejectedValueOnce(
      new Error("Forbidden: You do not have permission to view this ticket")
    );

    render(<TicketDetail ticketId={999} currentRequester={mockRequester} onBack={() => {}} />);

    expect(
      await screen.findByText(/Forbidden: You do not have permission to view this ticket/i)
    ).toBeInTheDocument();
  });
});
