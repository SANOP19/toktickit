import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("Lab 2 Issue 4: My Tickets Screen", () => {
  const mockTickets = [
    {
      id: 1,
      ticketNumber: "TKT-2026-000101",
      summary: "Laptop battery drains quickly",
      description: "Battery discharges completely within 30 minutes.",
      requestedPriority: "MEDIUM" as const,
      currentStatus: "New",
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: { id: 2, name: "Hardware" },
      relatedSystem: { id: 7, name: "Corporate Laptop" },
    },
    {
      id: 2,
      ticketNumber: "TKT-2026-000102",
      summary: "Cannot connect to VPN from home",
      description: "Getting timeout error.",
      requestedPriority: "HIGH" as const,
      currentStatus: "Open",
      requesterId: 1,
      categoryId: 4,
      relatedSystemId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: { id: 4, name: "Network" },
      relatedSystem: { id: 3, name: "VPN" },
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, "fetchCategories").mockResolvedValue([
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
      { id: 4, name: "Network" },
    ]);
    vi.spyOn(api, "fetchTickets").mockResolvedValue({
      data: mockTickets,
      pagination: {
        page: 1,
        limit: 8,
        totalItems: 2,
        totalPages: 1,
      },
    });
  });

  it("renders ticket table with rows, badges, and columns (UI-04)", async () => {
    render(<App />);

    const ticketNumbers = await screen.findAllByText("TKT-2026-000101");
    expect(ticketNumbers[0]).toBeInTheDocument();
    expect(screen.getAllByText("Laptop battery drains quickly")[0]).toBeInTheDocument();
    expect(screen.getAllByText("TKT-2026-000102")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Cannot connect to VPN from home")[0]).toBeInTheDocument();
    expect(screen.getByText(/Showing 1 to 2 of 2 tickets/i)).toBeInTheDocument();
  });

  it("triggers search and filtering when search input is typed", async () => {
    const fetchTicketsSpy = vi.spyOn(api, "fetchTickets").mockResolvedValue({
      data: [mockTickets[0]],
      pagination: { page: 1, limit: 8, totalItems: 1, totalPages: 1 },
    });

    render(<App />);

    const searchInput = await screen.findByPlaceholderText(/Search by ticket number or summary/i);
    fireEvent.change(searchInput, { target: { value: "battery" } });

    await waitFor(() => {
      expect(fetchTicketsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ search: "battery" })
      );
    });
  });

  it("displays empty state when requester has no tickets", async () => {
    vi.spyOn(api, "fetchTickets").mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 8, totalItems: 0, totalPages: 1 },
    });

    render(<App />);

    expect(await screen.findByText(/No tickets yet/i)).toBeInTheDocument();
    expect(screen.getByText(/You haven't submitted any support requests yet/i)).toBeInTheDocument();
  });
});
