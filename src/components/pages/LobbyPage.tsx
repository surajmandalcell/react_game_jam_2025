import React from "react";
import { GamePage, GameState, PlayerRole } from "../../types";
import { useSettings } from "../../context/SettingsContext";

interface LobbyPageProps {
  gameState: GameState;
  playerId: string | null;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ gameState, playerId }) => {
  const { settings } = useSettings();
  const isLeader = playerId === gameState.players[0]?.id;

  const handleStartGame = () => {
    if (gameState.players.length < 2) {
      alert("You need at least 2 players to start the game!");
      return;
    }

    // Ensure there's a gorilla assigned before starting
    if (!gameState.gorillaId) {
      const randomPlayer =
        gameState.players[Math.floor(Math.random() * gameState.players.length)];
      Rune.actions.assignGorilla(randomPlayer.id);
    }

    Rune.actions.startNewGame();
  };

  const handleAssignGorilla = (playerId: string) => {
    if (isLeader) {
      Rune.actions.assignGorilla(playerId);
    }
  };

  const handleGoBack = () => {
    Rune.actions.navigateTo(GamePage.HOME);
  };

  return (
    <div className={`page lobby-page ${settings.darkMode ? "dark-mode" : ""}`}>
      <h1 className="page-title">Game Lobby</h1>

      <div className="page-content">
        <div className="lobby-info">
          <p>
            {isLeader
              ? "You are the lobby leader. Assign the gorilla and start the game when ready."
              : "Waiting for the lobby leader to start the game..."}
          </p>
          <p>Players: {gameState.players.length}/6</p>
        </div>

        <div className="player-list">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`player-item ${player.role === PlayerRole.GORILLA ? "player-item-gorilla" : ""}`}
              onClick={() => handleAssignGorilla(player.id)}
            >
              <span>{player.name}</span>
              {player.role === PlayerRole.GORILLA && <span>🦍 Gorilla</span>}
              {player.id === playerId && <span> (You)</span>}
            </div>
          ))}
        </div>

        <div className="action-buttons">
          {isLeader && (
            <button className="btn btn-primary" onClick={handleStartGame}>
              Start Game
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
