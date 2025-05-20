import React, { useEffect, useState } from "react";
import { GamePage, GameState } from "../types";
import { SettingsProvider } from "../context/SettingsContext";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import SettingsPage from "./pages/SettingsPage";
import GamePlayPage from "./pages/GamePage";
import EndGamePage from "./pages/EndGamePage";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add debugging
    console.log("App component mounted, initializing Rune client");

    try {
      // Initialize Rune client
      Rune.initClient({
        onChange: ({ game, yourPlayerId }) => {
          console.log("Rune onChange called", { game, yourPlayerId });
          setGameState(game);
          if (yourPlayerId) {
            setPlayerId(yourPlayerId);
          }

          // Redirect to home if trying to access page out of order
          const currentPath = window.location.pathname;
          if (currentPath !== game.page && currentPath !== "/") {
            redirectToHome();
          }
        },
      });
    } catch (err) {
      console.error("Error initializing Rune client:", err);
      setError(
        `Failed to initialize game: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, []);
  const redirectToHome = () => {
    Rune.actions.navigateTo(GamePage.HOME);
  };

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <h1>Error Initializing Game</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Show loading state
  if (!gameState) {
    return <div className="loading">Loading game state...</div>;
  }

  // Wrapper component for phone display
  const PhoneContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <div className="phone-container">
        <div className="phone-header"></div>
        <div className="phone-content">{children}</div>
        <div className="phone-footer"></div>
      </div>
    );
  };
  // Render the appropriate page based on current game state
  const renderPage = () => {
    switch (gameState.page) {
      case GamePage.HOME:
        return <HomePage gameState={gameState} playerId={playerId} />;
      case GamePage.LOBBY:
        return <LobbyPage gameState={gameState} playerId={playerId} />;
      case GamePage.SETTINGS:
        return <SettingsPage gameState={gameState} playerId={playerId} />;
      case GamePage.GAME:
        return <GamePlayPage gameState={gameState} playerId={playerId} />;
      case GamePage.END:
        return <EndGamePage gameState={gameState} playerId={playerId} />;
      default:
        return <HomePage gameState={gameState} playerId={playerId} />;
    }
  };

  return (
    <SettingsProvider>
      <PhoneContainer>{renderPage()}</PhoneContainer>
    </SettingsProvider>
  );
};

export default App;
