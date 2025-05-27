import type { PlayerId, RuneClient } from "rune-sdk/multiplayer";

export const GRID_SIZE = 10;
export const TOTAL_MEN = 2;
export const TOTAL_PLAYERS = 3;
export const MINES_PER_PLAYER = 3;
export const MINE_PLACEMENT_TIME = 10; // 10 seconds to place mines

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
  minePlacementEndTime?: number; // Timestamp when mine placement should end
  randomMinesPlaced: Record<PlayerId, boolean>; // Track if random mines were placed for a player
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
  forceStartPlaying: () => void;
};

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

function placeRandomMines(game: GameState, playerId: PlayerId): void {
  const minesToPlace = game.minesToPlace[playerId];
  if (minesToPlace <= 0) return;

  // Create a list of all available cells
  const availableCells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!game.grid[y][x].hasMine) {
        availableCells.push({ x, y });
      }
    }
  }

  // Shuffle the available cells using random()
  for (let i = availableCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCells[i], availableCells[j]] = [
      availableCells[j],
      availableCells[i],
    ];
  }

  // Place mines randomly
  for (let i = 0; i < minesToPlace && i < availableCells.length; i++) {
    const { x, y } = availableCells[i];
    game.grid[y][x].hasMine = true;
    game.grid[y][x].mineOwnerId = playerId;
  }

  // Mark all mines as placed for this player
  game.minesToPlace[playerId] = 0;
  game.randomMinesPlaced[playerId] = true;
}

function checkMinePlacementTimer(game: GameState, gameTime: number): void {
  // Don't do anything if we're not in PLACING_MINES state or if there's no timer set
  if (game.status !== GameStatus.PLACING_MINES || !game.minePlacementEndTime)
    return;

  // Don't do anything if all mines are already placed
  if (allMinesPlaced(game)) {
    console.log("All mines already placed, skipping timer check");
    return;
  }

  if (gameTime >= game.minePlacementEndTime) {
    console.log("Mine placement timer expired", {
      gameTime,
      minePlacementEndTime: game.minePlacementEndTime,
    });

    // Time's up! Place random mines for any players who haven't placed all their mines
    for (const playerId in game.playerRoles) {
      if (
        game.playerRoles[playerId] === PlayerRole.MAN &&
        game.minesToPlace[playerId] > 0
      ) {
        placeRandomMines(game, playerId);
      }
    }

    // Move to playing state if all mines are placed
    if (allMinesPlaced(game)) {
      console.log("All mines placed, transitioning to PLAYING state");
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId ?? null;
      // Clear the timer
      game.minePlacementEndTime = undefined;
    }
  }
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
      minePlacementEndTime: undefined,
      randomMinesPlaced: {},
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

      // Make sure we have at least one gorilla
      if (!game.gorillaPlayerId) {
        const playerIds = Object.keys(game.playerRoles);
        if (playerIds.length > 0) {
          // Randomly assign a gorilla if none was selected
          const randomIndex = Math.floor(Math.random() * playerIds.length);
          const randomPlayerId = playerIds[randomIndex];
          game.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
          game.gorillaPlayerId = randomPlayerId as PlayerId;
        } else {
          // No players available
          return;
        }
      }

      // Initialize mines to place for each player
      for (const playerId in game.playerRoles) {
        if (game.playerRoles[playerId] === PlayerRole.MAN) {
          game.minesToPlace[playerId] = MINES_PER_PLAYER;
          game.randomMinesPlaced[playerId] = false;
        }
      }

      // Set the end time for mine placement
      game.minePlacementEndTime = Rune.gameTime() + MINE_PLACEMENT_TIME * 1000;

      // Change game state to placing mines
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

    forceStartPlaying: (_, { game }) => {
      if (game.status !== GameStatus.PLACING_MINES) {
        console.log(
          "forceStartPlaying called but game is not in PLACING_MINES state:",
          game.status
        );
        return;
      }

      console.log("forceStartPlaying action triggered", {
        beforeStatus: game.status,
        minesToPlace: { ...game.minesToPlace },
        gorillaPlayerId: game.gorillaPlayerId,
      });

      // Place random mines for any players who haven't placed all their mines
      for (const playerId in game.playerRoles) {
        if (
          game.playerRoles[playerId] === PlayerRole.MAN &&
          game.minesToPlace[playerId] > 0
        ) {
          placeRandomMines(game, playerId);
        }
      }

      // Make sure we have a gorilla player
      if (!game.gorillaPlayerId) {
        console.log("No gorilla player found, selecting one");
        const playerIds = Object.keys(game.playerRoles);
        if (playerIds.length > 0) {
          const randomIndex = Math.floor(Math.random() * playerIds.length);
          const randomPlayerId = playerIds[randomIndex] as PlayerId;
          game.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
          game.gorillaPlayerId = randomPlayerId;
        }
      }

      // Force transition to playing state
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId;

      // Clear the mine placement timer
      game.minePlacementEndTime = undefined;

      console.log("forceStartPlaying completed", {
        afterStatus: game.status,
        minesToPlace: { ...game.minesToPlace },
        currentTurn: game.currentTurn,
      });
    },
  },

  update: ({ game }) => {
    checkMinePlacementTimer(game, Rune.gameTime());

    // Additional check to ensure game transitions to PLAYING if all mines are placed
    if (game.status === GameStatus.PLACING_MINES && allMinesPlaced(game)) {
      console.log(
        "Update loop: All mines placed, transitioning to PLAYING state"
      );
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId ?? null;
      game.minePlacementEndTime = undefined;
    }
  },

  updatesPerSecond: 10,
});
