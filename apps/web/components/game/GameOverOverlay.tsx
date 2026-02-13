"use client";

import type { Player } from "@gambit/engine";
import { playerName } from "@/lib/engine-helpers";

interface GameOverOverlayProps {
  winner: Player | null;
  winCondition: string | null;
  onNewGame: () => void;
}

export function GameOverOverlay({
  winner,
  winCondition,
  onNewGame,
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

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
      <div className="rounded-xl bg-gray-800 p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-amber-100">{title}</h2>
        <p className="mt-2 text-gray-400">{subtitle}</p>
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
