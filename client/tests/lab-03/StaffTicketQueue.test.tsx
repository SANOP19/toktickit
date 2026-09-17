import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue";
import { AuthProvider } from "../../src/context/AuthContext";
import * as api from "../../src/api";
import { User } from "../../src/types";

const mockStaffUser: User = {
  id: 5,
  name: "Alex Rivera",
  email: "alex.r@example.com",
  role: "IT_STAFF",
  isActive: true,
  mustChangePassword: false,
};

const mockCategories: api.Category[] = [
  { id: 1, name: "Access & Accounts" },
  { id: 2, name: "Hardware" },
];

const mockQueueResponse: api.StaffTicketQueueResponse = {
  tickets: [
    {
      id: 1,
      ticketNumber: "TKT-2026-000001",
      summary: "VPN connection drops every 10 minutes",
      description: "Experiencing repeated disconnects.",
      categoryId: 1,
      category: { id: 1, name: "Access & Accounts" },
      relatedSystemId: 1,
      requesterId: 1,
      requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
      currentStatus: "Open",
      requestedPriority: "MEDIUM",
      itPriority: "HIGH",
      ownerId: 5,
      owner: {
        id: 5,
        name: "Alex Rivera",
        email: "alex.r@example.com",
        role: "IT_STAFF",
        isActive: true,
        mustChangePassword: false,
      },
      createdAt: "2026-09-01T08:30:00.000Z",
      updatedAt: "2026-09-01T08:30:00.000Z",
      attachments: [],
    },
    {
      id: 2,
      ticketNumber: "TKT-2026-000002",
      summary: "New monitor request for dual display setup",
      description: "Need secondary monitor.",
      categoryId: 2,
      category: { id: 2, name: "Hardware" },
      relatedSystemId: 2,
      requesterId: 2,
      requester: { id: 2, name: "Marcus Chen", email: "marcus.c@example.com" },
      currentStatus: "New",
      requestedPriority: "LOW",
      itPriority: "LOW",
      ownerId: null,
      owner: null,
      createdAt: "2026-09-02T09:15:00.000Z",
      updatedAt: "2026-09-02T09:15:00.000Z",
      attachments: [],
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
  summary: {
    totalOpen: 2,
    assignedToMe: 1,
    unassigned: 1,
  },
};

describe("StaffTicketQueue Component (Teacher Mockup 2, AC-07, AC-08, BR-06, BR-07)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, "fetchCategories").mockResolvedValue(mockCategories);
  });

  const renderQueue = (props: { onSelectTicket?: (t: api.Ticket) => void } = {}) => {
    return render(
      <AuthProvider initialUser={mockStaffUser}>
        <StaffTicketQueue {...props} />
      </AuthProvider>
    );
  };

  it("renders summary metrics cards correctly (AC-07, Teacher Mockup 2)", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);

    renderQueue();

    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();
    expect(screen.getByText(/IT Staff Ticket Queue/i)).toBeInTheDocument();
    expect(screen.getByText("Total Open Tickets")).toBeInTheDocument();
    expect(screen.getByText("Assigned to Me")).toBeInTheDocument();
    expect(screen.getByText("Unassigned Tickets")).toBeInTheDocument();

    expect(screen.getByTestId("metric-total-open")).toHaveTextContent("2");
    expect(screen.getByTestId("metric-assigned-to-me")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-unassigned")).toHaveTextContent("1");
  });

  it("renders tickets in desktop table with unassigned badge (AC-07, AC-08)", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);

    renderQueue();

    // Verify ticket rows exist
    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-row-2")).toBeInTheDocument();

    // Verify unassigned badge
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
  });

  it("filters by ownership tabs (all, unassigned, assigned_to_me) (AC-07, BR-07)", async () => {
    const fetchSpy = vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);
    const user = userEvent.setup();

    renderQueue();

    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();

    // Click Unassigned tab
    const unassignedTab = screen.getByTestId("filter-owner-unassigned");
    await user.click(unassignedTab);

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ownerFilter: "unassigned",
      })
    );

    // Click Assigned to Me tab
    const assignedTab = screen.getByTestId("filter-owner-assigned_to_me");
    await user.click(assignedTab);

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ownerFilter: "assigned_to_me",
      })
    );
  });

  it("filters by search query and category (AC-07, BR-07)", async () => {
    const fetchSpy = vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);
    const user = userEvent.setup();

    renderQueue();

    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();

    // Type search
    const searchInput = screen.getByTestId("staff-search-input");
    await user.type(searchInput, "VPN");

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "VPN",
        })
      );
    });

    // Change category
    const categorySelect = screen.getByTestId("staff-category-filter");
    await user.selectOptions(categorySelect, "1");

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryId: 1,
        })
      );
    });
  });

  it("clears all filters when Clear Filters button is clicked (AC-07)", async () => {
    const fetchSpy = vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);
    const user = userEvent.setup();

    renderQueue();

    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();

    const searchInput = screen.getByTestId("staff-search-input");
    await user.type(searchInput, "VPN");

    const clearBtn = screen.getByTestId("clear-filters-btn");
    await user.click(clearBtn);

    expect(searchInput).toHaveValue("");
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: undefined,
          categoryId: undefined,
          currentStatus: undefined,
          priority: undefined,
          ownerFilter: "all",
          page: 1,
        })
      );
    });
  });

  it("calls onSelectTicket when ticket row or view button is clicked", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockQueueResponse);
    const onSelectTicket = vi.fn();
    const user = userEvent.setup();

    renderQueue({ onSelectTicket });

    expect(await screen.findByTestId("ticket-row-1")).toBeInTheDocument();

    // Click view button
    const viewButtons = screen.getAllByRole("button", { name: /View/i });
    await user.click(viewButtons[0]);

    expect(onSelectTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        ticketNumber: "TKT-2026-000001",
      })
    );
  });

  it("renders empty state when no tickets are found", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue({
      tickets: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
      summary: {
        totalOpen: 0,
        assignedToMe: 0,
        unassigned: 0,
      },
    });

    renderQueue();

    expect(await screen.findByTestId("queue-empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("empty-clear-filters-btn")).toBeInTheDocument();
  });
});
