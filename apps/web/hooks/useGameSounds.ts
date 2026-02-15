"use client";

import { useEffect, useRef } from "react";
import type { GameState, Move, Player } from "@gambit/engine";
import { soundManager, type SoundKey } from "@/lib/sound-manager";

/**
 * Determines the sound to play for a given move.
 */
function soundForMove(move: Move): SoundKey {
  switch (move.type) {
    case "move":
      return `${move.piece.type}-move` as SoundKey;
    case "capture":
      if (move.piece.type === "archer") {
        return "longshot";
      }
      return `${move.piece.type}-capture` as SoundKey;
    case "longshot":
      return "longshot";
    case "pushback":
      return "pushback";
    case "promotion":
      return "promotion";
    case "ransom":
      return "ransom";
    default:
      return "footman-move";
  }
}

interface UseGameSoundsOptions {
  /** The player perspective (null for local hotseat / spectator) */
  playerColor?: Player | null;
  /** Whether sounds are enabled for this context (e.g. false during rapid replay scrubbing) */
  enabled?: boolean;
}

/**
 * Hook that watches game state changes and plays appropriate sound effects.
 * Should be used in game client components (GameClient, BotGameClient, OnlineGameClient).
 */
export function useGameSounds(
  gameState: GameState | null,
  options: UseGameSoundsOptions = {},
) {
  const { playerColor = null, enabled = true } = options;
  const prevStateRef = useRef<GameState | null>(null);
  const prevMoveCountRef = useRef(0);
  const hasInitRef = useRef(false);

  // Initialize sound manager on mount
  useEffect(() => {
    if (!hasInitRef.current) {
      hasInitRef.current = true;
      soundManager.init();
    }
  }, []);

  // Watch for game state changes and play sounds
  useEffect(() => {
    if (!gameState || !enabled) return;

    const prevState = prevStateRef.current;
    const prevMoveCount = prevMoveCountRef.current;
    const currentMoveCount = gameState.moveHistory.length;

    // Update refs
    prevStateRef.current = gameState;
    prevMoveCountRef.current = currentMoveCount;

    // Skip initial render (no previous state to compare)
    if (!prevState) return;

    // New move was made
    if (currentMoveCount > prevMoveCount) {
      const lastMove = gameState.moveHistory[currentMoveCount - 1];
      if (lastMove) {
        soundManager.play(soundForMove(lastMove));
      }
    }

    // Check state changed
    if (gameState.checkPlayer && !prevState.checkPlayer) {
      // Small delay so check sound doesn't overlap with move sound
      setTimeout(() => soundManager.play("check"), 150);
    }

    // Game ended
    if (gameState.gamePhase === "ended" && prevState.gamePhase !== "ended") {
      const isWinner =
        playerColor !== null && gameState.winner === playerColor;
      const isDraw = gameState.winner === null;

      setTimeout(() => {
        if (isDraw) {
          soundManager.play("defeat");
        } else if (isWinner) {
          if (gameState.winCondition === "annihilation") {
            soundManager.play("annihilation");
          } else {
            soundManager.play("checkmate");
          }
        } else if (playerColor !== null) {
          // We lost
          soundManager.play("defeat");
        } else {
          // Local / spectator — play the winner's sound
          if (gameState.winCondition === "annihilation") {
            soundManager.play("annihilation");
          } else {
            soundManager.play("checkmate");
          }
        }
      }, 300);
    }

    // Turn changed — play turn-change sound if it's now our turn
    if (prevState.turn !== gameState.turn && gameState.gamePhase === "playing") {
      if (playerColor === null || gameState.turn === playerColor) {
        soundManager.play("turn-change");
      }
    }
  }, [gameState, playerColor, enabled]);
}

/**
 * Hook that plays selection/deselection sounds.
 * Call these from the board interaction handler.
 */
export function useSelectionSounds() {
  return {
    playSelect: () => soundManager.play("select"),
    playDeselect: () => soundManager.play("deselect"),
  };
}

/**
 * Play error sound for invalid moves.
 */
export function playErrorSound() {
  soundManager.play("error");
}

/**
 * Play game start sound.
 */
export function playGameStartSound() {
  soundManager.play("game-start");
}

/**
 * Play match found sound.
 */
export function playMatchFoundSound() {
  soundManager.play("match-found");
}

/**
 * Play draw offer sound.
 */
export function playDrawOfferSound() {
  soundManager.play("draw-offer");
}
