import React, { useState, useEffect } from "react";
import {
  GamePage as GamePageEnum,
  GameState,
  GameStatus,
  PlayerRole,
} from "../../types";
import { useSettings } from "../../context/SettingsContext";

interface GamePageProps {
  gameState: GameState;
  playerId: string | null;
}

const GamePage: React.FC<GamePageProps> = ({ gameState, playerId }) => {
  const { settings } = useSettings();
  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isGorilla = playerId === gameState.gorillaId;
  const isPlacingMines = gameState.status === GameStatus.PLACING_MINES;
  const hasPlacedMine = gameState.minesPlaced.includes(playerId || "");

  useEffect(() => {
    // Reset selected cell when game status changes
    setSelectedCell(null);
  }, [gameState.status]);

  const handleCellClick = (x: number, y: number) => {
    if (isPlacingMines && !isGorilla && !hasPlacedMine) {
      // Human players placing mines
      setSelectedCell({ x, y });
    } else if (gameState.status === GameStatus.PLAYING && isGorilla) {
      // Gorilla revealing cells
      Rune.actions.revealCell({ x, y });
    }
  };

  const handlePlaceMine = () => {
    if (selectedCell && !hasPlacedMine) {
      Rune.actions.placeMine(selectedCell);
      setSelectedCell(null);
    }
  };

  const renderStatusMessage = () => {
    if (isPlacingMines) {
      if (isGorilla) {
        return "You are the Gorilla! Wait for humans to place their mines.";
      } else {
        return hasPlacedMine
          ? "Wait for other players to place their mines..."
          : "You are a Human! Select a cell to place your mine.";
      }
    } else if (gameState.status === GameStatus.PLAYING) {
      if (isGorilla) {
        return "You are the Gorilla! Tap to reveal humans, but avoid mines!";
      } else {
        return "You are a Human! Watch the Gorilla hunt for humans.";
      }
    }
    return "";
  };

  return (
    <div className={`page game-page ${settings.darkMode ? "dark-mode" : ""}`}>
      <h1 className="page-title">
        {isGorilla ? "You are the Gorilla" : "You are a Human"}
      </h1>

      <div className="page-content">
        <div className="status-message">{renderStatusMessage()}</div>

        <div className="game-grid">
          {gameState.grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell 
                  ${cell.isRevealed ? "revealed" : ""} 
                  ${cell.isRevealed && cell.isMine ? "mine" : ""}
                  ${selectedCell?.x === x && selectedCell?.y === y ? "selected" : ""}
                `}
                onClick={() => handleCellClick(x, y)}
              >
                {cell.isRevealed && !cell.isMine && "👤"}
                {cell.isRevealed && cell.isMine && "💣"}
                {!cell.isRevealed &&
                  selectedCell?.x === x &&
                  selectedCell?.y === y &&
                  "❓"}
              </div>
            ))
          )}
        </div>

        {isPlacingMines && !isGorilla && !hasPlacedMine && selectedCell && (
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handlePlaceMine}>
              Place Mine
            </button>
          </div>
        )}

        <div className="game-stats">
          <div>
            Mines Placed: {gameState.minesPlaced.length}/
            {gameState.players.length - 1}
          </div>
          {gameState.status === GameStatus.PLAYING && (
            <div>
              Humans Found: {gameState.revealedCount}/
              {gameState.totalHumansToReveal}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
