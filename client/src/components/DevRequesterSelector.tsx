import React, { useEffect, useState } from "react";
import { RequesterUser, fetchDevRequesters } from "../api";
import { useRequester } from "../context/RequesterContext";

interface DevRequesterSelectorProps {
  onSelectComplete?: () => void;
  onCancel?: () => void;
}

export const DevRequesterSelector: React.FC<DevRequesterSelectorProps> = ({
  onSelectComplete,
  onCancel,
}) => {
  const { selectedRequester, setSelectedRequester } = useRequester();
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">(selectedRequester ? selectedRequester.id : "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchDevRequesters()
      .then((data) => {
        if (isMounted) {
          setRequesters(data);
          if (data.length > 0 && selectedId === "") {
            setSelectedId(data[0].id);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load development requesters");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const user = requesters.find((r) => r.id === Number(selectedId));
    if (user) {
      setSelectedRequester(user);
      if (onSelectComplete) {
        onSelectComplete();
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 p-4" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: "56px", height: "56px", backgroundColor: "#EAF6EF", color: "#006B3C" }}
              >
                <i className="bi bi-person-badge fs-2"></i>
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
              </div>
              <h2 className="h4 fw-bold" style={{ color: "#1F2937" }}>Select Development Requester</h2>
              <p className="text-muted small">
                Choose a development requester to simulate the current requester context for Lab 2.<br />
                This is for testing only and is not a login screen.
              </p>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border" style={{ color: "#006B3C" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="small text-muted mt-2">Loading active development requesters...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger small mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {!loading && !error && (
              <form onSubmit={handleContinue}>
                <div className="mb-3">
                  <label htmlFor="requesterSelect" className="form-label fw-semibold small" style={{ color: "#374151" }}>
                    Development Requester <span className="text-danger">*</span>
                  </label>
                  <select
                    id="requesterSelect"
                    className="form-select"
                    value={selectedId}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    required
                    style={{ borderColor: "#D1D5DB", height: "42px" }}
                  >
                    {requesters.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.name} ({req.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  <div className="d-flex align-items-start mb-2">
                    <span className="badge rounded-pill bg-light text-success border border-success me-2 mt-1">i</span>
                    <span className="small text-muted">Only active development requesters are shown.</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <span className="badge rounded-pill bg-light text-primary border border-primary me-2 mt-1">🔐</span>
                    <div className="small text-muted">
                      <strong>Authentication coming in Lab 3</strong>
                      <div className="text-secondary" style={{ fontSize: "12px" }}>
                        In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  {selectedRequester && onCancel && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={onCancel}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn text-white px-4 fw-medium"
                    style={{ backgroundColor: "#006B3C" }}
                    disabled={selectedId === ""}
                  >
                    Continue &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
