import React, { useEffect, useState } from "react";
import {
  GameState,
  GameStatus,
  PlayerRole,
  GRID_SIZE,
  MINES_PER_PLAYER,
  Cell,
} from "../logic";
import { PlayerId } from "rune-sdk/multiplayer";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Target, Bomb, Crosshair } from "lucide-react";
import { Route, router } from "../router";

// Add a declaration for the Rune global object for our hack
declare global {
  interface Window {
    Rune: any;
  }
}

// Function to count nearby mines for a cell
function countNearbyMines(grid: Cell[][], x: number, y: number): number {
  let count = 0;

  // Check all 8 adjacent cells
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself

      const nx = x + dx;
      const ny = y + dy;

      // Check if adjacent cell is within grid bounds
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        if (grid[ny][nx].hasMine) {
          count++;
        }
      }
    }
  }

  return count;
}

// Component to display number of nearby mines
interface MineCounterProps {
  x: number;
  y: number;
  gameState: GameState;
}

function MineCounter({ x, y, gameState }: MineCounterProps) {
  const count = countNearbyMines(gameState.grid, x, y);

  if (count === 0) {
    return null; // Don't display anything for cells with no nearby mines
  }

  // Colors for different mine counts
  const colors = {
    1: "text-blue-600",
    2: "text-green-600",
    3: "text-red-600",
    4: "text-purple-800",
    5: "text-amber-700",
    6: "text-cyan-600",
    7: "text-black",
    8: "text-gray-600",
  };

  return (
    <span
      className={`font-bold ${colors[count as keyof typeof colors] || "text-black"}`}
    >
      {count}
    </span>
  );
}

// SVG patterns for cells
const grassPattern = (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0"
  >
    <defs>
      <pattern
        id="grass"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path d="M0,0 L20,0 L20,20 L0,20 Z" fill="#4ade80" />
        <path d="M0,0 L5,0 L5,5 L0,5 Z" fill="#22c55e" />
        <path d="M10,10 L15,10 L15,15 L10,15 Z" fill="#22c55e" />
        <path d="M5,15 L10,15 L10,20 L5,20 Z" fill="#22c55e" />
        <path d="M15,5 L20,5 L20,10 L15,10 Z" fill="#22c55e" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grass)" />
  </svg>
);

const dirtPattern = (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0"
  >
    <defs>
      <pattern
        id="dirt"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <rect width="20" height="20" fill="#92400e" />
        <circle cx="5" cy="5" r="1" fill="#78350f" />
        <circle cx="15" cy="15" r="1" fill="#78350f" />
        <circle cx="10" cy="10" r="1" fill="#78350f" />
        <circle cx="15" cy="5" r="1" fill="#78350f" />
        <circle cx="5" cy="15" r="1" fill="#78350f" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dirt)" />
  </svg>
);

interface GameProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

// Helper function to format game status for display
const formatGameStatus = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.LOBBY:
      return "Lobby";
    case GameStatus.PLACING_MINES:
      return "Placing Mines";
    case GameStatus.PLAYING:
      return "Playing";
    case GameStatus.ENDED:
      return "Game Over";
    default:
      return status;
  }
};

export function Game({ gameState, myPlayerId }: GameProps) {
  const [animation, setAnimation] = useState<{
    x: number;
    y: number;
    type: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [allMinesPlaced, setAllMinesPlaced] = useState<boolean>(false);
  const [showStartedMessage, setShowStartedMessage] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Gorilla vs Men - Game";
  }, []);

  // Log game state changes
  useEffect(() => {
    if (gameState) {
      console.log("Game state updated:", {
        status: gameState.status,
        minesToPlace: gameState.minesToPlace,
        allMinesPlaced: Object.values(gameState.minesToPlace).every(
          (mines) => mines === 0
        ),
        gorillaPlayerId: gameState.gorillaPlayerId,
        currentTurn: gameState.currentTurn,
        timestamp: Rune.gameTime(),
      });

      // Show a message when transitioning to playing state
      if (gameState.status === GameStatus.PLAYING) {
        console.log("GAME IS NOW IN PLAYING STATE!");
        setShowStartedMessage(true);
        setTimeout(() => setShowStartedMessage(false), 3000);
      }
    }
  }, [gameState?.status, gameState?.minesToPlace]);

  // Check if all mines are placed
  useEffect(() => {
    if (!gameState) return;

    // Check if all players have placed their mines
    const allPlaced = Object.values(gameState.minesToPlace).every(
      (mines) => mines === 0
    );
    console.log("Checking allMinesPlaced in UI:", {
      allPlaced,
      minesToPlace: gameState.minesToPlace,
    });
    setAllMinesPlaced(allPlaced);
  }, [gameState?.minesToPlace]);

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
      const now = Rune.gameTime();
      const endTime = gameState.minePlacementEndTime || 0;
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 500); // Update more frequently for smoother countdown

    return () => clearInterval(timerId);
  }, [gameState?.status, gameState?.minePlacementEndTime]);

  if (!gameState || !myPlayerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-background to-muted">
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
        Math.floor((gameState.minePlacementEndTime - Rune.gameTime()) / 1000)
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
        console.log(`Attempting to place mine at (${x}, ${y})`);
        try {
          // Store the current mines to place value
          const beforeMinesToPlace = gameState.minesToPlace[myPlayerId];

          // Call the action
          Rune.actions.placeMine({ x, y });

          // Set animation
          setAnimation({ x, y, type: "mine-placed" });
          setTimeout(() => setAnimation(null), 800);

          // Check if the action was successful after a short delay
          setTimeout(() => {
            const afterMinesToPlace = gameState.minesToPlace[myPlayerId];
            console.log("Mine placement check:", {
              beforeMinesToPlace,
              afterMinesToPlace,
              changed: beforeMinesToPlace !== afterMinesToPlace,
            });

            // If the value didn't change, try again
            if (beforeMinesToPlace === afterMinesToPlace) {
              console.log("Mine placement didn't register, trying again");
              try {
                Rune.actions.placeMine({ x, y });
              } catch (error) {
                console.error("Error in second mine placement attempt:", error);
              }
            }
          }, 300);
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
          setTimeout(() => setAnimation(null), 800);
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

  const renderTimer = () => {
    if (
      gameState.status !== GameStatus.PLACING_MINES ||
      !gameState.minePlacementEndTime
    ) {
      return null;
    }

    // Calculate percentage for circular timer
    const maxTime = 10; // 10 seconds total
    const remainingPercentage = (timeLeft / maxTime) * 100;
    const circumference = 2 * Math.PI * 16; // 2πr where r=16
    const dashOffset = ((100 - remainingPercentage) / 100) * circumference;
    const urgentTime = timeLeft <= 3;

    return (
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground opacity-20"
            strokeWidth="2"
          />
          {/* Timer progress */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            className={`${urgentTime ? "text-red-500 animate-pulse" : "text-primary"}`}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xl font-bold ${urgentTime ? "text-red-500 animate-pulse" : "text-foreground"}`}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    );
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
          <div className="relative mb-8 mt-4">
            <Alert className="mb-4 border-blue-500 bg-blue-500/10">
              <div className="flex items-center justify-between">
                <AlertTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Target className="h-5 w-5" />
                  <span>Place your mines!</span>
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                Click on the grid to place mines. If you don't place all mines
                in time, they will be placed randomly.
              </AlertDescription>
            </Alert>
            <Badge className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-1 text-lg">
              {minesToPlace} mines left
            </Badge>
          </div>
        );
      } else {
        // For gorilla, check if all mines are placed and show appropriate message
        return (
          <Alert className="mb-4 mt-4 border-amber-500 bg-amber-500/10 py-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-600 dark:text-amber-400">
                {allMinesPlaced
                  ? "All mines placed!"
                  : "Men are placing their mines"}
              </AlertTitle>
            </div>
            <AlertDescription className="">
              {allMinesPlaced
                ? "Game will start shortly..."
                : "Wait for men to place their mines."}
            </AlertDescription>
            {allMinesPlaced && isGorilla && (
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <Button
                  onClick={() => {
                    console.log(
                      "Force start playing button clicked - FUCKING START THE GAME ALREADY!"
                    );
                    // Try multiple times with increasing delays to ensure the action gets through
                    try {
                      Rune.actions.forceStartPlaying();
                      console.log(
                        "forceStartPlaying action called immediately"
                      );
                    } catch (error) {
                      console.error(
                        "Error calling forceStartPlaying (1st attempt):",
                        error
                      );
                    }

                    setTimeout(() => {
                      try {
                        console.log(
                          "Trying forceStartPlaying again after 100ms"
                        );
                        Rune.actions.forceStartPlaying();
                      } catch (error) {
                        console.error(
                          "Error calling forceStartPlaying (2nd attempt):",
                          error
                        );
                      }
                    }, 100);

                    setTimeout(() => {
                      try {
                        console.log(
                          "Trying forceStartPlaying again after 500ms"
                        );
                        Rune.actions.forceStartPlaying();
                      } catch (error) {
                        console.error(
                          "Error calling forceStartPlaying (3rd attempt):",
                          error
                        );
                      }
                    }, 500);
                  }}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 animate-pulse"
                >
                  Start Hunting!
                </Button>

                <Button
                  onClick={() => {
                    console.log("Debug button clicked");
                    try {
                      Rune.actions.debugGameState();
                    } catch (error) {
                      console.error("Error calling debugGameState:", error);
                    }
                  }}
                  variant="outline"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Debug
                </Button>

                <Button
                  onClick={() => {
                    console.log("Fix Mines button clicked");
                    try {
                      Rune.actions.fixMines();
                    } catch (error) {
                      console.error("Error calling fixMines:", error);
                    }
                  }}
                  variant="outline"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Fix Mines
                </Button>

                {gameState.status === GameStatus.PLACING_MINES &&
                  minesToPlace > 0 && (
                    <Button
                      onClick={() => {
                        console.log("Direct place mines button clicked");
                        try {
                          // Find empty cells to place mines
                          const emptyCells: Array<{ x: number; y: number }> =
                            [];
                          for (let y = 0; y < GRID_SIZE; y++) {
                            for (let x = 0; x < GRID_SIZE; x++) {
                              if (!gameState.grid[y][x].hasMine) {
                                emptyCells.push({ x, y });
                              }
                            }
                          }

                          console.log(
                            `Found ${emptyCells.length} empty cells for mine placement`
                          );

                          // Shuffle the empty cells
                          const shuffled = [...emptyCells].sort(
                            () => 0.5 - Math.random()
                          );

                          // Place mines directly
                          const minesToPlace =
                            gameState.minesToPlace[myPlayerId];
                          console.log(
                            `Placing ${minesToPlace} mines for player ${myPlayerId}`
                          );

                          for (
                            let i = 0;
                            i < minesToPlace && i < shuffled.length;
                            i++
                          ) {
                            const { x, y } = shuffled[i];
                            console.log(
                              `Directly placing mine at (${x}, ${y})`
                            );
                            Rune.actions.directPlaceMine({
                              x,
                              y,
                              playerId: myPlayerId,
                            });
                          }

                          // Check if this completes all mine placement
                          setTimeout(() => {
                            if (allMinesPlaced) {
                              console.log(
                                "All mines placed, forcing game to start"
                              );
                              Rune.actions.forceStartPlaying();
                            }
                          }, 500);
                        } catch (error) {
                          console.error("Error directly placing mines:", error);
                        }
                      }}
                      variant="outline"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Place All Mines
                    </Button>
                  )}

                {/* Emergency button to directly hack the game state */}
                <Button
                  onClick={() => {
                    console.log(
                      "🚨 EMERGENCY: Directly hacking game state to PLAYING"
                    );
                    try {
                      // This is a hack to directly modify the game state
                      // It's not recommended in normal circumstances
                      const hackGame = () => {
                        if (window.Rune && window.Rune._game) {
                          // @ts-ignore - Accessing private API
                          const gameState = window.Rune._game;
                          if (gameState.status === GameStatus.PLACING_MINES) {
                            gameState.status = GameStatus.PLAYING;
                            gameState.currentTurn = gameState.gorillaPlayerId;
                            console.log("✅ Hacked game state to PLAYING");
                          }
                        }
                      };

                      // Try to hack the game state
                      hackGame();

                      // Also try the normal action
                      Rune.actions.forceStartPlaying();
                    } catch (error) {
                      console.error("Error hacking game state:", error);
                    }
                  }}
                  variant="outline"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  EMERGENCY
                </Button>
              </div>
            )}
          </Alert>
        );
      }
    } else if (gameState.status === GameStatus.PLAYING) {
      if (isMyTurn) {
        return (
          <Alert className="mb-4 mt-4 border-green-500 bg-green-500/10">
            <div className="flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-green-600 dark:text-green-400 animate-pulse" />
              <AlertTitle className="text-green-600 dark:text-green-400 text-lg">
                Your turn! Hunt for men!
              </AlertTitle>
            </div>
            <AlertDescription className="">
              Click on cells to reveal them. Avoid mines! Find all safe cells to
              win.
            </AlertDescription>
          </Alert>
        );
      } else {
        return (
          <Alert className="mb-4 mt-4 border-gray-500 bg-gray-500/10">
            <AlertTitle>Waiting for Gorilla</AlertTitle>
            <AlertDescription>
              {gameState.currentTurn
                ? `The Gorilla is hunting! Stay hidden!`
                : "Waiting for Gorilla to make a move"}
            </AlertDescription>
          </Alert>
        );
      }
    }

    return null;
  };

  const renderGameContent = () => {
    const isPlacingMines = gameState.status === GameStatus.PLACING_MINES;
    const isPlaying = gameState.status === GameStatus.PLAYING;

    // Determine title emoji based on player role
    const titleEmoji = isGorilla ? "🦍" : "👨";
    const titleText = isGorilla ? "Gorilla" : "Man";

    return (
      <div className="flex flex-col h-screen p-4 bg-gradient-to-b from-background to-muted/50 w-full">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Rune.actions.restartGame();
              router.navigate(Route.HOME);
            }}
            className="flex items-center gap-1 text-foreground hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{titleEmoji}</span>
            <h1 className="text-xl font-bold text-foreground">{titleText}</h1>
          </div>
          <div className="w-20 flex justify-end">{renderTimer()}</div>
        </div>

        {showStartedMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-bounce">
            Game started! {isGorilla ? "Hunt for men!" : "Gorilla is hunting!"}
          </div>
        )}

        <div className="flex-grow flex flex-col items-center justify-center">
          {renderGameStatus()}

          <div className="flex-1 grid grid-cols-10 gap-0.5 mb-4 max-w-md mx-auto w-full min-w-full">
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const cell = gameState.grid[y][x];
                const isAnimating = animation?.x === x && animation?.y === y;

                let cellClass = "relative overflow-hidden";

                // Base class based on game state
                if (isPlacingMines) {
                  cellClass += " bg-amber-900"; // Dirt background for placing mines
                } else if (isPlaying && !cell.revealed) {
                  cellClass += " bg-green-600"; // Grass background for playing (all unrevealed cells)
                } else {
                  cellClass += " bg-gray-200 dark:bg-gray-800";
                }

                if (cell.revealed) {
                  cellClass = "bg-gray-100 dark:bg-gray-700";
                  if (cell.hasMine) {
                    cellClass = "bg-red-300 dark:bg-red-900 animate-bounce";
                  }
                } else if (
                  isPlacingMines &&
                  myRole === PlayerRole.MAN &&
                  cell.hasMine &&
                  cell.mineOwnerId === myPlayerId
                ) {
                  // Show my mines during placement phase with special styling
                  cellClass =
                    "bg-blue-200 dark:bg-blue-900 relative overflow-hidden";
                }

                if (isAnimating) {
                  if (animation?.type === "mine-placed") {
                    cellClass += " animate-ping-once";
                  } else if (animation?.type === "explosion") {
                    cellClass += " animate-explosion";
                  } else if (animation?.type === "reveal") {
                    cellClass += " animate-reveal";
                  }
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className={cn(
                      "w-full aspect-square flex items-center justify-center border border-gray-300/50 dark:border-gray-700/50 cursor-pointer text-xl transition-all shadow-sm hover:shadow-md relative overflow-hidden",
                      cellClass
                    )}
                    onClick={() => handleCellClick(x, y)}
                  >
                    {/* Show grass pattern on all unrevealed cells during PLAYING state */}
                    {!cell.revealed && isPlaying && grassPattern}
                    {/* Show dirt pattern during PLACING_MINES state */}
                    {!cell.revealed && isPlacingMines && dirtPattern}
                    <span className="z-10 relative">
                      {/* Show mines during placement phase for the mine owner */}
                      {cell.revealed && cell.hasMine && "💣"}
                      {!cell.revealed &&
                        cell.hasMine &&
                        cell.mineOwnerId === myPlayerId &&
                        myRole === PlayerRole.MAN &&
                        "💣"}
                      {/* Show number of nearby mines for revealed cells */}
                      {cell.revealed && !cell.hasMine && (
                        <MineCounter x={x} y={y} gameState={gameState} />
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary min-w-full">
            <CardHeader className="py-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Game Progress</span>
                <div className="flex items-center gap-2">
                  <Bomb className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">
                    {Object.values(gameState.playerRoles).filter(
                      (role) => role === PlayerRole.MAN
                    ).length * MINES_PER_PLAYER}{" "}
                    mines total
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${revealedPercentage}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                <div>
                  <span className="text-muted-foreground">Revealed:</span>{" "}
                  <Badge variant="outline" className="ml-1">
                    {gameState.revealedCount}
                  </Badge>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge className="ml-1 bg-primary">
                    {formatGameStatus(gameState.status)}
                  </Badge>
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
