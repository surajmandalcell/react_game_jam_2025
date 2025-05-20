import React from "react";
import { GamePage, GameState } from "../../types";
import { useSettings } from "../../context/SettingsContext";

interface HomePageProps {
  gameState: GameState;
  playerId: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ gameState, playerId }) => {
  const { settings } = useSettings();

  const handleNewGame = () => {
    Rune.actions.navigateTo(GamePage.LOBBY);
  };

  const handleSettings = () => {
    Rune.actions.navigateTo(GamePage.SETTINGS);
  };

  return (
    <div className={`page home-page ${settings.darkMode ? "dark-mode" : ""}`}>
      <h1 className="page-title">Humans & Gorilla</h1>

      <div className="page-content">
        <div className="game-description">
          <p>Welcome to Humans & Gorilla!</p>
          <p>5 players control humans, while 1 player is the gorilla.</p>
          <p>
            Humans each place 1 mine on the field. The gorilla must find all
            humans while avoiding the mines.
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleNewGame}>
            New Game
          </button>
          <button className="btn btn-secondary" onClick={handleSettings}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
