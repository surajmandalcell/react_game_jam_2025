import React, { useEffect, useState } from "react";
import { GameState, PlayerRole } from "../logic";
import { Route, router } from "../router";
import { PlayerId } from "rune-sdk/multiplayer";

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
      <div className="loading-container">
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
        <div className="loading-spinner"></div>
        <p>Loading game state...</p>
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
    <div className="lobby-page">
      <div className="nav-bar">
        <button
          onClick={() => router.navigate(Route.HOME)}
          className="nav-button"
        >
          ←
        </button>
        <h2>Game Lobby</h2>
        <div></div>
      </div>

      <div className="lobby-container">
        <div className="lobby-header">
          <h3>Players ({Object.keys(gameState.playerRoles).length}/6)</h3>
          {isHost && <div className="host-badge floating">HOST</div>}
        </div>

        <ul className="player-list">
          {Object.entries(gameState.playerRoles).map(([playerId, role]) => {
            const isMe = playerId === myPlayerId;
            const isGorilla = role === PlayerRole.GORILLA;
            const roleClass = isGorilla ? "player-gorilla" : "player-man";

            return (
              <li
                key={playerId}
                className={`player-item ${roleClass} ${isMe ? "is-me" : ""}`}
              >
                <div className="player-info">
                  <span className="player-name">
                    {getPlayerNameDisplay(playerId)}
                    {isMe && <span className="player-you-tag">YOU</span>}
                  </span>
                  <span className="player-status">Ready</span>
                </div>
                <span className="player-role">{role.toUpperCase()}</span>
              </li>
            );
          })}
        </ul>

        <div className="role-selection-container">
          <div
            className={`role-selection ${roleAnimation ? `animate-${roleAnimation}` : ""}`}
          >
            <div
              className={`role-button man ${myRole === PlayerRole.MAN ? "selected" : ""}`}
              onClick={() => handleRoleSelection(PlayerRole.MAN)}
            >
              <div className="role-icon">👨</div>
              <div className="role-name">Man</div>
            </div>
            <div
              className={`role-button gorilla ${myRole === PlayerRole.GORILLA ? "selected" : ""} ${!canBeGorilla ? "disabled" : ""} ${!canBeGorilla ? "bg-gray-500" : ""}`}
              onClick={() => handleRoleSelection(PlayerRole.GORILLA)}
            >
              <div className="role-icon">🦍</div>
              <div className="role-name">Gorilla</div>
            </div>
          </div>
        </div>

        <div className="lobby-info">
          <div className="lobby-info-item">
            <span className="info-label">Gorilla</span>
            <span className="info-value">
              {" "}
              Hunts for men by revealing cells
            </span>
          </div>
          <div className="lobby-info-item">
            <span className="info-label">Men</span>
            <span className="info-value">Place mines to catch the gorilla</span>
          </div>
        </div>

        <div className="button-container">
          <button onClick={handleInvite} className="button">
            <span className="button-icon">👥</span> Invite Players
          </button>
          {isHost && (
            <button
              onClick={handleStartGame}
              className={`button ${Object.keys(gameState.playerRoles).length > 1 ? "" : "disabled"}`}
              disabled={Object.keys(gameState.playerRoles).length <= 1}
            >
              <span className="button-icon">🎮</span> Start Game
              {Object.keys(gameState.playerRoles).length <= 1 && (
                <span className="button-hint">Need more players</span>
              )}
            </button>
          )}
          {!isHost && (
            <div className="waiting-host">
              <div className="waiting-spinner"></div>
              <div className="waiting-text pulsing-text">
                Waiting for host to start game...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lobby;
