import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserManagement } from "../../src/components/UserManagement";
import { AuthProvider } from "../../src/context/AuthContext";
import * as api from "../../src/api";
import { User } from "../../src/types";

const mockAdminUser: User = {
  id: 10,
  name: "John Smith",
  email: "admin.john@example.com",
  role: "ADMINISTRATOR",
  isActive: true,
  mustChangePassword: false,
};

const mockUserList: User[] = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 6,
    name: "Alex Thompson",
    email: "tech.alex@example.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 10,
    name: "John Smith",
    email: "admin.john@example.com",
    role: "ADMINISTRATOR",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 11,
    name: "Amanda Clark",
    email: "new.user@example.com",
    role: "REQUESTER",
    isActive: false,
    mustChangePassword: true,
  },
];

function renderUserManagement() {
  return render(
    <AuthProvider initialUser={mockAdminUser}>
      <UserManagement />
    </AuthProvider>
  );
}

describe("UserManagement Component (Issue 6 / UI-06 / Teacher Mockup 4)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockUserList);
    vi.spyOn(api, "createAdminUserApi").mockResolvedValue({
      id: 12,
      name: "New Field Tech",
      email: "field.tech@example.com",
      role: "IT_STAFF",
      isActive: true,
      mustChangePassword: true,
    });
    vi.spyOn(api, "updateAdminUserApi").mockResolvedValue({
      id: 6,
      name: "Alex Thompson (Senior)",
      email: "tech.alex@example.com",
      role: "IT_STAFF",
      isActive: true,
      mustChangePassword: false,
    });
    vi.spyOn(api, "resetUserPasswordApi").mockResolvedValue({
      message: "Password reset successfully.",
    });
  });

  it("renders user table, header, search input, role filter, and user records (UI-06)", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText(/User Management/i)).toBeInTheDocument();
      expect(screen.getByTestId("admin-users-table")).toBeInTheDocument();
    });

    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
    expect(screen.getByText("Alex Thompson")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Amanda Clark")).toBeInTheDocument();

    // Check role badges
    expect(screen.getAllByText("Requester").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IT Staff").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Administrator").length).toBeGreaterThanOrEqual(1);

    // Check status badges
    expect(screen.getAllByText(/✓ Active/i).length).toBe(3);
    expect(screen.getByText("Deactivated")).toBeInTheDocument();

    // Check password state
    expect(screen.getByText("Change Required")).toBeInTheDocument();
  });

  it("filters users by search query", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("admin-search-input")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("admin-search-input");
    await userEvent.type(searchInput, "Jennifer");

    await waitFor(() => {
      expect(api.fetchAdminUsersApi).toHaveBeenCalledWith("Jennifer", "");
    });
  });

  it("filters users by role selection", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("admin-role-filter")).toBeInTheDocument();
    });

    const roleSelect = screen.getByTestId("admin-role-filter");
    await userEvent.selectOptions(roleSelect, "IT_STAFF");

    await waitFor(() => {
      expect(api.fetchAdminUsersApi).toHaveBeenCalledWith("", "IT_STAFF");
    });
  });

  it("opens Create User modal, validates, and submits new user (AC-10, BR-21)", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("open-create-user-modal-btn")).toBeInTheDocument();
    });

    // Open modal
    await userEvent.click(screen.getByTestId("open-create-user-modal-btn"));
    expect(screen.getByTestId("create-user-modal")).toBeInTheDocument();

    // Fill form
    await userEvent.type(screen.getByTestId("create-user-name"), "New Field Tech");
    await userEvent.type(screen.getByTestId("create-user-email"), "field.tech@example.com");
    await userEvent.selectOptions(screen.getByTestId("create-user-role"), "IT_STAFF");
    await userEvent.type(screen.getByTestId("create-user-password"), "SecurePass123!");

    // Submit
    await userEvent.click(screen.getByTestId("submit-create-user-btn"));

    await waitFor(() => {
      expect(api.createAdminUserApi).toHaveBeenCalledWith({
        name: "New Field Tech",
        email: "field.tech@example.com",
        role: "IT_STAFF",
        initialPassword: "SecurePass123!",
        isActive: true,
      });
    });
  });

  it("opens Edit User modal for other user and updates successfully (FR-11)", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("edit-user-btn-6")).toBeInTheDocument();
    });

    // Open edit modal for user 6 (Alex Thompson)
    await userEvent.click(screen.getByTestId("edit-user-btn-6"));
    expect(screen.getByTestId("edit-user-modal")).toBeInTheDocument();

    const nameInput = screen.getByTestId("edit-user-name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alex Thompson (Senior)");

    await userEvent.click(screen.getByTestId("submit-edit-user-btn"));

    await waitFor(() => {
      expect(api.updateAdminUserApi).toHaveBeenCalledWith(6, {
        name: "Alex Thompson (Senior)",
        email: "tech.alex@example.com",
        role: "IT_STAFF",
        isActive: true,
      });
    });
  });

  it("enforces Self-Deactivation Guard in Edit User modal for currently logged-in Admin (BR-18, AC-11)", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("edit-user-btn-10")).toBeInTheDocument();
    });

    // Open edit modal for user 10 (John Smith - current user)
    await userEvent.click(screen.getByTestId("edit-user-btn-10"));
    expect(screen.getByTestId("edit-user-modal")).toBeInTheDocument();

    // Check that self-deactivation guard notice is displayed and deactivation checkbox is NOT rendered
    expect(screen.getByTestId("self-deactivation-notice")).toBeInTheDocument();
    expect(screen.getByText(/Self-Deactivation Guard/i)).toBeInTheDocument();
    expect(screen.queryByTestId("edit-user-active")).not.toBeInTheDocument();
  });

  it("opens Reset Password modal, fills new initial password, and submits (BR-21)", async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByTestId("reset-pwd-btn-1")).toBeInTheDocument();
    });

    // Open reset password modal for user 1
    await userEvent.click(screen.getByTestId("reset-pwd-btn-1"));
    expect(screen.getByTestId("reset-password-modal")).toBeInTheDocument();

    const passInput = screen.getByTestId("reset-password-input");
    await userEvent.type(passInput, "ResetPass2026!");

    await userEvent.click(screen.getByTestId("submit-reset-password-btn"));

    await waitFor(() => {
      expect(api.resetUserPasswordApi).toHaveBeenCalledWith(1, "ResetPass2026!");
    });
  });
});
