import React, { useState, useEffect } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar, NavTab } from "./components/Navbar.js";
import { DevRequesterSelector } from "./components/DevRequesterSelector.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import TicketDetail from "./components/TicketDetail.js";
import { LoginScreen } from "./components/LoginScreen.js";
import { MandatoryPasswordChangeModal } from "./components/MandatoryPasswordChangeModal.js";
import { StaffTicketQueue } from "./components/StaffTicketQueue.js";
import { StaffTicketDetail } from "./components/StaffTicketDetail.js";
import { UserManagement } from "./components/UserManagement.js";
import { StaffDashboard } from "./components/StaffDashboard.js";
import { RequesterDashboard } from "./components/RequesterDashboard.js";

type UiState = "idle" | "loading" | "success" | "error";

export interface AppProps {
  initialTab?: NavTab;
}

export function AppContent({ initialTab }: AppProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { selectedRequester, setSelectedRequester } = useRequester();

  const getInitialTab = (): NavTab => {
    if (initialTab) return initialTab;
    if (import.meta.env.MODE === "test") {
      return user?.role === "ADMINISTRATOR"
        ? "user-management"
        : user?.role === "IT_STAFF"
        ? "staff-queue"
        : "my-tickets";
    }
    return "dashboard";
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getInitialTab);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isChangingRequester, setIsChangingRequester] = useState(false);

  // Drill-down filter states
  const [staffQueueFilter, setStaffQueueFilter] = useState<{
    currentStatus?: string;
    ownerFilter?: "all" | "unassigned" | "assigned_to_me";
    priority?: string;
  }>({});
  const [myTicketsStatusFilter, setMyTicketsStatusFilter] = useState<string>("");

  // Sync authenticated user with RequesterContext
  const prevUserIdRef = React.useRef<number | null>(null);
  useEffect(() => {
    setSelectedTicketId(null);
    if (user && prevUserIdRef.current !== user.id) {
      prevUserIdRef.current = user.id;
      if (user.role === "REQUESTER") {
        setSelectedRequester({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      }
      if (initialTab) {
        setCurrentTab(initialTab);
      } else if (import.meta.env.MODE !== "test") {
        setCurrentTab("dashboard");
      }
    }
  }, [user, setSelectedRequester, initialTab]);

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

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: "#F5F7F6" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F7F6" }}>
      <MandatoryPasswordChangeModal />
      <Navbar
        currentTab={selectedTicketId !== null ? (user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR" ? "staff-queue" : "my-tickets") : currentTab}
        onTabChange={(tab) => {
          setSelectedTicketId(null);
          if (tab === "staff-queue") {
            setStaffQueueFilter({});
          } else if (tab === "my-tickets") {
            setMyTicketsStatusFilter("");
          }
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
        ) : selectedTicketId !== null ? (
          user && (user.role === "IT_STAFF" || user.role === "ADMINISTRATOR") ? (
            <StaffTicketDetail
              ticketId={selectedTicketId}
              onBack={() => setSelectedTicketId(null)}
            />
          ) : (
            <TicketDetail
              ticketId={selectedTicketId}
              currentRequester={
                selectedRequester || {
                  id: user?.id || 1,
                  name: user?.name || "Staff",
                  email: user?.email || "staff@example.com",
                }
              }
              onBack={() => setSelectedTicketId(null)}
            />
          )
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
            {currentTab === "dashboard" && (
              user && (user.role === "IT_STAFF" || user.role === "ADMINISTRATOR") ? (
                <StaffDashboard
                  onDrillDown={(filters) => {
                    setStaffQueueFilter(filters);
                    setCurrentTab("staff-queue");
                  }}
                  onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                  onCreateClick={() => {
                    setSelectedTicketId(null);
                    setCurrentTab("create-ticket");
                  }}
                  onManageUsersClick={() => {
                    setSelectedTicketId(null);
                    setCurrentTab("user-management");
                  }}
                />
              ) : (
                <RequesterDashboard
                  onDrillDown={(status) => {
                    setMyTicketsStatusFilter(status === "open" ? "open" : (status || ""));
                    setCurrentTab("my-tickets");
                  }}
                  onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                  onCreateClick={() => {
                    setSelectedTicketId(null);
                    setCurrentTab("create-ticket");
                  }}
                  onViewAll={() => {
                    setMyTicketsStatusFilter("");
                    setCurrentTab("my-tickets");
                  }}
                />
              )
            )}

            {currentTab === "my-tickets" && (
              <MyTickets
                onCreateClick={() => {
                  setSelectedTicketId(null);
                  setCurrentTab("create-ticket");
                }}
                onSelectTicket={(t) => setSelectedTicketId(t.id)}
                initialStatus={myTicketsStatusFilter}
              />
            )}

            {currentTab === "create-ticket" && (
              <CreateTicket
                onSuccess={() => {
                  setSelectedTicketId(null);
                  setCurrentTab(user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR" ? "staff-queue" : "my-tickets");
                }}
                onCancel={() => {
                  setSelectedTicketId(null);
                  setCurrentTab("dashboard");
                }}
              />
            )}

            {currentTab === "staff-queue" && (
              <StaffTicketQueue
                onSelectTicket={(t) => setSelectedTicketId(t.id)}
                initialStatus={staffQueueFilter.currentStatus}
                initialOwnerFilter={staffQueueFilter.ownerFilter}
                initialPriority={staffQueueFilter.priority}
              />
            )}

            {currentTab === "user-management" && user?.role === "ADMINISTRATOR" && (
              <UserManagement />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App({ initialTab }: AppProps = {}) {
  return (
    <AuthProvider>
      <RequesterProvider>
        <AppContent initialTab={initialTab} />
      </RequesterProvider>
    </AuthProvider>
  );
}
