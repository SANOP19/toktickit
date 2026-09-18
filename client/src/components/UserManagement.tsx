import React, { useState, useEffect, useCallback } from "react";
import { User, Role, CreateUserPayload, UpdateUserPayload } from "../types";
import {
  fetchAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  resetUserPasswordApi,
} from "../api";
import { useAuth } from "../context/AuthContext";

export function UserManagement() {
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");

  // Filters
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    role: "REQUESTER",
    initialPassword: "",
    isActive: true,
  });
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>("");

  // Edit Form State
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    name: "",
    email: "",
    role: "REQUESTER",
    isActive: true,
  });
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");

  // Reset Password State
  const [newPassword, setNewPassword] = useState<string>("");
  const [resetSubmitting, setResetSubmitting] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>("");

  // Load Users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminUsersApi(search, roleFilter);
      setUsers(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.initialPassword) {
      setCreateError("All required fields must be filled.");
      return;
    }
    if (createForm.initialPassword.length < 8) {
      setCreateError("Initial password must be at least 8 characters long.");
      return;
    }

    setCreateSubmitting(true);
    setCreateError("");
    try {
      const created = await createAdminUserApi(createForm);
      setUsers((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        role: "REQUESTER",
        initialPassword: "",
        isActive: true,
      });
      setActionSuccess(`User "${created.name}" created successfully with forced first-login password change.`);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: unknown) {
      setCreateError((err as Error).message || "Failed to create user.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    });
    setEditError("");
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      setEditError("Name and email are required.");
      return;
    }

    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await updateAdminUserApi(editingUser.id, editForm);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      setActionSuccess(`User "${updated.name}" updated successfully.`);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: unknown) {
      setEditError((err as Error).message || "Failed to update user.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPwd = (u: User) => {
    setResetPwdUser(u);
    setNewPassword("");
    setResetError("");
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUser) return;
    if (!newPassword || newPassword.length < 8) {
      setResetError("New initial password must be at least 8 characters long.");
      return;
    }

    setResetSubmitting(true);
    setResetError("");
    try {
      await resetUserPasswordApi(resetPwdUser.id, newPassword);
      setUsers((prev) =>
        prev.map((u) => (u.id === resetPwdUser.id ? { ...u, mustChangePassword: true } : u))
      );
      setResetPwdUser(null);
      setNewPassword("");
      setActionSuccess(`Password reset for "${resetPwdUser.name}". User must change password at next login.`);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: unknown) {
      setResetError((err as Error).message || "Failed to reset password.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "REQUESTER":
        return <span className="badge bg-success">Requester</span>;
      case "IT_STAFF":
        return <span className="badge bg-primary">IT Staff</span>;
      case "ADMINISTRATOR":
        return <span className="badge bg-dark">Administrator</span>;
      default:
        return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <div className="my-4" data-testid="user-management-container">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1" style={{ color: "#006B3C" }}>
            👥 User Management
          </h1>
          <p className="text-muted small mb-0">
            Provision accounts, manage security roles, and enforce password change policies.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm text-white px-3 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: "#006B3C" }}
          onClick={() => {
            setIsCreateModalOpen(true);
            setCreateError("");
          }}
          data-testid="open-create-user-modal-btn"
        >
          <span>➕</span>
          <span>Create User</span>
        </button>
      </div>

      {/* Action Success / Error Notifications */}
      {actionSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show border-0 mb-3 shadow-sm"
          style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}
          role="alert"
          data-testid="admin-success-alert"
        >
          ✓ {actionSuccess}
          <button type="button" className="btn-close" onClick={() => setActionSuccess("")} />
        </div>
      )}

      {actionError && (
        <div
          className="alert alert-danger alert-dismissible fade show border-0 mb-3 shadow-sm"
          role="alert"
          data-testid="admin-error-alert"
        >
          ⚠️ {actionError}
          <button type="button" className="btn-close" onClick={() => setActionError("")} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="admin-search-input"
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Role Filter */}
            <div className="col-8 col-md-4">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                data-testid="admin-role-filter"
              >
                <option value="">All Roles</option>
                <option value="REQUESTER">Requesters</option>
                <option value="IT_STAFF">IT Staff</option>
                <option value="ADMINISTRATOR">Administrators</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="col-4 col-md-2 text-end">
              {(search || roleFilter) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("");
                  }}
                  data-testid="admin-clear-filters-btn"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm border-0 rounded-3 bg-white">
        <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-dark">
            System Accounts ({users.length})
          </h2>
          {loading && (
            <span className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </span>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" data-testid="admin-users-table">
            <thead className="table-light text-muted small">
              <tr>
                <th scope="col" className="ps-4">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Password State</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted small">
                    No user accounts found matching your query.
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isCurrentUser = authUser?.id === u.id;
                return (
                  <tr key={u.id} data-testid={`user-row-${u.id}`}>
                    {/* User Name & Email */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: u.role === "ADMINISTRATOR" ? "#1F2937" : u.role === "IT_STAFF" ? "#0284C7" : "#059669",
                            fontSize: "12px",
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small">
                            {u.name} {isCurrentUser && <span className="badge bg-light text-dark border ms-1">You</span>}
                          </div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td>
                      {u.isActive ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Password State */}
                    <td>
                      {u.mustChangePassword ? (
                        <span className="badge bg-warning text-dark small" title="Must change password upon next login">
                          Change Required
                        </span>
                      ) : (
                        <span className="text-muted small">Normal</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleOpenEdit(u)}
                          data-testid={`edit-user-btn-${u.id}`}
                          title="Edit User"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleOpenResetPwd(u)}
                          data-testid={`reset-pwd-btn-${u.id}`}
                          title="Reset Password"
                        >
                          🔑 Reset Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: Create User Modal */}
      {/* =================================================================== */}
      {isCreateModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          data-testid="create-user-modal"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-3">
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-header bg-white border-bottom">
                  <h3 className="h6 fw-bold mb-0 text-dark">➕ Create New User Account</h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="cancel-create-user-btn"
                  />
                </div>

                <div className="modal-body p-4">
                  {createError && (
                    <div className="alert alert-danger small py-2 mb-3">⚠️ {createError}</div>
                  )}

                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Alex Rivera"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                      data-testid="create-user-name"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="e.g. alex.r@example.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                      data-testid="create-user-email"
                    />
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                      data-testid="create-user-role"
                    >
                      <option value="REQUESTER">Requester</option>
                      <option value="IT_STAFF">IT Staff</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>

                  {/* Initial Password */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Initial Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Min. 8 characters"
                      value={createForm.initialPassword}
                      onChange={(e) => setCreateForm({ ...createForm, initialPassword: e.target.value })}
                      minLength={8}
                      required
                      data-testid="create-user-password"
                    />
                    <div className="form-text small" style={{ fontSize: "11px" }}>
                      User will be forced to change this password upon their first login (AC-10, BR-21).
                    </div>
                  </div>

                  {/* Active Checkbox */}
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="createIsActive"
                      checked={createForm.isActive}
                      onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                      data-testid="create-user-active"
                    />
                    <label className="form-check-label small text-dark" htmlFor="createIsActive">
                      Active Account
                    </label>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white px-3"
                    style={{ backgroundColor: "#006B3C" }}
                    disabled={createSubmitting}
                    data-testid="submit-create-user-btn"
                  >
                    {createSubmitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: Edit User Modal */}
      {/* =================================================================== */}
      {editingUser && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          data-testid="edit-user-modal"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-3">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header bg-white border-bottom">
                  <h3 className="h6 fw-bold mb-0 text-dark">✏️ Edit User Account</h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingUser(null)}
                    data-testid="cancel-edit-user-btn"
                  />
                </div>

                <div className="modal-body p-4">
                  {editError && <div className="alert alert-danger small py-2 mb-3">⚠️ {editError}</div>}

                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      data-testid="edit-user-name"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      data-testid="edit-user-email"
                    />
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                      data-testid="edit-user-role"
                    >
                      <option value="REQUESTER">Requester</option>
                      <option value="IT_STAFF">IT Staff</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>

                  {/* Active Toggle with Safety Guard Notice */}
                  <div className="mb-2">
                    {authUser?.id === editingUser.id ? (
                      <div className="alert alert-warning small py-2 mb-0" data-testid="self-deactivation-notice">
                        🔒 <strong>Self-Deactivation Guard:</strong> You cannot deactivate your own administrator account (BR-18, AC-11).
                      </div>
                    ) : (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsActive"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                          data-testid="edit-user-active"
                        />
                        <label className="form-check-label small text-dark" htmlFor="editIsActive">
                          Active Account
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white px-3"
                    style={{ backgroundColor: "#006B3C" }}
                    disabled={editSubmitting}
                    data-testid="submit-edit-user-btn"
                  >
                    {editSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: Reset Password Modal */}
      {/* =================================================================== */}
      {resetPwdUser && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          data-testid="reset-password-modal"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-3">
              <form onSubmit={handleResetSubmit}>
                <div className="modal-header bg-white border-bottom">
                  <h3 className="h6 fw-bold mb-0 text-dark">🔑 Reset User Password</h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setResetPwdUser(null)}
                    data-testid="cancel-reset-password-btn"
                  />
                </div>

                <div className="modal-body p-4">
                  {resetError && <div className="alert alert-danger small py-2 mb-3">⚠️ {resetError}</div>}

                  <div className="alert alert-light border small text-muted mb-3 py-2">
                    Resetting password for: <strong>{resetPwdUser.name}</strong> ({resetPwdUser.email})
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      New Initial Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      required
                      data-testid="reset-password-input"
                    />
                    <div className="form-text small" style={{ fontSize: "11px" }}>
                      User will be required to change this password at their next login (BR-21).
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setResetPwdUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white px-3"
                    style={{ backgroundColor: "#006B3C" }}
                    disabled={resetSubmitting}
                    data-testid="submit-reset-password-btn"
                  >
                    {resetSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
