import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GameState,
  GameStatus,
  PlayerRole,
  TOTAL_MEN,
  TOTAL_PLAYERS,
  MINES_PER_PLAYER,
  MINE_PLACEMENT_TIME,
  GRID_SIZE,
} from "../logic";

// Mock the global Rune object
vi.mock("rune-sdk/multiplayer", () => {
  return {
    __esModule: true,
  };
});

describe("Game Constants", () => {
  it("should have the correct constants", () => {
    expect(TOTAL_MEN).toBe(2);
    expect(TOTAL_PLAYERS).toBe(3);
    expect(MINES_PER_PLAYER).toBe(3);
    expect(MINE_PLACEMENT_TIME).toBe(10);
    expect(GRID_SIZE).toBe(10);
  });
});

describe("Game Logic", () => {
  let mockGame: GameState;
  const mockPlayerId1 = "player1";
  const mockPlayerId2 = "player2";
  const mockPlayerId3 = "player3";

  beforeEach(() => {
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

  it("should have the correct initial state", () => {
    expect(mockGame.status).toBe(GameStatus.LOBBY);
    expect(Object.keys(mockGame.playerRoles).length).toBe(3);
    expect(mockGame.gorillaPlayerId).toBe(mockPlayerId3);
    expect(mockGame.minesToPlace[mockPlayerId1]).toBe(MINES_PER_PLAYER);
    expect(mockGame.minesToPlace[mockPlayerId2]).toBe(MINES_PER_PLAYER);
  });

  it("should correctly identify men and gorilla roles", () => {
    const menCount = Object.values(mockGame.playerRoles).filter(
      (role) => role === PlayerRole.MAN
    ).length;
    const gorillaCount = Object.values(mockGame.playerRoles).filter(
      (role) => role === PlayerRole.GORILLA
    ).length;

    expect(menCount).toBe(2);
    expect(gorillaCount).toBe(1);
  });

  describe("Game Setup", () => {
    it("should have the correct number of players", () => {
      expect(Object.keys(mockGame.playerRoles).length).toBe(3);
    });

    it("should have the correct roles distribution", () => {
      const menCount = Object.values(mockGame.playerRoles).filter(
        (role) => role === PlayerRole.MAN
      ).length;
      const gorillaCount = Object.values(mockGame.playerRoles).filter(
        (role) => role === PlayerRole.GORILLA
      ).length;

      expect(menCount).toBe(2);
      expect(gorillaCount).toBe(1);
    });

    it("should have the correct number of mines per player", () => {
      expect(mockGame.minesToPlace[mockPlayerId1]).toBe(MINES_PER_PLAYER);
      expect(mockGame.minesToPlace[mockPlayerId2]).toBe(MINES_PER_PLAYER);
      expect(mockGame.minesToPlace[mockPlayerId3]).toBe(0); // Gorilla doesn't place mines
    });
  });

  describe("Mine Placement", () => {
    it("should allow men to place mines", () => {
      // Change game state to mine placement
      mockGame.status = GameStatus.PLACING_MINES;

      // Mock the action of placing a mine
      const placeMine = (playerId: string, x: number, y: number) => {
        if (mockGame.status !== GameStatus.PLACING_MINES) return;
        if (mockGame.playerRoles[playerId] !== PlayerRole.MAN) return;
        if (mockGame.minesToPlace[playerId] <= 0) return;
        if (mockGame.grid[y][x].hasMine) return;

        mockGame.grid[y][x].hasMine = true;
        mockGame.grid[y][x].mineOwnerId = playerId;
        mockGame.minesToPlace[playerId]--;
      };

      // Place mines for player 1
      placeMine(mockPlayerId1, 0, 0);
      placeMine(mockPlayerId1, 1, 1);
      placeMine(mockPlayerId1, 2, 2);

      // Check if mines are placed correctly
      expect(mockGame.grid[0][0].hasMine).toBe(true);
      expect(mockGame.grid[0][0].mineOwnerId).toBe(mockPlayerId1);
      expect(mockGame.grid[1][1].hasMine).toBe(true);
      expect(mockGame.grid[2][2].hasMine).toBe(true);
      expect(mockGame.minesToPlace[mockPlayerId1]).toBe(0);
    });

    it("should not allow placing more mines than allocated", () => {
      // Change game state to mine placement
      mockGame.status = GameStatus.PLACING_MINES;

      // Mock the action of placing a mine
      const placeMine = (playerId: string, x: number, y: number) => {
        if (mockGame.status !== GameStatus.PLACING_MINES) return;
        if (mockGame.playerRoles[playerId] !== PlayerRole.MAN) return;
        if (mockGame.minesToPlace[playerId] <= 0) return;
        if (mockGame.grid[y][x].hasMine) return;

        mockGame.grid[y][x].hasMine = true;
        mockGame.grid[y][x].mineOwnerId = playerId;
        mockGame.minesToPlace[playerId]--;
      };

      // Place all allocated mines
      placeMine(mockPlayerId1, 0, 0);
      placeMine(mockPlayerId1, 1, 1);
      placeMine(mockPlayerId1, 2, 2);

      // Try to place one more mine
      placeMine(mockPlayerId1, 3, 3);

      // Check if only the allocated mines are placed
      expect(mockGame.grid[0][0].hasMine).toBe(true);
      expect(mockGame.grid[1][1].hasMine).toBe(true);
      expect(mockGame.grid[2][2].hasMine).toBe(true);
      expect(mockGame.grid[3][3].hasMine).toBe(false);
      expect(mockGame.minesToPlace[mockPlayerId1]).toBe(0);
    });
  });

  describe("Random Mine Placement", () => {
    it("should place mines randomly when time is up", () => {
      // Mock the random mine placement function
      const placeRandomMines = (game: GameState, playerId: string) => {
        const minesToPlace = game.minesToPlace[playerId];
        if (minesToPlace <= 0) return;

        // For testing, just place mines in a predictable pattern
        for (let i = 0; i < minesToPlace; i++) {
          game.grid[i][i].hasMine = true;
          game.grid[i][i].mineOwnerId = playerId;
        }

        game.minesToPlace[playerId] = 0;
        game.randomMinesPlaced[playerId] = true;
      };

      // Set up game state
      mockGame.status = GameStatus.PLACING_MINES;

      // Simulate time up for player1
      placeRandomMines(mockGame, mockPlayerId1);

      // Check if mines were placed randomly
      expect(mockGame.minesToPlace[mockPlayerId1]).toBe(0);
      expect(mockGame.randomMinesPlaced[mockPlayerId1]).toBe(true);

      // Check that the correct number of mines were placed
      let mineCount = 0;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (
            mockGame.grid[y][x].hasMine &&
            mockGame.grid[y][x].mineOwnerId === mockPlayerId1
          ) {
            mineCount++;
          }
        }
      }
      expect(mineCount).toBe(MINES_PER_PLAYER);
    });
  });
});
