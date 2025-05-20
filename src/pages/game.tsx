import { GameState, GameStatus, PlayerRole, GRID_SIZE } from "../logic";
import { PlayerId } from "rune-sdk/multiplayer";
import React, { useEffect } from "react";

interface GameProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function Game({ gameState, myPlayerId }: GameProps) {
  useEffect(() => {
    document.title = "Gorilla vs Men - Game";
  }, []);

  if (!gameState || !myPlayerId) {
    return <div>Loading game state...</div>;
  }

  const myRole = gameState.playerRoles[myPlayerId];
  const isGorilla = myRole === PlayerRole.GORILLA;

  let statusMessage = "";
  if (gameState.status === GameStatus.PLACING_MINES) {
    if (myRole === PlayerRole.MAN) {
      const minesToPlace = gameState.minesToPlace[myPlayerId] || 0;
      statusMessage = `Place your mine (${minesToPlace} remaining)`;
    } else {
      statusMessage = "Men are placing mines...";
    }
  } else if (gameState.status === GameStatus.PLAYING) {
    if (isGorilla) {
      statusMessage = "Your turn! Tap to find men";
    } else {
      statusMessage = "Gorilla is hunting...";
    }
  }

  const handleCellClick = (x: number, y: number) => {
    if (
      gameState.status === GameStatus.PLACING_MINES &&
      myRole === PlayerRole.MAN
    ) {
      if (gameState.minesToPlace[myPlayerId] > 0) {
        try {
          Rune.actions.placeMine({ x, y });
        } catch (error) {
          console.error("Error placing mine:", error);
        }
      }
    } else if (gameState.status === GameStatus.PLAYING && isGorilla) {
      try {
        Rune.actions.revealCell({ x, y });
      } catch (error) {
        console.error("Error revealing cell:", error);
      }
    }
  };

  return (
    <div>
      <h2>Gorilla vs Men</h2>

      <div className={`role-indicator ${myRole.toLowerCase()}`}>
        You are: {myRole.toUpperCase()}
      </div>

      <div className="game-status">{statusMessage}</div>

      <div className="game-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const cell = gameState.grid[y][x];
          let cellClass = "cell";

          if (cell.revealed) {
            cellClass += " revealed";
            if (cell.hasMine) {
              cellClass += " mine";
            }
          }

          return (
            <div
              key={`${x}-${y}`}
              className={cellClass}
              onClick={() => handleCellClick(x, y)}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default Game;
