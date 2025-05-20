import React, { useEffect, useState } from "react";
import { Route, router } from "../router";

export function Home() {
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    document.title = "Gorilla vs Men - Home";

    // Add title animation after a short delay
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 300);

    return () => clearTimeout(timer);
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
      <div className={`title-container ${animateTitle ? "animate-in" : ""}`}>
        <h1 className="menu-title">
          <span className="title-part title-gorilla">GORILLA</span>
          <span className="title-part title-vs">VS</span>
          <span className="title-part title-men">MEN</span>
        </h1>

        <div className="game-tagline">
          Hunt or be hunted in this multiplayer challenge
        </div>
      </div>

      <div className={`game-preview ${animateTitle ? "animate-in" : ""}`}>
        <div className="game-preview-gorilla">
          <div className="preview-icon">🦍</div>
          <div className="preview-label">The Gorilla</div>
        </div>
        <div className="game-preview-vs">VS</div>
        <div className="game-preview-men">
          <div className="preview-icon">👨👨👨</div>
          <div className="preview-label">The Men</div>
        </div>
      </div>

      <div className={`button-container ${animateTitle ? "animate-in" : ""}`}>
        <button onClick={handleNewGame} className="button main-button">
          <span className="button-icon">🎮</span> Play Now
        </button>
        <button onClick={handleCustomLobby} className="button">
          <span className="button-icon">👥</span> Custom Lobby
        </button>
        <button onClick={handleSettings} className="button secondary">
          <span className="button-icon">⚙️</span> Settings
        </button>
      </div>

      <div className="game-footer-info">
        <div className="game-version">Version 1.0.0</div>
        <div className="game-platform">Powered by Rune</div>
      </div>
    </div>
  );
}

export default Home;
