"use client";

import { useState } from "react";
import type { GamePhase } from "@gambit/engine";

interface BotGameControlsProps {
  gamePhase: GamePhase;
  onNewGame: () => void;
  onForfeit: () => void;
  onBack: () => void;
}

export function BotGameControls({
  gamePhase,
  onNewGame,
  onForfeit,
  onBack,
}: BotGameControlsProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (gamePhase === "ended") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onNewGame}
          className="rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
        >
          New Game
        </button>
        <button
          onClick={onBack}
          className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
        >
          Change Difficulty
        </button>
      </div>
    );
  }

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
          <span className="text-xs text-gray-400">Forfeit the game?</span>
          <button
            onClick={() => {
              onForfeit();
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
            onClick={onBack}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            Change Difficulty
          </button>
        </>
      )}
    </div>
  );
}
