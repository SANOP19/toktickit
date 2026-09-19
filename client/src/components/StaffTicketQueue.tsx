import React, { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Category,
  fetchCategories,
  fetchStaffTicketsApi,
  StaffTicketQueryParams,
  StaffTicketQueueResponse,
} from "../api";
import { useAuth } from "../context/AuthContext";

interface Props {
  onSelectTicket?: (ticket: Ticket) => void;
}

export function StaffTicketQueue({ onSelectTicket }: Props) {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "unassigned" | "assigned_to_me">("all");

  // Pagination & Sorting States
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Summary Metrics
  const [summary, setSummary] = useState<{
    totalOpen: number;
    assignedToMe: number;
    unassigned: number;
  }>({
    totalOpen: 0,
    assignedToMe: 0,
    unassigned: 0,
  });

  // Load categories
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch Tickets function
  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: StaffTicketQueryParams = {
        search: search.trim() || undefined,
        categoryId: categoryId !== "" ? Number(categoryId) : undefined,
        currentStatus: currentStatus || undefined,
        priority: priority || undefined,
        ownerFilter,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      const res: StaffTicketQueueResponse = await fetchStaffTicketsApi(params);
      setTickets(res.tickets || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load staff ticket queue.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, currentStatus, priority, ownerFilter, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleClearFilters = () => {
    setSearch("");
    setCategoryId("");
    setCurrentStatus("");
    setPriority("");
    setOwnerFilter("all");
    setPage(1);
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
        return "bg-secondary text-white";
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

  const getPriorityBadge = (p: string) => {
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
        return <span className="badge bg-secondary text-white">{p}</span>;
    }
  };

  return (
    <div className="my-4" data-testid="staff-ticket-queue-container">
      {/* Header & Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">🛠️ IT Staff Ticket Queue</h1>
          <p className="text-muted small mb-0">
            Shared operational workspace for triaging, assigning, and resolving support requests.
          </p>
        </div>

        {/* Quick Refresh Button */}
        <div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => loadQueue()}
            disabled={loading}
          >
            🔄 Refresh Queue
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar (Teacher Mockup 2 / UI-Spec 3.3) */}
      <div className="row g-3 mb-4" data-testid="summary-metrics-bar">
        <div className="col-12 col-md-4">
          <div
            className="card border-0 shadow-sm p-3 rounded-3"
            style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #006B3C" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold d-block">Total Open Tickets</span>
                <span className="h4 fw-bold mb-0" style={{ color: "#006B3C" }} data-testid="metric-total-open">
                  {summary.totalOpen}
                </span>
              </div>
              <span className="fs-3">📋</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div
            className="card border-0 shadow-sm p-3 rounded-3"
            style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #0D6EFD" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold d-block">Assigned to Me</span>
                <span className="h4 fw-bold text-primary mb-0" data-testid="metric-assigned-to-me">
                  {summary.assignedToMe}
                </span>
              </div>
              <span className="fs-3">👤</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div
            className="card border-0 shadow-sm p-3 rounded-3"
            style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #F59E0B" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold d-block">Unassigned Tickets</span>
                <span className="h4 fw-bold text-warning mb-0" data-testid="metric-unassigned">
                  {summary.unassigned}
                </span>
              </div>
              <span className="fs-3">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        {/* Operational Ownership Filter Tabs */}
        <div className="card-header bg-white px-4 pt-3 pb-0 border-bottom">
          <ul className="nav nav-tabs card-header-tabs" data-testid="ownership-filter-tabs">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${ownerFilter === "all" ? "active fw-bold" : "text-muted"}`}
                style={ownerFilter === "all" ? { color: "#006B3C", borderBottom: "3px solid #006B3C" } : {}}
                onClick={() => {
                  setOwnerFilter("all");
                  setPage(1);
                }}
                data-testid="filter-owner-all"
              >
                All Tickets
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${ownerFilter === "unassigned" ? "active fw-bold" : "text-muted"}`}
                style={ownerFilter === "unassigned" ? { color: "#006B3C", borderBottom: "3px solid #006B3C" } : {}}
                onClick={() => {
                  setOwnerFilter("unassigned");
                  setPage(1);
                }}
                data-testid="filter-owner-unassigned"
              >
                Unassigned ({summary.unassigned})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${ownerFilter === "assigned_to_me" ? "active fw-bold" : "text-muted"}`}
                style={ownerFilter === "assigned_to_me" ? { color: "#006B3C", borderBottom: "3px solid #006B3C" } : {}}
                onClick={() => {
                  setOwnerFilter("assigned_to_me");
                  setPage(1);
                }}
                data-testid="filter-owner-assigned_to_me"
              >
                Assigned to Me ({summary.assignedToMe})
              </button>
            </li>
          </ul>
        </div>

        {/* Filter Toolbar */}
        <div className="card-body p-4 border-bottom bg-light">
          <div className="row g-2">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by ticket # or summary..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  data-testid="staff-search-input"
                />
                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                  setPage(1);
                }}
                data-testid="staff-category-filter"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={currentStatus}
                onChange={(e) => {
                  setCurrentStatus(e.target.value);
                  setPage(1);
                }}
                data-testid="staff-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Requester">Waiting for Requester</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Reopened">Reopened</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                data-testid="staff-priority-filter"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="col-6 col-md-2 d-grid">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClearFilters}
                data-testid="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="card-body p-0">
          {error && (
            <div className="alert alert-danger m-3" role="alert" data-testid="queue-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5" data-testid="queue-loading">
              <div className="spinner-border text-success" role="status" style={{ color: "#006B3C" }}>
                <span className="visually-hidden">Loading queue...</span>
              </div>
              <p className="text-muted small mt-2">Loading ticket queue...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-5" data-testid="queue-empty-state">
              <span className="fs-1 d-block mb-3">📭</span>
              <h3 className="h6 fw-bold text-dark">No tickets found</h3>
              <p className="text-muted small mb-3">
                {search || categoryId !== "" || currentStatus || priority || ownerFilter !== "all"
                  ? "No tickets match your active filter criteria."
                  : "No tickets matching your criteria"}
              </p>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={handleClearFilters}
                data-testid="empty-clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 992px) */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                  <thead style={{ backgroundColor: "#F9FAFB", borderBottom: "2px solid #E5E7EB" }}>
                    <tr>
                      <th
                        scope="col"
                        className="fw-semibold text-muted py-3 ps-4"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSortBy("ticketNumber");
                          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                        }}
                      >
                        Ticket No. {sortBy === "ticketNumber" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th
                        scope="col"
                        className="fw-semibold text-muted py-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSortBy("createdAt");
                          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                        }}
                      >
                        Created {sortBy === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        Requester
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        Summary
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        Category
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        IT / Req Priority
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        Status
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3">
                        Owner
                      </th>
                      <th scope="col" className="fw-semibold text-muted py-3 pe-4 text-end">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        data-testid={`ticket-row-${t.id}`}
                        onClick={() => onSelectTicket && onSelectTicket(t)}
                        style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                      >
                        {/* Ticket Number */}
                        <td className="ps-4">
                          <span className="fw-bold" style={{ color: "#006B3C" }}>
                            {t.ticketNumber}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="text-muted small">
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Requester */}
                        <td>
                          <div className="fw-semibold text-dark">{t.requester?.name || "Requester"}</div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            {t.requester?.email || ""}
                          </div>
                        </td>

                        {/* Summary */}
                        <td>
                          <div
                            className="fw-medium text-dark text-truncate"
                            style={{ maxWidth: 220 }}
                            title={t.summary}
                          >
                            {t.summary}
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="badge bg-light text-dark border">
                            {t.category?.name || "General"}
                          </span>
                        </td>

                        {/* Priority: IT Priority vs Requested Priority */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            {t.itPriority ? (
                              <>
                                {getPriorityBadge(t.itPriority)}
                                <small className="text-muted" style={{ fontSize: "10px" }}>
                                  (IT)
                                </small>
                              </>
                            ) : (
                              <>
                                {getPriorityBadge(t.requestedPriority)}
                                <small className="text-muted" style={{ fontSize: "10px" }}>
                                  (Req)
                                </small>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <span
                              className={`badge ${getStatusBadgeClass(t.currentStatus)}`}
                              style={t.currentStatus === "Reopened" ? { backgroundColor: "#0D9488" } : undefined}
                            >
                              {t.currentStatus}
                            </span>
                            {t.isRequesterResolved && (
                              <span
                                className="badge border"
                                style={{
                                  fontSize: "10px",
                                  backgroundColor: "#EAF6EF",
                                  color: "#006B3C",
                                  borderColor: "#006B3C",
                                }}
                                title="Requester indicated problem appears resolved"
                              >
                                ✓ Resolved
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Ticket Owner */}
                        <td>
                          {t.owner ? (
                            <span className="badge bg-light text-primary border border-primary">
                              👤 {t.owner.name}
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                border: "1px solid #FCD34D",
                              }}
                            >
                              ⏳ Unassigned
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="pe-4 text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectTicket) onSelectTicket(t);
                            }}
                            data-testid={`view-detail-btn-${t.id}`}
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< 768px) */}
              <div className="d-md-none p-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="card border p-3 mb-2 shadow-sm rounded-3"
                    onClick={() => onSelectTicket && onSelectTicket(t)}
                    data-testid={`mobile-ticket-card-${t.id}`}
                    style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold" style={{ color: "#006B3C" }}>
                        {t.ticketNumber}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <span className={`badge ${getStatusBadgeClass(t.currentStatus)}`}>
                          {t.currentStatus}
                        </span>
                        {t.isRequesterResolved && (
                          <span
                            className="badge border"
                            style={{
                              fontSize: "10px",
                              backgroundColor: "#EAF6EF",
                              color: "#006B3C",
                              borderColor: "#006B3C",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="fw-semibold text-dark mb-1 small">{t.summary}</div>

                    <div className="d-flex justify-content-between align-items-center text-muted small mb-2" style={{ fontSize: "11px" }}>
                      <span>👤 {t.requester?.name || "Requester"}</span>
                      <span>{t.category?.name || "General"}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <div>
                        {t.owner ? (
                          <span className="badge bg-light text-primary border" style={{ fontSize: "11px" }}>
                            Assigned: {t.owner.name}
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              border: "1px solid #FCD34D",
                              fontSize: "11px",
                            }}
                          >
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div>
                        {t.itPriority ? getPriorityBadge(t.itPriority) : getPriorityBadge(t.requestedPriority)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top bg-white gap-2" data-testid="queue-pagination">
                <div className="text-muted small">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} tickets
                  {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                </div>

                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    data-testid="prev-page-btn"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    data-testid="next-page-btn"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffTicketQueue;
