import type { GameState, Player, Piece, Position } from "../types.js";
import type { EvaluationWeights } from "./types.js";
import { getAllPieces, getAllLegalMoves } from "../moves.js";
import { getRiverStatus, posToIndex } from "../board.js";
import { countControlledPoints } from "../victory.js";
import { getFootmanCaptures, getFootmanPushbacks } from "../units/footman.js";
import { getArcherLongshots } from "../units/archer.js";

const PIECE_VALUES: Record<string, number> = {
  footman: 100,
  archer: 150,
  knight: 175,
};

const WIN_SCORE = 100000;

const ROWS = "ABCDEFGHIJK";

/**
 * Evaluates the board position from the perspective of the maximizing player.
 * Positive scores favor the maximizing player, negative scores favor the opponent.
 */
export function evaluate(
  state: GameState,
  maximizingPlayer: Player,
  weights: EvaluationWeights,
  randomness: number = 0,
): number {
  // Terminal state check
  if (state.gamePhase === "ended") {
    if (state.winner === maximizingPlayer) return WIN_SCORE;
    if (state.winner !== null) return -WIN_SCORE;
    return 0; // draw
  }

  const opponent: Player = maximizingPlayer === "white" ? "black" : "white";

  let score = 0;

  // Material
  if (weights.material > 0) {
    score += evaluateMaterial(state, maximizingPlayer) * weights.material;
  }

  // Capture point control
  if (weights.capturePointControl > 0) {
    score += evaluateCapturePoints(state, maximizingPlayer) * weights.capturePointControl;
  }

  // River advancement
  if (weights.riverAdvancement > 0) {
    score += evaluateRiverAdvancement(state, maximizingPlayer) * weights.riverAdvancement;
  }

  // Center control
  if (weights.centerControl > 0) {
    score += evaluateCenterControl(state, maximizingPlayer) * weights.centerControl;
  }

  // Mobility (expensive - only when weighted)
  if (weights.mobility > 0) {
    score += evaluateMobility(state, maximizingPlayer) * weights.mobility;
  }

  // Longshot threats
  if (weights.longshotThreats > 0) {
    score += evaluateLongshotThreats(state, maximizingPlayer) * weights.longshotThreats;
  }

  // Pushback availability
  if (weights.pushbackAvailability > 0) {
    score += evaluatePushbackAvailability(state, maximizingPlayer) * weights.pushbackAvailability;
  }

  // Promotion potential
  if (weights.promotionPotential > 0) {
    score += evaluatePromotionPotential(state, maximizingPlayer) * weights.promotionPotential;
  }

  // Back row defense
  if (weights.backRowDefense > 0) {
    score += evaluateBackRowDefense(state, maximizingPlayer) * weights.backRowDefense;
  }

  // Captured pieces value
  if (weights.capturedPiecesValue > 0) {
    score += evaluateCapturedPiecesValue(state, maximizingPlayer) * weights.capturedPiecesValue;
  }

  // Pawn structure
  if (weights.pawnStructure > 0) {
    score += evaluatePawnStructure(state, maximizingPlayer) * weights.pawnStructure;
  }

  // Add randomness for weaker bots
  if (randomness > 0) {
    score += (Math.random() - 0.5) * randomness * 100;
  }

  return score;
}

/** Material score: sum of piece values difference */
export function evaluateMaterial(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  const myPieces = getAllPieces(player, state.board);
  const theirPieces = getAllPieces(opponent, state.board);

  let myValue = 0;
  for (const piece of myPieces) {
    myValue += PIECE_VALUES[piece.type];
  }

  let theirValue = 0;
  for (const piece of theirPieces) {
    theirValue += PIECE_VALUES[piece.type];
  }

  return myValue - theirValue;
}

/** Capture point control scoring */
export function evaluateCapturePoints(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  const myPoints = countControlledPoints(state.capturePoints, player);
  const theirPoints = countControlledPoints(state.capturePoints, opponent);

  let score = myPoints * 80 - theirPoints * 80;

  // Bonus for controlling multiple points
  if (myPoints >= 3) score += 500;
  else if (myPoints >= 2) score += 200;

  if (theirPoints >= 3) score -= 600;
  else if (theirPoints >= 2) score -= 200;

  return score;
}

/** River advancement: reward pieces advancing across the river */
export function evaluateRiverAdvancement(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return riverAdvancementForPlayer(state, player) - riverAdvancementForPlayer(state, opponent);
}

function riverAdvancementForPlayer(state: GameState, player: Player): number {
  const pieces = getAllPieces(player, state.board);
  let score = 0;

  for (const piece of pieces) {
    const riverStatus = getRiverStatus(piece.position, player);

    if (piece.type === "footman") {
      if (riverStatus === "beyond") score += 30;
      else if (riverStatus === "at") score += 15;
    } else if (piece.type === "archer") {
      if (riverStatus === "behind") score += 20;
      else if (riverStatus === "beyond") score -= 10;
    }
    // Knights are unaffected by river
  }

  return score;
}

/** Center control: pieces on central columns are better positioned */
export function evaluateCenterControl(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return centerControlForPlayer(state, player) - centerControlForPlayer(state, opponent);
}

function centerControlForPlayer(state: GameState, player: Player): number {
  const pieces = getAllPieces(player, state.board);
  let score = 0;

  for (const piece of pieces) {
    const col = piece.position.col;
    if (col >= 4 && col <= 7) score += 10;
    else if (col === 3 || col === 8) score += 5;
  }

  return score;
}

/** Mobility: count available moves (simplified - count move squares only) */
export function evaluateMobility(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";

  const myMoves = getAllLegalMoves(player, state);
  const theirMoves = getAllLegalMoves(opponent, state);

  let myMobility = 0;
  for (const pa of myMoves) {
    const multiplier = pa.piece.type === "knight" ? 2 : 1;
    myMobility += (pa.moves.length + pa.captures.length + pa.pushbacks.length + pa.longshots.length) * multiplier;
  }

  let theirMobility = 0;
  for (const pa of theirMoves) {
    const multiplier = pa.piece.type === "knight" ? 2 : 1;
    theirMobility += (pa.moves.length + pa.captures.length + pa.pushbacks.length + pa.longshots.length) * multiplier;
  }

  return myMobility - theirMobility;
}

/** Longshot threats: archers with available longshot targets */
export function evaluateLongshotThreats(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  const myPieces = getAllPieces(player, state.board);
  const theirPieces = getAllPieces(opponent, state.board);

  let score = 0;
  for (const piece of myPieces) {
    if (piece.type === "archer") {
      const longshots = getArcherLongshots(piece, state);
      score += longshots.length * 25;
    }
  }
  for (const piece of theirPieces) {
    if (piece.type === "archer") {
      const longshots = getArcherLongshots(piece, state);
      score -= longshots.length * 25;
    }
  }

  return score;
}

/** Pushback availability: footmen with pushback options */
export function evaluatePushbackAvailability(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  const myPieces = getAllPieces(player, state.board);
  const theirPieces = getAllPieces(opponent, state.board);

  let score = 0;
  for (const piece of myPieces) {
    if (piece.type === "footman") {
      const pushbacks = getFootmanPushbacks(piece, state);
      score += pushbacks.length * 15;
    }
  }
  for (const piece of theirPieces) {
    if (piece.type === "footman") {
      const pushbacks = getFootmanPushbacks(piece, state);
      score -= pushbacks.length * 15;
    }
  }

  return score;
}

/** Promotion potential: footmen close to enemy back row */
export function evaluatePromotionPotential(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return promotionPotentialForPlayer(state, player) - promotionPotentialForPlayer(state, opponent);
}

function promotionPotentialForPlayer(state: GameState, player: Player): number {
  const pieces = getAllPieces(player, state.board);
  const hasCapturedPieces = state.capturedPieces[player].length > 0;
  if (!hasCapturedPieces) return 0;

  const enemyBackRow = player === "white" ? "K" : "A";
  const enemyBackRowIndex = ROWS.indexOf(enemyBackRow);

  let score = 0;
  for (const piece of pieces) {
    if (piece.type !== "footman") continue;
    const rowIndex = ROWS.indexOf(piece.position.row);
    const distance = Math.abs(rowIndex - enemyBackRowIndex);

    if (distance === 0) score += 80;
    else if (distance === 1) score += 60;
    else if (distance === 2) score += 40;
  }

  return score;
}

/** Back row defense: pieces protecting home territory */
export function evaluateBackRowDefense(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return backRowDefenseForPlayer(state, player) - backRowDefenseForPlayer(state, opponent);
}

function backRowDefenseForPlayer(state: GameState, player: Player): number {
  const pieces = getAllPieces(player, state.board);
  const homeRows = player === "white" ? ["A", "B"] : ["J", "K"];

  let score = 0;
  for (const piece of pieces) {
    if (homeRows.includes(piece.position.row)) {
      if (piece.type === "archer") score += 10;
      else if (piece.type === "knight") score += 5;
    }
  }

  return score;
}

/** Captured pieces value: having captured enemy pieces is a small bonus */
export function evaluateCapturedPiecesValue(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return state.capturedPieces[opponent].length * 10 - state.capturedPieces[player].length * 10;
}

/** Pawn structure: connected/supported footmen */
export function evaluatePawnStructure(state: GameState, player: Player): number {
  const opponent: Player = player === "white" ? "black" : "white";
  return pawnStructureForPlayer(state, player) - pawnStructureForPlayer(state, opponent);
}

function pawnStructureForPlayer(state: GameState, player: Player): number {
  const pieces = getAllPieces(player, state.board);
  const footmen = pieces.filter((p) => p.type === "footman");
  if (footmen.length === 0) return 0;

  let score = 0;

  for (const footman of footmen) {
    const [rowIndex, colIndex] = posToIndex(footman.position);
    let isProtected = false;
    let isIsolated = true;

    // Check if any friendly piece is adjacent (8 directions)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = rowIndex + dr;
        const c = colIndex + dc;
        if (r < 0 || r > 10 || c < 0 || c > 9) continue;
        const neighbor = state.board[r][c];
        if (neighbor && neighbor.player === player) {
          isIsolated = false;
          // Check if protected by another footman's capture zone
          if (neighbor.type === "footman") {
            isProtected = true;
          }
        }
      }
    }

    if (isProtected) score += 15;
    if (isIsolated) score -= 10;
  }

  return score;
}
