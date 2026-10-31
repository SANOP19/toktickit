import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequesterDashboard } from "../../src/components/RequesterDashboard";
import { AuthContext, AuthContextType } from "../../src/context/AuthContext";
import * as api from "../../src/api";
import { RequesterDashboardData } from "../../src/types";

const mockRequesterUser = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
};

const mockAuthContext: AuthContextType = {
  user: mockRequesterUser,
  token: "mock-token",
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
};

const mockRequesterDashboardData: RequesterDashboardData = {
  metrics: {
    myOpenTickets: 3,
    inProgressTickets: 2,
    resolvedTickets: 4,
    closedTickets: 9,
  },
  recentTickets: [
    {
      id: 201,
      ticketNumber: "TKT-2026-000201",
      summary: "Monitor display flickers intermittently",
      category: "Hardware",
      requestedPriority: "MEDIUM",
      currentStatus: "In Progress",
      isRequesterResolved: false,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 202,
      ticketNumber: "TKT-2026-000202",
      summary: "Request access to Git repository",
      category: "Account and Access",
      requestedPriority: "LOW",
      currentStatus: "Resolved",
      isRequesterResolved: true,
      updatedAt: new Date().toISOString(),
    },
  ],
};

const renderRequesterDashboard = (props: Partial<React.ComponentProps<typeof RequesterDashboard>> = {}) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <RequesterDashboard {...props} />
    </AuthContext.Provider>
  );
};

describe("Sprint 4 Issue 5: Requester Personal Dashboard (Teacher Mockup 2, UI-05, AC-12, AC-13, BR-15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "fetchRequesterDashboardApi").mockResolvedValue(mockRequesterDashboardData);
  });

  it("renders header greeting with requester name and subtitle", async () => {
    renderRequesterDashboard();

    expect(await screen.findByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();
    expect(screen.getByText(/Here's the latest on your IT service requests/i)).toBeInTheDocument();
  });

  it("renders 4 personal KPI metric cards with authoritative counts (Mockup 2, AC-12)", async () => {
    renderRequesterDashboard();

    expect(await screen.findByTestId("kpi-card-my-open")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-in-progress")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-resolved")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-closed")).toBeInTheDocument();

    expect(screen.getByTestId("kpi-card-my-open")).toHaveTextContent("3");
    expect(screen.getByTestId("kpi-card-in-progress")).toHaveTextContent("2");
    expect(screen.getByTestId("kpi-card-resolved")).toHaveTextContent("4");
    expect(screen.getByTestId("kpi-card-closed")).toHaveTextContent("9");
  });

  it("triggers drill-down navigation when personal KPI cards are clicked (AC-13, BR-18)", async () => {
    const onDrillDown = vi.fn();
    renderRequesterDashboard({ onDrillDown });

    const openCard = await screen.findByTestId("kpi-card-my-open");
    fireEvent.click(openCard);
    expect(onDrillDown).toHaveBeenCalledWith("open");

    const inProgressCard = screen.getByTestId("kpi-card-in-progress");
    fireEvent.click(inProgressCard);
    expect(onDrillDown).toHaveBeenCalledWith("In Progress");

    const resolvedCard = screen.getByTestId("kpi-card-resolved");
    fireEvent.click(resolvedCard);
    expect(onDrillDown).toHaveBeenCalledWith("Resolved");

    const closedCard = screen.getByTestId("kpi-card-closed");
    fireEvent.click(closedCard);
    expect(onDrillDown).toHaveBeenCalledWith("Closed");
  });

  it("renders recent requests with clickable rows and requester-resolved badge", async () => {
    const onSelectTicket = vi.fn();
    renderRequesterDashboard({ onSelectTicket });

    expect(await screen.findByText("TKT-2026-000201")).toBeInTheDocument();
    expect(screen.getByText("Monitor display flickers intermittently")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000202")).toBeInTheDocument();

    // Verify User Resolved indicator badge on resolved ticket
    expect(screen.getByText("✓ User Resolved")).toBeInTheDocument();

    const row = screen.getByTestId("recent-ticket-row-201");
    fireEvent.click(row);
    expect(onSelectTicket).toHaveBeenCalledWith(201);
  });

  it("triggers quick actions when action buttons are clicked", async () => {
    const onCreateClick = vi.fn();
    const onViewAll = vi.fn();
    renderRequesterDashboard({ onCreateClick, onViewAll });

    const createBtn = await screen.findByTestId("quick-btn-create-ticket");
    fireEvent.click(createBtn);
    expect(onCreateClick).toHaveBeenCalled();

    const viewMyTicketsBtn = screen.getByTestId("quick-btn-view-my-tickets");
    fireEvent.click(viewMyTicketsBtn);
    expect(onViewAll).toHaveBeenCalled();
  });

  it("renders clean empty state when requester has zero tickets (AC-14, BR-17)", async () => {
    vi.spyOn(api, "fetchRequesterDashboardApi").mockResolvedValue({
      metrics: { myOpenTickets: 0, inProgressTickets: 0, resolvedTickets: 0, closedTickets: 0 },
      recentTickets: [],
    });

    renderRequesterDashboard();

    expect(await screen.findByTestId("empty-recent-requests")).toBeInTheDocument();
    expect(screen.getByText(/You have not submitted any service tickets yet/i)).toBeInTheDocument();
  });

  it("reloads dashboard when Refresh button is clicked", async () => {
    const fetchSpy = vi.spyOn(api, "fetchRequesterDashboardApi");
    renderRequesterDashboard();

    const refreshBtn = await screen.findByTestId("btn-refresh-dashboard");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
