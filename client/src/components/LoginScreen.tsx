import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err.message || "Failed to sign in. Please check your credentials.";
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setErrors({});
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7F6",
        padding: "20px",
      }}
    >
      <div
        className="card border-0 shadow-sm"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Zen Green Top Header */}
        <div
          style={{
            backgroundColor: "#006B3C",
            color: "#FFFFFF",
            padding: "24px 28px",
            textAlign: "center",
          }}
        >
          <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
            <span style={{ fontSize: "1.4rem" }}>🎫</span>
            <h2 className="h4 fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>
              TokTickIT
            </h2>
          </div>
          <p className="small mb-0" style={{ opacity: 0.9 }}>
            Enterprise IT Service Desk Platform
          </p>
        </div>

        {/* Card Body */}
        <div className="card-body p-4">
          <h1 className="h5 fw-bold text-dark mb-1">Sign in to your account</h1>
          <p className="text-muted small mb-4">
            Enter your enterprise credentials to access tickets and services.
          </p>

          {/* General Error Banner */}
          {errors.general && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small"
              role="alert"
              style={{ borderRadius: "8px" }}
            >
              <span>⚠️</span>
              <div>{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="login-email-input"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                disabled={isSubmitting}
                style={{
                  borderRadius: "8px",
                  borderColor: errors.email ? "#DC3545" : "#DDE2E5",
                  padding: "10px 12px",
                }}
              />
              {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Password <span className="text-danger">*</span>
              </label>
              <input
                id="login-password-input"
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={isSubmitting}
                style={{
                  borderRadius: "8px",
                  borderColor: errors.password ? "#DC3545" : "#DDE2E5",
                  padding: "10px 12px",
                }}
              />
              {errors.password && <div className="invalid-feedback small">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              className="btn w-100 fw-bold py-2 shadow-sm"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#006B3C",
                borderColor: "#006B3C",
                color: "#FFFFFF",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              {isSubmitting ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick-fill Demo Accounts for Assessment & Testing */}
          <div className="mt-4 pt-3 border-top">
            <p className="small text-muted fw-semibold mb-2" style={{ fontSize: "0.8rem" }}>
              ⚡ Quick-fill Demo Accounts (Password: Password123!)
            </p>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-1 px-2"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => fillCredentials("jennifer.a@example.com")}
              >
                Requester
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-1 px-2"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => fillCredentials("tech.alex@example.com")}
              >
                IT Staff
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-1 px-2"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => fillCredentials("admin.john@example.com")}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm py-1 px-2 text-dark"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => fillCredentials("new.user@example.com")}
              >
                First-Login 🔒
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm py-1 px-2"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => fillCredentials("metier.l@example.com")}
              >
                Inactive ⛔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
