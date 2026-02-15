"use client";

import type { Move } from "@gambit/engine";
import { GameBoard } from "./GameBoard";
import { CapturedPiecesTray } from "./CapturedPiecesTray";
import { useReplayState } from "@/hooks/useReplayState";
import { useReplaySounds } from "@/hooks/useReplaySounds";

interface ReplayClientProps {
  moves: unknown[];
}

export function ReplayClient({ moves }: ReplayClientProps) {
  const typedMoves = moves as Move[];
  const {
    frames,
    currentIndex,
    currentFrame,
    totalFrames,
    isPlaying,
    canGoForward,
    canGoBack,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    goToFrame,
    toggleAutoPlay,
  } = useReplayState(typedMoves);

  const { state } = currentFrame;

  // Play sounds during replay (debounced for scrubbing)
  const currentMoveForSound =
    currentFrame.moveIndex !== null ? typedMoves[currentFrame.moveIndex] ?? null : null;
  useReplaySounds(currentIndex, currentMoveForSound, isPlaying);

  // Build last move highlight from current frame's state
  const lastMove =
    state.moveHistory.length > 0
      ? {
          from: state.moveHistory[state.moveHistory.length - 1].from,
          to: state.moveHistory[state.moveHistory.length - 1].to,
        }
      : null;

  const btnBase =
    "rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30";
  const btnStyle = `${btnBase} bg-gray-700 text-gray-200 hover:bg-gray-600`;

  // Build move list from original moves (exclude injected frames)
  const moveEntries = frames
    .filter((f) => f.moveIndex !== null)
    .map((f, i) => ({
      frameIndex: frames.indexOf(f),
      label: f.moveDescription ?? "",
      moveNum: i + 1,
    }));

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Board + Controls */}
      <div className="flex flex-col items-center gap-4">
        <GameBoard
          board={state.board}
          selectedPieceId={null}
          highlights={[]}
          pushbackArrows={[]}
          lastMove={lastMove}
          onTileClick={() => {}}
          onPushDirectionClick={() => {}}
        />

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToStart}
            disabled={!canGoBack}
            className={btnStyle}
            title="Go to start (Home)"
          >
            ⏮
          </button>
          <button
            onClick={stepBackward}
            disabled={!canGoBack}
            className={btnStyle}
            title="Previous move (←)"
          >
            ◀
          </button>
          <button
            onClick={toggleAutoPlay}
            className={`${btnBase} ${
              isPlaying
                ? "bg-amber-700 text-white hover:bg-amber-600"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
            title="Auto-play (Space)"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={stepForward}
            disabled={!canGoForward}
            className={btnStyle}
            title="Next move (→)"
          >
            ▶
          </button>
          <button
            onClick={goToEnd}
            disabled={!canGoForward}
            className={btnStyle}
            title="Go to end (End)"
          >
            ⏭
          </button>
        </div>

        {/* Current move info */}
        <div className="text-center text-sm text-gray-400">
          {currentFrame.moveDescription ? (
            <>
              <span className="text-gray-500">
                Move {currentIndex} of {totalFrames - 1}
              </span>
              {" — "}
              <span className="text-amber-200">
                {currentFrame.moveDescription}
              </span>
            </>
          ) : currentIndex === 0 ? (
            <span className="text-gray-500">Starting position</span>
          ) : (
            <span className="text-gray-500">
              Move {currentIndex} of {totalFrames - 1}
            </span>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex w-full flex-col gap-4 lg:w-72">
        {/* Capture Points */}
        <div className="rounded-lg bg-gray-800 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Capture Points
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {["F1", "F4", "F7", "F10"].map((key) => {
              const owner = state.capturePoints[key];
              return (
                <div
                  key={key}
                  className={`rounded px-2 py-1 ${
                    owner === "white"
                      ? "bg-amber-100/20 text-amber-100"
                      : owner === "black"
                        ? "bg-gray-600 text-gray-200"
                        : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        </div>

        {/* Captured Pieces */}
        <div className="rounded-lg bg-gray-800 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Captured Pieces
          </h3>
          <CapturedPiecesTray capturedPieces={state.capturedPieces} />
        </div>

        {/* Move List */}
        <div className="rounded-lg bg-gray-800 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Move History
          </h3>
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {moveEntries.map((entry) => (
              <button
                key={entry.frameIndex}
                onClick={() => goToFrame(entry.frameIndex)}
                className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                  entry.frameIndex === currentIndex
                    ? "bg-amber-700/30 text-amber-200"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              >
                <span className="mr-2 text-gray-600">{entry.moveNum}.</span>
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
