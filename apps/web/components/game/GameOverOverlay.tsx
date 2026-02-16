"use client";

import type { Player } from "@gambit/engine";
import type { GameOverRatingChanges } from "@gambit/shared";
import { playerName } from "@/lib/engine-helpers";

interface GameOverOverlayProps {
  winner: Player | null;
  winCondition: string | null;
  onNewGame: () => void;
  playerColor?: Player | null;
  ratingChanges?: GameOverRatingChanges | null;
}

export function GameOverOverlay({
  winner,
  winCondition,
  onNewGame,
  playerColor,
  ratingChanges,
}: GameOverOverlayProps) {
  let title: string;
  let subtitle: string;

  if (winner) {
    title = `${playerName(winner)} Wins!`;
  } else {
    title = "Draw!";
  }

  switch (winCondition) {
    case "annihilation":
      subtitle = "All opponent pieces eliminated";
      break;
    case "checkmate":
      subtitle = "Capture point checkmate";
      break;
    case "forfeit":
      subtitle = "Opponent forfeited";
      break;
    case "draw":
      subtitle = "Game drawn by agreement";
      break;
    default:
      subtitle = "Game over";
  }

  const myRating = ratingChanges && playerColor
    ? ratingChanges[playerColor]
    : null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
      <div className="mx-4 rounded-xl bg-gray-800 p-6 text-center shadow-2xl sm:p-8">
        <h2 className="text-3xl font-bold text-amber-100">{title}</h2>
        <p className="mt-2 text-gray-400">{subtitle}</p>
        {myRating && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-400">
              {Math.round(myRating.after)}
            </span>
            {(() => {
              const diff = Math.round(myRating.after - myRating.before);
              const sign = diff >= 0 ? "+" : "";
              const color = diff >= 0 ? "text-green-400" : "text-red-400";
              return (
                <span className={`text-sm font-bold ${color}`}>
                  ({sign}{diff})
                </span>
              );
            })()}
            {myRating.provisional && (
              <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-amber-300">
                Provisional
              </span>
            )}
          </div>
        )}
        <button
          onClick={onNewGame}
          className="mt-6 rounded-lg bg-amber-700 px-6 py-2 font-semibold text-white transition-colors hover:bg-amber-600"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
