import { GameState, PlayerRole } from "../logic";
import { Route, router } from "../router";
import { PlayerId } from "rune-sdk/multiplayer";
import React, { useEffect } from "react";

interface LobbyProps {
  gameState: GameState | null;
  myPlayerId: PlayerId | undefined;
}

export function Lobby({ gameState, myPlayerId }: LobbyProps) {
  useEffect(() => {
    document.title = "Gorilla vs Men - Lobby";
  }, []);

  if (!gameState || !myPlayerId) {
    return (
      <div>
        <div className="nav-bar">
          <button
            onClick={() => router.navigate(Route.HOME)}
            className="nav-button"
          >
            ←
          </button>
          <h2>Lobby</h2>
          <div></div>
        </div>
        <div>Loading game state...</div>
      </div>
    );
  }

  const playerIds = Object.keys(gameState.playerRoles);
  const isHost = playerIds.length > 0 && playerIds[0] === myPlayerId;
  const myRole = gameState.playerRoles[myPlayerId];

  const handleRoleSelection = (role: PlayerRole) => {
    try {
      Rune.actions.assignRole(role);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleInvite = () => {
    // Invite functionality would be handled in Rune app natively
    alert("Invite functionality is handled in the Rune app");
  };

  const handleStartGame = () => {
    try {
      Rune.actions.startGame();
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <button
          onClick={() => router.navigate(Route.HOME)}
          className="nav-button"
        >
          ←
        </button>
        <h2>Lobby</h2>
        <div></div>
      </div>

      <div className="lobby-container">
        <h3>Players ({Object.keys(gameState.playerRoles).length}/6)</h3>
        <ul className="player-list">
          {Object.entries(gameState.playerRoles).map(([playerId, role]) => {
            const isMe = playerId === myPlayerId;
            const roleClass =
              role === PlayerRole.MAN ? "player-man" : "player-gorilla";

            return (
              <li key={playerId} className={`player-item ${roleClass}`}>
                <span>
                  {isMe ? "You" : `Player ${playerId.substring(0, 4)}`}
                </span>
                <span>{role.toUpperCase()}</span>
              </li>
            );
          })}
        </ul>

        <div className="role-selection">
          <div
            className={`role-button man ${myRole === PlayerRole.MAN ? "selected" : ""}`}
            onClick={() => handleRoleSelection(PlayerRole.MAN)}
          >
            Man
          </div>
          <div
            className={`role-button gorilla ${myRole === PlayerRole.GORILLA ? "selected" : ""}`}
            onClick={() => handleRoleSelection(PlayerRole.GORILLA)}
          >
            Gorilla
          </div>
        </div>

        <div className="button-container">
          <button onClick={handleInvite} className="button">
            Invite Players
          </button>
          {isHost && (
            <button onClick={handleStartGame} className="button">
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lobby;
