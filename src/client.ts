import { graphicsCtx, drawTile, loadTileSet, TileSet } from "./graphics";
import backgroundSrc from "./assets/Background/Brown.png";
import terrainSrc from "./assets/Terrain/Terrain (16x16).png";

import pinkIdleSrc from "./assets/Pink Man/Idle (32x32).png";
import pinkRunSrc from "./assets/Pink Man/Run (32x32).png";
import pinkJumpSrc from "./assets/Pink Man/Jump (32x32).png";

import frogIdleSrc from "./assets/Ninja Frog/Idle (32x32).png";
import frogRunSrc from "./assets/Ninja Frog/Run (32x32).png";
import frogJumpSrc from "./assets/Ninja Frog/Jump (32x32).png";

import dudeIdleSrc from "./assets/Mask Dude/Idle (32x32).png";
import dudeRunSrc from "./assets/Mask Dude/Run (32x32).png";
import dudeJumpSrc from "./assets/Mask Dude/Jump (32x32).png";

import guyIdleSrc from "./assets/Virtual Guy/Idle (32x32).png";
import guyRunSrc from "./assets/Virtual Guy/Run (32x32).png";
import guyJumpSrc from "./assets/Virtual Guy/Jump (32x32).png";

import { Controls, GameState, tileMap, Animation } from "./logic";
import { gameInputs } from "./input";
import { PlayerId } from "rune-sdk";

const TILE_MAPPING: Record<number, number> = {
  1: 122,
};

interface AnimFrames {
  idle: TileSet;
  run: TileSet;
  jump: TileSet;
}

const SCALE = 2;

(async () => {
  const background = await loadTileSet(backgroundSrc, 64, 64);
  const terrain = await loadTileSet(terrainSrc, 16, 16);

  const playerArt: Record<string, AnimFrames> = {
    "pink-man": {
      idle: await loadTileSet(pinkIdleSrc, 32, 32),
      run: await loadTileSet(pinkRunSrc, 32, 32),
      jump: await loadTileSet(pinkJumpSrc, 32, 32),
    },
    "mask-dude": {
      idle: await loadTileSet(dudeIdleSrc, 32, 32),
      run: await loadTileSet(dudeRunSrc, 32, 32),
      jump: await loadTileSet(dudeJumpSrc, 32, 32),
    },
    "ninja-frog": {
      idle: await loadTileSet(frogIdleSrc, 32, 32),
      run: await loadTileSet(frogRunSrc, 32, 32),
      jump: await loadTileSet(frogJumpSrc, 32, 32),
    },
    "virtual-guy": {
      idle: await loadTileSet(guyIdleSrc, 32, 32),
      run: await loadTileSet(guyRunSrc, 32, 32),
      jump: await loadTileSet(guyJumpSrc, 32, 32),
    },
  };

  let gameState: GameState;
  let myPlayerId: PlayerId | undefined;

  let lastSentControls: Controls = {
    left: false,
    right: false,
    jump: false,
  };
  let lastActionTime = 0;

  function requestRender(): void {
    requestAnimationFrame(() => {
      gameLoop();
    });
  }

  function gameLoop(): void {
    if (
      Date.now() - lastActionTime > 100 &&
      (gameInputs.left !== lastSentControls.left ||
        gameInputs.right !== lastSentControls.right ||
        gameInputs.jump !== lastSentControls.jump)
    ) {
      lastSentControls = { ...gameInputs };
      lastActionTime = Date.now();
      Rune.actions.controls(lastSentControls);
    }

    requestRender();

    for (let x = 0; x < graphicsCtx.canvas.width + 64; x += 64) {
      for (let y = 0; y < graphicsCtx.canvas.height + 64; y += 64) {
        drawTile(x, y - (Math.floor(Date.now() / 25) % 64), background, 0);
      }
    }

    graphicsCtx.save();
    graphicsCtx.scale(SCALE, SCALE);
    if (myPlayerId) {
      const myPlayer = gameState.players.find((p) => p.playerId === myPlayerId);
      if (myPlayer) {
        graphicsCtx.translate(
          -myPlayer.x + Math.floor(graphicsCtx.canvas.width / 2 / SCALE),
          -myPlayer.y + Math.floor(graphicsCtx.canvas.height / 2 / SCALE)
        );
      }
    }

    for (let x = 0; x < tileMap[0].length; x++) {
      for (let y = 0; y < tileMap.length; y++) {
        if (tileMap[y][x] !== 0) {
          drawTile(x * 16, y * 16, terrain, TILE_MAPPING[tileMap[y][x]]);
        }
      }
    }

    if (gameState) {
      for (const player of gameState.players) {
        const frames =
          player.animation === Animation.JUMP
            ? playerArt[player.sprite].jump
            : player.animation === Animation.WALK
              ? playerArt[player.sprite].run
              : playerArt[player.sprite].idle;

        drawTile(
          player.x - 16,
          player.y - 16,
          frames,
          Math.floor(Date.now() / 50) % frames.tilesAcross,
          player.flipped
        );
      }
    }
    graphicsCtx.restore();
  }

  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      myPlayerId = yourPlayerId;

      gameState = game;
    },
  });

  requestRender();
})();
