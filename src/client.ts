import { GameState, GameStatus } from "./logic";
import { Route, router } from "./router";
import { PlayerId } from "rune-sdk/multiplayer";
import { Home, Lobby, Settings, Game, End } from "./pages";
import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";

let gameState: GameState | null = null;
let myPlayerId: PlayerId | undefined;
let root: ReactDOM.Root | null = null;

function initUI(): void {
  const appRoot = document.getElementById("root");
  if (!appRoot) {
    console.error("Root element not found");
    return;
  }

  root = ReactDOM.createRoot(appRoot);

  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }
}

function renderCurrentPage(): void {
  if (!root) return;

  const currentRoute = router.getCurrentRoute();

  switch (currentRoute) {
    case Route.HOME:
      root.render(React.createElement(Home));
      break;
    case Route.LOBBY:
      root.render(React.createElement(Lobby, { gameState, myPlayerId }));
      break;
    case Route.SETTINGS:
      root.render(React.createElement(Settings));
      break;
    case Route.GAME:
      root.render(React.createElement(Game, { gameState, myPlayerId }));
      break;
    case Route.END:
      root.render(React.createElement(End, { gameState, myPlayerId }));
      break;
    default:
      router.navigate(Route.HOME);
      break;
  }
}

function initRuneClient(): void {
  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      gameState = game;
      myPlayerId = yourPlayerId;

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

      renderCurrentPage();
    },
  });
}

function init(): void {
  initUI();
  initRuneClient();

  router.addListener(() => {
    renderCurrentPage();
  });

  renderCurrentPage();
}

document.addEventListener("DOMContentLoaded", init);
