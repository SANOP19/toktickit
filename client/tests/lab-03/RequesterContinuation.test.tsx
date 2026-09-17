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
  currentStatus: "Open",
  isRequesterResolved: false,
  createdAt: "2026-09-03T10:00:00.000Z",
  updatedAt: "2026-09-03T10:00:00.000Z",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  requester: mockRequester,
  attachments: [],
  comments: [
    {
      id: 1,
      ticketId: 42,
      authorId: 1,
      author: { id: 1, name: "Jennifer Anderson", role: "REQUESTER" },
      content: "I tested charging with a different adapter, issue persists.",
      createdAt: "2026-09-03T10:30:00.000Z",
    },
    {
      id: 2,
      ticketId: 42,
      authorId: 5,
      author: { id: 5, name: "Alex Rivera", role: "IT_STAFF" },
      content: "We ordered a replacement battery for your laptop.",
      createdAt: "2026-09-03T11:00:00.000Z",
    },
  ],
};

describe("Requester Continuation & Comments (AC-05, AC-14, BR-10, BR-14)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Problem Appears Resolved button and toggles resolution status (AC-14, BR-10)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getTicketDetail").mockResolvedValue(mockTicket);
    const toggleSpy = vi.spyOn(api, "toggleProblemResolvedApi").mockResolvedValueOnce({
      ...mockTicket,
      isRequesterResolved: true,
    });

    render(<TicketDetail ticketId={42} currentRequester={mockRequester} onBack={() => {}} />);

    // Check initial state
    expect(await screen.findByText("Is your problem resolved?")).toBeInTheDocument();
    const resolveBtn = screen.getByTestId("resolve-indication-btn");
    expect(resolveBtn).toHaveTextContent("✓ Problem Appears Resolved");

    // Click resolve
    await user.click(resolveBtn);

    expect(toggleSpy).toHaveBeenCalledWith(42, true);

    // Verify resolved state
    await waitFor(() => {
      expect(screen.getByText("✓ Problem Marked as Resolved by Requester")).toBeInTheDocument();
      expect(screen.getByText("Requester Confirmed")).toBeInTheDocument();
      expect(resolveBtn).toHaveTextContent("Undo / Problem Persists");
    });
  });

  it("renders threaded public comments with role badges and timestamps (AC-05, BR-14)", async () => {
    vi.spyOn(api, "getTicketDetail").mockResolvedValue(mockTicket);

    render(<TicketDetail ticketId={42} currentRequester={mockRequester} onBack={() => {}} />);

    // Header count
    expect(await screen.findByText("💬 Public Comments (2)")).toBeInTheDocument();

    // Verify comment 1 (Requester)
    expect(screen.getByText("I tested charging with a different adapter, issue persists.")).toBeInTheDocument();
    expect(screen.getAllByText("Requester").length).toBeGreaterThanOrEqual(1);

    // Verify comment 2 (IT Staff)
    expect(screen.getByText("We ordered a replacement battery for your laptop.")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("IT Staff")).toBeInTheDocument();
  });

  it("submits a new public comment and appends to thread (AC-05, BR-13, BR-16)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getTicketDetail").mockResolvedValue(mockTicket);
    const addCommentSpy = vi.spyOn(api, "addCommentApi").mockResolvedValueOnce({
      id: 3,
      ticketId: 42,
      authorId: 1,
      author: { id: 1, name: "Jennifer Anderson", role: "REQUESTER" },
      content: "Great, I will bring the laptop tomorrow.",
      createdAt: "2026-09-03T11:15:00.000Z",
    });

    render(<TicketDetail ticketId={42} currentRequester={mockRequester} onBack={() => {}} />);

    const textarea = await screen.findByTestId("new-comment-textarea");
    const submitBtn = screen.getByTestId("submit-comment-btn");

    // Initially disabled when empty
    expect(submitBtn).toBeDisabled();

    // Type comment
    await user.type(textarea, "Great, I will bring the laptop tomorrow.");
    expect(submitBtn).toBeEnabled();

    // Submit
    await user.click(submitBtn);

    expect(addCommentSpy).toHaveBeenCalledWith(42, "Great, I will bring the laptop tomorrow.");

    // New comment rendered in list
    expect(await screen.findByText("Great, I will bring the laptop tomorrow.")).toBeInTheDocument();
    expect(screen.getByText("💬 Public Comments (3)")).toBeInTheDocument();
  });
});
