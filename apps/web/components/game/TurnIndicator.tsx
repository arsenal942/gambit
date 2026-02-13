"use client";

import type { Player, GamePhase } from "@gambit/engine";
import { playerName } from "@/lib/engine-helpers";

interface TurnIndicatorProps {
  turn: Player;
  gamePhase: GamePhase;
}

export function TurnIndicator({ turn, gamePhase }: TurnIndicatorProps) {
  if (gamePhase === "ended") return null;

  let label = `${playerName(turn)}'s Turn`;
  if (gamePhase === "awaitingPromotion") label = `${playerName(turn)} — Promotion`;
  if (gamePhase === "awaitingRansom") label = `${playerName(turn)} — Ransom`;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-2">
      <div
        className="h-4 w-4 rounded-full border-2"
        style={{
          backgroundColor: turn === "white" ? "#FAF0DC" : "#2C1810",
          borderColor: turn === "white" ? "#3D2B1F" : "#D4C5A9",
        }}
      />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
