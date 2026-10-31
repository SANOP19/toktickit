import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffDashboard } from "../../src/components/StaffDashboard";
import { AuthContext, AuthContextType } from "../../src/context/AuthContext";
import * as api from "../../src/api";
import { StaffDashboardData } from "../../src/types";

const mockStaffUser = {
  id: 6,
  name: "Alex Rivera",
  email: "alex.r@example.com",
  role: "IT_STAFF" as const,
  isActive: true,
  mustChangePassword: false,
};

const mockAuthContext: AuthContextType = {
  user: mockStaffUser,
  token: "mock-token",
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
};

const mockDashboardData: StaffDashboardData = {
  metrics: {
    newTickets: 5,
    openTickets: 12,
    inProgressTickets: 8,
    waitingForRequester: 3,
    myAssignedTickets: 7,
    urgentTickets: 2,
  },
  recentTickets: [
    {
      id: 101,
      ticketNumber: "TKT-2026-000101",
      summary: "VPN connectivity lost after Windows update",
      category: "Network",
      itPriority: "URGENT",
      currentStatus: "In Progress",
      ownerName: "Alex Rivera",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 102,
      ticketNumber: "TKT-2026-000102",
      summary: "Outlook crashes when opening attachments",
      category: "Software",
      itPriority: "HIGH",
      currentStatus: "Open",
      ownerName: "Unassigned",
      updatedAt: new Date().toISOString(),
    },
  ],
  myRecentActions: [
    {
      id: 1,
      ticketId: 101,
      ticketNumber: "TKT-2026-000101",
      description: "Reinstalled Cisco AnyConnect client and reset routing tables.",
      status: "COMPLETED",
      actionDateTime: new Date().toISOString(),
    },
  ],
};

const renderStaffDashboard = (props: Partial<React.ComponentProps<typeof StaffDashboard>> = {}) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <StaffDashboard {...props} />
    </AuthContext.Provider>
  );
};

describe("Sprint 4 Issue 5: IT Staff Dashboard (Teacher Mockup 1, UI-04, AC-11, AC-13, BR-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "fetchStaffDashboardApi").mockResolvedValue(mockDashboardData);
  });

  it("renders header greeting with staff name and subtitle", async () => {
    renderStaffDashboard();

    expect(await screen.findByText(/Welcome back, Alex Rivera!/i)).toBeInTheDocument();
    expect(screen.getByText(/Here's what's happening with your queue today/i)).toBeInTheDocument();
  });

  it("renders 5 operational KPI metric cards with authoritative backend counts (Mockup 1, AC-11)", async () => {
    renderStaffDashboard();

    // Check KPI cards presence and values
    expect(await screen.findByTestId("kpi-card-new")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-open")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-in-progress")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-waiting-for-requester")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-my-assigned")).toBeInTheDocument();

    expect(screen.getByTestId("kpi-card-new")).toHaveTextContent("5");
    expect(screen.getByTestId("kpi-card-open")).toHaveTextContent("12");
    expect(screen.getByTestId("kpi-card-in-progress")).toHaveTextContent("8");
    expect(screen.getByTestId("kpi-card-waiting-for-requester")).toHaveTextContent("3");
    expect(screen.getByTestId("kpi-card-my-assigned")).toHaveTextContent("7");
  });

  it("renders Urgent Tickets indicator banner when urgentTickets > 0", async () => {
    const onDrillDown = vi.fn();
    renderStaffDashboard({ onDrillDown });

    const banner = await screen.findByTestId("urgent-tickets-banner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent("2 urgent tickets");

    const viewUrgentBtn = screen.getByTestId("btn-view-urgent");
    fireEvent.click(viewUrgentBtn);
    expect(onDrillDown).toHaveBeenCalledWith({ priority: "URGENT" });
  });

  it("triggers drill-down navigation when KPI metric cards are clicked (AC-13, BR-18)", async () => {
    const onDrillDown = vi.fn();
    renderStaffDashboard({ onDrillDown });

    // Click 'New' card
    const newCard = await screen.findByTestId("kpi-card-new");
    fireEvent.click(newCard);
    expect(onDrillDown).toHaveBeenCalledWith({ currentStatus: "New" });

    // Click 'In Progress' card
    const inProgressCard = screen.getByTestId("kpi-card-in-progress");
    fireEvent.click(inProgressCard);
    expect(onDrillDown).toHaveBeenCalledWith({ currentStatus: "In Progress" });

    // Click 'My Assigned' card
    const myAssignedCard = screen.getByTestId("kpi-card-my-assigned");
    fireEvent.click(myAssignedCard);
    expect(onDrillDown).toHaveBeenCalledWith({ ownerFilter: "assigned_to_me" });
  });

  it("renders recent operational tickets with clickable rows opening ticket detail", async () => {
    const onSelectTicket = vi.fn();
    renderStaffDashboard({ onSelectTicket });

    expect((await screen.findAllByText("TKT-2026-000101"))[0]).toBeInTheDocument();
    expect(screen.getByText("VPN connectivity lost after Windows update")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000102")).toBeInTheDocument();

    const row = screen.getByTestId("recent-ticket-row-101");
    fireEvent.click(row);
    expect(onSelectTicket).toHaveBeenCalledWith(101);
  });

  it("renders recent work interventions (Actions Taken) performed by current user", async () => {
    renderStaffDashboard();

    expect(await screen.findByText("🛠️ My Recent Interventions (Actions Taken)")).toBeInTheDocument();
    expect(screen.getByText(/Reinstalled Cisco AnyConnect client and reset routing tables/i)).toBeInTheDocument();
  });

  it("reloads dashboard when Refresh button is clicked", async () => {
    const fetchSpy = vi.spyOn(api, "fetchStaffDashboardApi");
    renderStaffDashboard();

    const refreshBtn = await screen.findByTestId("btn-refresh-dashboard");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
