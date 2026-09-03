import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("Lab 2 Issue 2: Development Requester Context", () => {
  const mockActiveRequesters = [
    { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
    { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, "fetchDevRequesters").mockResolvedValue(mockActiveRequesters);
  });

  it("renders the application shell with active requester name", async () => {
    render(<App />);

    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
    expect(await screen.findByTestId("active-requester-name")).toHaveTextContent("Jennifer Anderson");
    expect(screen.getByRole("heading", { name: /My Tickets/i })).toBeInTheDocument();
  });

  it("opens Development Requester Selection when Change is clicked and selects a new requester", async () => {
    render(<App />);

    // Click Change button in navbar
    const changeBtn = screen.getByRole("button", { name: /change/i });
    fireEvent.click(changeBtn);

    // Modal / selector screen should appear
    expect(await screen.findByText(/Select Development Requester/i)).toBeInTheDocument();
    expect(screen.getByText(/This is for testing only and is not a login screen/i)).toBeInTheDocument();

    // Select Michael Brown
    const select = await screen.findByLabelText(/Development Requester/i);
    fireEvent.change(select, { target: { value: "2" } });

    // Click Continue
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueBtn);

    // Shell should now show Michael Brown
    await waitFor(() => {
      expect(screen.getByTestId("active-requester-name")).toHaveTextContent("Michael Brown");
    });
  });
});
