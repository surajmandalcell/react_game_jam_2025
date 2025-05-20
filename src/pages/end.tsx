import React, { useEffect, useState } from "react";
import { GameState, PlayerRole } from "../logic";
import { Route, router } from "../router";
import { PlayerId } from "rune-sdk/multiplayer";

interface EndProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function End({ gameState, myPlayerId }: EndProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    document.title = "Gorilla vs Men - Game Over";

    // Delay confetti animation for a more dramatic effect
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!gameState || !myPlayerId) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game results...</p>
      </div>
    );
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

  // Determine the winner and message
  const isWinner = gameState.winner === myPlayerId;
  const winnerRole = gameState.winningRole;

  let winnerMessage = "";
  let winnerName = "";
  let winnerIcon = "";
  let winnerColors = "";

  if (gameState.winner) {
    if (winnerRole === PlayerRole.GORILLA) {
      winnerMessage =
        "The Gorilla found all the men without hitting any mines!";
      winnerIcon = "🦍";
      winnerColors = "gorilla-win";
    } else {
      winnerMessage = "The Gorilla hit a mine!";
      winnerIcon = "💥";
      winnerColors = "man-win";
    }

    winnerName =
      gameState.winner === myPlayerId
        ? "You Won!"
        : `Player ${gameState.winner.substring(0, 4)} Won!`;
  } else {
    winnerMessage = "Game Over";
    winnerName = "No winner";
    winnerIcon = "🏳️";
    winnerColors = "";
  }

  return (
    <div className={`win-container ${winnerColors}`}>
      <div className="win-content">
        <h2 className="game-over-title">Game Over!</h2>

        <div className="win-icon-container">
          <div className="win-icon">{winnerIcon}</div>
        </div>

        <p className="win-message">{winnerMessage}</p>
        <p className="winner-name">{winnerName}</p>

        {isWinner && (
          <div className="win-badge">
            <span className="win-badge-text">VICTORY</span>
          </div>
        )}

        <div className="game-stats-summary">
          <div className="stat-item">
            <span className="stat-label">Cells Revealed</span>
            <span className="stat-value">{gameState.revealedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Players</span>
            <span className="stat-value">
              {Object.keys(gameState.playerRoles).length}
            </span>
          </div>
        </div>

        <div className="button-container">
          <button onClick={handleNewGame} className="button">
            <span className="button-icon">🎮</span> New Game
          </button>
          <button onClick={handleHome} className="button secondary">
            <span className="button-icon">🏠</span> Home
          </button>
        </div>
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => {
            const randomSize = Math.floor(Math.random() * 10) + 5;
            const randomDelay = Math.random() * 3;
            const randomDuration = Math.random() * 3 + 3;
            const randomColor = [
              "#e74a8f",
              "#4a8fe7",
              "#8fe74a",
              "#e7e54a",
              "#4ae7e5",
              "#e74a4a",
              "#ffffff",
            ][Math.floor(Math.random() * 7)];

            const style = {
              left: `${Math.random() * 100}%`,
              width: `${randomSize}px`,
              height: `${randomSize * 1.5}px`,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
              backgroundColor: randomColor,
              transform: `rotate(${Math.random() * 360}deg)`,
            };

            return <div key={i} className="confetti" style={style} />;
          })}
        </div>
      )}
    </div>
  );
}

export default End;
