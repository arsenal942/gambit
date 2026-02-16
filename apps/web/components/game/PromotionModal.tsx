"use client";

import { useState } from "react";
import {
  getPromotionOptions,
  getPieceAt,
  type GameState,
  type GameAction,
  type Piece,
  type Position,
} from "@gambit/engine";
import { PIECE_COLORS } from "@/lib/constants";
import { posToLabel, playerName } from "@/lib/engine-helpers";

interface PromotionModalProps {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

export function PromotionModal({ gameState, dispatch }: PromotionModalProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const pending = gameState.pendingPromotion;
  if (!pending) return null;

  // Find the footman on the board
  let footman: Piece | null = null;
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 10; c++) {
      const p = gameState.board[r][c];
      if (p && p.id === pending.pieceId) {
        footman = p;
        break;
      }
    }
    if (footman) break;
  }

  if (!footman) return null;

  const options = getPromotionOptions(footman, gameState);
  const colors = PIECE_COLORS[gameState.turn];

  if (selectedPiece) {
    // Step 2: Choose placement position
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
        <div className="mx-4 max-h-[80vh] w-full max-w-80 overflow-y-auto rounded-xl bg-gray-800 p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-amber-100">
            Place {selectedPiece.type}
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Choose a tile in your home rows
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {options.placementPositions.map((pos) => (
              <button
                key={`${pos.row}${pos.col}`}
                onClick={() =>
                  dispatch({
                    type: "promotion",
                    capturedPieceId: selectedPiece.id,
                    placementPosition: pos,
                  })
                }
                className="rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-amber-700"
              >
                {posToLabel(pos)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedPiece(null)}
            className="mt-4 text-xs text-gray-400 hover:text-gray-200"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Choose a captured piece to return
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-80 rounded-xl bg-gray-800 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-amber-100">Promotion</h3>
        <p className="mt-1 text-xs text-gray-400">
          {playerName(gameState.turn)}'s footman reached the back row.
          Choose a captured piece to return, or decline.
        </p>
        <div className="mt-4 space-y-2">
          {options.capturedPieces.map((piece) => (
            <button
              key={piece.id}
              onClick={() => setSelectedPiece(piece)}
              className="flex w-full items-center gap-3 rounded-lg bg-gray-700 px-4 py-2 text-left hover:bg-gray-600"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded text-sm font-bold"
                style={{
                  backgroundColor: colors.fill,
                  color: colors.stroke,
                  border: `1px solid ${colors.stroke}`,
                }}
              >
                {piece.type[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-200">
                {piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => dispatch({ type: "declinePromotion" })}
          className="mt-4 w-full rounded bg-gray-600 py-2 text-sm text-gray-300 hover:bg-gray-500"
        >
          Decline Promotion
        </button>
      </div>
    </div>
  );
}
