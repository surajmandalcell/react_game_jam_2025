import React from "react";
import { GamePage, GameState } from "../../types";
import { useSettings } from "../../context/SettingsContext";

interface SettingsPageProps {
  gameState: GameState;
  playerId: string | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ gameState, playerId }) => {
  const { settings, updateSettings } = useSettings();

  const handleDarkModeToggle = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const handleGraphicsQualityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateSettings({
      graphicsQuality: e.target.value as "high" | "medium" | "low",
    });
  };

  const handleGoBack = () => {
    Rune.actions.navigateTo(GamePage.HOME);
  };

  return (
    <div
      className={`page settings-page ${settings.darkMode ? "dark-mode" : ""}`}
    >
      <h1 className="page-title">Settings</h1>

      <div className="page-content">
        <div className="settings-section">
          <div className="settings-option">
            <span>Dark Mode</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={handleDarkModeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-option">
            <span>Graphics Quality</span>
            <select
              value={settings.graphicsQuality}
              onChange={handleGraphicsQualityChange}
              className="graphics-select"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
