import type { PlayerId, RuneClient } from "rune-sdk/multiplayer";

export const GRID_SIZE = 10;
export const TOTAL_MEN = 2;
export const TOTAL_PLAYERS = 3;
export const MINES_PER_PLAYER = 3;
export const MINE_PLACEMENT_TIME = 10;

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
  minePlacementEndTime?: number;
  randomMinesPlaced: Record<PlayerId, boolean>;
  lastTimerLogTime?: number;
  previousMinesToPlace?: Record<PlayerId, number>;
}

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
  debugGameState: () => void;
  fixMines: () => void;
  directPlaceMine: (params: {
    x: number;
    y: number;
    playerId: PlayerId;
  }) => void;
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
  const currentMinesToPlace = {};
  Object.keys(game.minesToPlace).forEach((key) => {
    currentMinesToPlace[key] = game.minesToPlace[key];
  });

  if (!game.previousMinesToPlace) {
    game.previousMinesToPlace = {};
  }

  const minesToPlaceChanged =
    JSON.stringify(currentMinesToPlace) !==
    JSON.stringify(game.previousMinesToPlace);

  if (minesToPlaceChanged) {
    console.log("Checking if all mines are placed:", currentMinesToPlace);
    game.previousMinesToPlace = JSON.parse(JSON.stringify(currentMinesToPlace));
  }

  for (const playerId in game.minesToPlace) {
    if (
      game.playerRoles[playerId] === PlayerRole.MAN &&
      game.minesToPlace[playerId] > 0
    ) {
      if (minesToPlaceChanged) {
        console.log(
          `Player ${playerId} still has ${game.minesToPlace[playerId]} mines to place`
        );
      }
      return false;
    }
  }

  if (minesToPlaceChanged) {
    console.log("All mines have been placed!");
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
  if (game.playerRoles[playerId] !== PlayerRole.MAN) {
    console.log(
      `Skipping random mine placement for player ${playerId}: not a MAN (role: ${game.playerRoles[playerId]})`
    );
    return;
  }

  const minesToPlace = game.minesToPlace[playerId];
  if (minesToPlace <= 0) return;

  console.log(
    `Starting to place ${minesToPlace} random mines for player ${playerId}`
  );

  const availableCells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!game.grid[y][x].hasMine) {
        availableCells.push({ x, y });
      }
    }
  }

  console.log(
    `Found ${availableCells.length} available cells for random mine placement`
  );

  for (let i = availableCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCells[i], availableCells[j]] = [
      availableCells[j],
      availableCells[i],
    ];
  }

  for (let i = 0; i < minesToPlace && i < availableCells.length; i++) {
    const { x, y } = availableCells[i];
    game.grid[y][x].hasMine = true;
    game.grid[y][x].mineOwnerId = playerId;
    console.log(`Placed random mine at (${x}, ${y}) for player ${playerId}`);
  }

  game.minesToPlace[playerId] = 0;
  game.randomMinesPlaced[playerId] = true;

  console.log(`Finished placing random mines for player ${playerId}`);
}

let lastTimerExpirationLog = 0;

function checkMinePlacementTimer(game: GameState, gameTime: number): void {
  if (game.status !== GameStatus.PLACING_MINES || !game.minePlacementEndTime)
    return;

  if (allMinesPlaced(game)) {
    console.log("All mines already placed, skipping timer check");
    return;
  }

  if (gameTime >= game.minePlacementEndTime) {
    const currentSecond = Math.floor(gameTime / 1000);
    if (!game.lastTimerLogTime || currentSecond > game.lastTimerLogTime) {
      console.log("Mine placement timer expired", {
        gameTime,
        minePlacementEndTime: game.minePlacementEndTime,
      });
      game.lastTimerLogTime = currentSecond;
    }

    for (const playerId in game.minesToPlace) {
      if (
        game.minesToPlace[playerId] > 0 &&
        game.playerRoles[playerId] === PlayerRole.MAN
      ) {
        console.log(
          `Placing random mines for player ${playerId} (${game.playerRoles[playerId]})`
        );
        placeRandomMines(game, playerId);
      }
    }

    if (allMinesPlaced(game)) {
      console.log("All mines placed, transitioning to PLAYING state");
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId ?? null;
      game.minePlacementEndTime = undefined;
    }
  }
}

function countNearbyMines(game: GameState, x: number, y: number): number {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        if (game.grid[ny][nx].hasMine) {
          count++;
        }
      }
    }
  }

  return count;
}

function floodFill(game: GameState, x: number, y: number): void {
  if (
    x < 0 ||
    x >= GRID_SIZE ||
    y < 0 ||
    y >= GRID_SIZE ||
    game.grid[y][x].revealed ||
    game.grid[y][x].hasMine
  ) {
    return;
  }

  game.grid[y][x].revealed = true;
  game.revealedCount++;

  const nearbyMines = countNearbyMines(game, x, y);
  if (nearbyMines === 0) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        floodFill(game, x + dx, y + dy);
      }
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
      previousMinesToPlace: undefined,
    };

    allPlayerIds.forEach((playerId) => {
      initialState.playerRoles[playerId] = PlayerRole.MAN;
      initialState.minesToPlace[playerId] = 0;
      initialState.randomMinesPlaced[playerId] = false;
    });

    console.log("Game initialized with state:", {
      playerRoles: initialState.playerRoles,
      minesToPlace: initialState.minesToPlace,
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
      console.log(`placeMine called by player ${playerId}`, {
        status: game.status,
        playerRole: game.playerRoles[playerId],
        minesToPlace: game.minesToPlace[playerId],
        params,
      });

      if (game.status !== GameStatus.PLACING_MINES) {
        console.log("Cannot place mine: game not in PLACING_MINES state");
        return;
      }
      if (game.playerRoles[playerId] !== PlayerRole.MAN) {
        console.log(
          `Cannot place mine: player is not a MAN (role: ${game.playerRoles[playerId]})`
        );
        return;
      }
      if (game.minesToPlace[playerId] <= 0) {
        console.log("Cannot place mine: player has no mines left to place");
        return;
      }

      const { x, y } = params;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        console.log("Cannot place mine: coordinates out of bounds");
        return;
      }
      if (game.grid[y][x].hasMine) {
        console.log("Cannot place mine: cell already has a mine");
        return;
      }

      game.grid[y][x].hasMine = true;
      game.grid[y][x].mineOwnerId = playerId;

      const currentMines = game.minesToPlace[playerId];
      game.minesToPlace[playerId] = currentMines - 1;

      console.log(`Mine placed at (${x},${y}) by player ${playerId}`, {
        remainingMines: game.minesToPlace[playerId],
        previousMines: currentMines,
      });

      if (game.minesToPlace[playerId] !== currentMines - 1) {
        console.error("CRITICAL ERROR: Failed to update minesToPlace!", {
          expected: currentMines - 1,
          actual: game.minesToPlace[playerId],
        });
      }

      if (allMinesPlaced(game)) {
        console.log(
          "All mines placed in placeMine action, transitioning to PLAYING"
        );
        game.status = GameStatus.PLAYING;
        game.currentTurn = game.gorillaPlayerId ?? null;
        console.log("Game state after transition:", {
          status: game.status,
          currentTurn: game.currentTurn,
        });
      }
    },

    revealCell: (params, { game, playerId }) => {
      if (game.status !== GameStatus.PLAYING) return;
      if (playerId !== game.gorillaPlayerId) return;

      const { x, y } = params;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
      if (game.grid[y][x].revealed) return;

      if (game.grid[y][x].hasMine) {
        game.grid[y][x].revealed = true;
        game.revealedCount++;

        game.status = GameStatus.ENDED;
        game.winner = game.grid[y][x].mineOwnerId ?? null;
        game.winningRole = PlayerRole.MAN;
      } else {
        floodFill(game, x, y);

        if (checkGorillaWin(game)) {
          game.status = GameStatus.ENDED;
          game.winner = game.gorillaPlayerId ?? null;
          game.winningRole = PlayerRole.GORILLA;
        }
      }
    },

    startGame: (_, { game }) => {
      if (game.status !== GameStatus.LOBBY) return;

      if (!game.gorillaPlayerId) {
        const playerIds = Object.keys(game.playerRoles);
        if (playerIds.length > 0) {
          const randomIndex = Math.floor(Math.random() * playerIds.length);
          const randomPlayerId = playerIds[randomIndex];
          game.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
          game.gorillaPlayerId = randomPlayerId as PlayerId;
        } else {
          return;
        }
      }

      for (const playerId in game.playerRoles) {
        if (game.playerRoles[playerId] === PlayerRole.MAN) {
          game.minesToPlace[playerId] = MINES_PER_PLAYER;
        } else {
          game.minesToPlace[playerId] = 0;
        }
        game.randomMinesPlaced[playerId] = false;
      }

      game.previousMinesToPlace = undefined;

      game.minePlacementEndTime = Rune.gameTime() + MINE_PLACEMENT_TIME * 1000;

      game.status = GameStatus.PLACING_MINES;

      console.log("Game started, mines initialized:", {
        playerRoles: game.playerRoles,
        minesToPlace: game.minesToPlace,
        gorillaPlayerId: game.gorillaPlayerId,
      });
    },

    restartGame: (_, { game }) => {
      if (game.status !== GameStatus.ENDED) return;

      game.status = GameStatus.LOBBY;
      game.grid = initializeGrid();
      game.revealedCount = 0;
      game.winner = null;
      game.winningRole = null;
      game.minePlacementEndTime = undefined;
      game.currentTurn = null;

      game.minesToPlace = {};

      for (const playerId in game.playerRoles) {
        game.minesToPlace[playerId] = 0;
        game.randomMinesPlaced[playerId] = false;
      }

      game.previousMinesToPlace = undefined;
    },

    forceStartPlaying: (_, { game }) => {
      console.log("🔥🔥🔥 forceStartPlaying CALLED 🔥🔥🔥", {
        currentStatus: game.status,
        timestamp: Rune.gameTime(),
      });

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

      for (const playerId in game.playerRoles) {
        if (
          game.playerRoles[playerId] === PlayerRole.MAN &&
          game.minesToPlace[playerId] > 0
        ) {
          console.log(`Placing random mines for player ${playerId}`);
          placeRandomMines(game, playerId);
        }
      }

      if (!game.gorillaPlayerId) {
        console.log("No gorilla player found, selecting one");
        const playerIds = Object.keys(game.playerRoles);
        if (playerIds.length > 0) {
          const randomIndex = Math.floor(Math.random() * playerIds.length);
          const randomPlayerId = playerIds[randomIndex] as PlayerId;
          game.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
          game.gorillaPlayerId = randomPlayerId;
          console.log(`Selected ${randomPlayerId} as gorilla`);
        }
      }

      console.log("🎮 FORCING GAME STATE TO PLAYING 🎮");
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId;

      game.minePlacementEndTime = undefined;

      console.log("forceStartPlaying completed", {
        afterStatus: game.status,
        minesToPlace: { ...game.minesToPlace },
        currentTurn: game.currentTurn,
      });

      if (game.status !== GameStatus.PLAYING) {
        console.error(
          "⚠️ CRITICAL ERROR: Game state not updated to PLAYING after forceStartPlaying!"
        );
      } else {
        console.log("✅ Game state successfully updated to PLAYING");
      }
    },

    debugGameState: (_, { game }) => {
      console.log("🔍 DEBUG GAME STATE 🔍", {
        status: game.status,
        minesToPlace: game.minesToPlace,
        allMinesPlaced: allMinesPlaced(game),
        gorillaPlayerId: game.gorillaPlayerId,
        currentTurn: game.currentTurn,
        timestamp: Rune.gameTime(),
      });

      if (game.status === GameStatus.PLACING_MINES && allMinesPlaced(game)) {
        console.log(
          "⚠️ Found issue: All mines placed but still in PLACING_MINES state. Fixing..."
        );
        game.status = GameStatus.PLAYING;
        game.currentTurn = game.gorillaPlayerId;
        game.minePlacementEndTime = undefined;
        console.log("✅ Fixed game state: Now in PLAYING state");
      }

      if (game.status === GameStatus.PLAYING && !game.currentTurn) {
        console.log(
          "⚠️ Found issue: In PLAYING state but currentTurn not set. Fixing..."
        );
        game.currentTurn = game.gorillaPlayerId;
        console.log("✅ Fixed game state: Set currentTurn to gorilla");
      }

      return {
        status: game.status,
        currentTurn: game.currentTurn,
        allMinesPlaced: allMinesPlaced(game),
      };
    },

    fixMines: (_, { game }) => {
      console.log(
        "🔧 Running fixMines action to check and fix mine placement issues"
      );

      const actualMinesPlaced: Record<PlayerId, number> = {};

      for (const playerId in game.playerRoles) {
        if (game.playerRoles[playerId] === PlayerRole.MAN) {
          actualMinesPlaced[playerId] = 0;
        }
      }

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cell = game.grid[y][x];
          if (cell.hasMine && cell.mineOwnerId) {
            if (actualMinesPlaced[cell.mineOwnerId] !== undefined) {
              actualMinesPlaced[cell.mineOwnerId]++;
            }
          }
        }
      }

      console.log("Actual mines placed in grid:", actualMinesPlaced);
      console.log("Mines to place according to game state:", game.minesToPlace);

      let fixedIssues = false;
      for (const playerId in actualMinesPlaced) {
        const actualMines = actualMinesPlaced[playerId];
        const expectedRemainingMines = Math.max(
          0,
          MINES_PER_PLAYER - actualMines
        );

        if (game.minesToPlace[playerId] !== expectedRemainingMines) {
          console.log(`Fixing mine count for player ${playerId}:`, {
            actualMinesPlaced: actualMines,
            currentMinesToPlace: game.minesToPlace[playerId],
            correctMinesToPlace: expectedRemainingMines,
          });

          game.minesToPlace[playerId] = expectedRemainingMines;
          fixedIssues = true;
        }
      }

      if (allMinesPlaced(game) && game.status === GameStatus.PLACING_MINES) {
        console.log("All mines are now placed, transitioning to PLAYING state");
        game.status = GameStatus.PLAYING;
        game.currentTurn = game.gorillaPlayerId;
        game.minePlacementEndTime = undefined;
        fixedIssues = true;
      }

      return {
        fixedIssues,
        actualMinesPlaced,
        minesToPlace: { ...game.minesToPlace },
        allMinesPlaced: allMinesPlaced(game),
      };
    },

    directPlaceMine: (params, { game, playerId }) => {
      const { x, y, playerId: targetPlayerId } = params;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        console.log("Cannot place mine: coordinates out of bounds");
        return;
      }
      if (game.grid[y][x].hasMine) {
        console.log("Cannot place mine: cell already has a mine");
        return;
      }

      game.grid[y][x].hasMine = true;
      game.grid[y][x].mineOwnerId = targetPlayerId;

      const currentMines = game.minesToPlace[targetPlayerId];
      game.minesToPlace[targetPlayerId] = currentMines - 1;

      console.log(
        `Mine placed at (${x},${y}) by player ${playerId} for player ${targetPlayerId}`,
        {
          remainingMines: game.minesToPlace[targetPlayerId],
          previousMines: currentMines,
        }
      );

      if (game.minesToPlace[targetPlayerId] !== currentMines - 1) {
        console.error("CRITICAL ERROR: Failed to update minesToPlace!", {
          expected: currentMines - 1,
          actual: game.minesToPlace[targetPlayerId],
        });
      }

      if (allMinesPlaced(game)) {
        console.log(
          "All mines placed in directPlaceMine action, transitioning to PLAYING"
        );
        game.status = GameStatus.PLAYING;
        game.currentTurn = game.gorillaPlayerId ?? null;
        console.log("Game state after transition:", {
          status: game.status,
          currentTurn: game.currentTurn,
        });
      }
    },
  },

  update: ({ game }) => {
    checkMinePlacementTimer(game, Rune.gameTime());

    if (game.status === GameStatus.PLACING_MINES && allMinesPlaced(game)) {
      console.log(
        "Update loop: All mines placed, transitioning to PLAYING state"
      );
      game.status = GameStatus.PLAYING;
      game.currentTurn = game.gorillaPlayerId ?? null;
      game.minePlacementEndTime = undefined;
    }

    const currentSecond = Math.floor(Rune.gameTime() / 1000);
    if (currentSecond % 2 === 0) {
      if (game.status === GameStatus.PLACING_MINES) {
        if (
          game.minePlacementEndTime &&
          Rune.gameTime() >= game.minePlacementEndTime + 2000
        ) {
          console.log("🔄 TIMER EXPIRED: Force placing mines for MAN players", {
            minesToPlace: { ...game.minesToPlace },
            playerRoles: { ...game.playerRoles },
          });

          for (const playerId in game.minesToPlace) {
            if (
              game.minesToPlace[playerId] > 0 &&
              game.playerRoles[playerId] === PlayerRole.MAN
            ) {
              console.log(
                `Forcing mine placement for player ${playerId} (role: ${game.playerRoles[playerId]})`
              );
              placeRandomMines(game, playerId);
            }
          }

          console.log(
            "🔄 FORCING transition to PLAYING state after timer expired",
            {
              minesToPlace: { ...game.minesToPlace },
              allMinesPlaced: allMinesPlaced(game),
            }
          );
          game.status = GameStatus.PLAYING;
          game.currentTurn = game.gorillaPlayerId;
          game.minePlacementEndTime = undefined;
        }
      }
    }
  },

  updatesPerSecond: 10,
});
