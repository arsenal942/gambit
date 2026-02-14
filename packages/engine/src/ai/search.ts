import type {
  GameState,
  GameAction,
  Player,
  Position,
} from "../types.js";
import type { PieceActions } from "../moves.js";
import type { BotProfile, SearchResult } from "./types.js";
import { getAllLegalMoves } from "../moves.js";
import { executeMove } from "../game.js";
import { evaluate } from "./evaluation.js";
import { getOpeningMove } from "./openings.js";
import { isCapturePoint, posToIndex, getForwardDirection } from "../board.js";
import { getPromotionOptions } from "../units/footman.js";
import { getRansomOptions } from "../units/knight.js";

const WIN_SCORE = 100000;

/**
 * Converts PieceActions[] into a flat array of GameAction[] suitable for executeMove.
 */
export function flattenActions(pieceActions: PieceActions[]): GameAction[] {
  const actions: GameAction[] = [];
  for (const pa of pieceActions) {
    for (const pos of pa.moves) {
      actions.push({ type: "move", pieceId: pa.piece.id, to: pos });
    }
    for (const cap of pa.captures) {
      actions.push({ type: "capture", pieceId: pa.piece.id, to: cap.position });
    }
    for (const pb of pa.pushbacks) {
      actions.push({
        type: "pushback",
        pieceId: pa.piece.id,
        targetPieceId: pb.targetPiece.id,
        pushDirection: pb.pushDirection,
      });
    }
    for (const ls of pa.longshots) {
      actions.push({
        type: "longshot",
        pieceId: pa.piece.id,
        targetPosition: ls.targetPosition,
      });
    }
  }
  return actions;
}

/**
 * Orders moves for better alpha-beta pruning.
 * Priority: captures > longshots > capture point moves > pushbacks > forward moves > others
 */
export function orderMoves(actions: GameAction[], state: GameState): GameAction[] {
  const movingPlayer = state.turn;
  const fwd = getForwardDirection(movingPlayer);

  return [...actions].sort((a, b) => {
    return moveScore(b, state, fwd) - moveScore(a, state, fwd);
  });
}

function moveScore(action: GameAction, state: GameState, fwd: number): number {
  switch (action.type) {
    case "capture":
      return 1000;
    case "longshot":
      return 900;
    case "pushback":
      return 400;
    case "move": {
      // Reward moves toward capture points
      if (isCapturePoint(action.to)) return 700;
      // Reward forward development
      const [toRow] = posToIndex(action.to);
      return 100 + toRow * fwd;
    }
    default:
      return 0;
  }
}

/**
 * Generates all legal actions for the current game phase.
 * Handles playing, awaitingPromotion, and awaitingRansom phases.
 */
function generateActions(state: GameState): GameAction[] {
  if (state.gamePhase === "awaitingPromotion") {
    return generatePromotionActions(state);
  }
  if (state.gamePhase === "awaitingRansom") {
    return generateRansomActions(state);
  }
  const pieceActions = getAllLegalMoves(state.turn, state);
  return flattenActions(pieceActions);
}

function generatePromotionActions(state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  const pending = state.pendingPromotion;
  if (!pending) return [{ type: "declinePromotion" }];

  // Find the promoting piece on the board
  let promotingPiece = null;
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const p = state.board[r][c];
      if (p && p.id === pending.pieceId) {
        promotingPiece = p;
        break;
      }
    }
    if (promotingPiece) break;
  }

  if (!promotingPiece) return [{ type: "declinePromotion" }];

  const options = getPromotionOptions(promotingPiece, state);
  for (const capturedPiece of options.capturedPieces) {
    for (const pos of options.placementPositions) {
      actions.push({
        type: "promotion",
        capturedPieceId: capturedPiece.id,
        placementPosition: pos,
      });
    }
  }

  // Always include decline option
  actions.push({ type: "declinePromotion" });
  return actions;
}

function generateRansomActions(state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  const pending = state.pendingRansom;
  if (!pending) return [{ type: "declineRansom" }];

  // Find the capturing knight on the board
  let capturingKnight = null;
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const p = state.board[r][c];
      if (p && p.id === pending.pieceId) {
        capturingKnight = p;
        break;
      }
    }
    if (capturingKnight) break;
  }

  if (!capturingKnight) return [{ type: "declineRansom" }];

  // Find the captured knight piece from capturedPieces
  const currentPlayer = state.turn;
  const capturedKnight = state.capturedPieces[currentPlayer === "white" ? "black" : "white"]
    .find((p) => p.id === pending.capturedPieceId);

  if (!capturedKnight) return [{ type: "declineRansom" }];

  const options = getRansomOptions(capturingKnight, capturedKnight, state);
  for (const capturedPiece of options.capturedPieces) {
    for (const pos of options.placementPositions) {
      actions.push({
        type: "ransom",
        capturedPieceId: capturedPiece.id,
        placementPosition: pos,
      });
    }
  }

  // Always include decline option
  actions.push({ type: "declineRansom" });
  return actions;
}

/**
 * Minimax with alpha-beta pruning.
 * Returns the evaluation score for the given position.
 */
function alphaBeta(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: Player,
  isMaximizing: boolean,
  profile: BotProfile,
  deadline: number,
): number {
  // Terminal or depth limit
  if (state.gamePhase === "ended" || depth <= 0) {
    return evaluate(state, maximizingPlayer, profile.evaluationWeights, profile.randomness);
  }

  // Time check
  if (Date.now() >= deadline) {
    return evaluate(state, maximizingPlayer, profile.evaluationWeights, profile.randomness);
  }

  const actions = generateActions(state);

  if (actions.length === 0) {
    return evaluate(state, maximizingPlayer, profile.evaluationWeights, profile.randomness);
  }

  // Order moves for better pruning (only for "playing" phase actions)
  const orderedActions =
    state.gamePhase === "playing" ? orderMoves(actions, state) : actions;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const action of orderedActions) {
      let newState: GameState;
      try {
        newState = executeMove(state, action);
      } catch {
        continue; // skip invalid actions
      }

      // If the move results in a pending promotion/ransom for the same player,
      // we need to continue at the same depth (compound action)
      const isCompound =
        (newState.gamePhase === "awaitingPromotion" || newState.gamePhase === "awaitingRansom") &&
        newState.turn === state.turn;

      const evalScore = alphaBeta(
        newState,
        isCompound ? depth : depth - 1,
        alpha,
        beta,
        maximizingPlayer,
        isCompound ? isMaximizing : !isMaximizing,
        profile,
        deadline,
      );

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const action of orderedActions) {
      let newState: GameState;
      try {
        newState = executeMove(state, action);
      } catch {
        continue;
      }

      const isCompound =
        (newState.gamePhase === "awaitingPromotion" || newState.gamePhase === "awaitingRansom") &&
        newState.turn === state.turn;

      const evalScore = alphaBeta(
        newState,
        isCompound ? depth : depth - 1,
        alpha,
        beta,
        maximizingPlayer,
        isCompound ? isMaximizing : !isMaximizing,
        profile,
        deadline,
      );

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Searches at a fixed depth and returns the best action with its score.
 */
function searchAtDepth(
  state: GameState,
  depth: number,
  maximizingPlayer: Player,
  profile: BotProfile,
  deadline: number,
): SearchResult | null {
  const actions = generateActions(state);
  if (actions.length === 0) return null;

  const orderedActions =
    state.gamePhase === "playing" ? orderMoves(actions, state) : actions;

  let bestAction: GameAction = orderedActions[0];
  let bestScore = -Infinity;

  for (const action of orderedActions) {
    if (Date.now() >= deadline) break;

    let newState: GameState;
    try {
      newState = executeMove(state, action);
    } catch {
      continue;
    }

    // Compound action check
    const isCompound =
      (newState.gamePhase === "awaitingPromotion" || newState.gamePhase === "awaitingRansom") &&
      newState.turn === state.turn;

    const score = alphaBeta(
      newState,
      isCompound ? depth : depth - 1,
      -Infinity,
      Infinity,
      maximizingPlayer,
      isCompound ? true : false,
      profile,
      deadline,
    );

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return { action: bestAction, score: bestScore, depth };
}

/**
 * Main entry point for the AI search.
 * Finds the best action for the current game state using the given bot profile.
 */
export function findBestAction(
  state: GameState,
  profile: BotProfile,
): SearchResult {
  const currentPlayer = state.turn;
  const deadline = Date.now() + profile.timeLimitMs;

  // Check opening book first
  if (profile.useOpeningBook && state.gamePhase === "playing") {
    const openingMove = getOpeningMove(state, currentPlayer);
    if (openingMove) {
      return { action: openingMove, score: 0, depth: 0 };
    }
  }

  // Generate all legal actions
  const actions = generateActions(state);
  if (actions.length === 0) {
    throw new Error("No legal actions available");
  }

  // Single action: return immediately
  if (actions.length === 1) {
    return { action: actions[0], score: 0, depth: 0 };
  }

  let bestResult: SearchResult | null = null;

  if (profile.useIterativeDeepening) {
    // Iterative deepening: search at increasing depths
    for (let depth = 1; depth <= profile.depth; depth++) {
      if (Date.now() >= deadline) break;

      const result = searchAtDepth(state, depth, currentPlayer, profile, deadline);
      if (result) {
        bestResult = result;
      }
    }
  } else {
    // Fixed depth search
    bestResult = searchAtDepth(state, profile.depth, currentPlayer, profile, deadline);
  }

  if (!bestResult) {
    // Fallback: return first legal action
    return { action: actions[0], score: 0, depth: 0 };
  }

  return bestResult;
}
