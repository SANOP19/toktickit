import React, { useState, useEffect } from "react";
import { ActionTaken, ActionStatus, CreateActionTakenPayload, UpdateActionTakenPayload } from "../types";
import { createActionTakenApi, updateActionTakenApi } from "../api";

interface Props {
  show: boolean;
  onClose: () => void;
  ticketId: number;
  actionToEdit?: ActionTaken | null;
  onSuccess: (action: ActionTaken) => void;
}

export function AddActionTakenModal({ show, onClose, ticketId, actionToEdit, onSuccess }: Props) {
  const isEditMode = !!actionToEdit;

  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<ActionStatus>("COMPLETED");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpNote, setFollowUpNote] = useState<string>("");
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (actionToEdit) {
      setDescription(actionToEdit.description || "");
      setResult(actionToEdit.result || "");
      setStatus(actionToEdit.status || "COMPLETED");
      setFollowUpRequired(actionToEdit.followUpRequired || false);
      setFollowUpNote(actionToEdit.followUpNote || "");
      setAttachmentNotes(actionToEdit.attachmentNotes || "");
    } else {
      setDescription("");
      setResult("");
      setStatus("COMPLETED");
      setFollowUpRequired(false);
      setFollowUpNote("");
      setAttachmentNotes("");
    }
    setError("");
  }, [actionToEdit, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedDesc = description.trim();
    const trimmedResult = result.trim();
    const trimmedFollowUp = followUpNote.trim();
    const trimmedAttachmentNotes = attachmentNotes.trim();

    if (!trimmedDesc || trimmedDesc.length < 5) {
      setError("Description must contain at least 5 characters.");
      return;
    }
    if (trimmedDesc.length > 2000) {
      setError("Description cannot exceed 2,000 characters.");
      return;
    }

    if (!trimmedResult || trimmedResult.length < 3) {
      setError("Operational result must contain at least 3 characters.");
      return;
    }
    if (trimmedResult.length > 2000) {
      setError("Result cannot exceed 2,000 characters.");
      return;
    }

    if (followUpRequired) {
      if (!trimmedFollowUp || trimmedFollowUp.length < 5) {
        setError("Follow-up note is mandatory when follow-up is required (min 5 characters).");
        return;
      }
      if (trimmedFollowUp.length > 2000) {
        setError("Follow-up note cannot exceed 2,000 characters.");
        return;
      }
    }

    if (trimmedAttachmentNotes && trimmedAttachmentNotes.length > 1000) {
      setError("Attachment notes cannot exceed 1,000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      let savedAction: ActionTaken;
      if (isEditMode && actionToEdit) {
        const updatePayload: UpdateActionTakenPayload = {
          description: trimmedDesc,
          result: trimmedResult,
          status,
          followUpRequired,
          followUpNote: followUpRequired ? trimmedFollowUp : null,
          attachmentNotes: trimmedAttachmentNotes || null,
          version: actionToEdit.version,
        };
        savedAction = await updateActionTakenApi(ticketId, actionToEdit.id, updatePayload);
      } else {
        const createPayload: CreateActionTakenPayload = {
          description: trimmedDesc,
          result: trimmedResult,
          status,
          followUpRequired,
          followUpNote: followUpRequired ? trimmedFollowUp : null,
          attachmentNotes: trimmedAttachmentNotes || null,
        };
        savedAction = await createActionTakenApi(ticketId, createPayload);
      }
      onSuccess(savedAction);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save Action Taken.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1050 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="actionTakenModalTitle"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content shadow border-0 rounded-3">
          <div className="modal-header text-white" style={{ backgroundColor: "#006B3C" }}>
            <h5 className="modal-title fw-bold" id="actionTakenModalTitle">
              {isEditMode ? "✏️ Edit Action Taken" : "🛠️ Record Action Taken"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              disabled={submitting}
              data-testid="cancel-action-x-btn"
            />
          </div>

          <form onSubmit={handleSubmit} noValidate data-testid="action-taken-form">
            <div className="modal-body p-4">
              {error && (
                <div
                  className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3"
                  role="alert"
                  data-testid="action-modal-error"
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Status and Follow-up Row */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="action-status-select" className="form-label small fw-bold text-dark">
                    Action Status <span className="text-danger">*</span>
                  </label>
                  <select
                    id="action-status-select"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ActionStatus)}
                    disabled={submitting}
                    data-testid="action-status-select"
                  >
                    <option value="COMPLETED">Completed (Action completed successfully)</option>
                    <option value="IN_PROGRESS">In Progress (Intervention ongoing)</option>
                    <option value="CANCELLED">Cancelled (Intervention abandoned)</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 d-flex align-items-end">
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="action-followup-toggle"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                      disabled={submitting}
                      data-testid="action-followup-toggle"
                    />
                    <label className="form-check-label fw-bold small text-dark" htmlFor="action-followup-toggle">
                      Follow-Up Required
                    </label>
                    <div className="text-muted small" style={{ fontSize: "11px" }}>
                      Toggle on if further operational intervention or user reply is needed.
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Input */}
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <label htmlFor="action-description-input" className="form-label small fw-bold text-dark">
                    Action Description <span className="text-danger">*</span>
                  </label>
                  <span className="text-muted small">{description.length}/2,000</span>
                </div>
                <textarea
                  id="action-description-input"
                  className="form-control"
                  rows={3}
                  placeholder="Detail the technical diagnosis, steps, or procedure performed (e.g. Cleared network switch cache, inspected DHCP lease pool)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  maxLength={2000}
                  data-testid="action-description-input"
                  required
                />
                <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>
                  Minimum 5 characters. Must accurately reflect technical activity.
                </div>
              </div>

              {/* Result Input */}
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <label htmlFor="action-result-input" className="form-label small fw-bold text-dark">
                    Operational Result <span className="text-danger">*</span>
                  </label>
                  <span className="text-muted small">{result.length}/2,000</span>
                </div>
                <textarea
                  id="action-result-input"
                  className="form-control"
                  rows={3}
                  placeholder="Operational outcome or observation (e.g. Ping latency dropped to 4ms, workstation successfully renewed IP 10.0.1.45)..."
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  disabled={submitting}
                  maxLength={2000}
                  data-testid="action-result-input"
                  required
                />
                <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>
                  Minimum 3 characters. State observable result or measured metric.
                </div>
              </div>

              {/* Conditional Follow-up Note */}
              {followUpRequired && (
                <div className="mb-3 p-3 rounded-3 border" style={{ backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }}>
                  <div className="d-flex justify-content-between">
                    <label htmlFor="action-followup-note-input" className="form-label small fw-bold" style={{ color: "#B45309" }}>
                      ⚠️ Follow-Up Note <span className="text-danger">*</span>
                    </label>
                    <span className="text-muted small">{followUpNote.length}/2,000</span>
                  </div>
                  <textarea
                    id="action-followup-note-input"
                    className="form-control"
                    rows={2}
                    placeholder="Describe required next steps, monitoring timeline, or user follow-up (e.g. Monitor switch port error counter for next 24 hours)..."
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    disabled={submitting}
                    maxLength={2000}
                    data-testid="action-followup-note-input"
                    required
                  />
                  <div className="small mt-1" style={{ color: "#B45309", fontSize: "11px" }}>
                    Mandatory when follow-up is enabled (min 5 characters).
                  </div>
                </div>
              )}

              {/* Attachment Notes Input */}
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <label htmlFor="action-attachment-notes-input" className="form-label small fw-bold text-dark">
                    Attachment Notes / Reference <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <span className="text-muted small">{attachmentNotes.length}/1,000</span>
                </div>
                <input
                  type="text"
                  id="action-attachment-notes-input"
                  className="form-control"
                  placeholder="e.g. See ping_test_log.txt and switch_config.png uploaded under Attachments tab"
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  disabled={submitting}
                  maxLength={1000}
                  data-testid="action-attachment-notes-input"
                />
                <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>
                  Textual reference linking this action to diagnostics, logs, or screenshot attachments.
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={submitting}
                data-testid="cancel-action-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white fw-bold d-flex align-items-center gap-2"
                style={{ backgroundColor: "#006B3C" }}
                disabled={submitting}
                data-testid="submit-action-btn"
              >
                {submitting && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                )}
                {isEditMode ? "Save Changes" : "Record Action"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
