import React, { useState, useEffect, useCallback } from "react";
import { useRequester } from "../context/RequesterContext";
import { Category, fetchCategories, fetchTickets } from "../api";
import { Ticket, TicketPriority } from "../types";

interface MyTicketsProps {
  onCreateClick?: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

export const MyTickets: React.FC<MyTicketsProps> = ({ onCreateClick, onSelectTicket }) => {
  const { selectedRequester } = useRequester();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Query State
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [priority, setPriority] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load categories for filter dropdown
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Load tickets on mount and whenever filters change
  useEffect(() => {
    let isMounted = true;
    if (!selectedRequester) return;

    setLoading(true);
    setError(null);

    fetchTickets({
      requesterId: selectedRequester.id,
      search: search.trim() || undefined,
      categoryId: categoryId !== "" ? Number(categoryId) : undefined,
      priority: priority || undefined,
      status: status || undefined,
      page,
      limit,
    })
      .then((res) => {
        if (isMounted) {
          setTickets(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalItems(res.pagination?.totalItems || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load tickets");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRequester?.id, search, categoryId, priority, status, page, limit]);

  const handleClearFilters = () => {
    setSearch("");
    setCategoryId("");
    setPriority("");
    setStatus("");
    setPage(1);
  };

  const getPriorityBadgeClass = (p: TicketPriority | string) => {
    switch (p) {
      case "LOW":
        return "bg-light text-success border border-success";
      case "MEDIUM":
        return "bg-warning text-dark";
      case "HIGH":
        return "bg-danger text-white";
      case "URGENT":
        return "bg-danger text-white fw-bold";
      default:
        return "bg-secondary text-white";
    }
  };

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case "New":
        return "bg-info text-dark";
      case "Open":
      case "In Progress":
        return "bg-primary text-white";
      case "Resolved":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="card shadow-sm border-0 p-4 rounded-3" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h5 fw-bold mb-1" style={{ color: "#1F2937" }}>My Tickets</h2>
          <p className="text-muted small mb-0">
            View, search, and track support requests submitted by <strong data-testid="active-requester-name">{selectedRequester?.name}</strong>.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {(search || categoryId !== "" || priority || status) && (
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-muted small p-0 me-2"
              onClick={handleClearFilters}
            >
              🔄 Clear Filters
            </button>
          )}
          {onCreateClick && (
            <button
              type="button"
              className="btn btn-sm text-white px-3 fw-medium"
              style={{ backgroundColor: "#006B3C" }}
              onClick={onCreateClick}
            >
              + Create Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="row g-2 mb-4 p-3 rounded-3" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        {/* Search */}
        <div className="col-12 col-md-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted" id="search-addon">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by ticket number or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tickets"
              aria-describedby="search-addon"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="col-6 col-md-2">
          <select
            className="form-select form-select-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="col-6 col-md-2">
          <select
            className="form-select form-select-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Filter by Priority"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="col-12 col-md-3">
          <select
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger small mb-3" role="alert">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#006B3C" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="small text-muted mt-2">Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        /* Empty / No-Results States */
        <div className="text-center py-5 text-muted">
          <span className="fs-1 d-block mb-3">📭</span>
          {search || categoryId !== "" || priority || status ? (
            <div>
              <h3 className="h6 fw-bold text-dark">No tickets found</h3>
              <p className="small mb-3">No tickets match your filter criteria.</p>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div>
              <h3 className="h6 fw-bold text-dark">No tickets yet</h3>
              <p className="small mb-3">You haven't submitted any support requests yet.</p>
              {onCreateClick && (
                <button
                  type="button"
                  className="btn btn-sm text-white px-3"
                  style={{ backgroundColor: "#006B3C" }}
                  onClick={onCreateClick}
                >
                  Create Your First Ticket
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View & Mobile Cards */
        <div>
          {/* Desktop Table (hidden on small viewports) */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
              <thead style={{ backgroundColor: "#F9FAFB", borderBottom: "2px solid #E5E7EB" }}>
                <tr>
                  <th scope="col" className="fw-semibold text-muted py-2">Ticket No.</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Created Date</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Summary</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Category</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Requested Priority</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Current Status</th>
                  <th scope="col" className="fw-semibold text-muted py-2">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket && onSelectTicket(t)}
                    style={{ cursor: onSelectTicket ? "pointer" : "default" }}
                  >
                    <td className="fw-bold" style={{ color: "#006B3C" }}>{t.ticketNumber}</td>
                    <td className="text-muted">
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="fw-medium text-dark">{t.summary}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{t.category?.name || "General"}</span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(t.requestedPriority)}`}>
                        {t.requestedPriority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(t.currentStatus)}`}>
                        {t.currentStatus}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(t.updatedAt || t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (visible only on small viewports < 768px) */}
          <div className="d-md-none">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="card border p-3 mb-2 shadow-sm rounded-3"
                onClick={() => onSelectTicket && onSelectTicket(t)}
                style={{ cursor: onSelectTicket ? "pointer" : "default" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold small" style={{ color: "#006B3C" }}>{t.ticketNumber}</span>
                  <span className={`badge ${getStatusBadgeClass(t.currentStatus)}`}>{t.currentStatus}</span>
                </div>
                <div className="fw-medium text-dark mb-2 small">{t.summary}</div>
                <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: "11px" }}>
                  <span>{t.category?.name || "General"}</span>
                  <span className={`badge ${getPriorityBadgeClass(t.requestedPriority)}`}>{t.requestedPriority}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
            <span className="small text-muted">
              Showing {startItem} to {endItem} of {totalItems} tickets
            </span>

            <nav aria-label="Ticket pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    &lsaquo; Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <li key={num} className={`page-item ${page === num ? "active" : ""}`}>
                    <button
                      className="page-link"
                      style={page === num ? { backgroundColor: "#006B3C", borderColor: "#006B3C" } : {}}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    Next &rsaquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
