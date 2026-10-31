import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection";
import { AddActionTakenModal } from "../../src/components/AddActionTakenModal";
import * as api from "../../src/api";
import { ActionTaken } from "../../src/types";

const mockActions: ActionTaken[] = [
  {
    id: 101,
    ticketId: 1,
    performedById: 5,
    performedBy: {
      id: 5,
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      role: "IT_STAFF",
    },
    actionDateTime: "2026-10-29T10:00:00.000Z",
    description: "Inspected edge switch port 24 and discovered high CRC error rate.",
    result: "Cleaned fiber patch cable and reseated 10G SFP+ module.",
    status: "IN_PROGRESS",
    followUpRequired: true,
    followUpNote: "Monitor CRC error counter over next 4 hours to verify stability.",
    attachmentNotes: "See switch_port_diagnostics.txt in attachments",
    version: 1,
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
  {
    id: 102,
    ticketId: 1,
    performedById: 3,
    performedBy: {
      id: 3,
      name: "Morgan Lee",
      email: "morgan.lee@example.com",
      role: "ADMINISTRATOR",
    },
    actionDateTime: "2026-10-29T14:30:00.000Z",
    description: "Verified switch port counter shows 0 CRC errors after 4 hours.",
    result: "Network throughput restored to full 10 Gbps line rate.",
    status: "COMPLETED",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    version: 1,
    createdAt: "2026-10-29T14:30:00.000Z",
    updatedAt: "2026-10-29T14:30:00.000Z",
  },
];

describe("Sprint 4 Issue 3: Actions Taken Ticket Detail Interface (FR-01..04, BR-01..09, UI-03)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders chronological Actions Taken cards with performer, description, result, and status (AC-01, BR-09)", () => {
    render(
      <ActionsTakenSection
        ticketId={1}
        actions={mockActions}
        isStaffView={true}
      />
    );

    // Header badge
    expect(screen.getByTestId("actions-count-badge")).toHaveTextContent("2");

    // Performer names
    expect(screen.getByTestId("action-performer-101")).toHaveTextContent("Alex Rivera");
    expect(screen.getByTestId("action-performer-102")).toHaveTextContent("Morgan Lee");

    // Descriptions
    expect(screen.getByTestId("action-description-101")).toHaveTextContent(
      "Inspected edge switch port 24 and discovered high CRC error rate."
    );
    expect(screen.getByTestId("action-description-102")).toHaveTextContent(
      "Verified switch port counter shows 0 CRC errors after 4 hours."
    );

    // Results
    expect(screen.getByTestId("action-result-101")).toHaveTextContent(
      "Cleaned fiber patch cable and reseated 10G SFP+ module."
    );
    expect(screen.getByTestId("action-result-102")).toHaveTextContent(
      "Network throughput restored to full 10 Gbps line rate."
    );

    // Status badges
    expect(screen.getByTestId("action-status-badge-inprogress")).toBeInTheDocument();
    expect(screen.getByTestId("action-status-badge-completed")).toBeInTheDocument();
  });

  it("renders conditional follow-up note callout and attachment references (AC-02, BR-05, BR-06)", () => {
    render(
      <ActionsTakenSection
        ticketId={1}
        actions={mockActions}
        isStaffView={false}
      />
    );

    // Follow-up required block on Action 101
    expect(screen.getByTestId("action-followup-container-101")).toBeInTheDocument();
    expect(screen.getByTestId("action-follow-up-note-101")).toHaveTextContent(
      "Monitor CRC error counter over next 4 hours to verify stability."
    );

    // Action 102 has followUpRequired = false, so no container
    expect(screen.queryByTestId("action-followup-container-102")).not.toBeInTheDocument();

    // Attachment reference
    expect(screen.getByTestId("action-attachment-notes-101")).toHaveTextContent(
      "See switch_port_diagnostics.txt in attachments"
    );
  });

  it("enforces staff management controls vs requester read-only mode (FR-04, BR-04)", () => {
    // Staff View: Add & Edit buttons must be rendered
    const { unmount } = render(
      <ActionsTakenSection
        ticketId={1}
        actions={mockActions}
        isStaffView={true}
      />
    );
    expect(screen.getByTestId("add-action-taken-btn")).toBeInTheDocument();
    expect(screen.getByTestId("edit-action-btn-101")).toBeInTheDocument();
    expect(screen.getByTestId("edit-action-btn-102")).toBeInTheDocument();

    unmount();

    // Requester View: Add & Edit buttons must be STRICTLY HIDDEN / unrendered
    render(
      <ActionsTakenSection
        ticketId={1}
        actions={mockActions}
        isStaffView={false}
      />
    );
    expect(screen.queryByTestId("add-action-taken-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-action-btn-101")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-action-btn-102")).not.toBeInTheDocument();
  });

  it("renders empty state guidance when ticket has zero recorded actions (BR-11)", () => {
    render(
      <ActionsTakenSection
        ticketId={1}
        actions={[]}
        isStaffView={true}
      />
    );

    expect(screen.getByTestId("no-actions-taken-msg")).toBeInTheDocument();
    expect(screen.getByTestId("empty-add-action-btn")).toBeInTheDocument();
  });

  it("enforces modal conditional validation for follow-up notes (BR-05, AC-02)", async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddActionTakenModal
        show={true}
        onClose={handleClose}
        ticketId={1}
        onSuccess={handleSuccess}
      />
    );

    // Fill valid description & result
    await user.type(screen.getByTestId("action-description-input"), "Replaced faulty Cat6 patch lead.");
    await user.type(screen.getByTestId("action-result-input"), "Link negotiation established at 1 Gbps.");

    // Toggle follow-up required ON without note
    await user.click(screen.getByTestId("action-followup-toggle"));
    expect(screen.getByTestId("action-followup-note-input")).toBeInTheDocument();

    // Try submitting with empty note
    await user.click(screen.getByTestId("submit-action-btn"));

    // Form displays conditional validation error
    expect(screen.getByTestId("action-modal-error")).toHaveTextContent(
      "Follow-up note is mandatory when follow-up is required"
    );
    expect(handleSuccess).not.toHaveBeenCalled();

    // Now fill follow-up note with >= 5 chars
    await user.type(screen.getByTestId("action-followup-note-input"), "Check with user tomorrow morning.");

    // Mock API success
    const mockCreated: ActionTaken = {
      id: 103,
      ticketId: 1,
      performedById: 5,
      actionDateTime: new Date().toISOString(),
      description: "Replaced faulty Cat6 patch lead.",
      result: "Link negotiation established at 1 Gbps.",
      status: "COMPLETED",
      followUpRequired: true,
      followUpNote: "Check with user tomorrow morning.",
      attachmentNotes: null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vi.spyOn(api, "createActionTakenApi").mockResolvedValueOnce(mockCreated);

    await user.click(screen.getByTestId("submit-action-btn"));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(mockCreated);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("handles optimistic concurrency conflict (HTTP 409) during edit (BR-08, AC-07)", async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddActionTakenModal
        show={true}
        onClose={handleClose}
        ticketId={1}
        actionToEdit={mockActions[0]}
        onSuccess={handleSuccess}
      />
    );

    // Mock 409 conflict
    vi.spyOn(api, "updateActionTakenApi").mockRejectedValueOnce(
      new Error("STALE_UPDATE_DETECTED: Action Taken was modified by another user.")
    );

    await user.click(screen.getByTestId("submit-action-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("action-modal-error")).toHaveTextContent(
        "STALE_UPDATE_DETECTED"
      );
      expect(handleSuccess).not.toHaveBeenCalled();
    });
  });
});
