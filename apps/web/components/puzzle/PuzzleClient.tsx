"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Position } from "@gambit/engine";
import { usePuzzleState } from "@/hooks/usePuzzleState";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";
import { GameBoard } from "@/components/game/GameBoard";
import { PromotionModal } from "@/components/game/PromotionModal";
import { RansomModal } from "@/components/game/RansomModal";
import { PuzzleInfo } from "./PuzzleInfo";
import { ShareButton } from "./ShareButton";
import { getDailyPuzzleNumber, getPuzzleByNumber, TOTAL_PUZZLES } from "@/lib/puzzle/daily";

export function PuzzleClient() {
  const dailyNumber = useMemo(() => getDailyPuzzleNumber(), []);
  const [currentNumber, setCurrentNumber] = useState(dailyNumber);

  const puzzle = useMemo(() => getPuzzleByNumber(currentNumber), [currentNumber]);
  const isDaily = currentNumber === dailyNumber;

  const {
    gameState,
    legalMoves,
    dispatch,
    status,
    moveIndex,
    totalMoves,
    feedback,
    hintVisible,
    showHint,
    reset,
  } = usePuzzleState(puzzle);

  const { selectedPieceId, highlights, pushbackArrows, onTileClick, onPushDirectionClick } =
    useBoardInteraction(gameState, legalMoves, dispatch);

  const { markSolved, isSolved, solvedCount, currentStreak } = usePuzzleProgress();

  // Mark solved when puzzle is completed
  const alreadySolved = isSolved(puzzle.id);
  if (status === "solved" && !alreadySolved) {
    markSolved(puzzle.id);
  }

  const handleTileClick = (pos: Position) => {
    if (status !== "solving") return;
    onTileClick(pos);
  };

  const handlePushDirection = (direction: [number, number], resultingPosition: Position) => {
    if (status !== "solving") return;
    onPushDirectionClick(direction, resultingPosition);
  };

  const goToPuzzle = (n: number) => {
    const wrapped = ((n - 1) % TOTAL_PUZZLES + TOTAL_PUZZLES) % TOTAL_PUZZLES + 1;
    setCurrentNumber(wrapped);
  };

  const showPromotion =
    gameState.gamePhase === "awaitingPromotion" && gameState.turn === "white";
  const showRansom =
    gameState.gamePhase === "awaitingRansom" && gameState.turn === "white";

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Header */}
      <div className="mx-auto mb-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-gray-200"
          >
            &larr; Home
          </Link>
          {isDaily && (
            <span className="rounded-full border border-amber-700/50 bg-amber-900/30 px-3 py-0.5 text-xs font-medium text-amber-400">
              Today&apos;s Puzzle
            </span>
          )}
        </div>

        {/* Puzzle navigation */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            onClick={() => goToPuzzle(currentNumber - 1)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label="Previous puzzle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-amber-100">
              Puzzle #{currentNumber}
            </h1>
            {isSolved(puzzle.id) && status !== "solved" && (
              <span className="text-xs text-green-400">Completed</span>
            )}
          </div>

          <button
            onClick={() => goToPuzzle(currentNumber + 1)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label="Next puzzle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-4xl flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        {/* Board section */}
        <div className="relative w-full max-w-[640px]">
          {/* Info panel above board on mobile */}
          <div className="mb-3 lg:hidden">
            <PuzzleInfo
              puzzle={puzzle}
              moveIndex={moveIndex}
              totalMoves={totalMoves}
              feedback={feedback}
              hintVisible={hintVisible}
              onShowHint={showHint}
              status={status}
            />
          </div>

          <GameBoard
            board={gameState.board}
            selectedPieceId={status === "solving" ? selectedPieceId : null}
            highlights={status === "solving" ? highlights : []}
            pushbackArrows={status === "solving" ? pushbackArrows : []}
            lastMove={null}
            onTileClick={handleTileClick}
            onPushDirectionClick={handlePushDirection}
          />

          {/* Promotion/Ransom modals */}
          {showPromotion && (
            <PromotionModal gameState={gameState} dispatch={dispatch} />
          )}
          {showRansom && (
            <RansomModal gameState={gameState} dispatch={dispatch} />
          )}

          {/* Solved overlay */}
          {status === "solved" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-xs space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
                <div className="text-4xl">&#127942;</div>
                <h2 className="text-xl font-bold text-amber-100">
                  Puzzle Solved!
                </h2>
                <p className="text-sm text-gray-400">
                  {puzzle.title} — {puzzle.difficulty}
                </p>
                <ShareButton puzzleNumber={currentNumber} />
                <button
                  onClick={() => goToPuzzle(currentNumber + 1)}
                  className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  Next Puzzle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden w-72 space-y-4 lg:block">
          <PuzzleInfo
            puzzle={puzzle}
            moveIndex={moveIndex}
            totalMoves={totalMoves}
            feedback={feedback}
            hintVisible={hintVisible}
            onShowHint={showHint}
            status={status}
          />

          {status === "solving" && (
            <button
              onClick={reset}
              className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            >
              Reset Puzzle
            </button>
          )}

          {status === "solved" && (
            <ShareButton puzzleNumber={currentNumber} />
          )}

          {/* Stats */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3">
            <h3 className="mb-2 text-sm font-semibold text-gray-300">Stats</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Solved</span>
              <span className="text-gray-300">
                {solvedCount} / {TOTAL_PUZZLES}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-gray-500">Streak</span>
              <span className="text-amber-400">
                {currentStreak} day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Daily button */}
          {!isDaily && (
            <button
              onClick={() => setCurrentNumber(dailyNumber)}
              className="w-full rounded-lg bg-amber-900/30 px-4 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-900/50"
            >
              Go to Today&apos;s Puzzle
            </button>
          )}
        </div>

        {/* Mobile: controls below board */}
        <div className="mt-3 w-full max-w-[640px] space-y-3 lg:hidden">
          {status === "solving" && (
            <button
              onClick={reset}
              className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            >
              Reset Puzzle
            </button>
          )}

          {status === "solved" && (
            <div className="space-y-2">
              <ShareButton puzzleNumber={currentNumber} />
              <button
                onClick={() => goToPuzzle(currentNumber + 1)}
                className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Next Puzzle
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-gray-500">
              Solved: <span className="text-gray-300">{solvedCount}/{TOTAL_PUZZLES}</span>
            </span>
            <span className="text-gray-500">
              Streak: <span className="text-amber-400">{currentStreak}d</span>
            </span>
          </div>

          {!isDaily && (
            <button
              onClick={() => setCurrentNumber(dailyNumber)}
              className="w-full rounded-lg bg-amber-900/30 px-4 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-900/50"
            >
              Go to Today&apos;s Puzzle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
