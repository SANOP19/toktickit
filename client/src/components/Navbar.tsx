import React from "react";
import { useRequester } from "../context/RequesterContext";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentTab: "my-tickets" | "create-ticket" | "staff-queue" | "select-requester";
  onTabChange: (tab: "my-tickets" | "create-ticket" | "staff-queue" | "select-requester") => void;
  onOpenRequesterModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenRequesterModal,
}) => {
  const { selectedRequester } = useRequester();
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch {
    // AuthProvider not present in some isolated tests
  }
  const user = authContext?.user;
  const logout = authContext?.logout;

  const roleLabels: Record<string, string> = {
    REQUESTER: "Requester",
    IT_STAFF: "IT Staff",
    ADMINISTRATOR: "Admin",
  };

  const isStaffOrAdmin = user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR";

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 py-2"
      style={{ backgroundColor: "#006B3C" }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <button
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white btn btn-link text-decoration-none p-0"
          onClick={() => onTabChange(isStaffOrAdmin ? "staff-queue" : "my-tickets")}
        >
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white"
            style={{ width: "28px", height: "28px", color: "#006B3C" }}
          >
            ⏱
          </span>
          <span>TokTickIT</span>
        </button>

        {/* Navigation Links */}
        <div className="d-flex align-items-center gap-2 me-auto ms-3">
          {(!user || user.role === "REQUESTER") && (
            <>
              <button
                className={`btn btn-sm text-white px-3 py-1 rounded-pill ${
                  currentTab === "my-tickets" ? "fw-bold shadow-sm" : "opacity-75"
                }`}
                style={{
                  backgroundColor: currentTab === "my-tickets" ? "#0B7A46" : "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={() => onTabChange("my-tickets")}
                data-testid="nav-my-tickets"
              >
                📋 My Tickets
              </button>
              <button
                data-testid="nav-create-ticket"
                className={`btn btn-sm text-white px-3 py-1 rounded-pill ${
                  currentTab === "create-ticket" ? "fw-bold shadow-sm" : "opacity-75"
                }`}
                style={{
                  backgroundColor: currentTab === "create-ticket" ? "#0B7A46" : "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={() => onTabChange("create-ticket")}
              >
                ➕ Create Ticket
              </button>
            </>
          )}

          {isStaffOrAdmin && (
            <button
              data-testid="nav-staff-queue"
              className={`btn btn-sm text-white px-3 py-1 rounded-pill ${
                currentTab === "staff-queue" ? "fw-bold shadow-sm" : "opacity-75"
              }`}
              style={{
                backgroundColor: currentTab === "staff-queue" ? "#0B7A46" : "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onClick={() => onTabChange("staff-queue")}
            >
              🛠️ Ticket Queue
            </button>
          )}
        </div>

        {/* User Info / Switcher & Logout */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.18)" }}
              >
                <span className="text-white small fw-medium">
                  👤 {user.name}
                </span>
                <span
                  className="badge bg-light text-dark fw-bold rounded-pill"
                  style={{ fontSize: "11px" }}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <button
                className="btn btn-xs btn-light text-dark px-2 py-0 rounded-pill small"
                style={{ fontSize: "11px", fontWeight: 600 }}
                onClick={onOpenRequesterModal}
                title="Switch Development Requester"
              >
                Change
              </button>
              <button
                id="nav-logout-btn"
                className="btn btn-outline-light btn-sm rounded-pill px-3 py-1 fw-medium"
                style={{ fontSize: "12px" }}
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          ) : selectedRequester ? (
            <div
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <span className="text-white small fw-medium">
                👤 {selectedRequester.name}
              </span>
              <button
                className="btn btn-xs btn-light text-dark px-2 py-0 rounded-pill small"
                style={{ fontSize: "11px", fontWeight: 600 }}
                onClick={onOpenRequesterModal}
                title="Switch Development Requester"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-light fw-medium px-3 rounded-pill"
              onClick={onOpenRequesterModal}
            >
              Select Requester
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
