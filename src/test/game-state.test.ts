import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GameState,
  GameStatus,
  PlayerRole,
  TOTAL_MEN,
  TOTAL_PLAYERS,
  MINES_PER_PLAYER,
  GRID_SIZE,
} from "../logic";

describe("Game State Transitions", () => {
  let mockGame: GameState;
  const mockPlayerId1 = "player1";
  const mockPlayerId2 = "player2";
  const mockPlayerId3 = "player3";

  beforeEach(() => {
    // Initialize a mock game state
    mockGame = {
      status: GameStatus.LOBBY,
      playerRoles: {
        [mockPlayerId1]: PlayerRole.MAN,
        [mockPlayerId2]: PlayerRole.MAN,
        [mockPlayerId3]: PlayerRole.GORILLA,
      },
      gorillaPlayerId: mockPlayerId3,
      grid: Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill(null)
            .map(() => ({
              revealed: false,
              hasMine: false,
            }))
        ),
      minesToPlace: {
        [mockPlayerId1]: MINES_PER_PLAYER,
        [mockPlayerId2]: MINES_PER_PLAYER,
        [mockPlayerId3]: 0,
      },
      currentTurn: null,
      winner: null,
      winningRole: null,
      revealedCount: 0,
      minePlacementEndTime: undefined,
      randomMinesPlaced: {
        [mockPlayerId1]: false,
        [mockPlayerId2]: false,
        [mockPlayerId3]: false,
      },
    };
  });

  describe("Lobby to Placing Mines", () => {
    it("should transition from LOBBY to PLACING_MINES when game starts", () => {
      // Mock the startGame action
      const startGame = () => {
        if (mockGame.status !== GameStatus.LOBBY) return;

        // Make sure we have a gorilla
        if (!mockGame.gorillaPlayerId) {
          const playerIds = Object.keys(mockGame.playerRoles);
          if (playerIds.length > 0) {
            const randomPlayerId =
              playerIds[Math.floor(Math.random() * playerIds.length)];
            mockGame.playerRoles[randomPlayerId] = PlayerRole.GORILLA;
            mockGame.gorillaPlayerId = randomPlayerId;
          }
        }

        // Initialize mines to place
        for (const playerId in mockGame.playerRoles) {
          if (mockGame.playerRoles[playerId] === PlayerRole.MAN) {
            mockGame.minesToPlace[playerId] = MINES_PER_PLAYER;
            mockGame.randomMinesPlaced[playerId] = false;
          }
        }

        // Set the end time for mine placement
        mockGame.minePlacementEndTime = Date.now() + 10 * 1000;

        // Change game state to placing mines
        mockGame.status = GameStatus.PLACING_MINES;
      };

      // Start the game
      startGame();

      // Check if game state changed correctly
      expect(mockGame.status).toBe(GameStatus.PLACING_MINES);
      expect(mockGame.minePlacementEndTime).toBeDefined();
      expect(mockGame.minesToPlace[mockPlayerId1]).toBe(MINES_PER_PLAYER);
      expect(mockGame.minesToPlace[mockPlayerId2]).toBe(MINES_PER_PLAYER);
    });
  });

  describe("Placing Mines to Playing", () => {
    it("should transition from PLACING_MINES to PLAYING when all mines are placed", () => {
      // Set up game state
      mockGame.status = GameStatus.PLACING_MINES;
      mockGame.minePlacementEndTime = Date.now() + 10 * 1000;

      // Mock the placeMine action
      const placeMine = (playerId: string, x: number, y: number) => {
        if (mockGame.status !== GameStatus.PLACING_MINES) return;
        if (mockGame.playerRoles[playerId] !== PlayerRole.MAN) return;
        if (mockGame.minesToPlace[playerId] <= 0) return;
        if (mockGame.grid[y][x].hasMine) return;

        mockGame.grid[y][x].hasMine = true;
        mockGame.grid[y][x].mineOwnerId = playerId;
        mockGame.minesToPlace[playerId]--;
      };

      // Mock the check for all mines placed
      const allMinesPlaced = () => {
        for (const playerId in mockGame.minesToPlace) {
          if (mockGame.minesToPlace[playerId] > 0) {
            return false;
          }
        }
        return true;
      };

      // Mock the transition function
      const checkMinePlacementComplete = () => {
        if (mockGame.status !== GameStatus.PLACING_MINES) return;

        if (allMinesPlaced()) {
          mockGame.status = GameStatus.PLAYING;
          mockGame.currentTurn = mockGame.gorillaPlayerId ?? null;
        }
      };

      // Place all mines for both players
      placeMine(mockPlayerId1, 0, 0);
      placeMine(mockPlayerId1, 1, 1);
      placeMine(mockPlayerId1, 2, 2);

      placeMine(mockPlayerId2, 3, 3);
      placeMine(mockPlayerId2, 4, 4);
      placeMine(mockPlayerId2, 5, 5);

      // Check if all mines are placed and transition
      checkMinePlacementComplete();

      // Check if game state changed correctly
      expect(mockGame.status).toBe(GameStatus.PLAYING);
      expect(mockGame.currentTurn).toBe(mockPlayerId3); // Gorilla goes first
    });
  });

  describe("Playing to Ended", () => {
    it("should transition to ENDED when gorilla hits a mine", () => {
      // Set up game state
      mockGame.status = GameStatus.PLAYING;
      mockGame.currentTurn = mockPlayerId3; // Gorilla's turn

      // Place a mine
      mockGame.grid[3][3].hasMine = true;
      mockGame.grid[3][3].mineOwnerId = mockPlayerId1;

      // Mock the revealCell action
      const revealCell = (playerId: string, x: number, y: number) => {
        if (mockGame.status !== GameStatus.PLAYING) return;
        if (playerId !== mockGame.currentTurn) return;
        if (mockGame.grid[y][x].revealed) return;

        mockGame.grid[y][x].revealed = true;
        mockGame.revealedCount++;

        // Check if gorilla hit a mine
        if (
          mockGame.grid[y][x].hasMine &&
          playerId === mockGame.gorillaPlayerId
        ) {
          // Men win
          mockGame.status = GameStatus.ENDED;
          mockGame.winner = mockGame.grid[y][x].mineOwnerId || null;
          mockGame.winningRole = PlayerRole.MAN;
          return;
        }

        // Check if gorilla has revealed all non-mine cells
        const totalCells = GRID_SIZE * GRID_SIZE;
        const totalMines = TOTAL_MEN * MINES_PER_PLAYER;
        if (mockGame.revealedCount === totalCells - totalMines) {
          // Gorilla wins
          mockGame.status = GameStatus.ENDED;
          mockGame.winner = mockGame.gorillaPlayerId || null;
          mockGame.winningRole = PlayerRole.GORILLA;
          return;
        }
      };

      // Gorilla reveals a cell with a mine
      revealCell(mockPlayerId3, 3, 3);

      // Check if game state changed correctly
      expect(mockGame.status).toBe(GameStatus.ENDED);
      expect(mockGame.winner).toBe(mockPlayerId1);
      expect(mockGame.winningRole).toBe(PlayerRole.MAN);
    });

    it("should transition to ENDED when gorilla reveals all non-mine cells", () => {
      // Set up game state
      mockGame.status = GameStatus.PLAYING;
      mockGame.currentTurn = mockPlayerId3; // Gorilla's turn

      // Place mines
      mockGame.grid[0][0].hasMine = true;
      mockGame.grid[0][0].mineOwnerId = mockPlayerId1;
      mockGame.grid[1][1].hasMine = true;
      mockGame.grid[1][1].mineOwnerId = mockPlayerId1;
      mockGame.grid[2][2].hasMine = true;
      mockGame.grid[2][2].mineOwnerId = mockPlayerId1;

      mockGame.grid[3][3].hasMine = true;
      mockGame.grid[3][3].mineOwnerId = mockPlayerId2;
      mockGame.grid[4][4].hasMine = true;
      mockGame.grid[4][4].mineOwnerId = mockPlayerId2;
      mockGame.grid[5][5].hasMine = true;
      mockGame.grid[5][5].mineOwnerId = mockPlayerId2;

      // Mock the revealCell action
      const revealCell = (playerId: string, x: number, y: number) => {
        if (mockGame.status !== GameStatus.PLAYING) return;
        if (playerId !== mockGame.currentTurn) return;
        if (mockGame.grid[y][x].revealed) return;

        mockGame.grid[y][x].revealed = true;
        mockGame.revealedCount++;

        // Check if gorilla hit a mine
        if (
          mockGame.grid[y][x].hasMine &&
          playerId === mockGame.gorillaPlayerId
        ) {
          // Men win
          mockGame.status = GameStatus.ENDED;
          mockGame.winner = mockGame.grid[y][x].mineOwnerId || null;
          mockGame.winningRole = PlayerRole.MAN;
          return;
        }

        // Check if gorilla has revealed all non-mine cells
        const totalCells = GRID_SIZE * GRID_SIZE;
        const totalMines = TOTAL_MEN * MINES_PER_PLAYER;
        if (mockGame.revealedCount === totalCells - totalMines) {
          // Gorilla wins
          mockGame.status = GameStatus.ENDED;
          mockGame.winner = mockGame.gorillaPlayerId || null;
          mockGame.winningRole = PlayerRole.GORILLA;
          return;
        }
      };

      // Set revealedCount to almost winning
      mockGame.revealedCount =
        GRID_SIZE * GRID_SIZE - TOTAL_MEN * MINES_PER_PLAYER - 1;

      // Gorilla reveals the last non-mine cell
      revealCell(mockPlayerId3, 6, 6);

      // Check if game state changed correctly
      expect(mockGame.status).toBe(GameStatus.ENDED);
      expect(mockGame.winner).toBe(mockPlayerId3);
      expect(mockGame.winningRole).toBe(PlayerRole.GORILLA);
    });
  });
});
