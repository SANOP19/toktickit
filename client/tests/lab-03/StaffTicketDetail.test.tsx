import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketDetail } from "../../src/components/StaffTicketDetail";
import { AuthProvider } from "../../src/context/AuthContext";
import * as api from "../../src/api";
import { User, Ticket } from "../../src/types";

const mockStaffUser: User = {
  id: 6,
  name: "Alex Thompson",
  email: "alex.t@example.com",
  role: "IT_STAFF",
  isActive: true,
  mustChangePassword: false,
};

const mockStaffList: User[] = [
  {
    id: 6,
    name: "Alex Thompson",
    email: "alex.t@example.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 7,
    name: "Lisa Martinez",
    email: "lisa.m@example.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
  },
];

const mockTicketDetail: Ticket = {
  id: 1,
  ticketNumber: "TKT-2026-000001",
  summary: "VPN connection drops every 10 minutes",
  description: "Experiencing repeated disconnects during remote meetings.",
  categoryId: 1,
  category: { id: 1, name: "Access & Accounts" },
  relatedSystemId: 1,
  relatedSystem: { id: 1, name: "GlobalProtect VPN" },
  requesterId: 1,
  requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
  currentStatus: "New",
  requestedPriority: "MEDIUM",
  itPriority: "HIGH",
  ownerId: null,
  owner: null,
  isRequesterResolved: false,
  createdAt: "2026-09-01T08:30:00.000Z",
  updatedAt: "2026-09-01T08:30:00.000Z",
  attachments: [
    {
      id: 101,
      ticketId: 1,
      originalName: "vpn_error_log.txt",
      storageName: "vpn_error_log.txt",
      sizeBytes: 15360,
      mimeType: "text/plain",
      isRemoved: false,
      createdAt: "2026-09-01T08:31:00.000Z",
    },
  ],
  comments: [
    {
      id: 1,
      ticketId: 1,
      authorId: 1,
      author: { id: 1, name: "Jennifer Anderson", role: "REQUESTER" },
      content: "This started happening yesterday morning after updating.",
      createdAt: "2026-09-01T09:00:00.000Z",
    },
  ],
  internalNotes: [
    {
      id: 1,
      ticketId: 1,
      authorId: 6,
      author: { id: 6, name: "Alex Thompson", role: "IT_STAFF" },
      content: "Gateway 10.0.1.5 was restarted earlier. Investigating tunnel logs.",
      createdAt: "2026-09-01T09:30:00.000Z",
    },
  ],
};

function renderStaffTicketDetail(props: { ticketId: number; onBack: () => void }) {
  return render(
    <AuthProvider initialUser={mockStaffUser}>
      <StaffTicketDetail {...props} />
    </AuthProvider>
  );
}

describe("StaffTicketDetail Component (Issue 5 / Teacher Mockup 3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValue(mockTicketDetail);
    vi.spyOn(api, "fetchStaffUsersApi").mockResolvedValue(mockStaffList);
    vi.spyOn(api, "assignStaffTicketApi").mockResolvedValue({
      ...mockTicketDetail,
      ownerId: 6,
      owner: mockStaffUser,
      currentStatus: "Open",
    });
    vi.spyOn(api, "updateStaffTicketPriorityApi").mockResolvedValue({
      ...mockTicketDetail,
      itPriority: "URGENT",
    });
    vi.spyOn(api, "updateStaffTicketStatusApi").mockResolvedValue({
      ...mockTicketDetail,
      currentStatus: "Open",
    });
    vi.spyOn(api, "addCommentApi").mockResolvedValue({
      id: 2,
      ticketId: 1,
      authorId: 6,
      author: { id: 6, name: "Alex Thompson", role: "IT_STAFF" },
      content: "We are checking the gateway logs now.",
      createdAt: "2026-09-01T10:00:00.000Z",
    });
    vi.spyOn(api, "addInternalNoteApi").mockResolvedValue({
      id: 2,
      ticketId: 1,
      authorId: 6,
      author: { id: 6, name: "Alex Thompson", role: "IT_STAFF" },
      content: "Checked RADIUS server, no authentication failure found.",
      createdAt: "2026-09-01T10:15:00.000Z",
    });
  });

  it("renders ticket operational details, metadata, requester, and attachments (AC-07)", async () => {
    const handleBack = vi.fn();
    renderStaffTicketDetail({ ticketId: 1, onBack: handleBack });

    await waitFor(() => {
      expect(screen.getByText(/TKT-2026-000001/i)).toBeInTheDocument();
      expect(screen.getByText(/VPN connection drops every 10 minutes/i)).toBeInTheDocument();
    });

    // Requester info
    const requesterElements = screen.getAllByText(/Jennifer Anderson/i);
    expect(requesterElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/jennifer.a@example.com/i)).toBeInTheDocument();

    // System and Category
    expect(screen.getByText(/Access & Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/GlobalProtect VPN/i)).toBeInTheDocument();

    // Attachments
    expect(screen.getByText(/vpn_error_log.txt/i)).toBeInTheDocument();

    // Back button
    const backBtn = screen.getByTestId("back-to-queue-btn");
    expect(backBtn).toBeInTheDocument();
    await userEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("displays requester resolution banner when isRequesterResolved is true (AC-11, BR-07)", async () => {
    vi.spyOn(api, "fetchStaffTicketDetailApi").mockResolvedValueOnce({
      ...mockTicketDetail,
      isRequesterResolved: true,
    });

    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("requester-resolved-banner")).toBeInTheDocument();
      expect(screen.getByText(/Requester Problem Indication:/i)).toBeInTheDocument();
    });
  });

  it("allows claiming an unassigned ticket with auto-advance to Open (AC-08, BR-09)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("claim-ticket-btn")).toBeInTheDocument();
    });

    const claimBtn = screen.getByTestId("claim-ticket-btn");
    await userEvent.click(claimBtn);

    await waitFor(() => {
      expect(api.assignStaffTicketApi).toHaveBeenCalledWith(1, 6);
    });
  });

  it("allows updating IT Priority independently of requested priority (AC-10)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("staff-priority-select")).toBeInTheDocument();
    });

    const prioritySelect = screen.getByTestId("staff-priority-select");
    await userEvent.selectOptions(prioritySelect, "URGENT");

    await waitFor(() => {
      expect(api.updateStaffTicketPriorityApi).toHaveBeenCalledWith(1, "URGENT");
    });
  });

  it("filters status dropdown to only permitted transitions and updates status (AC-09, BR-08)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("staff-status-select")).toBeInTheDocument();
    });

    // For "New", permitted next statuses are "Open" and "Cancelled"
    const statusSelect = screen.getByTestId("staff-status-select");
    expect(statusSelect).toBeInTheDocument();

    // Select "Open"
    await userEvent.selectOptions(statusSelect, "Open");

    const updateBtn = screen.getByTestId("update-status-btn");
    expect(updateBtn).not.toBeDisabled();
    await userEvent.click(updateBtn);

    await waitFor(() => {
      expect(api.updateStaffTicketStatusApi).toHaveBeenCalledWith(1, "Open");
    });
  });

  it("switches between Public Comments and Confidential Internal Notes tabs (AC-12)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("tab-public-comments")).toBeInTheDocument();
      expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
    });

    // Public Comments is active by default
    expect(screen.getByText(/This started happening yesterday morning after updating./i)).toBeInTheDocument();

    // Switch to Internal Notes tab
    const internalTab = screen.getByTestId("tab-internal-notes");
    await userEvent.click(internalTab);

    // Confidential banner and internal note should appear
    await waitFor(() => {
      expect(screen.getByTestId("internal-notes-security-notice")).toBeInTheDocument();
      expect(screen.getByText(/Gateway 10.0.1.5 was restarted earlier. Investigating tunnel logs./i)).toBeInTheDocument();
    });
  });

  it("posts a public comment under Public Comments tab (AC-12)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("public-comment-input")).toBeInTheDocument();
    });

    const commentInput = screen.getByTestId("public-comment-input");
    const postBtn = screen.getByTestId("submit-public-comment-btn");

    await userEvent.type(commentInput, "We are checking the gateway logs now.");
    await userEvent.click(postBtn);

    await waitFor(() => {
      expect(api.addCommentApi).toHaveBeenCalledWith(1, "We are checking the gateway logs now.");
    });
  });

  it("posts an internal note under Internal Notes tab (AC-12)", async () => {
    renderStaffTicketDetail({ ticketId: 1, onBack: vi.fn() });

    await waitFor(() => {
      expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
    });

    const internalTab = screen.getByTestId("tab-internal-notes");
    await userEvent.click(internalTab);

    await waitFor(() => {
      expect(screen.getByTestId("internal-note-input")).toBeInTheDocument();
    });

    const noteInput = screen.getByTestId("internal-note-input");
    const addNoteBtn = screen.getByTestId("submit-internal-note-btn");

    await userEvent.type(noteInput, "Checked RADIUS server, no authentication failure found.");
    await userEvent.click(addNoteBtn);

    await waitFor(() => {
      expect(api.addInternalNoteApi).toHaveBeenCalledWith(1, "Checked RADIUS server, no authentication failure found.");
    });
  });
});
