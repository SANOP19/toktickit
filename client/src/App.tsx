import React, { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Navbar } from "./components/Navbar.js";
import { DevRequesterSelector } from "./components/DevRequesterSelector.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import TicketDetail from "./components/TicketDetail.js";

type UiState = "idle" | "loading" | "success" | "error";

export function AppContent() {
  const { selectedRequester } = useRequester();
  const [currentTab, setCurrentTab] = useState<"my-tickets" | "create-ticket" | "select-requester">("my-tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
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
        currentTab={selectedTicketId !== null ? "my-tickets" : currentTab}
        onTabChange={(tab) => {
          setSelectedTicketId(null);
          setCurrentTab(tab);
          setIsChangingRequester(false);
        }}
        onOpenRequesterModal={() => setIsChangingRequester(true)}
      />

      <main className="container py-4" style={{ maxWidth: 1000 }}>
        {isChangingRequester ? (
          <DevRequesterSelector
            onSelectComplete={() => {
              setSelectedTicketId(null);
              setIsChangingRequester(false);
            }}
            onCancel={() => setIsChangingRequester(false)}
          />
        ) : selectedTicketId !== null && selectedRequester ? (
          <TicketDetail
            ticketId={selectedTicketId}
            currentRequester={selectedRequester}
            onBack={() => setSelectedTicketId(null)}
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
              <MyTickets
                onCreateClick={() => {
                  setSelectedTicketId(null);
                  setCurrentTab("create-ticket");
                }}
                onSelectTicket={(t) => setSelectedTicketId(t.id)}
              />
            )}

            {currentTab === "create-ticket" && (
              <CreateTicket
                onSuccess={() => {
                  setSelectedTicketId(null);
                  setCurrentTab("my-tickets");
                }}
                onCancel={() => {
                  setSelectedTicketId(null);
                  setCurrentTab("my-tickets");
                }}
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
