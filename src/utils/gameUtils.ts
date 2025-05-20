import { Cell, Player, PlayerRole, GameState, GameStatus } from "../types";

// Get the player role (human or gorilla) for the current player
export const getPlayerRole = (
  gameState: GameState,
  playerId: string | null
): PlayerRole | null => {
  if (!playerId) return null;
  const player = gameState.players.find((p) => p.id === playerId);
  return player ? player.role : null;
};

// Check if the current player is the gorilla
export const isPlayerGorilla = (
  gameState: GameState,
  playerId: string | null
): boolean => {
  return getPlayerRole(gameState, playerId) === PlayerRole.GORILLA;
};

// Check if the current player is the leader (first player)
export const isPlayerLeader = (
  gameState: GameState,
  playerId: string | null
): boolean => {
  if (!playerId || gameState.players.length === 0) return false;
  return gameState.players[0].id === playerId;
};

// Check if the player has already placed a mine
export const hasPlayerPlacedMine = (
  gameState: GameState,
  playerId: string | null
): boolean => {
  if (!playerId) return false;
  return gameState.minesPlaced.includes(playerId);
};

// Get the current player
export const getCurrentPlayer = (
  gameState: GameState,
  playerId: string | null
): Player | null => {
  if (!playerId) return null;
  return gameState.players.find((p) => p.id === playerId) || null;
};

// Format player name for display
export const formatPlayerName = (
  player: Player,
  isCurrentPlayer: boolean
): string => {
  let name = player.name;
  if (isCurrentPlayer) name += " (You)";
  if (player.role === PlayerRole.GORILLA) name += " 🦍";
  return name;
};

// Check if game is in mine placement phase
export const isMinePhase = (gameState: GameState): boolean => {
  return gameState.status === GameStatus.PLACING_MINES;
};

// Check if game is in playing phase
export const isPlayingPhase = (gameState: GameState): boolean => {
  return gameState.status === GameStatus.PLAYING;
};

// Calculate the remaining mines to be placed
export const getRemainingMines = (gameState: GameState): number => {
  const totalPlayers = gameState.players.length;
  const gorillaCount = 1; // Always 1 gorilla
  const totalHumans = totalPlayers - gorillaCount;
  return totalHumans - gameState.minesPlaced.length;
};
