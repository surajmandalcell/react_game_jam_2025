import React, { useEffect, useRef } from "react";
import ConfettiGenerator from "confetti-js";
import { GamePage, GameState, GameResult, PlayerRole } from "../../types";
import { useSettings } from "../../context/SettingsContext";

interface EndGamePageProps {
  gameState: GameState;
  playerId: string | null;
}

const EndGamePage: React.FC<EndGamePageProps> = ({ gameState, playerId }) => {
  const { settings } = useSettings();
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const isWinner = gameState.winnerId === playerId;
  const isGorilla = gameState.gorillaId === playerId;

  useEffect(() => {
    // Initialize confetti effect
    if (confettiRef.current) {
      const confettiSettings = {
        target: confettiRef.current,
        max: 150,
        size: 1.5,
        animate: true,
        props: ["circle", "square", "triangle", "line"],
        colors: [
          [165, 104, 246],
          [230, 61, 135],
          [0, 199, 228],
          [253, 214, 126],
        ],
        clock: 25,
        rotate: true,
        start_from_edge: true,
        respawn: true,
      };

      const confetti = new ConfettiGenerator(confettiSettings);
      confetti.render();

      return () => confetti.clear();
    }
  }, []);

  const handleNewGame = () => {
    Rune.actions.startNewGame();
  };

  const handleHome = () => {
    Rune.actions.navigateTo(GamePage.HOME);
  };

  const renderResultMessage = () => {
    if (gameState.result === GameResult.GORILLA_WIN) {
      if (isGorilla) {
        return "You found all humans without hitting any mines! 🦍";
      } else {
        return "The Gorilla found all humans without hitting any mines! 🦍";
      }
    } else if (gameState.result === GameResult.HUMAN_WIN) {
      const winnerPlayer = gameState.players.find(
        (p) => p.id === gameState.winnerId
      );

      if (isWinner) {
        return "Your mine caught the Gorilla! You win! 💣";
      } else if (isGorilla) {
        return `You hit ${winnerPlayer?.name}'s mine! Game over! 💣`;
      } else {
        return `${winnerPlayer?.name}'s mine caught the Gorilla! 💣`;
      }
    }

    return "Game ended!";
  };

  return (
    <div
      className={`page end-game-page ${settings.darkMode ? "dark-mode" : ""}`}
    >
      <canvas ref={confettiRef} className="confetti-container"></canvas>

      <h1 className="page-title">Game Over!</h1>

      <div className="page-content">
        <div className="result-message">
          <h2>{isWinner ? "You Won! 🎉" : ""}</h2>
          <p>{renderResultMessage()}</p>
        </div>

        <div className="player-list">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`player-item ${player.role === PlayerRole.GORILLA ? "player-item-gorilla" : ""} ${player.id === gameState.winnerId ? "winner" : ""}`}
            >
              <span>{player.name}</span>
              {player.role === PlayerRole.GORILLA && <span>🦍 Gorilla</span>}
              {player.id === gameState.winnerId && <span>👑 Winner</span>}
              {player.id === playerId && <span> (You)</span>}
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleNewGame}>
            New Game
          </button>
          <button className="btn btn-secondary" onClick={handleHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndGamePage;
