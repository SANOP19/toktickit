import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MandatoryPasswordChangeModal } from "../../src/components/MandatoryPasswordChangeModal.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";
import { User } from "../../src/types.js";

describe("Lab 3 MandatoryPasswordChangeModal Component (UI-02, BR-02, AC-03)", () => {
  const quarantinedUser: User = {
    id: 11,
    name: "Amanda Clark",
    email: "new.user@example.com",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: true, // Forces modal to render
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders mandatory password change modal when mustChangePassword is true", () => {
    render(
      <AuthProvider initialUser={quarantinedUser}>
        <MandatoryPasswordChangeModal />
      </AuthProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Initial Password Change Required/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Amanda Clark/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter current password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-type new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Set New Password & Continue/i })
    ).toBeInTheDocument();
  });

  it("does not render when user does not have mustChangePassword flag", () => {
    const regularUser: User = {
      ...quarantinedUser,
      mustChangePassword: false,
    };

    const { container } = render(
      <AuthProvider initialUser={regularUser}>
        <MandatoryPasswordChangeModal />
      </AuthProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("keeps submit button disabled until password complexity rules are satisfied", () => {
    render(
      <AuthProvider initialUser={quarantinedUser}>
        <MandatoryPasswordChangeModal />
      </AuthProvider>
    );

    const submitBtn = screen.getByRole("button", { name: /Set New Password & Continue/i });
    expect(submitBtn).toBeDisabled();

    // Fill current password
    fireEvent.change(screen.getByPlaceholderText(/Enter current password/i), {
      target: { value: "Password123!" },
    });
    expect(submitBtn).toBeDisabled();

    // Fill too-short new password
    fireEvent.change(screen.getByPlaceholderText(/At least 8 characters/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-type new password/i), {
      target: { value: "short" },
    });
    expect(submitBtn).toBeDisabled();

    // Fill valid new password (>= 8 chars) matching
    fireEvent.change(screen.getByPlaceholderText(/At least 8 characters/i), {
      target: { value: "BrandNewPassword2026!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-type new password/i), {
      target: { value: "BrandNewPassword2026!" },
    });

    expect(submitBtn).not.toBeDisabled();
  });

  it("submits password change and calls changePasswordApi successfully (AC-02, BR-02)", async () => {
    vi.spyOn(api, "changePasswordApi").mockResolvedValue({
      token: "new-jwt-token",
      user: {
        ...quarantinedUser,
        mustChangePassword: false,
      },
    });

    render(
      <AuthProvider initialUser={quarantinedUser}>
        <MandatoryPasswordChangeModal />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter current password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/At least 8 characters/i), {
      target: { value: "BrandNewPassword2026!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-type new password/i), {
      target: { value: "BrandNewPassword2026!" },
    });

    const submitBtn = screen.getByRole("button", { name: /Set New Password & Continue/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.changePasswordApi).toHaveBeenCalledWith(
        "Password123!",
        "BrandNewPassword2026!",
        "BrandNewPassword2026!",
        expect.any(String)
      );
    });
  });
});
