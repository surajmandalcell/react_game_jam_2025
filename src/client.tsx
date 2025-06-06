import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GameState, GameStatus } from "./logic";
import { End, Game, Home, Lobby, Settings } from "./pages";
import { Route, router } from "./router";
import "./index.css";

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
      // Store previous game state for comparison
      const prevGameState = gameState;

      // Update game state and player ID
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

      // Store the current route before potentially changing it
      const currentRoute = router.getCurrentRoute();

      // Track if this is the first load
      const isFirstLoad = !prevGameState;

      // Detect game state transitions
      const gameStarting =
        prevGameState?.status === GameStatus.LOBBY &&
        (game.status === GameStatus.PLACING_MINES ||
          game.status === GameStatus.PLAYING);

      const gameEnding =
        prevGameState?.status !== GameStatus.ENDED &&
        game.status === GameStatus.ENDED;

      // Handle navigation based on game state changes
      if (isFirstLoad) {
        // Initial navigation based on game state
        if (game.status === GameStatus.LOBBY && currentRoute !== Route.LOBBY) {
          router.navigate(Route.LOBBY);
        } else if (
          (game.status === GameStatus.PLAYING ||
            game.status === GameStatus.PLACING_MINES) &&
          currentRoute !== Route.GAME
        ) {
          router.navigate(Route.GAME);
        } else if (
          game.status === GameStatus.ENDED &&
          currentRoute !== Route.END
        ) {
          router.navigate(Route.END);
        }
      } else if (
        // Always navigate on these critical state changes
        gameStarting ||
        gameEnding
      ) {
        if (gameStarting) {
          console.log("Game starting - navigating to game screen");
          router.navigate(Route.GAME);
        } else if (gameEnding) {
          console.log("Game ending - navigating to end screen");
          router.navigate(Route.END);
        }
      }
    },
  });
}

function init(): void {
  initUI();

  // Set default route to LOBBY on first load
  const isFirstLoad = !localStorage.getItem("hasVisited");
  if (isFirstLoad) {
    router.navigate(Route.LOBBY);
    localStorage.setItem("hasVisited", "true");
  }

  const rootElement = document.getElementById("root");
  if (rootElement) {
    reactRoot = ReactDOM.createRoot(rootElement);

    reactRoot.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
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
