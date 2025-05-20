import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { GameState, GameStatus } from "./logic";
import { Route, router } from "./router";
import { Home, Lobby, Game, End, Settings } from "./pages";
import "./styles.css";

let gameState: GameState | null = null;
let myPlayerId: string | undefined;

let reactRoot: ReactDOM.Root | null = null;

function initUI(): void {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }
}

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>(
    router.getCurrentRoute()
  );
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(
    gameState
  );
  const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>(
    myPlayerId
  );

  useEffect(() => {
    setCurrentGameState(gameState);
    setCurrentPlayerId(myPlayerId);
  }, [gameState, myPlayerId]);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(router.getCurrentRoute());
    };

    router.addListener(handleRouteChange);
    return () => router.removeListener(handleRouteChange);
  }, []);

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case Route.HOME:
        return <Home />;
      case Route.LOBBY:
        return (
          <Lobby gameState={currentGameState} myPlayerId={currentPlayerId} />
        );
      case Route.GAME:
        return (
          <Game gameState={currentGameState} myPlayerId={currentPlayerId} />
        );
      case Route.END:
        return (
          <End gameState={currentGameState} myPlayerId={currentPlayerId} />
        );
      case Route.SETTINGS:
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return <div className="game-container">{renderCurrentPage()}</div>;
};

function initRuneClient(): void {
  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      gameState = game;
      myPlayerId = yourPlayerId;

      window.gameState = gameState;
      window.myPlayerId = myPlayerId;

      if (reactRoot) {
        reactRoot.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      }

      if (
        game.status === GameStatus.LOBBY &&
        router.getCurrentRoute() !== Route.LOBBY
      ) {
        router.navigate(Route.LOBBY);
      } else if (
        game.status === GameStatus.PLAYING &&
        router.getCurrentRoute() !== Route.GAME
      ) {
        router.navigate(Route.GAME);
      } else if (
        game.status === GameStatus.ENDED &&
        router.getCurrentRoute() !== Route.END
      ) {
        router.navigate(Route.END);
      }
    },
  });
}

function init(): void {
  initUI();

  const rootElement = document.getElementById("root");
  if (rootElement) {
    reactRoot = ReactDOM.createRoot(rootElement);

    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }

  initRuneClient();
}

document.addEventListener("DOMContentLoaded", init);

declare global {
  interface Window {
    gameState: GameState | null;
    myPlayerId: string | undefined;
  }
}

window.gameState = gameState;
window.myPlayerId = myPlayerId;
