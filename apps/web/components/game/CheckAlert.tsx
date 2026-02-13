"use client";

import type { Player } from "@gambit/engine";
import { playerName } from "@/lib/engine-helpers";

interface CheckAlertProps {
  checkPlayer: Player | null;
}

export function CheckAlert({ checkPlayer }: CheckAlertProps) {
  if (!checkPlayer) return null;

  return (
    <div className="rounded-lg border border-red-500 bg-red-950 px-4 py-2 text-center">
      <span className="text-sm font-bold text-red-400">
        {playerName(checkPlayer)} is in CHECK!
      </span>
    </div>
  );
}
