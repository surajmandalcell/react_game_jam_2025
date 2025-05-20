import React, { useEffect, useState } from "react";
import { GameState, GameStatus, PlayerRole, GRID_SIZE } from "../logic";
import { PlayerId } from "rune-sdk/multiplayer";

interface GameProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function Game({ gameState, myPlayerId }: GameProps) {
  const [animation, setAnimation] = useState<{
    x: number;
    y: number;
    type: string;
  } | null>(null);

  useEffect(() => {
    document.title = "Gorilla vs Men - Game";
  }, []);

  if (!gameState || !myPlayerId) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game state...</p>
      </div>
    );
  }

  const myRole = gameState.playerRoles[myPlayerId];
  const isGorilla = myRole === PlayerRole.GORILLA;
  const isMyTurn = isGorilla && gameState.status === GameStatus.PLAYING;

  let statusMessage = "";
  let statusClass = "";

  if (gameState.status === GameStatus.PLACING_MINES) {
    if (myRole === PlayerRole.MAN) {
      const minesToPlace = gameState.minesToPlace[myPlayerId] || 0;
      statusMessage = `Place your mine (${minesToPlace} remaining)`;
      statusClass = "status-placing pulsing-text";
    } else {
      statusMessage = "Men are placing mines...";
      statusClass = "status-waiting";
    }
  } else if (gameState.status === GameStatus.PLAYING) {
    if (isGorilla) {
      statusMessage = "Your turn! Tap to find men";
      statusClass = "status-active pulsing-text";
    } else {
      statusMessage = "Gorilla is hunting...";
      statusClass = "status-waiting";
    }
  }

  const handleCellClick = (x: number, y: number) => {
    if (
      gameState.status === GameStatus.PLACING_MINES &&
      myRole === PlayerRole.MAN &&
      gameState.minesToPlace[myPlayerId] > 0
    ) {
      try {
        setAnimation({ x, y, type: "place-mine" });
        setTimeout(() => setAnimation(null), 800);
        Rune.actions.placeMine({ x, y });
      } catch (error) {
        console.error("Error placing mine:", error);
      }
    } else if (gameState.status === GameStatus.PLAYING && isGorilla) {
      try {
        setAnimation({ x, y, type: "reveal" });
        setTimeout(() => setAnimation(null), 800);
        Rune.actions.revealCell({ x, y });
      } catch (error) {
        console.error("Error revealing cell:", error);
      }
    }
  };

  const getPlayerCount = (role: PlayerRole) => {
    return Object.values(gameState.playerRoles).filter(
      (playerRole) => playerRole === role
    ).length;
  };

  const renderGameInfo = () => {
    return (
      <div className="game-info">
        <div className="player-count">
          <div className="player-count-item man">
            <span className="player-count-label">MEN</span>
            <span className="player-count-value">
              {getPlayerCount(PlayerRole.MAN)}
            </span>
          </div>
          <div className="player-count-item gorilla">
            <span className="player-count-label">GORILLA</span>
            <span className="player-count-value">
              {getPlayerCount(PlayerRole.GORILLA)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getCellClassName = (x: number, y: number) => {
    const cell = gameState.grid[y][x];
    let cellClass = "cell";

    if (cell.revealed) {
      cellClass += " revealed";
      if (cell.hasMine) {
        cellClass += " mine";
      }
    }

    // Add animation class if this cell is being animated
    if (animation && animation.x === x && animation.y === y) {
      cellClass += ` animation-${animation.type}`;
    }

    return cellClass;
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>Gorilla vs Men</h2>

        <div className="game-subheader">
          <div className={`role-indicator ${myRole.toLowerCase()}`}>
            {myRole.toUpperCase()}
          </div>

          <div className={`game-status ${statusClass}`}>{statusMessage}</div>
        </div>

        {renderGameInfo()}
      </div>

      <div className="game-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);

          return (
            <div
              key={`${x}-${y}`}
              className={getCellClassName(x, y)}
              onClick={() => handleCellClick(x, y)}
            >
              {gameState.grid[y][x].revealed &&
                !gameState.grid[y][x].hasMine && (
                  <div className="cell-content revealed-cell"></div>
                )}
              {gameState.grid[y][x].revealed &&
                gameState.grid[y][x].hasMine && (
                  <div className="cell-content mine-cell">💥</div>
                )}
            </div>
          );
        })}
      </div>

      <div className="game-footer">
        <div className="game-stats">
          Revealed: {gameState.revealedCount} / {GRID_SIZE * GRID_SIZE}
        </div>
        {isMyTurn && <div className="turn-indicator floating">YOUR TURN</div>}
      </div>
    </div>
  );
}

export default Game;
