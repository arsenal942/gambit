"use client";

import { useState } from "react";
import type { GamePhase } from "@gambit/engine";
import type { DrawOfferState } from "@/hooks/useOnlineGameState";

interface OnlineGameControlsProps {
  gamePhase: GamePhase;
  turnsSinceCapture: number;
  onForfeit: () => void;
  onOfferDraw: () => void;
  drawOffer: DrawOfferState;
}

export function OnlineGameControls({
  gamePhase,
  turnsSinceCapture,
  onForfeit,
  onOfferDraw,
  drawOffer,
}: OnlineGameControlsProps) {
  const [confirmForfeit, setConfirmForfeit] = useState(false);

  if (gamePhase === "ended") return null;

  const drawAvailable = turnsSinceCapture >= 20;

  return (
    <div className="flex flex-wrap gap-2">
      {confirmForfeit ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Forfeit the game?</span>
          <button
            onClick={() => {
              onForfeit();
              setConfirmForfeit(false);
            }}
            className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmForfeit(false)}
            className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-500"
          >
            No
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setConfirmForfeit(true)}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            Forfeit
          </button>
          <button
            onClick={onOfferDraw}
            disabled={!drawAvailable || drawOffer.pending}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              drawOffer.pending
                ? drawOffer.isOurs
                  ? "Draw offered, waiting for response..."
                  : "Draw offer pending"
                : drawAvailable
                  ? "Offer a draw"
                  : `Draw available after ${20 - turnsSinceCapture} more half-turns without capture`
            }
          >
            {drawOffer.pending && drawOffer.isOurs
              ? "Draw Offered..."
              : "Draw"}
          </button>
        </>
      )}
    </div>
  );
}
