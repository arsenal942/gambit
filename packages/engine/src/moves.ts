import type { Board, GameState, Piece, Player, Position } from "./types.js";
import { getFootmanMoves, getFootmanCaptures, getFootmanPushbacks } from "./units/footman.js";
import { getArcherMoves, getArcherLongshots } from "./units/archer.js";
import { getKnightMoves, getKnightCaptures } from "./units/knight.js";

type Direction = [number, number];

export interface PieceActions {
  piece: Piece;
  moves: Position[];
  captures: { position: Position; targetPiece: Piece }[];
  pushbacks: {
    targetPiece: Piece;
    pushDirection: Direction;
    resultingPosition: Position;
  }[];
  longshots: {
    targetPiece: Piece;
    targetPosition: Position;
    screenPiece: Piece;
    direction: Direction;
  }[];
}

/**
 * Returns all pieces belonging to the given player on the board.
 */
export function getAllPieces(player: Player, board: Board): Piece[] {
  const pieces: Piece[] = [];
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

/**
 * Aggregates all legal actions for every piece belonging to the given player.
 * Returns only pieces that have at least one available action.
 */
export function getAllLegalMoves(
  player: Player,
  gameState: GameState,
): PieceActions[] {
  const pieces = getAllPieces(player, gameState.board);
  const result: PieceActions[] = [];

  for (const piece of pieces) {
    const actions: PieceActions = {
      piece,
      moves: [],
      captures: [],
      pushbacks: [],
      longshots: [],
    };

    switch (piece.type) {
      case "footman":
        actions.moves = getFootmanMoves(piece, gameState);
        actions.captures = getFootmanCaptures(piece, gameState);
        actions.pushbacks = getFootmanPushbacks(piece, gameState);
        break;
      case "archer":
        actions.moves = getArcherMoves(piece, gameState);
        actions.longshots = getArcherLongshots(piece, gameState);
        break;
      case "knight":
        actions.moves = getKnightMoves(piece, gameState);
        actions.captures = getKnightCaptures(piece, gameState);
        break;
    }

    const hasAny =
      actions.moves.length > 0 ||
      actions.captures.length > 0 ||
      actions.pushbacks.length > 0 ||
      actions.longshots.length > 0;

    if (hasAny) {
      result.push(actions);
    }
  }

  return result;
}

/**
 * Returns true if the given player has at least one legal action available.
 * Short-circuits as soon as any action is found.
 */
export function hasLegalMoves(
  player: Player,
  gameState: GameState,
): boolean {
  const pieces = getAllPieces(player, gameState.board);

  for (const piece of pieces) {
    switch (piece.type) {
      case "footman":
        if (getFootmanMoves(piece, gameState).length > 0) return true;
        if (getFootmanCaptures(piece, gameState).length > 0) return true;
        if (getFootmanPushbacks(piece, gameState).length > 0) return true;
        break;
      case "archer":
        if (getArcherMoves(piece, gameState).length > 0) return true;
        if (getArcherLongshots(piece, gameState).length > 0) return true;
        break;
      case "knight":
        if (getKnightMoves(piece, gameState).length > 0) return true;
        if (getKnightCaptures(piece, gameState).length > 0) return true;
        break;
    }
  }

  return false;
}
