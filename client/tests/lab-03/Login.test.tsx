import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginScreen } from "../../src/components/LoginScreen.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";

describe("Lab 3 LoginScreen Component (UI-01, BR-01, AC-01, AC-02)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.setItem("test_logged_out", "true");
  });

  it("renders TokTickIT branding, email input, password input, and Sign In button", () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { name: /TokTickIT/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("displays inline validation errors when submitted empty", async () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it("displays validation error when email format is invalid", async () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "invalid-email-format" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it("populates form when demo account button is clicked", () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    const requesterDemoBtn = screen.getByRole("button", { name: /^Requester$/i });
    fireEvent.click(requesterDemoBtn);

    const emailInput = screen.getByPlaceholderText(/name@example.com/i) as HTMLInputElement;
    const passInput = screen.getByPlaceholderText(/••••••••••••/i) as HTMLInputElement;

    expect(emailInput.value).toBe("jennifer.a@example.com");
    expect(passInput.value).toBe("Password123!");
  });

  it("submits valid credentials and calls login API successfully (AC-01)", async () => {
    const mockUser = {
      id: 1,
      name: "Jennifer Anderson",
      email: "jennifer.a@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    };

    vi.spyOn(api, "loginApi").mockResolvedValue({
      token: "mock-jwt-token",
      user: mockUser,
    });

    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "jennifer.a@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(api.loginApi).toHaveBeenCalledWith("jennifer.a@example.com", "Password123!");
    });
  });

  it("displays safe error banner when account is inactive (BR-01, AC-02)", async () => {
    const inactiveError = new Error("Account is inactive. Please contact system administrator.");
    (inactiveError as any).code = "ACCOUNT_INACTIVE";
    vi.spyOn(api, "loginApi").mockRejectedValue(inactiveError);

    render(
      <AuthProvider initialUser={null}>
        <LoginScreen />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "metier.l@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(
      await screen.findByText(/Account is inactive\. Please contact system administrator\./i)
    ).toBeInTheDocument();
  });
});
