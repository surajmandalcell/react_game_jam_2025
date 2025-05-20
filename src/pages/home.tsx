import { Route, router } from "../router";
import React, { useEffect } from "react";

export function Home() {
  useEffect(() => {
    document.title = "Gorilla vs Men - Home";
  }, []);

  const handleNewGame = () => {
    router.navigate(Route.LOBBY);
  };

  const handleCustomLobby = () => {
    router.navigate(Route.LOBBY);
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
