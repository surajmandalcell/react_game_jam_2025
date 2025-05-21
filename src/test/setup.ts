import "@testing-library/jest-dom";
import { vi } from "vitest";

// Add type declaration for Rune SDK
declare global {
  var Rune: any;
}

// Mock Rune SDK
global.Rune = {
  initLogic: vi.fn(),
  initClient: vi.fn(),
  actions: {
    assignRole: vi.fn(),
    placeMine: vi.fn(),
    revealCell: vi.fn(),
    startGame: vi.fn(),
    restartGame: vi.fn(),
  },
  gameTime: vi.fn(() => Date.now()),
  gameOver: vi.fn(),
  invalidAction: vi.fn(),
} as any;
