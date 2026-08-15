import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// [State Definition] UI state enum: idle, loading, success, error
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  // [State Management] Track application state and category list
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // [Event Handler] System check click action handler
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

  // [UI Render] Main Service Desk Layout
  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      {/* [UI Header] App title banner */}
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      {/* [UI Action] System check trigger button */}
      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      {state === "success" && (
        <div className="mt-4">
          <p className="mb-2">
            System Status: <span className="fw-bold text-success">Online</span>
          </p>
          {categories.length > 0 && (
            <div>
              <p className="fw-bold mb-2">Supported Request Categories:</p>
              <ol className="list-group list-group-numbered" style={{ maxWidth: 360 }}>
                {categories.map((c) => (
                  <li key={c.id} className="list-group-item">
                    {c.name}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="mt-4">
          <p className="mb-2">
            System Status: <span className="fw-bold text-danger">Offline</span>
          </p>
          <div className="alert alert-danger" role="alert" style={{ maxWidth: 360 }}>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
