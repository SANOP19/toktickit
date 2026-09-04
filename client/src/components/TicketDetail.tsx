import { useState, useEffect } from "react";
import {
  Ticket,
  Attachment,
  RequesterUser,
  getTicketDetail,
  uploadAttachment,
  getAttachmentDownloadUrl,
  softRemoveAttachment,
} from "../api";

interface Props {
  ticketId: number;
  currentRequester: RequesterUser;
  onBack: () => void;
}

export default function TicketDetail({ ticketId, currentRequester, onBack }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Soft-removal modal state
  const [removingAttachment, setRemovingAttachment] = useState<Attachment | null>(null);
  const [removalReason, setRemovalReason] = useState<string>("");
  const [removalError, setRemovalError] = useState<string>("");
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  async function loadTicket() {
    setLoading(true);
    setError("");
    try {
      const data = await getTicketDetail(ticketId, currentRequester.id);
      setTicket(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId, currentRequester.id]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadError("");

    // Validate size (5MB, BR-10)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the maximum limit of 5 MB.");
      e.target.value = "";
      return;
    }

    // Validate MIME type (BR-10)
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError("Unsupported file type. Only JPG, PNG, WEBP, and PDF files are permitted.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      await uploadAttachment(ticketId, currentRequester.id, file);
      e.target.value = "";
      await loadTicket();
    } catch (err: unknown) {
      setUploadError((err as Error).message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }

  function openRemovalModal(att: Attachment) {
    setRemovingAttachment(att);
    setRemovalReason("");
    setRemovalError("");
  }

  function closeRemovalModal() {
    setRemovingAttachment(null);
    setRemovalReason("");
    setRemovalError("");
  }

  async function handleConfirmRemoval() {
    if (!removingAttachment) return;
    const trimmed = removalReason.trim();
    if (trimmed.length < 5) {
      setRemovalError("Removal reason is required and must be at least 5 characters.");
      return;
    }

    setIsRemoving(true);
    try {
      await softRemoveAttachment(ticketId, removingAttachment.id, currentRequester.id, trimmed);
      closeRemovalModal();
      await loadTicket();
    } catch (err: unknown) {
      setRemovalError((err as Error).message || "Failed to remove attachment");
    } finally {
      setIsRemoving(false);
    }
  }

  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case "URGENT":
        return <span className="badge bg-danger">Urgent</span>;
      case "HIGH":
        return <span className="badge bg-danger">High</span>;
      case "MEDIUM":
        return <span className="badge bg-warning text-dark">Medium</span>;
      case "LOW":
        return <span className="badge bg-secondary">Low</span>;
      default:
        return <span className="badge bg-light text-dark">{priority}</span>;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "New":
        return (
          <span
            className="badge"
            style={{ backgroundColor: "#006B3C", color: "#FFFFFF" }}
          >
            New
          </span>
        );
      case "In Progress":
        return <span className="badge bg-primary">In Progress</span>;
      case "Resolved":
        return <span className="badge bg-success">Resolved</span>;
      case "Closed":
        return <span className="badge bg-dark">Closed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  }

  if (loading) {
    return (
      <div className="card shadow-sm border-0 p-5 text-center my-4">
        <div className="spinner-border text-success mx-auto mb-3" role="status" style={{ color: "#006B3C" }}>
          <span className="visually-hidden">Loading ticket details...</span>
        </div>
        <p className="text-muted mb-0">Loading ticket information...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="my-4">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mb-3"
          onClick={onBack}
        >
          ← Back to My Tickets
        </button>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied or Error</h4>
          <p className="mb-0">{error || "Ticket not found or inaccessible."}</p>
        </div>
      </div>
    );
  }

  const activeAttachments = ticket.attachments?.filter((a) => !a.isRemoved) || [];
  const removedAttachments = ticket.attachments?.filter((a) => a.isRemoved) || [];
  const canUploadMore = activeAttachments.length < 5;

  return (
    <div className="my-4">
      {/* Top Breadcrumb & Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-3"
          onClick={onBack}
        >
          ← Back to My Tickets
        </button>
        <div className="text-muted small">
          My Tickets &gt; <span className="fw-semibold text-dark">{ticket.ticketNumber}</span>
        </div>
      </div>

      {/* Ticket Details Card */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: 8 }}>
        <div
          className="card-header text-white py-3 px-4 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#006B3C", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        >
          <div>
            <h1 className="h5 mb-0 fw-bold">{ticket.ticketNumber}</h1>
            <small className="opacity-75">Created on {formatDate(ticket.createdAt)}</small>
          </div>
          <div className="d-flex gap-2">
            {getStatusBadge(ticket.currentStatus)}
            {getPriorityBadge(ticket.requestedPriority)}
          </div>
        </div>

        <div className="card-body p-4">
          {/* Metadata Grid */}
          <div className="row g-3 mb-4 p-3 bg-light rounded-3">
            <div className="col-12 col-md-3">
              <label className="text-muted small fw-semibold d-block">Requester</label>
              <span className="fw-bold">{ticket.requester?.name || currentRequester.name}</span>
              <div className="text-muted small">{ticket.requester?.email || currentRequester.email}</div>
            </div>
            <div className="col-12 col-md-3">
              <label className="text-muted small fw-semibold d-block">Category</label>
              <span className="fw-medium">{ticket.category?.name || "N/A"}</span>
            </div>
            <div className="col-12 col-md-3">
              <label className="text-muted small fw-semibold d-block">Related System</label>
              <span className="fw-medium">{ticket.relatedSystem?.name || "N/A"}</span>
            </div>
            <div className="col-12 col-md-3">
              <label className="text-muted small fw-semibold d-block">Last Updated</label>
              <span className="text-muted small">{formatDate(ticket.updatedAt)}</span>
            </div>
          </div>

          {/* Summary & Description */}
          <div className="mb-4">
            <label className="text-muted small fw-semibold d-block mb-1">Ticket Summary</label>
            <h2 className="h5 fw-bold text-dark mb-3">{ticket.summary}</h2>

            <label className="text-muted small fw-semibold d-block mb-1">Description</label>
            <div
              className="p-3 rounded-2"
              style={{
                backgroundColor: "#FAFBFB",
                border: "1px solid #E5E7EB",
                whiteSpace: "pre-wrap",
                minHeight: 100,
              }}
            >
              {ticket.description}
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: 8 }}>
        <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-dark">
            📎 Attachments ({activeAttachments.length}/5 active)
          </h2>
        </div>

        <div className="card-body p-4">
          {/* Active Attachments List */}
          {activeAttachments.length === 0 ? (
            <p className="text-muted small mb-3">No active attachments attached to this ticket.</p>
          ) : (
            <div className="list-group mb-3">
              {activeAttachments.map((att) => (
                <div
                  key={att.id}
                  className="list-group-item d-flex justify-content-between align-items-center p-3"
                  data-testid={`attachment-item-${att.id}`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-4">📄</span>
                    <div>
                      <div className="fw-semibold text-dark">{att.originalName}</div>
                      <div className="text-muted small">
                        {formatBytes(att.sizeBytes)} • Uploaded {formatDate(att.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <a
                      href={getAttachmentDownloadUrl(ticketId, att.id, currentRequester.id)}
                      download={att.originalName}
                      className="btn btn-sm btn-outline-primary"
                    >
                      ⬇️ Download
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => openRemovalModal(att)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload New Attachment Form */}
          {canUploadMore ? (
            <div className="p-3 bg-light rounded-3 mt-3">
              <label htmlFor="attachment-upload-input" className="form-label fw-semibold small text-dark mb-1">
                Add Supporting Attachment (JPG, PNG, WEBP, PDF up to 5 MB)
              </label>
              <div className="input-group">
                <input
                  id="attachment-upload-input"
                  type="file"
                  className="form-control"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                />
                {isUploading && (
                  <span className="input-group-text bg-white text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Uploading...
                  </span>
                )}
              </div>
              {uploadError && (
                <div className="text-danger small mt-2" role="alert">
                  ⚠️ {uploadError}
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-info small mt-3 mb-0" role="alert">
              ℹ️ Maximum limit of 5 active attachments reached for this ticket.
            </div>
          )}

          {/* Soft-Removed Attachments List (Audit History) */}
          {removedAttachments.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <h3 className="h6 fw-bold text-muted mb-3">Removed Attachments (Audit History)</h3>
              <div className="list-group">
                {removedAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="list-group-item list-group-item-light p-3 opacity-75"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className="text-decoration-line-through text-muted fw-semibold">
                          📄 {att.originalName}
                        </span>
                        <div className="text-muted small mt-1">
                          Removed on {att.removedAt ? formatDate(att.removedAt) : "N/A"}
                        </div>
                        <div className="badge bg-secondary mt-1">
                          Reason: {att.removalReason || "No reason specified"}
                        </div>
                      </div>
                      <span className="text-muted small fst-italic">Download Disabled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Soft-Removal Reason Modal */}
      {removingAttachment && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Confirm Attachment Removal</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRemovalModal}
                  disabled={isRemoving}
                />
              </div>
              <div className="modal-body">
                <p className="small text-muted mb-3">
                  You are removing <strong>{removingAttachment.originalName}</strong>. This file will no longer be downloadable, and a removal audit record with your reason will be kept.
                </p>
                <div className="mb-3">
                  <label htmlFor="removal-reason-input" className="form-label fw-semibold small">
                    Reason for Removal <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="removal-reason-input"
                    className={`form-control ${removalError ? "is-invalid" : ""}`}
                    rows={3}
                    placeholder="e.g. Uploaded confidential document or outdated screenshot by mistake"
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    disabled={isRemoving}
                  />
                  {removalError && <div className="invalid-feedback">{removalError}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={closeRemovalModal}
                  disabled={isRemoving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleConfirmRemoval}
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Confirm Removal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
