import { PlayerId } from "rune-sdk";

export enum GamePage {
  HOME = "/home",
  LOBBY = "/lobby",
  SETTINGS = "/settings",
  GAME = "/game",
  END = "/end",
}

export enum PlayerRole {
  HUMAN = "human",
  GORILLA = "gorilla",
}

export type Player = {
  id: PlayerId;
  role: PlayerRole;
  name: string;
};

export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  playerId?: PlayerId; // Owner of the mine, if it's a mine
};

export enum GameStatus {
  WAITING = "waiting",
  PLACING_MINES = "placing_mines",
  PLAYING = "playing",
  ENDED = "ended",
}

export enum GameResult {
  ONGOING = "ongoing",
  GORILLA_WIN = "gorilla_win",
  HUMAN_WIN = "human_win",
}

export interface GameState {
  page: GamePage;
  players: Player[];
  grid: Cell[][];
  status: GameStatus;
  gorillaId?: PlayerId; // The player ID who's playing as the gorilla
  winnerId?: PlayerId; // Winner when game ends
  result: GameResult;
  revealedCount: number;
  totalHumansToReveal: number;
  currentTurn: PlayerId; // During mine placement phase
  minesPlaced: PlayerId[]; // Players who have placed mines
}

export type Controls = {
  x: number;
  y: number;
};

export interface Settings {
  darkMode: boolean;
  graphicsQuality: "high" | "medium" | "low";
}
