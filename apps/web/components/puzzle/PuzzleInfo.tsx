"use client";

import type { Puzzle } from "@/lib/puzzle/types";

interface PuzzleInfoProps {
  puzzle: Puzzle;
  moveIndex: number;
  totalMoves: number;
  feedback: string | null;
  hintVisible: boolean;
  onShowHint: () => void;
  status: "solving" | "solved" | "failed";
}

const difficultyColors = {
  beginner: "bg-green-900/60 text-green-300 border-green-700",
  intermediate: "bg-amber-900/60 text-amber-300 border-amber-700",
  advanced: "bg-red-900/60 text-red-300 border-red-700",
};

export function PuzzleInfo({
  puzzle,
  moveIndex,
  totalMoves,
  feedback,
  hintVisible,
  onShowHint,
  status,
}: PuzzleInfoProps) {
  return (
    <div className="space-y-3">
      {/* Title + difficulty */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-amber-100">{puzzle.title}</h2>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${difficultyColors[puzzle.difficulty]}`}
          >
            {puzzle.difficulty}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-300">{puzzle.objective}</p>
      </div>

      {/* Move counter */}
      {totalMoves > 1 && status === "solving" && (
        <p className="text-sm text-gray-400">
          Move {moveIndex + 1} of {totalMoves}
        </p>
      )}

      {/* Feedback */}
      {feedback && (
        <p
          className={`text-sm font-medium ${
            status === "solved"
              ? "text-green-400"
              : status === "failed"
                ? "text-red-400"
                : "text-gray-300"
          }`}
        >
          {feedback}
        </p>
      )}

      {/* Hint */}
      {status === "solving" && !hintVisible && (
        <button
          onClick={onShowHint}
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Show hint
        </button>
      )}
      {hintVisible && status === "solving" && (
        <p className="rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-300">
          {puzzle.hint}
        </p>
      )}
    </div>
  );
}
