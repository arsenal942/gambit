import {
  createEmptyBoard,
  setPieceAt,
  type GameState,
  type Piece,
} from "@gambit/engine";
import type { BoardSetup, PiecePlacement } from "./types";

function placementToPiece(p: PiecePlacement): Piece {
  return {
    id: p.id,
    type: p.type,
    player: p.player,
    position: { ...p.position },
    hasMoved: p.hasMoved ?? true,
  };
}

export function buildGameState(setup: BoardSetup): GameState {
  const board = createEmptyBoard();

  for (const placement of setup.pieces) {
    const piece = placementToPiece(placement);
    setPieceAt(board, piece.position, piece);
  }

  const capturedWhite = (setup.capturedPieces?.white ?? []).map(placementToPiece);
  const capturedBlack = (setup.capturedPieces?.black ?? []).map(placementToPiece);

  return {
    board,
    turn: setup.turn,
    moveHistory: [],
    capturedPieces: { white: capturedWhite, black: capturedBlack },
    capturePoints: setup.capturePoints
      ? { ...setup.capturePoints } as GameState["capturePoints"]
      : { F1: null, F4: null, F7: null, F10: null },
    checkPlayer: null,
    lastPushback: setup.lastPushback ?? null,
    turnsSinceCapture: 0,
    gamePhase: "playing",
    winner: null,
    winCondition: null,
    pendingPromotion: null,
    pendingRansom: null,
  };
}
