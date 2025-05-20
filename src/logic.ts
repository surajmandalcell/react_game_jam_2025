import type { PlayerId, RuneClient } from "rune-sdk/multiplayer";
import { 
  GameState, 
  GamePage, 
  GameStatus, 
  PlayerRole, 
  GameResult,
  Cell
} from "./types";

// Game constants
const GRID_SIZE = 10;
const TOTAL_MINES = 5;

// Define access to the Rune platform APIs
declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

// Actions that players can apply to game state
type GameActions = {
  navigateTo: (page: GamePage) => void;
  assignGorilla: (playerId: PlayerId) => void;
  placeMine: (coords: { x: number, y: number }) => void;
  revealCell: (coords: { x: number, y: number }) => void;
  startNewGame: () => void;
  updateSettings: (settings: { darkMode: boolean, graphicsQuality: string }) => void;
};

// Create a new empty grid
function createEmptyGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({
        x,
        y,
        isMine: false,
        isRevealed: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

// Initialize the logic side of the Rune platform
Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: (allPlayerIds) => {
    const initialState: GameState = {
      page: GamePage.HOME,
      players: allPlayerIds.map((id) => ({
        id,
        role: PlayerRole.HUMAN,
        name: `Player ${id.substring(0, 4)}`, // Use first 4 chars of ID as name for simplicity
      })),
      grid: createEmptyGrid(),
      status: GameStatus.WAITING,
      result: GameResult.ONGOING,
      revealedCount: 0,
      totalHumansToReveal: GRID_SIZE * GRID_SIZE - TOTAL_MINES,
      currentTurn: allPlayerIds[0], // First player starts
      minesPlaced: [],
    };

    return initialState;
  },
  updatesPerSecond: 10,
  update: ({ game }) => {
    // Check win conditions
    if (game.status === GameStatus.PLAYING) {
      // If all cells except mines are revealed, gorilla wins
      if (game.revealedCount >= game.totalHumansToReveal) {
        game.status = GameStatus.ENDED;
        game.result = GameResult.GORILLA_WIN;
        game.winnerId = game.gorillaId;
        game.page = GamePage.END;
      }
    }
  },
  actions: {
    // Navigation between pages
    navigateTo: (page, { game }) => {
      game.page = page;
    },

    // Assign a player as the gorilla
    assignGorilla: (playerId, { game, allPlayerIds }) => {
      // Only the first player (lobby leader) can assign gorilla
      if (allPlayerIds[0] === playerId) {
        // Reset all players to HUMAN role
        for (const player of game.players) {
          player.role = PlayerRole.HUMAN;
        }

        // Set the selected player as GORILLA
        const gorillaPlayer = game.players.find(p => p.id === playerId);
        if (gorillaPlayer) {
          gorillaPlayer.role = PlayerRole.GORILLA;
          game.gorillaId = playerId;
        }
      }
    },

    // Place a mine on the grid
    placeMine: (coords, { game, playerId }) => {
      const { x, y } = coords;
      
      if (game.status !== GameStatus.PLACING_MINES) return;
      if (game.minesPlaced.includes(playerId)) return; // Player already placed a mine
      if (playerId === game.gorillaId) return; // Gorilla can't place mines
      
      // Check if the cell is valid and not already a mine
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !game.grid[y][x].isMine) {
        game.grid[y][x].isMine = true;
        game.grid[y][x].playerId = playerId;
        game.minesPlaced.push(playerId);
        
        // Check if all human players have placed their mines
        if (game.minesPlaced.length >= (game.players.length - 1)) { // -1 because gorilla doesn't place
          game.status = GameStatus.PLAYING;
        }
      }
    },

    // Reveal a cell when gorilla taps it
    revealCell: (coords, { game, playerId }) => {
      const { x, y } = coords;
      
      if (game.status !== GameStatus.PLAYING) return;
      if (playerId !== game.gorillaId) return; // Only gorilla can reveal cells
      
      // Check if the cell is valid and not already revealed
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !game.grid[y][x].isRevealed) {
        game.grid[y][x].isRevealed = true;
        
        // Check if cell is a mine
        if (game.grid[y][x].isMine) {
          game.status = GameStatus.ENDED;
          game.result = GameResult.HUMAN_WIN;
          game.winnerId = game.grid[y][x].playerId;
          game.page = GamePage.END;
        } else {
          game.revealedCount++;
        }
      }
    },

    // Start a new game
    startNewGame: (_, { game, allPlayerIds }) => {
      game.grid = createEmptyGrid();
      game.status = GameStatus.PLACING_MINES;
      game.result = GameResult.ONGOING;
      game.revealedCount = 0;
      game.minesPlaced = [];
      game.totalHumansToReveal = GRID_SIZE * GRID_SIZE - TOTAL_MINES;
      game.currentTurn = allPlayerIds[0];
      game.page = GamePage.GAME;
    },
    
    // Update settings
    updateSettings: (_settings) => {
      // This function is a placeholder to sync settings across devices if needed
      // The actual settings will be stored in localStorage on the client side
    },
  },
});
