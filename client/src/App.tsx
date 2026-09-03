import React, { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Navbar } from "./components/Navbar.js";
import { DevRequesterSelector } from "./components/DevRequesterSelector.js";
import { CreateTicket } from "./components/CreateTicket.js";

type UiState = "idle" | "loading" | "success" | "error";

export function AppContent() {
  const { selectedRequester } = useRequester();
  const [currentTab, setCurrentTab] = useState<"my-tickets" | "create-ticket" | "select-requester">("my-tickets");
  const [isChangingRequester, setIsChangingRequester] = useState(false);

  // System check state (retained from Lab 1)
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");
    try {
      const status = await checkSystem();
      setCategories(status.categories);
      setState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to connect to TokTickIT API";
      setErrorMessage(msg || "Unable to connect to TokTickIT API");
      setState("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F7F6" }}>
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setIsChangingRequester(false);
        }}
        onOpenRequesterModal={() => setIsChangingRequester(true)}
      />

      <main className="container py-4" style={{ maxWidth: 1000 }}>
        {isChangingRequester ? (
          <DevRequesterSelector
            onSelectComplete={() => setIsChangingRequester(false)}
            onCancel={() => setIsChangingRequester(false)}
          />
        ) : (
          <>
            {/* System Status section from Lab 1 */}
            <div className="card shadow-sm border-0 mb-4 p-4" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h4 mb-0 fw-bold" style={{ color: "#006B3C" }}>
              IT Service Desk
            </h1>
                <button
                  className="btn btn-sm text-white px-3"
                  style={{ backgroundColor: "#006B3C" }}
                  onClick={handleCheck}
                  disabled={state === "loading"}
                >
                  {state === "loading" ? "Loading…" : "Check System"}
                </button>
              </div>

              {state === "success" && (
                <div className="alert alert-success border-0 small mb-0" style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}>
                  <p className="mb-2">
                    System Status: <span className="fw-bold">Online</span>
                  </p>
                  {categories.length > 0 && (
                    <div>
                      <p className="fw-bold mb-1">Supported Request Categories:</p>
                      <ol className="list-group list-group-numbered" style={{ maxWidth: 360 }}>
                        {categories.map((c) => (
                          <li key={c.id} className="list-group-item py-1">
                            {c.name}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {state === "error" && (
                <div className="mt-2">
                  <p className="mb-2">
                    System Status: <span className="fw-bold text-danger">Offline</span>
                  </p>
                  <div className="alert alert-danger" role="alert" style={{ maxWidth: 360 }}>
                    {errorMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content Display */}
            {currentTab === "my-tickets" && (
              <div className="card shadow-sm border-0 p-4" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1" style={{ color: "#1F2937" }}>My Tickets</h2>
                    <p className="text-muted small mb-0">
                      Viewing support tickets for <strong data-testid="active-requester-name">{selectedRequester?.name}</strong> ({selectedRequester?.email})
                    </p>
                  </div>
                  <button
                    className="btn btn-sm text-white px-3"
                    style={{ backgroundColor: "#006B3C" }}
                    onClick={() => setCurrentTab("create-ticket")}
                  >
                    + Create Ticket
                  </button>
                </div>
                <div className="text-center py-5 text-muted">
                  <span className="fs-1 d-block mb-2">📋</span>
                  <p className="small mb-1">No tickets created yet.</p>
                  <p className="small text-secondary">
                    Click <strong>+ Create Ticket</strong> above or switch to the Create Ticket tab to submit a new IT request.
                  </p>
                </div>
              </div>
            )}

            {currentTab === "create-ticket" && (
              <CreateTicket
                onSuccess={() => setCurrentTab("my-tickets")}
                onCancel={() => setCurrentTab("my-tickets")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RequesterProvider>
      <AppContent />
    </RequesterProvider>
  );
}
