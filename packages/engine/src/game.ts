import type {
  Board,
  GameAction,
  GameState,
  Move,
  Piece,
  Player,
  Position,
} from "./types.js";
import {
  getPieceAt,
  removePieceAt,
  setPieceAt,
  setupInitialBoard,
} from "./board.js";
import {
  getFootmanMoves,
  getFootmanCaptures,
  getFootmanPushbacks,
  canPromote,
  getPromotionOptions,
} from "./units/footman.js";
import { getArcherMoves, getArcherLongshots } from "./units/archer.js";
import {
  getKnightMoves,
  getKnightCaptures,
  getRansomOptions,
} from "./units/knight.js";
import {
  updateCapturePointControl,
  checkAnnihilation,
  checkCapturePointVictory,
} from "./victory.js";

// ── Cloning helpers ──────────────────────────────────────────────────

function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) =>
      cell ? { ...cell, position: { ...cell.position } } : null,
    ),
  );
}

function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    moveHistory: [...state.moveHistory],
    capturedPieces: {
      white: state.capturedPieces.white.map((p) => ({
        ...p,
        position: { ...p.position },
      })),
      black: state.capturedPieces.black.map((p) => ({
        ...p,
        position: { ...p.position },
      })),
    },
    capturePoints: { ...state.capturePoints },
    lastPushback: state.lastPushback
      ? { ...state.lastPushback }
      : null,
    pendingPromotion: state.pendingPromotion
      ? { ...state.pendingPromotion }
      : null,
    pendingRansom: state.pendingRansom
      ? { ...state.pendingRansom }
      : null,
  };
}

// ── Board search helpers ─────────────────────────────────────────────

function findPieceById(board: Board, pieceId: string): Piece | null {
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const piece = board[r][c];
      if (piece && piece.id === pieceId) return piece;
    }
  }
  return null;
}

function opponent(player: Player): Player {
  return player === "white" ? "black" : "white";
}

function posEquals(a: Position, b: Position): boolean {
  return a.col === b.col && a.row === b.row;
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Creates a new game with the initial board setup and white to move.
 */
export function createGame(): GameState {
  return {
    board: setupInitialBoard(),
    turn: "white",
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    capturePoints: { F1: null, F4: null, F7: null, F10: null },
    checkPlayer: null,
    lastPushback: null,
    turnsSinceCapture: 0,
    gamePhase: "playing",
    winner: null,
    winCondition: null,
    pendingPromotion: null,
    pendingRansom: null,
  };
}

/**
 * Executes a game action and returns the new (immutable) game state.
 * Throws an Error if the action is invalid.
 */
export function executeMove(
  gameState: GameState,
  action: GameAction,
): GameState {
  if (gameState.gamePhase === "ended") {
    throw new Error("Game is already over");
  }

  // Phase gating: awaiting promotion
  if (gameState.gamePhase === "awaitingPromotion") {
    if (action.type !== "promotion" && action.type !== "declinePromotion") {
      throw new Error(
        "Must resolve promotion: use 'promotion' or 'declinePromotion' action",
      );
    }
    return handlePromotion(gameState, action);
  }

  // Phase gating: awaiting ransom
  if (gameState.gamePhase === "awaitingRansom") {
    if (action.type !== "ransom" && action.type !== "declineRansom") {
      throw new Error(
        "Must resolve ransom: use 'ransom' or 'declineRansom' action",
      );
    }
    return handleRansom(gameState, action);
  }

  // Normal play
  switch (action.type) {
    case "move":
      return handleMove(gameState, action);
    case "capture":
      return handleCapture(gameState, action);
    case "pushback":
      return handlePushback(gameState, action);
    case "longshot":
      return handleLongshot(gameState, action);
    default:
      throw new Error(`Invalid action type '${(action as GameAction).type}' during playing phase`);
  }
}

/**
 * Ends the game via forfeit. The forfeiting player loses.
 */
export function forfeit(gameState: GameState, player: Player): GameState {
  if (gameState.gamePhase === "ended") {
    throw new Error("Game is already over");
  }
  const state = cloneGameState(gameState);
  state.gamePhase = "ended";
  state.winner = opponent(player);
  state.winCondition = "forfeit";
  return state;
}

/**
 * Ends the game in a draw (both players agree).
 * Only available if no captures have occurred for 20+ half-turns.
 */
export function offerDraw(gameState: GameState): GameState {
  if (gameState.gamePhase === "ended") {
    throw new Error("Game is already over");
  }
  if (gameState.turnsSinceCapture < 20) {
    throw new Error(
      `Draw not available: only ${gameState.turnsSinceCapture} half-turns since last capture (need 20)`,
    );
  }
  const state = cloneGameState(gameState);
  state.gamePhase = "ended";
  state.winner = null;
  state.winCondition = "draw";
  return state;
}

// ── Action handlers ──────────────────────────────────────────────────

function handleMove(
  gameState: GameState,
  action: { type: "move"; pieceId: string; to: Position },
): GameState {
  const piece = findPieceById(gameState.board, action.pieceId);
  if (!piece) throw new Error(`Piece '${action.pieceId}' not found`);
  if (piece.player !== gameState.turn) {
    throw new Error(`Cannot move opponent's piece`);
  }

  // Validate the move is legal
  let legalMoves: Position[];
  switch (piece.type) {
    case "footman":
      legalMoves = getFootmanMoves(piece, gameState);
      break;
    case "archer":
      legalMoves = getArcherMoves(piece, gameState);
      break;
    case "knight":
      legalMoves = getKnightMoves(piece, gameState);
      break;
  }

  if (!legalMoves.some((m) => posEquals(m, action.to))) {
    throw new Error(
      `Invalid move: ${piece.type} cannot move to ${action.to.row}${action.to.col}`,
    );
  }

  const state = cloneGameState(gameState);
  const clonedPiece = findPieceById(state.board, action.pieceId)!;

  // Apply move
  removePieceAt(state.board, clonedPiece.position);
  const from = { ...clonedPiece.position };
  clonedPiece.position = { ...action.to };
  clonedPiece.hasMoved = true;
  setPieceAt(state.board, action.to, clonedPiece);

  // Record move
  state.moveHistory.push({
    piece: { ...clonedPiece },
    from,
    to: { ...action.to },
    type: "move",
  });

  // Clear pushback tracking
  state.lastPushback = null;

  // Increment no-capture counter
  state.turnsSinceCapture++;

  // Post-move checks
  return postMoveChecks(state, clonedPiece, null);
}

function handleCapture(
  gameState: GameState,
  action: { type: "capture"; pieceId: string; to: Position },
): GameState {
  const piece = findPieceById(gameState.board, action.pieceId);
  if (!piece) throw new Error(`Piece '${action.pieceId}' not found`);
  if (piece.player !== gameState.turn) {
    throw new Error(`Cannot move opponent's piece`);
  }

  // Validate the capture is legal
  let legalCaptures: { position: Position; targetPiece: Piece }[];
  switch (piece.type) {
    case "footman":
      legalCaptures = getFootmanCaptures(piece, gameState);
      break;
    case "knight":
      legalCaptures = getKnightCaptures(piece, gameState);
      break;
    default:
      throw new Error(`${piece.type} cannot capture by displacement`);
  }

  const matchingCapture = legalCaptures.find((c) =>
    posEquals(c.position, action.to),
  );
  if (!matchingCapture) {
    throw new Error(
      `Invalid capture: ${piece.type} cannot capture at ${action.to.row}${action.to.col}`,
    );
  }

  const state = cloneGameState(gameState);
  const clonedPiece = findPieceById(state.board, action.pieceId)!;

  // Remove captured piece
  const capturedPiece = getPieceAt(state.board, action.to);
  if (!capturedPiece) {
    throw new Error("No piece at capture target");
  }
  removePieceAt(state.board, action.to);
  state.capturedPieces[capturedPiece.player].push(capturedPiece);

  // Move capturing piece
  const from = { ...clonedPiece.position };
  removePieceAt(state.board, clonedPiece.position);
  clonedPiece.position = { ...action.to };
  clonedPiece.hasMoved = true;
  setPieceAt(state.board, action.to, clonedPiece);

  // Record move
  const move: Move = {
    piece: { ...clonedPiece },
    from,
    to: { ...action.to },
    type: "capture",
    capturedPiece: { ...capturedPiece },
  };
  state.moveHistory.push(move);

  // Clear pushback tracking
  state.lastPushback = null;

  // Reset no-capture counter
  state.turnsSinceCapture = 0;

  // Post-move checks
  return postMoveChecks(state, clonedPiece, capturedPiece);
}

function handlePushback(
  gameState: GameState,
  action: {
    type: "pushback";
    pieceId: string;
    targetPieceId: string;
    pushDirection: [number, number];
  },
): GameState {
  const piece = findPieceById(gameState.board, action.pieceId);
  if (!piece) throw new Error(`Piece '${action.pieceId}' not found`);
  if (piece.player !== gameState.turn) {
    throw new Error(`Cannot move opponent's piece`);
  }
  if (piece.type !== "footman") {
    throw new Error("Only footmen can perform pushbacks");
  }

  // Validate pushback is legal
  const legalPushbacks = getFootmanPushbacks(piece, gameState);
  const matchingPushback = legalPushbacks.find(
    (p) =>
      p.targetPiece.id === action.targetPieceId &&
      p.pushDirection[0] === action.pushDirection[0] &&
      p.pushDirection[1] === action.pushDirection[1],
  );
  if (!matchingPushback) {
    throw new Error("Invalid pushback action");
  }

  const state = cloneGameState(gameState);

  // Move the target piece to the resulting position
  const targetPiece = findPieceById(state.board, action.targetPieceId)!;
  removePieceAt(state.board, targetPiece.position);
  const targetFrom = { ...targetPiece.position };
  targetPiece.position = { ...matchingPushback.resultingPosition };
  targetPiece.hasMoved = true;
  setPieceAt(state.board, matchingPushback.resultingPosition, targetPiece);

  // Record move
  state.moveHistory.push({
    piece: { ...findPieceById(state.board, action.pieceId)! },
    from: { ...piece.position },
    to: { ...matchingPushback.resultingPosition },
    type: "pushback",
  });

  // Set pushback tracking (the pushing piece's ID is stored as targetPieceId for anti-retaliation)
  state.lastPushback = {
    targetPieceId: action.pieceId,
    byPlayer: gameState.turn,
  };

  // Increment no-capture counter
  state.turnsSinceCapture++;

  // Update capture points and check victory, then switch turn
  state.capturePoints = updateCapturePointControl(state.board);

  const annihilationWinner = checkAnnihilation(state.board);
  if (annihilationWinner) {
    state.gamePhase = "ended";
    state.winner = annihilationWinner;
    state.winCondition = "annihilation";
    return state;
  }

  const cpVictory = checkCapturePointVictory(state, gameState.turn);
  state.checkPlayer = cpVictory.checkPlayer;
  if (cpVictory.winner) {
    state.gamePhase = "ended";
    state.winner = cpVictory.winner;
    state.winCondition = "checkmate";
    return state;
  }

  state.turn = opponent(gameState.turn);
  return state;
}

function handleLongshot(
  gameState: GameState,
  action: { type: "longshot"; pieceId: string; targetPosition: Position },
): GameState {
  const piece = findPieceById(gameState.board, action.pieceId);
  if (!piece) throw new Error(`Piece '${action.pieceId}' not found`);
  if (piece.player !== gameState.turn) {
    throw new Error(`Cannot move opponent's piece`);
  }
  if (piece.type !== "archer") {
    throw new Error("Only archers can perform longshots");
  }

  // Validate longshot is legal
  const legalLongshots = getArcherLongshots(piece, gameState);
  const matchingLongshot = legalLongshots.find((l) =>
    posEquals(l.targetPosition, action.targetPosition),
  );
  if (!matchingLongshot) {
    throw new Error(
      `Invalid longshot: cannot target ${action.targetPosition.row}${action.targetPosition.col}`,
    );
  }

  const state = cloneGameState(gameState);
  const clonedPiece = findPieceById(state.board, action.pieceId)!;

  // Remove the target piece
  const capturedPiece = getPieceAt(state.board, action.targetPosition);
  if (!capturedPiece) {
    throw new Error("No piece at longshot target");
  }
  removePieceAt(state.board, action.targetPosition);
  state.capturedPieces[capturedPiece.player].push(capturedPiece);

  // Move archer to the target position
  const from = { ...clonedPiece.position };
  removePieceAt(state.board, clonedPiece.position);
  clonedPiece.position = { ...action.targetPosition };
  clonedPiece.hasMoved = true;
  setPieceAt(state.board, action.targetPosition, clonedPiece);

  // Record move
  state.moveHistory.push({
    piece: { ...clonedPiece },
    from,
    to: { ...action.targetPosition },
    type: "longshot",
    capturedPiece: { ...capturedPiece },
  });

  // Clear pushback tracking
  state.lastPushback = null;

  // Reset no-capture counter
  state.turnsSinceCapture = 0;

  // Update capture points and check victory, then switch turn
  state.capturePoints = updateCapturePointControl(state.board);

  const annihilationWinner = checkAnnihilation(state.board);
  if (annihilationWinner) {
    state.gamePhase = "ended";
    state.winner = annihilationWinner;
    state.winCondition = "annihilation";
    return state;
  }

  const cpVictory = checkCapturePointVictory(state, gameState.turn);
  state.checkPlayer = cpVictory.checkPlayer;
  if (cpVictory.winner) {
    state.gamePhase = "ended";
    state.winner = cpVictory.winner;
    state.winCondition = "checkmate";
    return state;
  }

  state.turn = opponent(gameState.turn);
  return state;
}

// ── Two-step flow handlers ───────────────────────────────────────────

function handlePromotion(
  gameState: GameState,
  action: { type: "promotion"; capturedPieceId: string; placementPosition: Position } | { type: "declinePromotion" },
): GameState {
  const state = cloneGameState(gameState);

  if (action.type === "declinePromotion") {
    state.gamePhase = "playing";
    state.pendingPromotion = null;

    // Run victory checks before switching turn
    state.capturePoints = updateCapturePointControl(state.board);
    const cpVictory = checkCapturePointVictory(state, gameState.turn);
    state.checkPlayer = cpVictory.checkPlayer;
    if (cpVictory.winner) {
      state.gamePhase = "ended";
      state.winner = cpVictory.winner;
      state.winCondition = "checkmate";
      return state;
    }

    state.turn = opponent(gameState.turn);
    return state;
  }

  // PromotionAction — narrowed by the early return above
  if (action.type !== "promotion") throw new Error("Unexpected action type");
  const pending = gameState.pendingPromotion;
  if (!pending) throw new Error("No pending promotion");

  const footman = findPieceById(state.board, pending.pieceId);
  if (!footman) throw new Error("Promoting footman not found on board");

  // Validate chosen captured piece
  const currentPlayer = gameState.turn;
  const capturedIdx = state.capturedPieces[currentPlayer].findIndex(
    (p) => p.id === action.capturedPieceId,
  );
  if (capturedIdx === -1) {
    throw new Error(
      `Captured piece '${action.capturedPieceId}' not found`,
    );
  }

  // Validate placement position
  const options = getPromotionOptions(footman, state);
  if (
    !options.placementPositions.some((p) =>
      posEquals(p, action.placementPosition),
    )
  ) {
    throw new Error("Invalid placement position for promotion");
  }

  // Remove footman from board (sacrifice)
  removePieceAt(state.board, footman.position);

  // Remove captured piece from capturedPieces and place on board
  const [returnedPiece] = state.capturedPieces[currentPlayer].splice(
    capturedIdx,
    1,
  );
  returnedPiece.position = { ...action.placementPosition };
  returnedPiece.hasMoved = true;
  setPieceAt(state.board, action.placementPosition, returnedPiece);

  // Record in moveHistory
  state.moveHistory.push({
    piece: { ...footman },
    from: { ...footman.position },
    to: { ...action.placementPosition },
    type: "promotion",
    promotedPiece: { ...returnedPiece },
  });

  state.gamePhase = "playing";
  state.pendingPromotion = null;

  // Victory checks
  state.capturePoints = updateCapturePointControl(state.board);

  const annihilationWinner = checkAnnihilation(state.board);
  if (annihilationWinner) {
    state.gamePhase = "ended";
    state.winner = annihilationWinner;
    state.winCondition = "annihilation";
    return state;
  }

  const cpVictory = checkCapturePointVictory(state, gameState.turn);
  state.checkPlayer = cpVictory.checkPlayer;
  if (cpVictory.winner) {
    state.gamePhase = "ended";
    state.winner = cpVictory.winner;
    state.winCondition = "checkmate";
    return state;
  }

  state.turn = opponent(gameState.turn);
  return state;
}

function handleRansom(
  gameState: GameState,
  action: { type: "ransom"; capturedPieceId: string; placementPosition: Position } | { type: "declineRansom" },
): GameState {
  const state = cloneGameState(gameState);

  if (action.type === "declineRansom") {
    state.gamePhase = "playing";
    state.pendingRansom = null;

    // Run victory checks before switching turn
    state.capturePoints = updateCapturePointControl(state.board);

    const annihilationWinner = checkAnnihilation(state.board);
    if (annihilationWinner) {
      state.gamePhase = "ended";
      state.winner = annihilationWinner;
      state.winCondition = "annihilation";
      return state;
    }

    const cpVictory = checkCapturePointVictory(state, gameState.turn);
    state.checkPlayer = cpVictory.checkPlayer;
    if (cpVictory.winner) {
      state.gamePhase = "ended";
      state.winner = cpVictory.winner;
      state.winCondition = "checkmate";
      return state;
    }

    state.turn = opponent(gameState.turn);
    return state;
  }

  // RansomAction — narrowed by the early return above
  if (action.type !== "ransom") throw new Error("Unexpected action type");
  const pending = gameState.pendingRansom;
  if (!pending) throw new Error("No pending ransom");

  const currentPlayer = gameState.turn;

  // Validate chosen captured piece (must be footman or archer)
  const capturedIdx = state.capturedPieces[currentPlayer].findIndex(
    (p) => p.id === action.capturedPieceId,
  );
  if (capturedIdx === -1) {
    throw new Error(
      `Captured piece '${action.capturedPieceId}' not found`,
    );
  }
  const capturedPiece = state.capturedPieces[currentPlayer][capturedIdx];
  if (capturedPiece.type === "knight") {
    throw new Error("Cannot ransom a knight — only footmen and archers");
  }

  // Validate placement position (player's home rows, unoccupied)
  const homeRows =
    currentPlayer === "white" ? ["A", "B", "C"] : ["I", "J", "K"];
  const pos = action.placementPosition;
  if (!homeRows.includes(pos.row)) {
    throw new Error("Ransom placement must be in player's home rows");
  }
  if (getPieceAt(state.board, pos)) {
    throw new Error("Ransom placement position is occupied");
  }

  // Remove captured piece from capturedPieces and place on board
  const [returnedPiece] = state.capturedPieces[currentPlayer].splice(
    capturedIdx,
    1,
  );
  returnedPiece.position = { ...action.placementPosition };
  returnedPiece.hasMoved = true;
  setPieceAt(state.board, action.placementPosition, returnedPiece);

  // Record in moveHistory
  state.moveHistory.push({
    piece: { ...findPieceById(gameState.board, pending.pieceId)! },
    from: { ...findPieceById(gameState.board, pending.pieceId)!.position },
    to: { ...action.placementPosition },
    type: "ransom",
    ransomPiece: { ...returnedPiece },
  });

  state.gamePhase = "playing";
  state.pendingRansom = null;

  // Victory checks
  state.capturePoints = updateCapturePointControl(state.board);

  const annihilationWinner = checkAnnihilation(state.board);
  if (annihilationWinner) {
    state.gamePhase = "ended";
    state.winner = annihilationWinner;
    state.winCondition = "annihilation";
    return state;
  }

  const cpVictory = checkCapturePointVictory(state, gameState.turn);
  state.checkPlayer = cpVictory.checkPlayer;
  if (cpVictory.winner) {
    state.gamePhase = "ended";
    state.winner = cpVictory.winner;
    state.winCondition = "checkmate";
    return state;
  }

  state.turn = opponent(gameState.turn);
  return state;
}

// ── Post-move checks (shared by move and capture) ────────────────────

function postMoveChecks(
  state: GameState,
  movedPiece: Piece,
  capturedPiece: Piece | null,
): GameState {
  const movingPlayer = state.turn;

  // Update capture points
  state.capturePoints = updateCapturePointControl(state.board);

  // Check annihilation
  const annihilationWinner = checkAnnihilation(state.board);
  if (annihilationWinner) {
    state.gamePhase = "ended";
    state.winner = annihilationWinner;
    state.winCondition = "annihilation";
    return state;
  }

  // Check capture point victory
  const cpVictory = checkCapturePointVictory(state, movingPlayer);
  state.checkPlayer = cpVictory.checkPlayer;
  if (cpVictory.winner) {
    state.gamePhase = "ended";
    state.winner = cpVictory.winner;
    state.winCondition = "checkmate";
    return state;
  }

  // Check for promotion trigger (footman on enemy back row)
  if (movedPiece.type === "footman" && canPromote(movedPiece, state)) {
    const options = getPromotionOptions(movedPiece, state);
    if (options.capturedPieces.length > 0 && options.placementPositions.length > 0) {
      state.gamePhase = "awaitingPromotion";
      state.pendingPromotion = { pieceId: movedPiece.id };
      return state; // Don't switch turn yet
    }
    // Auto-skip: no captured pieces to return
  }

  // Check for ransom trigger (knight captured enemy knight)
  if (
    capturedPiece &&
    movedPiece.type === "knight" &&
    capturedPiece.type === "knight"
  ) {
    const ransomOpts = getRansomOptions(movedPiece, capturedPiece, state);
    if (
      ransomOpts.capturedPieces.length > 0 &&
      ransomOpts.placementPositions.length > 0
    ) {
      state.gamePhase = "awaitingRansom";
      state.pendingRansom = {
        pieceId: movedPiece.id,
        capturedPieceId: capturedPiece.id,
      };
      return state; // Don't switch turn yet
    }
    // Auto-skip: no eligible pieces or positions
  }

  // Switch turn
  state.turn = opponent(movingPlayer);
  return state;
}
