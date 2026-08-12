import React from "react";
import ReactDOM from "react-dom/client";
// [Styling] Import Bootstrap 5 styles
import "bootstrap/dist/css/bootstrap.min.css";
// [Root Component] Main Application component
import App from "./App.js";

// [React Mount] Initialize React root element
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

