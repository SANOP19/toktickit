import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchRequesterDashboardApi } from "../api";
import { RequesterDashboardData, RequesterDashboardMetrics } from "../types";

export interface RequesterDashboardProps {
  onDrillDown?: (statusFilter?: string) => void;
  onSelectTicket?: (ticketId: number) => void;
  onCreateClick?: () => void;
  onViewAll?: () => void;
}

const defaultMetrics: RequesterDashboardMetrics = {
  myOpenTickets: 0,
  inProgressTickets: 0,
  resolvedTickets: 0,
  closedTickets: 0,
};

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onDrillDown,
  onSelectTicket,
  onCreateClick,
  onViewAll,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<RequesterDashboardData>({
    metrics: defaultMetrics,
    recentTickets: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await fetchRequesterDashboardApi();
      setData({
        metrics: res.metrics || defaultMetrics,
        recentTickets: res.recentTickets || [],
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load Requester Dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = data.metrics || defaultMetrics;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "new") return <span className="badge bg-primary">New</span>;
    if (s === "open") return <span className="badge bg-info text-dark">Open</span>;
    if (s.includes("progress")) return <span className="badge bg-warning text-dark">In Progress</span>;
    if (s.includes("waiting")) return <span className="badge bg-secondary">Waiting</span>;
    if (s === "resolved") return <span className="badge bg-success">Resolved</span>;
    if (s === "closed") return <span className="badge bg-dark">Closed</span>;
    return <span className="badge bg-light text-dark">{status}</span>;
  };

  const getPriorityBadge = (p: string | undefined) => {
    const val = (p || "MEDIUM").toUpperCase();
    if (val === "URGENT") return <span className="badge bg-danger">Urgent</span>;
    if (val === "HIGH") return <span className="badge bg-warning text-dark">High</span>;
    if (val === "LOW") return <span className="badge bg-secondary">Low</span>;
    return <span className="badge bg-info text-dark">Medium</span>;
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" data-testid="dashboard-loading">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="requester-dashboard" data-testid="requester-dashboard">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-1" style={{ color: "#006B3C" }}>
            Welcome, {user?.name || "Requester"}!
          </h2>
          <p className="text-muted small mb-0">
            Here&apos;s the latest on your IT service requests.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            data-testid="btn-refresh-dashboard"
            className="btn btn-outline-success btn-sm rounded-pill d-inline-flex align-items-center gap-1 px-3"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            style={{ borderColor: "#006B3C", color: "#006B3C" }}
          >
            <span className={refreshing ? "spinner-border spinner-border-sm" : ""}>
              {!refreshing && "🔄"}
            </span>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={() => loadDashboard(false)}>
            Retry
          </button>
        </div>
      )}

      {/* Personal KPI Cards Grid (4 Cards - Mockup 2) */}
      <div className="row g-3 mb-4">
        {/* Card 1: My Open Tickets */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            data-testid="kpi-card-my-open"
            role="button"
            tabIndex={0}
            onClick={() => onDrillDown?.("open")}
            onKeyDown={(e) => handleCardKeyDown(e, () => onDrillDown?.("open"))}
            className="card h-100 shadow-sm border-0 transition-hover"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              backgroundColor: "#EAF6EF",
              borderLeft: "4px solid #006B3C",
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="small fw-bold" style={{ color: "#006B3C" }}>My Open Tickets</span>
                <span className="badge text-white rounded-pill" style={{ backgroundColor: "#006B3C" }}>Active</span>
              </div>
              <div className="h2 fw-bold mb-0" style={{ color: "#006B3C" }}>{metrics.myOpenTickets}</div>
              <div className="small mt-2" style={{ color: "#0B7A46" }}>Awaiting or in progress</div>
            </div>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            data-testid="kpi-card-in-progress"
            role="button"
            tabIndex={0}
            onClick={() => onDrillDown?.("In Progress")}
            onKeyDown={(e) => handleCardKeyDown(e, () => onDrillDown?.("In Progress"))}
            className="card h-100 shadow-sm border-0 transition-hover"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              borderLeft: "4px solid #ffc107",
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="text-muted small fw-semibold">In Progress</span>
                <span className="badge bg-warning bg-opacity-10 text-dark rounded-pill">Working</span>
              </div>
              <div className="h2 fw-bold mb-0 text-warning">{metrics.inProgressTickets}</div>
              <div className="text-muted small mt-2">Currently being resolved</div>
            </div>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            data-testid="kpi-card-resolved"
            role="button"
            tabIndex={0}
            onClick={() => onDrillDown?.("Resolved")}
            onKeyDown={(e) => handleCardKeyDown(e, () => onDrillDown?.("Resolved"))}
            className="card h-100 shadow-sm border-0 transition-hover"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              borderLeft: "4px solid #198754",
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="text-muted small fw-semibold">Resolved</span>
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill">Fixed</span>
              </div>
              <div className="h2 fw-bold mb-0 text-success">{metrics.resolvedTickets}</div>
              <div className="text-muted small mt-2">Solved by technician</div>
            </div>
          </div>
        </div>

        {/* Card 4: Closed */}
        <div className="col-12 col-sm-6 col-md-3">
          <div
            data-testid="kpi-card-closed"
            role="button"
            tabIndex={0}
            onClick={() => onDrillDown?.("Closed")}
            onKeyDown={(e) => handleCardKeyDown(e, () => onDrillDown?.("Closed"))}
            className="card h-100 shadow-sm border-0 transition-hover"
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              borderLeft: "4px solid #212529",
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="text-muted small fw-semibold">Closed</span>
                <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill">Archived</span>
              </div>
              <div className="h2 fw-bold mb-0 text-dark">{metrics.closedTickets}</div>
              <div className="text-muted small mt-2">Completed history</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="row g-4">
        {/* Left Column: Recent Requests Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h3 className="h6 fw-bold mb-0" style={{ color: "#006B3C" }}>
                📋 My Recent Requests
              </h3>
              <button
                data-testid="btn-view-all-requests"
                className="btn btn-sm btn-link text-decoration-none fw-semibold"
                style={{ color: "#006B3C" }}
                onClick={() => (onViewAll ? onViewAll() : onDrillDown?.())}
              >
                View all my tickets →
              </button>
            </div>
            <div className="card-body p-0">
              {data.recentTickets.length === 0 ? (
                <div className="p-4 text-center text-muted" data-testid="empty-recent-requests">
                  <p className="mb-3">You have not submitted any service tickets yet.</p>
                  <button
                    className="btn text-white btn-sm px-4 rounded-pill fw-medium"
                    style={{ backgroundColor: "#006B3C" }}
                    onClick={onCreateClick}
                  >
                    ➕ Create Your First Request
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: "#F9FAFB" }}>
                      <tr className="text-muted small">
                        <th className="ps-3 py-2">Ticket #</th>
                        <th className="py-2">Summary</th>
                        <th className="py-2">Priority</th>
                        <th className="py-2">Status</th>
                        <th className="pe-3 py-2 text-end">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          data-testid={`recent-ticket-row-${ticket.id}`}
                          onClick={() => onSelectTicket?.(ticket.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="ps-3 fw-bold text-success" style={{ color: "#006B3C" }}>
                            {ticket.ticketNumber}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: 260 }}>
                            <div className="fw-medium text-dark text-truncate">{ticket.summary}</div>
                            <span className="text-muted" style={{ fontSize: "11px" }}>{ticket.category}</span>
                          </td>
                          <td>{getPriorityBadge(ticket.requestedPriority)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              {getStatusBadge(ticket.currentStatus)}
                              {ticket.isRequesterResolved && (
                                <span
                                  className="badge rounded-pill"
                                  style={{ backgroundColor: "#D1E7DD", color: "#0F5132", fontSize: "10px" }}
                                  title="Requester indicated problem resolved"
                                >
                                  ✓ User Resolved
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="pe-3 small text-muted text-end">
                            {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Help Callout */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
            <div className="card-header bg-white border-0 py-3">
              <h3 className="h6 fw-bold mb-0" style={{ color: "#006B3C" }}>
                ⚡ Quick Actions
              </h3>
            </div>
            <div className="card-body d-flex flex-column gap-2 p-3">
              <button
                data-testid="quick-btn-create-ticket"
                className="btn text-white w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-medium rounded-pill"
                style={{ backgroundColor: "#006B3C" }}
                onClick={onCreateClick}
              >
                <span>➕</span> Create New Ticket
              </button>

              <button
                data-testid="quick-btn-view-my-tickets"
                className="btn btn-outline-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-medium rounded-pill"
                style={{ borderColor: "#006B3C", color: "#006B3C" }}
                onClick={() => (onViewAll ? onViewAll() : onDrillDown?.())}
              >
                <span>📋</span> View My Tickets
              </button>
            </div>
          </div>

          {/* TokTickIT Help Card */}
          <div
            className="p-3 shadow-sm rounded-3"
            style={{ backgroundColor: "#EAF6EF", border: "1px solid #D1E7DD" }}
          >
            <h4 className="h6 fw-bold mb-1" style={{ color: "#006B3C" }}>
              🤝 Need Help?
            </h4>
            <p className="small mb-2 text-muted">
              You can track interventions on your ticket in real-time under the <strong>Actions Taken</strong> tab.
            </p>
            <p className="small mb-0 text-muted">
              If your issue seems fixed, toggle <em>&quot;Problem Appears Resolved&quot;</em> on your ticket to advise our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
