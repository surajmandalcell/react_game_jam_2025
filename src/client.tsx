import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles.css";

// Import the logic to ensure it's loaded
import "./logic";

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, mounting React app");
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Root element not found!");
    return;
  }

  // Initialize the React application
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
