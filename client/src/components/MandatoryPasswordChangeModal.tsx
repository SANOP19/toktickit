import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const MandatoryPasswordChangeModal: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user does not require password change, do not render modal
  if (!user || !user.mustChangePassword) {
    return null;
  }

  // Live checklist evaluations
  const isMinLength = newPassword.length >= 8;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const canSubmit = isMinLength && isMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "12px", overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              padding: "20px 24px",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.3rem" }}>🔒</span>
              <h2 className="h5 fw-bold mb-0">Initial Password Change Required</h2>
            </div>
            <p className="small mb-0" style={{ opacity: 0.9 }}>
              Welcome, {user.name}. Please set a new private password to activate your account.
            </p>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <p className="small text-muted mb-3">
              According to organizational security policy (BR-02), you cannot enter the service desk application until you change your initial password.
            </p>

            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small"
                role="alert"
                style={{ borderRadius: "8px" }}
              >
                <span>⚠️</span>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Current Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Current (Initial) Password <span className="text-danger">*</span>
                </label>
                <input
                  id="current-password-input"
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                  style={{ borderRadius: "8px", padding: "10px 12px" }}
                />
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  New Secure Password <span className="text-danger">*</span>
                </label>
                <input
                  id="new-password-input"
                  type="password"
                  className="form-control"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  style={{ borderRadius: "8px", padding: "10px 12px" }}
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  style={{ borderRadius: "8px", padding: "10px 12px" }}
                />
              </div>

              {/* Live Checklist */}
              <div
                className="p-3 mb-4 rounded"
                style={{ backgroundColor: "#F5F7F6", fontSize: "0.85rem" }}
              >
                <div className="fw-semibold text-secondary mb-2">Password Requirements:</div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span>{isMinLength ? "✅" : "⚪"}</span>
                  <span className={isMinLength ? "text-success fw-medium" : "text-muted"}>
                    Minimum 8 characters
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span>{isMatch ? "✅" : "⚪"}</span>
                  <span className={isMatch ? "text-success fw-medium" : "text-muted"}>
                    Passwords match
                  </span>
                </div>
                {newPassword.length > 0 && currentPassword.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <span>{isDifferentFromCurrent ? "✅" : "⚠️"}</span>
                    <span className={isDifferentFromCurrent ? "text-success" : "text-danger"}>
                      Different from initial password
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  id="change-password-submit-button"
                  type="submit"
                  className="btn flex-grow-1 fw-bold py-2 shadow-sm"
                  disabled={!canSubmit || isSubmitting}
                  style={{
                    backgroundColor: canSubmit ? "#006B3C" : "#A5D6A7",
                    borderColor: canSubmit ? "#006B3C" : "#A5D6A7",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                  }}
                >
                  {isSubmitting ? "Updating Password..." : "Set New Password & Continue"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-2"
                  onClick={logout}
                  disabled={isSubmitting}
                  style={{ borderRadius: "8px" }}
                  title="Sign out and change later"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
