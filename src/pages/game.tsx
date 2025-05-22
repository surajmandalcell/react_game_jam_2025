import React, { useEffect, useState } from "react";
import { GameState, GameStatus, PlayerRole, GRID_SIZE } from "../logic";
import { PlayerId } from "rune-sdk/multiplayer";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Route, router } from "../router";

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
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    document.title = "Gorilla vs Men - Game";
  }, []);

  // Update the timer for mine placement
  useEffect(() => {
    if (
      !gameState ||
      gameState.status !== GameStatus.PLACING_MINES ||
      !gameState.minePlacementEndTime
    ) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const endTime = gameState.minePlacementEndTime || 0;
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [gameState?.status, gameState?.minePlacementEndTime]);

  if (!gameState || !myPlayerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading game state...</p>
      </div>
    );
  }

  const myRole = gameState.playerRoles[myPlayerId];
  const isGorilla = myRole === PlayerRole.GORILLA;
  const isMyTurn = isGorilla && gameState.status === GameStatus.PLAYING;
  const totalCells = GRID_SIZE * GRID_SIZE;
  const revealedPercentage = (gameState.revealedCount / totalCells) * 100;
  const minesToPlace = gameState.minesToPlace[myPlayerId] || 0;

  let statusMessage = "";
  let statusClass = "";

  if (gameState.status === GameStatus.PLACING_MINES) {
    if (myRole === PlayerRole.MAN) {
      statusMessage = `Place your mines (${minesToPlace} remaining)`;
      statusClass = "text-blue-600 dark:text-blue-400 animate-pulse";
    } else {
      statusMessage = "Men are placing mines...";
      statusClass = "text-muted-foreground";
    }

    // Calculate remaining time if timer is set
    if (gameState.minePlacementEndTime) {
      const remainingTime = Math.max(
        0,
        Math.floor((gameState.minePlacementEndTime - Date.now()) / 1000)
      );
      if (remainingTime > 0) {
        statusMessage += ` (${remainingTime}s)`;
      }
    }
  } else if (gameState.status === GameStatus.PLAYING) {
    if (isGorilla) {
      statusMessage = "Your turn! Tap to find men";
      statusClass = "text-amber-600 dark:text-amber-400 animate-pulse";
    } else {
      statusMessage = "Gorilla is hunting...";
      statusClass = "text-muted-foreground";
    }
  }

  const handleCellClick = (x: number, y: number) => {
    const cell = gameState.grid[y][x];

    if (
      gameState.status === GameStatus.PLACING_MINES &&
      myRole === PlayerRole.MAN &&
      minesToPlace > 0
    ) {
      if (!cell.hasMine) {
        try {
          Rune.actions.placeMine({ x, y });
          setAnimation({ x, y, type: "mine-placed" });
          setTimeout(() => setAnimation(null), 500);
        } catch (error) {
          console.error("Error placing mine:", error);
        }
      }
    } else if (
      gameState.status === GameStatus.PLAYING &&
      isGorilla &&
      isMyTurn
    ) {
      if (!cell.revealed) {
        try {
          Rune.actions.revealCell({ x, y });
          setAnimation({ x, y, type: cell.hasMine ? "explosion" : "reveal" });
          setTimeout(() => setAnimation(null), 500);
        } catch (error) {
          console.error("Error revealing cell:", error);
        }
      }
    }
  };

  const getPlayerCount = (role: PlayerRole) => {
    return Object.values(gameState.playerRoles).filter(
      (playerRole) => playerRole === role
    ).length;
  };

  const getCellClassName = (x: number, y: number) => {
    const cell = gameState.grid[y][x];

    return cn(
      "aspect-square border border-gray-300 dark:border-gray-700 flex items-center justify-center",
      cell.revealed && "bg-gray-100 dark:bg-gray-800",
      cell.revealed && cell.hasMine && "bg-red-100 dark:bg-red-900/30",
      animation &&
        animation.x === x &&
        animation.y === y &&
        `animate-${animation.type}`
    );
  };

  const renderGameStatus = () => {
    if (gameState.status === GameStatus.PLACING_MINES) {
      if (myRole === PlayerRole.MAN) {
        return (
          <Alert className="mb-4">
            <AlertTitle className="flex items-center justify-between">
              <span>Place your mines! Time left: {timeLeft}s</span>
              <Badge>{minesToPlace} mines left</Badge>
            </AlertTitle>
            <AlertDescription>
              Click on the grid to place mines. If you don't place all mines in
              time, they will be placed randomly.
            </AlertDescription>
          </Alert>
        );
      } else {
        return (
          <Alert className="mb-4">
            <AlertTitle>Men are placing their mines</AlertTitle>
            <AlertDescription>
              Wait for men to place their mines. Time left: {timeLeft}s
            </AlertDescription>
          </Alert>
        );
      }
    } else if (gameState.status === GameStatus.PLAYING) {
      if (isMyTurn) {
        return (
          <Alert className="mb-4">
            <AlertTitle>Your turn!</AlertTitle>
            <AlertDescription>
              {myRole === PlayerRole.GORILLA
                ? "Click on cells to reveal them. Avoid mines!"
                : "Wait for your turn to place mines."}
            </AlertDescription>
          </Alert>
        );
      } else {
        return (
          <Alert className="mb-4">
            <AlertTitle>Waiting for other player</AlertTitle>
            <AlertDescription>
              {gameState.currentTurn
                ? `Player ${gameState.currentTurn.substring(0, 4)} is taking their turn`
                : "Waiting for next player"}
            </AlertDescription>
          </Alert>
        );
      }
    }

    return null;
  };

  const renderGameContent = () => {
    return (
      <div className="flex flex-col h-screen p-4 bg-background w-full">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Rune.actions.restartGame();
              router.navigate(Route.HOME);
            }}
            className="flex items-center gap-1 text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-foreground">Gorilla vs. Men</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
          {renderGameStatus()}

          <div className="flex-1 grid grid-cols-10 gap-1 mb-4">
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const cell = gameState.grid[y][x];
                const isAnimating = animation?.x === x && animation?.y === y;
                const animationClass = isAnimating
                  ? `animate-${animation.type}`
                  : "";

                let cellContent = "";
                let cellClass = "bg-gray-200 dark:bg-gray-800";

                if (cell.revealed) {
                  cellClass = "bg-gray-100 dark:bg-gray-700";
                  if (cell.hasMine) {
                    cellContent = "💣";
                    cellClass = "bg-red-300 dark:bg-red-900";
                  }
                } else if (
                  gameState.status === GameStatus.PLACING_MINES &&
                  myRole === PlayerRole.MAN &&
                  cell.hasMine &&
                  cell.mineOwnerId === myPlayerId
                ) {
                  // Show my mines during placement phase
                  cellContent = "🎯";
                  cellClass = "bg-blue-200 dark:bg-blue-900";
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className={cn(
                      "w-full aspect-square flex items-center justify-center border border-gray-300 dark:border-gray-700 cursor-pointer text-xl transition-colors",
                      cellClass,
                      animationClass
                    )}
                    onClick={() => handleCellClick(x, y)}
                  >
                    {cellContent}
                  </div>
                );
              })
            )}
          </div>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Game Info</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Revealed:</span>{" "}
                  <Badge variant="outline">{gameState.revealedCount}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge>{gameState.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return renderGameContent();
}

export default Game;
