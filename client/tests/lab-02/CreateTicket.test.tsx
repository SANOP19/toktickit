import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("Lab 2 Issue 3: Create Ticket Screen", () => {
  const mockCategories = [
    { id: 1, name: "Account and Access" },
    { id: 2, name: "Hardware" },
  ];

  const mockSystems = [
    { id: 1, name: "Email" },
    { id: 7, name: "Corporate Laptop" },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, "fetchCategories").mockResolvedValue(mockCategories);
    vi.spyOn(api, "fetchRelatedSystems").mockResolvedValue(mockSystems);
  });

  it("navigates to Create Ticket screen and shows read-only requester name", async () => {
    render(<App />);

    // Click Create Ticket in navbar
    const createNavBtn = screen.getByTestId("nav-create-ticket");
    fireEvent.click(createNavBtn);

    expect(await screen.findByRole("heading", { name: /Create IT Support Ticket/i })).toBeInTheDocument();
    // Default requester is Jennifer Anderson
    expect(screen.getByDisplayValue(/Jennifer Anderson/i)).toBeInTheDocument();
  });

  it("displays field-level validation errors when submitted empty (UI-02)", async () => {
    render(<App />);

    // Go to Create Ticket tab
    fireEvent.click(screen.getByTestId("nav-create-ticket"));

    const submitBtn = await screen.findByRole("button", { name: /submit ticket/i });
    fireEvent.click(submitBtn);

    // Validation messages should appear
    expect(await screen.findByText(/Summary must be at least 5 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Description must be at least 10 characters/i)).toBeInTheDocument();
  });

  it("submits valid ticket and displays generated Ticket Number confirmation (UI-03)", async () => {
    const mockCreatedTicket = {
      id: 101,
      ticketNumber: "TKT-2026-000101",
      summary: "Laptop battery drains quickly",
      description: "Battery discharges completely within 30 minutes of usage.",
      requestedPriority: "MEDIUM" as const,
      currentStatus: "New",
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(api, "createTicket").mockResolvedValue(mockCreatedTicket);

    render(<App />);

    // Go to Create Ticket tab
    fireEvent.click(screen.getByTestId("nav-create-ticket"));

    // Fill form
    const summaryInput = await screen.findByPlaceholderText(/e\.g\. Laptop battery drains quickly/i);
    const descInput = screen.getByPlaceholderText(/Provide specific details about when the issue started/i);

    fireEvent.change(summaryInput, { target: { value: "Laptop battery drains quickly" } });
    fireEvent.change(descInput, { target: { value: "Battery discharges completely within 30 minutes of usage." } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /submit ticket/i });
    fireEvent.click(submitBtn);

    // Confirmation screen shows official ticket number
    expect(await screen.findByText(/Ticket Submitted Successfully!/i)).toBeInTheDocument();
    expect(screen.getByTestId("created-ticket-number")).toHaveTextContent("TKT-2026-000101");
  });
});
