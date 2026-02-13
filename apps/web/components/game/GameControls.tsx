"use client";

import { useState } from "react";
import type { Player, GamePhase } from "@gambit/engine";

interface GameControlsProps {
  turn: Player;
  gamePhase: GamePhase;
  turnsSinceCapture: number;
  onNewGame: () => void;
  onForfeit: (player: Player) => void;
  onOfferDraw: () => void;
}

export function GameControls({
  turn,
  gamePhase,
  turnsSinceCapture,
  onNewGame,
  onForfeit,
  onOfferDraw,
}: GameControlsProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (gamePhase === "ended") return null;

  const drawAvailable = turnsSinceCapture >= 20;

  return (
    <div className="flex flex-wrap gap-2">
      {confirmAction === "newgame" ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Start new game?</span>
          <button
            onClick={() => {
              onNewGame();
              setConfirmAction(null);
            }}
            className="rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmAction(null)}
            className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-500"
          >
            No
          </button>
        </div>
      ) : confirmAction === "forfeit" ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {turn === "white" ? "White" : "Black"} forfeits?
          </span>
          <button
            onClick={() => {
              onForfeit(turn);
              setConfirmAction(null);
            }}
            className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmAction(null)}
            className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-500"
          >
            No
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setConfirmAction("newgame")}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            New Game
          </button>
          <button
            onClick={() => setConfirmAction("forfeit")}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            Forfeit
          </button>
          <button
            onClick={onOfferDraw}
            disabled={!drawAvailable}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              drawAvailable
                ? "Offer a draw"
                : `Draw available after ${20 - turnsSinceCapture} more half-turns without capture`
            }
          >
            Draw
          </button>
        </>
      )}
    </div>
  );
}
