import React, { useState } from "react";
import { ActionTaken } from "../types";
import { AddActionTakenModal } from "./AddActionTakenModal";

interface Props {
  ticketId: number;
  actions: ActionTaken[];
  isStaffView: boolean;
  onActionCreated?: (action: ActionTaken) => void;
  onActionUpdated?: (action: ActionTaken) => void;
  onRefresh?: () => void;
}

export function ActionsTakenSection({
  ticketId,
  actions,
  isStaffView,
  onActionCreated,
  onActionUpdated,
  onRefresh,
}: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionToEdit, setActionToEdit] = useState<ActionTaken | null>(null);

  const handleOpenAddModal = () => {
    setActionToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (action: ActionTaken) => {
    setActionToEdit(action);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setActionToEdit(null);
  };

  const handleModalSuccess = (savedAction: ActionTaken) => {
    if (actionToEdit) {
      if (onActionUpdated) onActionUpdated(savedAction);
    } else {
      if (onActionCreated) onActionCreated(savedAction);
    }
    if (onRefresh) onRefresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span
            className="badge rounded-pill px-2 py-1 text-white fw-bold"
            style={{ backgroundColor: "#006B3C", fontSize: "11px" }}
            data-testid="action-status-badge-completed"
          >
            ✓ Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span
            className="badge rounded-pill px-2 py-1 bg-primary text-white fw-bold"
            style={{ fontSize: "11px" }}
            data-testid="action-status-badge-inprogress"
          >
            ⚙️ In Progress
          </span>
        );
      case "CANCELLED":
        return (
          <span
            className="badge rounded-pill px-2 py-1 bg-secondary text-white fw-bold"
            style={{ fontSize: "11px" }}
            data-testid="action-status-badge-cancelled"
          >
            ✕ Cancelled
          </span>
        );
      default:
        return (
          <span className="badge rounded-pill px-2 py-1 bg-light text-dark border" style={{ fontSize: "11px" }}>
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="actions-taken-container" data-testid="actions-taken-section">
      {/* Header and Controls */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h4 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <span>🛠️ Actions Taken</span>
            <span
              className="badge rounded-pill px-2"
              style={{ backgroundColor: "#EAF6EF", color: "#006B3C", border: "1px solid #006B3C" }}
              data-testid="actions-count-badge"
            >
              {actions.length}
            </span>
          </h4>
          <p className="text-muted small mb-0 mt-1" style={{ fontSize: "12px" }}>
            {isStaffView
              ? "Chronological parent-child record of IT operational interventions, diagnostic steps, and resolutions."
              : "Official operational interventions and diagnostic steps recorded by the IT support team."}
          </p>
        </div>

        {isStaffView && (
          <button
            type="button"
            className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1 shadow-sm"
            style={{ backgroundColor: "#006B3C" }}
            onClick={handleOpenAddModal}
            data-testid="add-action-taken-btn"
          >
            <span>+</span>
            <span>Add Action Taken</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {actions.length === 0 ? (
        <div
          className="text-center p-4 rounded-3 border"
          style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}
          data-testid="no-actions-taken-msg"
        >
          <div className="fs-3 text-muted mb-2">📋</div>
          <h5 className="h6 fw-bold text-dark mb-1">No Actions Taken Recorded Yet</h5>
          <p className="text-muted small mb-3" style={{ maxWidth: 480, margin: "0 auto" }}>
            {isStaffView
              ? "No operational actions have been recorded for this ticket. Recording at least one Action Taken is required before transitioning to Resolved or Closed."
              : "The IT support team has not yet recorded operational actions for this ticket. Progress updates will appear here once technical work begins."}
          </p>
          {isStaffView && (
            <button
              type="button"
              className="btn btn-sm btn-outline-success fw-medium"
              style={{ borderColor: "#006B3C", color: "#006B3C" }}
              onClick={handleOpenAddModal}
              data-testid="empty-add-action-btn"
            >
              + Record First Action Taken
            </button>
          )}
        </div>
      ) : (
        /* Chronological Actions List */
        <div className="d-flex flex-column gap-3" data-testid="actions-taken-list">
          {actions.map((action, idx) => {
            const performerName = action.performedBy?.name || `Staff #${action.performedById}`;
            const performerRole = action.performedBy?.role === "ADMINISTRATOR" ? "Admin" : "IT Staff";
            const initialLetter = performerName.charAt(0).toUpperCase();

            return (
              <div
                key={action.id || idx}
                className="card border shadow-sm rounded-3 overflow-hidden"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                data-testid={`action-taken-card-${action.id}`}
              >
                {/* Action Card Header */}
                <div
                  className="card-header bg-light px-3 py-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom"
                >
                  <div className="d-flex align-items-center gap-2">
                    {/* Performer Avatar */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: "#006B3C",
                        fontSize: "12px",
                      }}
                      title={`${performerName} (${performerRole})`}
                    >
                      {initialLetter}
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-bold small text-dark" data-testid={`action-performer-${action.id}`}>
                        {performerName}
                      </span>
                      <span
                        className="badge px-1 py-0 text-muted border bg-white small"
                        style={{ fontSize: "10px" }}
                      >
                        {performerRole}
                      </span>
                      <span className="text-muted small" style={{ fontSize: "11px" }}>
                        • {formatDateTime(action.actionDateTime)}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(action.status)}
                    {isStaffView && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-secondary py-0 px-2 small"
                        style={{ fontSize: "11px" }}
                        onClick={() => handleOpenEditModal(action)}
                        data-testid={`edit-action-btn-${action.id}`}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Card Body */}
                <div className="card-body p-3">
                  {/* Description */}
                  <div className="mb-2">
                    <span className="small fw-bold text-muted d-block text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                      Intervention / Action
                    </span>
                    <p
                      className="text-dark small mb-0 mt-1"
                      style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                      data-testid={`action-description-${action.id}`}
                    >
                      {action.description}
                    </p>
                  </div>

                  {/* Operational Result Box */}
                  <div
                    className="p-2 px-3 rounded-2 mt-2"
                    style={{ backgroundColor: "#F0F9F4", border: "1px solid #D1E7DD" }}
                  >
                    <span className="small fw-bold d-block" style={{ color: "#006B3C", fontSize: "11px" }}>
                      ✓ Operational Result
                    </span>
                    <div
                      className="text-dark small mt-1"
                      style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}
                      data-testid={`action-result-${action.id}`}
                    >
                      {action.result}
                    </div>
                  </div>

                  {/* Follow-Up Note Callout (if required) */}
                  {action.followUpRequired && (
                    <div
                      className="p-2 px-3 rounded-2 mt-2"
                      style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D" }}
                      data-testid={`action-followup-container-${action.id}`}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "10px" }}>
                          ⚠️ Follow-Up Required
                        </span>
                      </div>
                      <div
                        className="small mt-1 text-dark"
                        style={{ whiteSpace: "pre-wrap" }}
                        data-testid={`action-follow-up-note-${action.id}`}
                      >
                        {action.followUpNote || "Follow-up note pending."}
                      </div>
                    </div>
                  )}

                  {/* Attachment Notes Callout */}
                  {action.attachmentNotes && (
                    <div
                      className="p-2 px-3 rounded-2 mt-2 d-flex align-items-start gap-2"
                      style={{ backgroundColor: "#F8F9FA", border: "1px dashed #CBD5E1" }}
                      data-testid={`action-attachment-notes-${action.id}`}
                    >
                      <span className="small">📎</span>
                      <div>
                        <span className="small fw-bold text-muted d-block" style={{ fontSize: "10px" }}>
                          ATTACHMENT REFERENCE
                        </span>
                        <span className="small text-dark">{action.attachmentNotes}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Concurrency info */}
                <div
                  className="card-footer bg-white px-3 py-1 text-muted border-top d-flex justify-content-between align-items-center"
                  style={{ fontSize: "10px" }}
                >
                  <span>Action #{action.id}</span>
                  <span>Version: v{action.version || 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <AddActionTakenModal
          show={modalOpen}
          onClose={handleCloseModal}
          ticketId={ticketId}
          actionToEdit={actionToEdit}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
