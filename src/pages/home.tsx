import { Route, router } from "../router";
import React, { useEffect } from "react";

export function Home() {
  useEffect(() => {
    document.title = "Gorilla vs Men - Home";
  }, []);

  const handleNewGame = () => {
    try {
      Rune.showJoinGame();
      router.navigate(Route.LOBBY);
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };

  const handleCustomLobby = () => {
    try {
      Rune.showCreateGame();
      router.navigate(Route.LOBBY);
    } catch (error) {
      console.error("Error creating custom lobby:", error);
    }
  };

  const handleSettings = () => {
    router.navigate(Route.SETTINGS);
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">Gorilla vs Men</h1>
      <div className="button-container">
        <button onClick={handleNewGame} className="button">
          New Game
        </button>
        <button onClick={handleCustomLobby} className="button">
          Custom Lobby
        </button>
        <button onClick={handleSettings} className="button secondary">
          Settings
        </button>
      </div>
    </div>
  );
}

export default Home;
