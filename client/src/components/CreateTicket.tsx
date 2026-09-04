import React, { useState, useEffect } from "react";
import { useRequester } from "../context/RequesterContext";
import { Category, RelatedSystem, fetchCategories, fetchRelatedSystems, createTicket } from "../api";
import { TicketPriority, Ticket } from "../types";

interface CreateTicketProps {
  onSuccess?: (ticket: Ticket) => void;
  onCancel?: () => void;
}

export const CreateTicket: React.FC<CreateTicketProps> = ({ onSuccess, onCancel }) => {
  const { selectedRequester } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);

  // Form inputs
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [relatedSystemId, setRelatedSystemId] = useState<number | "">("");
  const [requestedPriority, setRequestedPriority] = useState<TicketPriority>("MEDIUM");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  // UI status
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCategories(), fetchRelatedSystems()])
      .then(([cats, systems]) => {
        if (isMounted) {
          setCategories(cats);
          setRelatedSystems(systems);
          if (cats.length > 0) setCategoryId(cats[0].id);
          if (systems.length > 0) setRelatedSystemId(systems[0].id);
          setLoadingReferences(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setApiError("Failed to load category and system reference data.");
          setLoadingReferences(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!categoryId) {
      newErrors.categoryId = "Please select a Category.";
    }
    if (!relatedSystemId) {
      newErrors.relatedSystemId = "Please select an affected Related System.";
    }
    if (!summary.trim() || summary.trim().length < 5) {
      newErrors.summary = "Summary must be at least 5 characters.";
    } else if (summary.trim().length > 120) {
      newErrors.summary = "Summary cannot exceed 120 characters.";
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    } else if (description.trim().length > 2000) {
      newErrors.description = "Description cannot exceed 2,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    if (!selectedRequester) {
      setApiError("No active requester selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        requesterId: selectedRequester.id,
        categoryId: Number(categoryId),
        relatedSystemId: Number(relatedSystemId),
        summary: summary.trim(),
        description: description.trim(),
        requestedPriority,
      };

      const ticket = await createTicket(payload);
      setCreatedTicket(ticket);
      setIsSubmitting(false);
    } catch (err: any) {
      // Preserve form values on error (satisfies BR-12 / AC-10)
      setApiError(err.message || "Failed to submit ticket. Please check connection.");
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedTicket(null);
    setSummary("");
    setDescription("");
    setErrors({});
    setApiError(null);
  };

  // Success Confirmation State
  if (createdTicket) {
    return (
      <div className="card shadow-sm border-0 p-4 rounded-3" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="text-center py-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: "64px", height: "64px", backgroundColor: "#EAF6EF", color: "#006B3C" }}
          >
            <span className="fs-1">✓</span>
          </div>
          <h2 className="h4 fw-bold" style={{ color: "#006B3C" }}>Ticket Submitted Successfully!</h2>
          <p className="text-muted small">Your IT support ticket has been recorded in the system.</p>

          <div className="p-3 my-4 rounded-3 border" style={{ backgroundColor: "#F9FAFB", maxWidth: "480px", margin: "0 auto" }}>
            <div className="text-muted small text-uppercase fw-semibold mb-1">Official Ticket Number</div>
            <div className="h3 fw-bold mb-2" style={{ color: "#006B3C" }} data-testid="created-ticket-number">
              {createdTicket.ticketNumber}
            </div>
            <div className="small text-secondary mb-1">
              Status: <span className="badge bg-info text-dark">{createdTicket.currentStatus || "New"}</span>
            </div>
            <div className="small text-muted">
              Summary: <em>{createdTicket.summary}</em>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={handleResetForm}
            >
              Create Another Ticket
            </button>
            {onSuccess && (
              <button
                type="button"
                className="btn text-white px-4 fw-medium"
                style={{ backgroundColor: "#006B3C" }}
                onClick={() => onSuccess(createdTicket)}
              >
                View in My Tickets &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4 rounded-3" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-1" style={{ color: "#1F2937" }}>Create IT Support Ticket</h2>
        <p className="text-muted small mb-0">
          Describe the technical issue you are experiencing and classify it appropriately.
        </p>
      </div>

      {apiError && (
        <div className="alert alert-danger small mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2"></i>
          <strong>Submission Error:</strong> {apiError}
        </div>
      )}

      {loadingReferences ? (
        <div className="text-center py-4 text-muted small">
          <div className="spinner-border spinner-border-sm me-2" style={{ color: "#006B3C" }}></div>
          Loading category and platform references...
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Read-Only Context Row */}
          <div className="row g-3 p-3 mb-4 rounded-3" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted small fw-medium mb-1">Requester (Read-only)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={`${selectedRequester?.name || "None"} (${selectedRequester?.email || ""})`}
                disabled
                readOnly
                style={{ backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted small fw-medium mb-1">Ticket Date (System-generated)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                disabled
                readOnly
                style={{ backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }}
              />
            </div>
          </div>

          {/* Classification Row */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label htmlFor="categorySelect" className="form-label small fw-semibold" style={{ color: "#374151" }}>
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="categorySelect"
                className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(Number(e.target.value));
                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                }}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <div className="invalid-feedback small">{errors.categoryId}</div>}
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="relatedSystemSelect" className="form-label small fw-semibold" style={{ color: "#374151" }}>
                Related System <span className="text-danger">*</span>
              </label>
              <select
                id="relatedSystemSelect"
                className={`form-select ${errors.relatedSystemId ? "is-invalid" : ""}`}
                value={relatedSystemId}
                onChange={(e) => {
                  setRelatedSystemId(Number(e.target.value));
                  if (errors.relatedSystemId) setErrors((prev) => ({ ...prev, relatedSystemId: "" }));
                }}
                required
              >
                {relatedSystems.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.relatedSystemId && <div className="invalid-feedback small">{errors.relatedSystemId}</div>}
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="prioritySelect" className="form-label small fw-semibold" style={{ color: "#374151" }}>
                Requested Priority <span className="text-danger">*</span>
              </label>
              <select
                id="prioritySelect"
                className="form-select"
                value={requestedPriority}
                onChange={(e) => setRequestedPriority(e.target.value as TicketPriority)}
              >
                <option value="LOW">Low (Minor inconvenience)</option>
                <option value="MEDIUM">Medium (Normal business impact)</option>
                <option value="HIGH">High (Major blocker)</option>
                <option value="URGENT">Urgent (Critical outage)</option>
              </select>
            </div>
          </div>

          {/* Ticket Summary */}
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="ticketSummary" className="form-label small fw-semibold" style={{ color: "#374151" }}>
                Ticket Summary <span className="text-danger">*</span>
              </label>
              <span className="small text-muted">{summary.length} / 120</span>
            </div>
            <input
              id="ticketSummary"
              type="text"
              className={`form-control ${errors.summary ? "is-invalid" : ""}`}
              placeholder="e.g. Laptop battery drains quickly"
              value={summary}
              maxLength={120}
              onChange={(e) => {
                setSummary(e.target.value);
                if (errors.summary) setErrors((prev) => ({ ...prev, summary: "" }));
              }}
              required
            />
            {errors.summary && <div className="invalid-feedback small">{errors.summary}</div>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label htmlFor="ticketDescription" className="form-label small fw-semibold" style={{ color: "#374151" }}>
                Description <span className="text-danger">*</span>
              </label>
              <span className="small text-muted">{description.length} / 2000</span>
            </div>
            <textarea
              id="ticketDescription"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              rows={4}
              placeholder="Provide specific details about when the issue started, steps to reproduce, and current impact..."
              value={description}
              maxLength={2000}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
              }}
              required
            />
            {errors.description && <div className="invalid-feedback small">{errors.description}</div>}
          </div>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn text-white px-4 fw-medium"
              style={{ backgroundColor: "#006B3C" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting Ticket...
                </>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
