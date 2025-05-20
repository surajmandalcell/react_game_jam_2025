import type { PlayerId, RuneClient } from "rune-sdk/multiplayer";

export const GRID_SIZE = 10;
export const TOTAL_MEN = 20;
export const TOTAL_PLAYERS = 6;
export const MINES_PER_PLAYER = 1;

export enum PlayerRole {
  MAN = "man",
  GORILLA = "gorilla",
}

export enum GameStatus {
  LOBBY = "lobby",
  PLACING_MINES = "placing_mines",
  PLAYING = "playing",
  ENDED = "ended",
}

export interface Cell {
  revealed: boolean;
  hasMine: boolean;
  mineOwnerId?: PlayerId;
}

export interface GameState {
  status: GameStatus;
  playerRoles: Record<PlayerId, PlayerRole>;
  gorillaPlayerId?: PlayerId;
  grid: Cell[][];
  minesToPlace: Record<PlayerId, number>;
  currentTurn: PlayerId | null;
  winner: PlayerId | null;
  winningRole: PlayerRole | null;
  revealedCount: number;
}

// For placeMine and revealCell, we need to use objects to match Rune's expectations
export interface PlaceMineParams {
  x: number;
  y: number;
}

export interface RevealCellParams {
  x: number;
  y: number;
}

type GameActions = {
  assignRole: (params: PlayerRole) => void;
  placeMine: (params: PlaceMineParams) => void;
  revealCell: (params: RevealCellParams) => void;
  startGame: () => void;
  restartGame: () => void;
};

declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

function initializeGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({
        revealed: false,
        hasMine: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

function allMinesPlaced(game: GameState): boolean {
  for (const playerId in game.minesToPlace) {
    if (game.minesToPlace[playerId] > 0) {
      return false;
    }
  }
  return true;
}

function checkGorillaWin(game: GameState): boolean {
  const totalCells = GRID_SIZE * GRID_SIZE;
  const totalMines =
    Object.keys(game.playerRoles).filter(
      (id) => game.playerRoles[id] === PlayerRole.MAN
    ).length * MINES_PER_PLAYER;

  return game.revealedCount === totalCells - totalMines;
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: TOTAL_PLAYERS,
  setup: (allPlayerIds) => {
    const initialState: GameState = {
      status: GameStatus.LOBBY,
      playerRoles: {},
      grid: initializeGrid(),
      minesToPlace: {},
      currentTurn: null,
      winner: null,
      winningRole: null,
      revealedCount: 0,
    };

    allPlayerIds.forEach((playerId) => {
      initialState.playerRoles[playerId] = PlayerRole.MAN;
      initialState.minesToPlace[playerId] = MINES_PER_PLAYER;
    });

    return initialState;
  },

  actions: {
    assignRole: (role, { game, playerId }) => {
      if (game.status !== GameStatus.LOBBY) return;

      if (role === PlayerRole.GORILLA) {
        if (game.gorillaPlayerId && game.gorillaPlayerId !== playerId) {
          game.playerRoles[game.gorillaPlayerId] = PlayerRole.MAN;
        }
        game.gorillaPlayerId = playerId;
      }

      game.playerRoles[playerId] = role;
    },

    placeMine: (params, { game, playerId }) => {
      if (game.status !== GameStatus.PLACING_MINES) return;
      if (game.playerRoles[playerId] !== PlayerRole.MAN) return;
      if (game.minesToPlace[playerId] <= 0) return;

      const { x, y } = params;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
      if (game.grid[y][x].hasMine) return;

      game.grid[y][x].hasMine = true;
      game.grid[y][x].mineOwnerId = playerId;
      game.minesToPlace[playerId]--;

      if (allMinesPlaced(game)) {
        game.status = GameStatus.PLAYING;
        game.currentTurn = game.gorillaPlayerId ?? null;
      }
    },

    revealCell: (params, { game, playerId }) => {
      if (game.status !== GameStatus.PLAYING) return;
      if (playerId !== game.gorillaPlayerId) return;

      const { x, y } = params;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
      if (game.grid[y][x].revealed) return;

      game.grid[y][x].revealed = true;
      game.revealedCount++;

      if (game.grid[y][x].hasMine) {
        game.status = GameStatus.ENDED;
        game.winner = game.grid[y][x].mineOwnerId ?? null;
        game.winningRole = PlayerRole.MAN;
      } else if (checkGorillaWin(game)) {
        game.status = GameStatus.ENDED;
        game.winner = game.gorillaPlayerId ?? null;
        game.winningRole = PlayerRole.GORILLA;
      }
    },

    startGame: (_, { game }) => {
      if (game.status !== GameStatus.LOBBY) return;

      if (!game.gorillaPlayerId) {
        const playerIds = Object.keys(game.playerRoles);
        if (playerIds.length > 0) {
          const randomPlayerId =
            playerIds[Math.floor(Math.random() * playerIds.length)];
          game.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
          game.gorillaPlayerId = randomPlayerId as PlayerId;
        }
      }

      game.status = GameStatus.PLACING_MINES;
    },

    restartGame: (_, { game }) => {
      if (game.status !== GameStatus.ENDED) return;

      game.status = GameStatus.LOBBY;
      game.grid = initializeGrid();
      game.revealedCount = 0;
      game.winner = null;
      game.winningRole = null;

      for (const playerId in game.playerRoles) {
        if (game.playerRoles[playerId] === PlayerRole.MAN) {
          game.minesToPlace[playerId] = MINES_PER_PLAYER;
        } else {
          game.minesToPlace[playerId] = 0;
        }
      }
    },
  },
});
