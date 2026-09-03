import React from "react";
import { useRequester } from "../context/RequesterContext";

interface NavbarProps {
  currentTab: "my-tickets" | "create-ticket" | "select-requester";
  onTabChange: (tab: "my-tickets" | "create-ticket" | "select-requester") => void;
  onOpenRequesterModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenRequesterModal,
}) => {
  const { selectedRequester } = useRequester();

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 py-2"
      style={{ backgroundColor: "#006B3C" }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <button
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white btn btn-link text-decoration-none p-0"
          onClick={() => onTabChange("my-tickets")}
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
          <button
            className={`btn btn-sm text-white px-3 py-1 rounded-pill ${
              currentTab === "my-tickets" ? "fw-bold shadow-sm" : "opacity-75"
            }`}
            style={{
              backgroundColor: currentTab === "my-tickets" ? "#0B7A46" : "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onClick={() => onTabChange("my-tickets")}
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
        </div>

        {/* Selected Requester Info / Switcher */}
        <div className="d-flex align-items-center gap-2">
          {selectedRequester ? (
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
