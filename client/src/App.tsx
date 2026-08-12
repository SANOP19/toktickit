import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// [State Definition] UI state enum: idle, loading, success, error
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  // [State Management] Track application state and category list
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  void categories;

  // [Event Handler] System check click action handler
  async function handleCheck() {
    // TODO(Issue 4): set loading, call checkSystem(), then either
    //   - success: store categories and show Online + the list, or
    //   - error: show Offline + a useful message.
    setState("loading");
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

      {/* TODO(Issue 4): render loading / success (Online + categories) / error (Offline) states. */}
    </div>
  );
}

