import type {
  Board,
  CapturePointControl,
  GameState,
  Player,
} from "./types.js";
import { CAPTURE_POINT_POSITIONS } from "./types.js";
import { getPieceAt } from "./board.js";

/**
 * Recalculates capture point control based on which pieces occupy the 4 capture points.
 */
export function updateCapturePointControl(board: Board): CapturePointControl {
  const control: CapturePointControl = {};
  for (const pos of CAPTURE_POINT_POSITIONS) {
    const key = `${pos.row}${pos.col}`;
    const piece = getPieceAt(board, pos);
    control[key] = piece ? piece.player : null;
  }
  return control;
}

/**
 * Counts how many capture points a player controls.
 */
export function countControlledPoints(
  capturePoints: CapturePointControl,
  player: Player,
): number {
  let count = 0;
  for (const key of Object.keys(capturePoints)) {
    if (capturePoints[key] === player) {
      count++;
    }
  }
  return count;
}

/**
 * Checks for annihilation — a player with zero pieces loses.
 * Returns the winning player, or null if both players still have pieces.
 */
export function checkAnnihilation(board: Board): Player | null {
  let whiteCount = 0;
  let blackCount = 0;

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.player === "white") whiteCount++;
        else blackCount++;
      }
    }
  }

  if (whiteCount === 0) return "black";
  if (blackCount === 0) return "white";
  return null;
}

/**
 * Checks capture point victory (check / checkmate) after a player's move.
 *
 * Logic:
 * 1. If the moving player was in check, verify whether the opponent still holds 3+.
 *    - If yes: checkmate — opponent wins.
 *    - If no: check is cleared.
 * 2. If the moving player now controls 3+, the opponent is placed in check.
 */
export function checkCapturePointVictory(
  gameState: GameState,
  movingPlayer: Player,
): { checkPlayer: Player | null; winner: Player | null } {
  const capturePoints = gameState.capturePoints;
  const opponent: Player = movingPlayer === "white" ? "black" : "white";

  // Step 1: If the moving player was in check, did the opponent maintain 3+?
  if (gameState.checkPlayer === movingPlayer) {
    const opponentControlled = countControlledPoints(capturePoints, opponent);
    if (opponentControlled >= 3) {
      // Checkmate — the opponent held 3+ through the moving player's turn
      return { checkPlayer: null, winner: opponent };
    }
    // Check is cleared — moving player broke the hold
  }

  // Step 2: Does the moving player now control 3+?
  const movingPlayerControlled = countControlledPoints(
    capturePoints,
    movingPlayer,
  );
  if (movingPlayerControlled >= 3) {
    // Opponent is now in check
    return { checkPlayer: opponent, winner: null };
  }

  // No check or checkmate
  return { checkPlayer: null, winner: null };
}

/**
 * Combined game-over check. Returns whether the game is over and why.
 */
export function isGameOver(
  gameState: GameState,
): { gameOver: boolean; winner: Player | null; winCondition: string | null } {
  // Already ended (forfeit, draw, etc.)
  if (gameState.gamePhase === "ended") {
    return {
      gameOver: true,
      winner: gameState.winner,
      winCondition: gameState.winCondition,
    };
  }

  // Annihilation
  const annihilationWinner = checkAnnihilation(gameState.board);
  if (annihilationWinner) {
    return {
      gameOver: true,
      winner: annihilationWinner,
      winCondition: "annihilation",
    };
  }

  // Check the winner field (set by checkmate in executeMove)
  if (gameState.winner) {
    return {
      gameOver: true,
      winner: gameState.winner,
      winCondition: gameState.winCondition,
    };
  }

  return { gameOver: false, winner: null, winCondition: null };
}
