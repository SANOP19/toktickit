import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketDetail } from "../../src/components/StaffTicketDetail";
import * as api from "../../src/api";
import { Ticket, ActionTaken } from "../../src/types";

// Mock useAuth
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 4, name: "Lisa Martinez", email: "tech.lisa@example.com", role: "IT_STAFF" },
    token: "mock-staff-jwt-token",
  }),
}));

const mockTicketWithoutActions: Ticket = {
  id: 301,
  ticketNumber: "TKT-2026-000301",
  requesterId: 1,
  ownerId: 4,
  owner: { id: 4, name: "Lisa Martinez", email: "tech.lisa@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: false },
  categoryId: 2,
  relatedSystemId: 7,
  summary: "Edge router flapping during peak hours",
  description: "BGP sessions dropping every 15 minutes.",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  currentStatus: "In Progress",
  isRequesterResolved: false,
  createdAt: "2026-10-29T08:00:00.000Z",
  updatedAt: "2026-10-29T09:00:00.000Z",
  category: { id: 2, name: "Network" },
  relatedSystem: { id: 7, name: "Core Router" },
  requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
  attachments: [],
  comments: [],
  internalNotes: [],
  actionsTaken: [],
};

const mockAction: ActionTaken = {
  id: 1,
  ticketId: 301,
  performedById: 4,
  performedBy: { id: 4, name: "Lisa Martinez", email: "tech.lisa@example.com", role: "IT_STAFF" },
  actionDateTime: "2026-10-29T10:00:00.000Z",
  description: "Diagnosed BGP keepalive timeout and tuned hold-time timer.",
  result: "BGP peering stabilized without flapping.",
  status: "COMPLETED",
  followUpRequired: false,
  version: 1,
  createdAt: "2026-10-29T10:00:00.000Z",
  updatedAt: "2026-10-29T10:00:00.000Z",
};

describe("Sprint 4 Issue 4: Ticket Workflow Hardening & Resolution Gate (FR-07, BR-10..13, AC-08)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("displays Resolution Gate warning banner when advancing to Resolved with 0 Actions Taken (AC-08, BR-11)", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValue(mockTicketWithoutActions);
    vi.spyOn(api, "fetchStaffUsersApi").mockResolvedValue([]);
    vi.spyOn(api, "fetchActionsTaken").mockResolvedValue([]);

    render(<StaffTicketDetail ticketId={301} onBack={() => {}} />);

    // Wait for ticket to load
    await waitFor(() => {
      expect(screen.getByTestId("staff-status-select")).toBeInTheDocument();
    });

    // Select "Advance to: Resolved"
    await user.selectOptions(screen.getByTestId("staff-status-select"), "Resolved");

    // Resolution Gate warning banner MUST appear
    expect(screen.getByTestId("resolution-gate-warning")).toBeInTheDocument();
    expect(screen.getByTestId("resolution-gate-warning")).toHaveTextContent("Resolution Gate: At least 1 Action Taken must be recorded");
  });

  it("displays server-side error alert when Resolution Gate rejects status update (FR-07, BR-11)", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValue(mockTicketWithoutActions);
    vi.spyOn(api, "fetchStaffUsersApi").mockResolvedValue([]);
    vi.spyOn(api, "fetchActionsTaken").mockResolvedValue([]);

    // Mock API rejection with RESOLUTION_GATE_FAILED
    vi.spyOn(api, "updateStaffTicketStatusApi").mockRejectedValueOnce(
      new Error("Cannot advance ticket to Resolved or Closed without at least one recorded Action Taken.")
    );

    render(<StaffTicketDetail ticketId={301} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId("staff-status-select")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByTestId("staff-status-select"), "Resolved");
    await user.click(screen.getByTestId("update-status-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("status-error-alert")).toBeInTheDocument();
      expect(screen.getByTestId("status-error-alert")).toHaveTextContent(
        "Cannot advance ticket to Resolved or Closed without at least one recorded Action Taken."
      );
    });
  });

  it("allows advancing status to Resolved when ticket has recorded Actions Taken (AC-08)", async () => {
    const user = userEvent.setup();

    const ticketWithActions: Ticket = {
      ...mockTicketWithoutActions,
      actionsTaken: [mockAction],
    };

    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValue(ticketWithActions);
    vi.spyOn(api, "fetchStaffUsersApi").mockResolvedValue([]);
    vi.spyOn(api, "fetchActionsTaken").mockResolvedValue([mockAction]);

    const updateStatusSpy = vi.spyOn(api, "updateStaffTicketStatusApi").mockResolvedValue({
      ...ticketWithActions,
      currentStatus: "Resolved",
    });

    render(<StaffTicketDetail ticketId={301} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId("staff-status-select")).toBeInTheDocument();
    });

    // Advance to: Resolved
    await user.selectOptions(screen.getByTestId("staff-status-select"), "Resolved");

    // Warning banner MUST NOT appear because ticket has actions
    expect(screen.queryByTestId("resolution-gate-warning")).not.toBeInTheDocument();

    // Click Update
    await user.click(screen.getByTestId("update-status-btn"));

    await waitFor(() => {
      expect(updateStatusSpy).toHaveBeenCalledWith(301, "Resolved");
      expect(screen.getByText(/Ticket status advanced to Resolved/i)).toBeInTheDocument();
    });
  });

  it("displays advisory requester resolved indication without disabling staff controls (FR-08, BR-12, AC-14)", async () => {
    const ticketWithRequesterResolved: Ticket = {
      ...mockTicketWithoutActions,
      isRequesterResolved: true,
    };

    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValue(ticketWithRequesterResolved);
    vi.spyOn(api, "fetchStaffUsersApi").mockResolvedValue([]);
    vi.spyOn(api, "fetchActionsTaken").mockResolvedValue([]);

    render(<StaffTicketDetail ticketId={301} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId("requester-resolved-banner")).toBeInTheDocument();
    });

    expect(screen.getByTestId("requester-resolved-banner")).toHaveTextContent(
      "The requester (Jennifer Anderson) has indicated that this issue appears resolved."
    );

    // Staff status select is still active and operational (advisory indication only)
    expect(screen.getByTestId("staff-status-select")).toBeInTheDocument();
    expect(screen.getByTestId("update-status-btn")).toBeInTheDocument();
  });
});
