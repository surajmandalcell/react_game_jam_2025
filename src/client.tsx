import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles.css";

// Import the logic to ensure it's loaded
import "./logic";

// Initialize the React application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
