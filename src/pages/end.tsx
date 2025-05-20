import { GameState, PlayerRole } from "../logic";
import { Route, router } from "../router";
import { PlayerId } from "rune-sdk/multiplayer";
import React, { useEffect, useState } from "react";

interface EndProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function End({ gameState, myPlayerId }: EndProps) {
  useEffect(() => {
    document.title = "Gorilla vs Men - Game Over";
  }, []);

  if (!gameState || !myPlayerId) {
    return <div>Loading game state...</div>;
  }

  const handleNewGame = () => {
    try {
      Rune.actions.restartGame();
    } catch (error) {
      console.error("Error restarting game:", error);
    }
  };

  const handleHome = () => {
    router.navigate(Route.HOME);
  };

  let winnerMessage = "";
  let winnerName = "";

  if (gameState.winner) {
    const isWinnerMe = gameState.winner === myPlayerId;

    if (gameState.winningRole === PlayerRole.GORILLA) {
      winnerMessage =
        "The Gorilla found all the men without hitting any mines!";
      winnerName = isWinnerMe
        ? "You"
        : `Player ${gameState.winner.substring(0, 4)}`;
    } else {
      winnerMessage = "The Gorilla hit a mine!";
      winnerName = isWinnerMe
        ? "You"
        : `Player ${gameState.winner.substring(0, 4)}`;
    }
  } else {
    winnerMessage = "Game Over";
    winnerName = "No winner";
  }

  return (
    <div className="win-container">
      <h2>Game Over!</h2>
      <p className="win-message">{winnerMessage}</p>
      <p className="winner-name">{winnerName} Won!</p>

      <div className="button-container">
        <button onClick={handleNewGame} className="button">
          New Game
        </button>
        <button onClick={handleHome} className="button secondary">
          Home
        </button>
      </div>

      {/* Confetti is rendered in CSS instead of React components */}
      <div className="confetti-container">
        {Array.from({ length: 50 }).map((_, i) => {
          const style = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: ["#e74a8f", "#4a8fe7", "#8fe74a", "#e7e54a"][
              Math.floor(Math.random() * 4)
            ],
          };
          return <div key={i} className="confetti" style={style} />;
        })}
      </div>
    </div>
  );
}

export default End;
