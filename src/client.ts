import { GameState, GameStatus } from "./logic";
import { Route, router } from "./router";
import "./styles.css";

let gameState: GameState | null = null;
let myPlayerId: string | undefined;

function initUI(): void {
  const appRoot = document.getElementById("root");
  if (!appRoot) {
    console.error("Root element not found");
    return;
  }

  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }
}

function renderCurrentPage(): void {
  const currentRoute = router.getCurrentRoute();
  window.location.hash = currentRoute;
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

// Make game state available globally for components
declare global {
  interface Window {
    gameState: GameState | null;
    myPlayerId: string | undefined;
  }
}

window.gameState = gameState;
window.myPlayerId = myPlayerId;
