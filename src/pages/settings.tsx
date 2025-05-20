import { Route, router } from "../router";
import React, { useEffect, useState } from "react";

export function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [graphicsQuality, setGraphicsQuality] = useState(
    localStorage.getItem("graphicsQuality") || "High"
  );

  useEffect(() => {
    document.title = "Gorilla vs Men - Settings";
  }, []);

  const handleDarkModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDarkMode = e.target.checked;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleGraphicsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quality = e.target.value;
    setGraphicsQuality(quality);
    localStorage.setItem("graphicsQuality", quality);
  };

  return (
    <div>
      <div className="nav-bar">
        <button
          onClick={() => router.navigate(Route.HOME)}
          className="nav-button"
        >
          ←
        </button>
        <h2>Settings</h2>
        <div></div>
      </div>

      <div className="settings-container">
        <div className="setting-item">
          <span>Dark Mode</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={handleDarkModeToggle}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <span>Graphics Quality</span>
          <select
            value={graphicsQuality}
            onChange={handleGraphicsChange}
            className="graphics-dropdown"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Settings;
