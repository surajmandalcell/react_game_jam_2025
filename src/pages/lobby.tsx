import React, { useEffect, useState } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LobbyProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function Lobby({ gameState, myPlayerId }: LobbyProps) {
  const [roleAnimation, setRoleAnimation] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Gorilla vs Men - Lobby";
  }, []);

  if (!gameState || !myPlayerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => router.navigate(Route.HOME)}
            className="text-foreground"
          >
            ←
          </Button>
          <h2 className="text-2xl font-bold">Lobby</h2>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading game state...</p>
      </div>
    );
  }

  const playerIds = Object.keys(gameState.playerRoles);
  const isHost = playerIds.length > 0 && playerIds[0] === myPlayerId;
  const myRole = gameState.playerRoles[myPlayerId];
  const gorillaAssigned = !!gameState.gorillaPlayerId;
  const canBeGorilla =
    !gorillaAssigned || gameState.gorillaPlayerId === myPlayerId;

  const handleRoleSelection = (role: PlayerRole) => {
    if (role === myRole) return;

    if (role === PlayerRole.GORILLA && !canBeGorilla) {
      // Show animation indicating this role is already taken
      setRoleAnimation("shake");
      setTimeout(() => setRoleAnimation(null), 500);
      return;
    }

    try {
      setRoleAnimation(role === PlayerRole.GORILLA ? "gorilla" : "man");
      setTimeout(() => setRoleAnimation(null), 800);
      Rune.actions.assignRole(role);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleInvite = () => {
    try {
      // This would use the Rune API in the actual app
      Rune.showInvitePlayers();
    } catch (error) {
      // Fallback if the API isn't available in test environment
      alert("Invite functionality is handled in the Rune app");
    }
  };

  const handleStartGame = () => {
    try {
      Rune.actions.startGame();
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const getPlayerNameDisplay = (playerId: string) => {
    if (playerId === myPlayerId) {
      return "You";
    }
    // Only show first 4 characters of ID for privacy
    return `Player ${playerId.substring(0, 4)}`;
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-background w-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => router.navigate(Route.HOME)}
          className="text-foreground"
        >
          ←
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Game Lobby</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <Card className="flex-1 mb-4 max-h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            Players ({Object.keys(gameState.playerRoles).length}/{3})
            {isHost && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                HOST
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(gameState.playerRoles).map(([playerId, role]) => {
              const isMe = playerId === myPlayerId;
              const isGorilla = role === PlayerRole.GORILLA;

              return (
                <li
                  key={playerId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    isGorilla
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30",
                    isMe && "border-2 border-primary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isGorilla ? "🦍" : "👨"}</span>
                    <div>
                      <span className="font-medium">
                        {getPlayerNameDisplay(playerId)}
                        {isMe && (
                          <Badge variant="secondary" className="ml-2">
                            YOU
                          </Badge>
                        )}
                      </span>
                      <p className="text-xs text-muted-foreground">Ready</p>
                    </div>
                  </div>
                  <Badge variant={isGorilla ? "default" : "outline"}>
                    {role.toUpperCase()}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Choose Your Role</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={myRole}
            className={`grid grid-cols-2 gap-2 ${roleAnimation ? `animate-${roleAnimation}` : ""}`}
          >
            <ToggleGroupItem
              value={PlayerRole.MAN}
              aria-label="Man"
              className={cn(
                "flex flex-col items-center justify-center p-4 h-24",
                myRole === PlayerRole.MAN && "bg-blue-100 dark:bg-blue-900/30"
              )}
              onClick={() => handleRoleSelection(PlayerRole.MAN)}
            >
              <span className="text-3xl mb-2">👨</span>
              <span className="font-medium">Man</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={PlayerRole.GORILLA}
              aria-label="Gorilla"
              className={cn(
                "flex flex-col items-center justify-center p-4 h-24",
                myRole === PlayerRole.GORILLA &&
                  "bg-amber-100 dark:bg-amber-900/30",
                !canBeGorilla && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canBeGorilla}
              onClick={() => handleRoleSelection(PlayerRole.GORILLA)}
            >
              <span className="text-3xl mb-2">🦍</span>
              <span className="font-medium">Gorilla</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Gorilla</Badge>
              <span className="text-sm">Hunts for men by revealing cells</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Men</Badge>
              <span className="text-sm">Place mines to catch the gorilla</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full mb-2 text-foreground"
          onClick={handleInvite}
        >
          👥 Invite Players
        </Button>

        {isHost ? (
          <Button
            className="w-full"
            disabled={Object.keys(gameState.playerRoles).length < 2}
            onClick={handleStartGame}
          >
            🎮 Start Game
            {Object.keys(gameState.playerRoles).length < 2 && (
              <span className="ml-2 text-xs text-muted-foreground">
                Need more players
              </span>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-center p-2 border rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary mr-2"></div>
            <div className="text-sm animate-pulse text-foreground">
              Waiting for host to start game...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;
