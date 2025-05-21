import React, { useEffect } from "react";
import { GameState, PlayerRole } from "../logic";
import { Route, router } from "../router";
import { PlayerId } from "rune-sdk/multiplayer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EndProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function End({ gameState, myPlayerId }: EndProps) {
  useEffect(() => {
    document.title = "Gorilla vs Men - Game Over";
  }, []);

  if (!gameState || !myPlayerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading game state...</p>
      </div>
    );
  }

  const handlePlayAgain = () => {
    try {
      Rune.actions.restartGame();
    } catch (error) {
      console.error("Error restarting game:", error);
    }
  };

  const myRole = gameState.playerRoles[myPlayerId];
  const isWinner = gameState.winner === myPlayerId;
  const isGorilla = myRole === PlayerRole.GORILLA;
  const gorillaWon = gameState.winningRole === PlayerRole.GORILLA;
  const manWon = gameState.winningRole === PlayerRole.MAN;

  const getPlayerNameDisplay = (playerId: string) => {
    if (playerId === myPlayerId) {
      return "You";
    }
    // Only show first 4 characters of ID for privacy
    return `Player ${playerId.substring(0, 4)}`;
  };

  const getWinnerMessage = () => {
    if (!gameState.winner) {
      return "It's a tie!";
    }

    if (isWinner) {
      return "You won!";
    } else {
      return `${getPlayerNameDisplay(gameState.winner)} won!`;
    }
  };

  const getWinDescription = () => {
    if (gorillaWon) {
      return "The gorilla successfully revealed all safe cells!";
    } else if (manWon) {
      return "The gorilla stepped on a mine!";
    } else {
      return "The game ended in a tie.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h2
              className={cn(
                "text-3xl font-bold mb-2",
                isWinner
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {getWinnerMessage()}
            </h2>
            <p className="text-muted-foreground">{getWinDescription()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div
              className={cn(
                "p-4 rounded-lg text-center",
                gorillaWon
                  ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <div className="text-4xl mb-2">🦍</div>
              <h3 className="font-medium">Gorilla</h3>
              <Badge
                variant={gorillaWon ? "default" : "outline"}
                className="mt-1"
              >
                {gorillaWon ? "WINNER" : "LOST"}
              </Badge>
            </div>

            <div
              className={cn(
                "p-4 rounded-lg text-center",
                manWon
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <div className="text-4xl mb-2">👨</div>
              <h3 className="font-medium">Men</h3>
              <Badge variant={manWon ? "default" : "outline"} className="mt-1">
                {manWon ? "WINNER" : "LOST"}
              </Badge>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              {isWinner
                ? "Congratulations on your victory!"
                : "Better luck next time!"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.navigate(Route.HOME)}>
            Home
          </Button>
          <Button onClick={handlePlayAgain}>Play Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default End;
