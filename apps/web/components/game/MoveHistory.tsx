"use client";

import { useRef, useEffect } from "react";
import type { Move } from "@gambit/engine";
import { describeMoveAction, playerName } from "@/lib/engine-helpers";

interface MoveHistoryProps {
  moveHistory: Move[];
}

export function MoveHistory({ moveHistory }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  return (
    <div className="rounded-lg bg-gray-800">
      <div className="border-b border-gray-700 px-3 py-2 text-xs font-semibold text-gray-400">
        Move History
      </div>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto px-3 py-1">
        {moveHistory.length === 0 && (
          <p className="py-2 text-center text-xs text-gray-500">No moves yet</p>
        )}
        {moveHistory.map((move, i) => (
          <div
            key={i}
            className="flex items-baseline gap-2 py-0.5 text-xs"
          >
            <span className="w-5 text-gray-500">{i + 1}.</span>
            <span
              className="font-medium"
              style={{ color: move.piece.player === "white" ? "#FAF0DC" : "#D4C5A9" }}
            >
              {playerName(move.piece.player)}
            </span>
            <span className="text-gray-300">{describeMoveAction(move)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
