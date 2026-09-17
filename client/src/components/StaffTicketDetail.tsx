import React, { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  User,
  TicketComment,
  InternalNote,
  fetchStaffTicketDetailApi,
  fetchStaffUsersApi,
  assignStaffTicketApi,
  updateStaffTicketPriorityApi,
  updateStaffTicketStatusApi,
  addCommentApi,
  addInternalNoteApi,
  getAttachmentDownloadUrl,
} from "../api";
import { useAuth } from "../context/AuthContext";

interface Props {
  ticketId: number;
  onBack: () => void;
}

const PERMITTED_TRANSITIONS: Record<string, string[]> = {
  "New": ["Open", "Cancelled"],
  "Open": ["In Progress", "Cancelled"],
  "In Progress": ["Waiting for Requester", "Resolved", "Cancelled"],
  "Waiting for Requester": ["In Progress", "Resolved"],
  "Resolved": ["Closed", "Reopened"],
  "Reopened": ["In Progress", "Waiting for Requester", "Resolved"],
  "Closed": [],
  "Cancelled": [],
};

export function StaffTicketDetail({ ticketId, onBack }: Props) {
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Operational Action states
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  // Communication tabs
  const [activeTab, setActiveTab] = useState<"comments" | "notes">("comments");

  // Public comment input
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string>("");

  // Internal note input
  const [newNote, setNewNote] = useState<string>("");
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string>("");

  // Status selection
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Load ticket and assignable staff
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, usersData] = await Promise.all([
        fetchStaffTicketDetailApi(ticketId),
        fetchStaffUsersApi().catch(() => []),
      ]);
      setTicket(ticketData);
      setStaffUsers(usersData);
      setSelectedStatus(ticketData.currentStatus);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load ticket detail.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Claim Ticket
  const handleClaimTicket = async () => {
    if (!user) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const updated = await assignStaffTicketApi(ticketId, user.id);
      setTicket(updated);
      setSelectedStatus(updated.currentStatus);
      setActionSuccess("Ticket successfully claimed! Status moved to Open.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: unknown) {
      setActionError((err as Error).message || "Failed to claim ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Assignee Change
  const handleAssignChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newOwnerId = val === "" ? null : Number(val);
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const updated = await assignStaffTicketApi(ticketId, newOwnerId);
      setTicket(updated);
      setSelectedStatus(updated.currentStatus);
      setActionSuccess(newOwnerId ? "Assignee updated successfully." : "Ticket unassigned.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: unknown) {
      setActionError((err as Error).message || "Failed to update assignee.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Priority Change
  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    if (!newPriority) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const updated = await updateStaffTicketPriorityApi(ticketId, newPriority);
      setTicket(updated);
      setActionSuccess(`IT Priority updated to ${newPriority}.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: unknown) {
      setActionError((err as Error).message || "Failed to update IT Priority.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Status Transition
  const handleStatusTransition = async () => {
    if (!selectedStatus || !ticket || selectedStatus === ticket.currentStatus) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const updated = await updateStaffTicketStatusApi(ticketId, selectedStatus);
      setTicket(updated);
      setActionSuccess(`Ticket status advanced to ${selectedStatus}.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: unknown) {
      setActionError((err as Error).message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Submit Public Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || newComment.trim().length > 2000) return;
    setIsSubmittingComment(true);
    setCommentError("");
    try {
      const posted = await addCommentApi(ticketId, newComment.trim());
      setTicket((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), posted] } : prev));
      setNewComment("");
    } catch (err: unknown) {
      setCommentError((err as Error).message || "Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Submit Internal Note
  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || newNote.trim().length > 2000) return;
    setIsSubmittingNote(true);
    setNoteError("");
    try {
      const posted = await addInternalNoteApi(ticketId, newNote.trim());
      setTicket((prev) => (prev ? { ...prev, internalNotes: [...(prev.internalNotes || []), posted] } : prev));
      setNewNote("");
    } catch (err: unknown) {
      setNoteError((err as Error).message || "Failed to save internal note.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "New":
        return "bg-info text-dark";
      case "Open":
        return "bg-primary text-white";
      case "In Progress":
        return "bg-warning text-dark";
      case "Waiting for Requester":
        return "text-white";
      case "Resolved":
        return "bg-success text-white";
      case "Closed":
        return "bg-dark text-white";
      case "Reopened":
        return "text-white";
      case "Cancelled":
        return "bg-light text-muted border";
      default:
        return "bg-secondary text-white";
    }
  };

  const getPriorityBadge = (p?: string | null) => {
    switch (p) {
      case "LOW":
        return <span className="badge bg-light text-success border border-success">Low</span>;
      case "MEDIUM":
        return <span className="badge bg-warning text-dark">Medium</span>;
      case "HIGH":
        return <span className="badge bg-danger text-white">High</span>;
      case "URGENT":
        return <span className="badge bg-danger text-white fw-bold">Urgent</span>;
      default:
        return <span className="badge bg-secondary text-white">{p || "None"}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" data-testid="staff-detail-loading">
        <div className="spinner-border text-success" role="status" style={{ color: "#006B3C" }}>
          <span className="visually-hidden">Loading ticket details...</span>
        </div>
        <p className="text-muted small mt-2">Loading operational ticket details...</p>
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
          data-testid="back-to-queue-btn"
        >
          ← Back to Ticket Queue
        </button>
        <div className="alert alert-danger shadow-sm border-0" role="alert">
          ⚠️ {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  const allowedTransitions = PERMITTED_TRANSITIONS[ticket.currentStatus] || [];
  const isOwnerCurrentUser = user && ticket.ownerId === user.id;

  return (
    <div className="my-4" data-testid="staff-ticket-detail-container">
      {/* Navigation Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={onBack}
          data-testid="back-to-queue-btn"
        >
          ← Back to Ticket Queue
        </button>
        <span className="text-muted small">
          Created: {new Date(ticket.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      {/* Ticket Header & Title */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 fw-bold mb-0" style={{ color: "#006B3C" }}>
                {ticket.ticketNumber}
              </h1>
              <span
                className={`badge px-3 py-1 rounded-pill ${getStatusBadgeClass(ticket.currentStatus)}`}
                data-testid="detail-status-badge"
                style={ticket.currentStatus === "Waiting for Requester" ? { backgroundColor: "#6f42c1" } : {}}
              >
                {ticket.currentStatus}
              </span>
            </div>
            <h2 className="h5 fw-semibold text-dark mt-2 mb-1">{ticket.summary}</h2>
          </div>
        </div>

        {/* Requester & Category Info Pills */}
        <div className="d-flex flex-wrap gap-3 text-muted small pt-2 border-top mt-2">
          <span>
            <strong>Requester:</strong> {ticket.requester?.name} ({ticket.requester?.email})
          </span>
          <span>
            <strong>Category:</strong> {ticket.category?.name || "General"}
          </span>
          <span>
            <strong>Related System:</strong> {ticket.relatedSystem?.name || "None"}
          </span>
        </div>
      </div>

      {/* Conditional Requester Problem Resolved Indication Banner */}
      {ticket.isRequesterResolved && (
        <div
          className="alert alert-success d-flex align-items-center gap-2 border-0 shadow-sm p-3 mb-4 rounded-3"
          style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}
          data-testid="requester-resolved-banner"
        >
          <span className="fs-5">✓</span>
          <div>
            <strong>Requester Problem Indication:</strong> The requester (
            {ticket.requester?.name || "User"}) has indicated that this issue appears resolved.
          </div>
        </div>
      )}

      {/* Operational Feedback Alerts */}
      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show border-0 mb-3" role="alert">
          ⚠️ {actionError}
          <button type="button" className="btn-close" onClick={() => setActionError("")} />
        </div>
      )}

      {actionSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show border-0 mb-3"
          style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}
          role="alert"
        >
          ✓ {actionSuccess}
          <button type="button" className="btn-close" onClick={() => setActionSuccess("")} />
        </div>
      )}

      {/* Operational Control Panel (Teacher Mockup 3) */}
      <div className="card shadow-sm border-0 rounded-3 mb-4 bg-white" data-testid="operational-control-panel">
        <div
          className="card-header py-3 px-4 bg-white border-bottom d-flex justify-content-between align-items-center"
          style={{ borderLeft: "4px solid #006B3C" }}
        >
          <h2 className="h6 fw-bold mb-0 text-dark">⚙️ Operational Control Panel (IT Staff / Admin)</h2>
          {actionLoading && (
            <span className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Updating...</span>
            </span>
          )}
        </div>

        <div className="card-body p-4">
          <div className="row g-3">
            {/* Control 1: Ownership Assignment & Claim */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark d-block">
                Assigned Owner
              </label>
              <div className="input-group input-group-sm mb-2">
                <select
                  className="form-select"
                  value={ticket.ownerId ?? ""}
                  onChange={handleAssignChange}
                  disabled={actionLoading}
                  data-testid="staff-assignee-select"
                >
                  <option value="">(Unassigned)</option>
                  {staffUsers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role === "ADMINISTRATOR" ? "Admin" : "IT Staff"})
                    </option>
                  ))}
                </select>
              </div>
              {!isOwnerCurrentUser && user && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success w-100 d-flex align-items-center justify-content-center gap-1"
                  style={{ borderColor: "#006B3C", color: "#006B3C" }}
                  onClick={handleClaimTicket}
                  disabled={actionLoading}
                  data-testid="claim-ticket-btn"
                >
                  🙋‍♂️ Claim Ticket (Assign to Me)
                </button>
              )}
              {isOwnerCurrentUser && (
                <span className="badge bg-light text-success border border-success d-inline-block p-1 small">
                  ✓ Assigned to You
                </span>
              )}
            </div>

            {/* Control 2: IT Priority Management */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark d-block">
                IT Priority (Operational)
              </label>
              <select
                className="form-select form-select-sm mb-2"
                value={ticket.itPriority ?? ticket.requestedPriority}
                onChange={handlePriorityChange}
                disabled={actionLoading}
                data-testid="staff-priority-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="text-muted small" style={{ fontSize: "11px" }}>
                <span>Requested Priority: </span>
                {getPriorityBadge(ticket.requestedPriority)}
              </div>
            </div>

            {/* Control 3: Status Transition Workflow */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark d-block">
                Lifecycle Status Workflow
              </label>
              {allowedTransitions.length > 0 ? (
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={actionLoading}
                    data-testid="staff-status-select"
                  >
                    <option value={ticket.currentStatus}>
                      Current: {ticket.currentStatus}
                    </option>
                    {allowedTransitions.map((st) => (
                      <option key={st} value={st}>
                        Advance to: {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-sm text-white px-3"
                    style={{ backgroundColor: "#006B3C" }}
                    onClick={handleStatusTransition}
                    disabled={actionLoading || selectedStatus === ticket.currentStatus}
                    data-testid="update-status-btn"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <span className="badge bg-secondary p-2 d-block text-center">
                  Terminal Status ({ticket.currentStatus})
                </span>
              )}
              <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>
                Permitted next: {allowedTransitions.length > 0 ? allowedTransitions.join(", ") : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Attachments */}
      <div className="card shadow-sm border-0 rounded-3 mb-4 bg-white">
        <div className="card-body p-4">
          <h3 className="h6 fw-bold text-dark mb-2">Description</h3>
          <p className="text-dark mb-4" style={{ whiteSpace: "pre-wrap" }}>
            {ticket.description}
          </p>

          <h3 className="h6 fw-bold text-dark mb-2">
            Attachments ({ticket.attachments?.filter((a) => !a.isRemoved).length || 0})
          </h3>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="list-group list-group-flush" data-testid="staff-attachments-list">
              {ticket.attachments.map((att) => (
                <div
                  key={att.id}
                  className="list-group-item d-flex justify-content-between align-items-center px-0 py-2"
                >
                  <div>
                    <span className="fw-medium small me-2">{att.originalName}</span>
                    <span className="text-muted small">({Math.round(att.sizeBytes / 1024)} KB)</span>
                    {att.isRemoved && (
                      <span className="badge bg-danger-subtle text-danger ms-2 small">
                        Soft-Removed: {att.removalReason || "No reason"}
                      </span>
                    )}
                  </div>
                  {!att.isRemoved && (
                    <a
                      href={getAttachmentDownloadUrl(ticket.id, att.id, ticket.requesterId || (ticket.requester ? ticket.requester.id : 1))}
                      className="btn btn-xs btn-outline-secondary"
                      target="_blank"
                      rel="noreferrer"
                    >
                      ⬇ Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted small mb-0">No attachments provided.</p>
          )}
        </div>
      </div>

      {/* Tabbed Communication Section: Public Comments vs Confidential Internal Notes */}
      <div className="card shadow-sm border-0 rounded-3 bg-white">
        <div className="card-header bg-white px-4 pt-3 pb-0 border-bottom">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === "comments" ? "active fw-bold" : "text-muted"}`}
                style={activeTab === "comments" ? { color: "#006B3C", borderBottom: "3px solid #006B3C" } : {}}
                onClick={() => setActiveTab("comments")}
                data-testid="tab-public-comments"
              >
                💬 Public Comments ({ticket.comments?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === "notes" ? "active fw-bold" : "text-muted"}`}
                style={activeTab === "notes" ? { color: "#B45309", borderBottom: "3px solid #F59E0B" } : {}}
                onClick={() => setActiveTab("notes")}
                data-testid="tab-internal-notes"
              >
                🔒 Confidential Internal Notes ({ticket.internalNotes?.length || 0})
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: Public Comments */}
          {activeTab === "comments" && (
            <div data-testid="public-comments-tab-content">
              <div className="alert alert-light border small text-muted mb-3 py-2">
                Public conversation visible to the Requester, IT Staff, and Administrators.
              </div>

              {/* Comments Thread */}
              <div className="mb-4" data-testid="public-comments-thread">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((c: TicketComment) => (
                    <div key={c.id} className="card border-0 bg-light p-3 mb-2 rounded-3 shadow-none">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold small text-dark">{c.author?.name || "Author"}</span>
                          <span
                            className={`badge ${
                              c.author?.role === "REQUESTER"
                                ? "bg-success"
                                : c.author?.role === "IT_STAFF"
                                ? "bg-primary"
                                : "bg-dark"
                            }`}
                            style={{ fontSize: "10px" }}
                          >
                            {c.author?.role === "REQUESTER"
                              ? "Requester"
                              : c.author?.role === "IT_STAFF"
                              ? "IT Staff"
                              : "Admin"}
                          </span>
                        </div>
                        <span className="text-muted small" style={{ fontSize: "11px" }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-dark mb-0 small" style={{ whiteSpace: "pre-wrap" }}>
                        {c.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small mb-3">No public comments yet.</p>
                )}
              </div>

              {/* New Comment Input */}
              {commentError && (
                <div className="alert alert-danger small py-2 mb-2">⚠️ {commentError}</div>
              )}
              <form onSubmit={handlePostComment}>
                <div className="mb-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Type a public reply to the requester..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={2000}
                    disabled={isSubmittingComment}
                    data-testid="public-comment-input"
                  />
                  <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: "11px" }}>
                    <span>Visible to Requester</span>
                    <span>{newComment.length} / 2,000</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-sm text-white px-3"
                  style={{ backgroundColor: "#006B3C" }}
                  disabled={isSubmittingComment || !newComment.trim()}
                  data-testid="submit-public-comment-btn"
                >
                  {isSubmittingComment ? "Posting..." : "Post Public Comment"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Confidential Internal Notes */}
          {activeTab === "notes" && (
            <div data-testid="internal-notes-tab-content">
              {/* Confidential Security Callout Banner */}
              <div
                className="alert d-flex align-items-center gap-2 border-0 shadow-sm p-3 mb-4 rounded-3"
                style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderLeft: "4px solid #F59E0B" }}
                data-testid="internal-notes-security-notice"
              >
                <span className="fs-5">🔒</span>
                <div>
                  <strong>Confidential Internal Workspace:</strong> Internal operational notes are strictly
                  confidential and visible <strong>ONLY</strong> to IT Staff and Administrators. Requesters are
                  blocked by server RBAC and cannot view this thread.
                </div>
              </div>

              {/* Internal Notes Thread */}
              <div className="mb-4" data-testid="internal-notes-thread">
                {ticket.internalNotes && ticket.internalNotes.length > 0 ? (
                  ticket.internalNotes.map((n: InternalNote) => (
                    <div
                      key={n.id}
                      className="card p-3 mb-2 rounded-3 shadow-none"
                      style={{
                        backgroundColor: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        borderLeft: "4px solid #F59E0B",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold small text-dark">{n.author?.name || "Staff"}</span>
                          <span
                            className="badge text-dark fw-bold"
                            style={{ backgroundColor: "#FCD34D", fontSize: "10px" }}
                          >
                            🔒 {n.author?.role === "ADMINISTRATOR" ? "Admin Note" : "Internal Note"}
                          </span>
                        </div>
                        <span className="text-muted small" style={{ fontSize: "11px" }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-dark mb-0 small" style={{ whiteSpace: "pre-wrap" }}>
                        {n.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small mb-3">No internal notes recorded yet.</p>
                )}
              </div>

              {/* New Internal Note Input */}
              {noteError && <div className="alert alert-danger small py-2 mb-2">⚠️ {noteError}</div>}
              <form onSubmit={handlePostNote}>
                <div className="mb-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Record internal troubleshooting details, diagnostic logs, vendor contact..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    maxLength={2000}
                    disabled={isSubmittingNote}
                    style={{ borderColor: "#FCD34D" }}
                    data-testid="internal-note-input"
                  />
                  <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: "11px" }}>
                    <span className="text-warning-emphasis">🔒 Confidential - IT Staff & Admin Only</span>
                    <span>{newNote.length} / 2,000</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-sm text-white px-3 fw-semibold"
                  style={{ backgroundColor: "#B45309" }}
                  disabled={isSubmittingNote || !newNote.trim()}
                  data-testid="submit-internal-note-btn"
                >
                  {isSubmittingNote ? "Saving..." : "Save Internal Note"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffTicketDetail;
