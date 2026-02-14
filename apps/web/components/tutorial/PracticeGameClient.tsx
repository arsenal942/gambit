"use client";

import Link from "next/link";
import { useTutorialGameState } from "@/hooks/useTutorialGameState";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import { useTutorialProgress } from "@/hooks/useTutorialProgress";
import { GameBoard } from "@/components/game/GameBoard";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { CapturedPiecesTray } from "@/components/game/CapturedPiecesTray";
import { PromotionModal } from "@/components/game/PromotionModal";
import { RansomModal } from "@/components/game/RansomModal";
import { BotThinkingIndicator } from "@/components/game/BotThinkingIndicator";
import { TutorialProgressBar } from "./TutorialProgressBar";
import { TutorialHintBanner } from "./TutorialHintBanner";
import { LESSONS } from "@/lib/tutorial/lessons";
import type { Position } from "@gambit/engine";

export function PracticeGameClient() {
  const {
    gameState,
    legalMoves,
    dispatch,
    newGame,
    lastMove,
    isBotThinking,
    hintText,
    isGameOver,
    winner,
    playerColor,
  } = useTutorialGameState();

  const { progress, markLessonComplete } = useTutorialProgress();

  const {
    selectedPieceId,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
  } = useBoardInteraction(gameState, legalMoves, dispatch);

  const isMyTurn = gameState.turn === playerColor;
  const showPromotion =
    gameState.gamePhase === "awaitingPromotion" && isMyTurn;
  const showRansom = gameState.gamePhase === "awaitingRansom" && isMyTurn;

  const lastMoveHighlight = lastMove
    ? { from: lastMove.from, to: lastMove.to }
    : null;

  const handleGameComplete = () => {
    markLessonComplete("practice-game");
    window.location.href = "/tutorial";
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Header */}
      <div className="mx-auto mb-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link
            href="/tutorial"
            className="text-sm text-gray-400 transition-colors hover:text-gray-200"
          >
            &larr; Back to Lessons
          </Link>
          <span className="text-sm text-gray-500">
            Lesson 8 of {LESSONS.length}
          </span>
        </div>
        <div className="mt-2">
          <TutorialProgressBar
            currentLessonNumber={8}
            completedLessons={progress.completedLessons}
          />
        </div>
        <h1 className="mt-3 text-center text-xl font-bold text-amber-100">
          Your First Battle
        </h1>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-4xl flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        {/* Board */}
        <div className="relative w-full max-w-[640px]">
          {/* Hint banner above board */}
          {hintText && !isGameOver && (
            <div className="mb-3">
              <TutorialHintBanner text={hintText} />
            </div>
          )}

          <GameBoard
            board={gameState.board}
            selectedPieceId={selectedPieceId}
            highlights={highlights}
            pushbackArrows={pushbackArrows}
            lastMove={lastMoveHighlight}
            onTileClick={onTileClick}
            onPushDirectionClick={onPushDirectionClick}
          />

          {/* Game over overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/70">
              <div className="mx-4 max-w-sm rounded-xl bg-gray-800 px-6 py-8 text-center shadow-2xl">
                {winner === playerColor ? (
                  <>
                    <h2 className="text-2xl font-bold text-amber-300">
                      Victory!
                    </h2>
                    <p className="mt-2 text-gray-300">
                      Congratulations! You&apos;ve conquered the training dummy.
                      You&apos;re ready for a real challenge!
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-300">
                      Defeat
                    </h2>
                    <p className="mt-2 text-gray-400">
                      Don&apos;t worry — even the best generals lose sometimes.
                      Try again!
                    </p>
                  </>
                )}
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href="/game/bot"
                    onClick={() => markLessonComplete("practice-game")}
                    className="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    Challenge the Squire Bot
                  </Link>
                  <button
                    onClick={handleGameComplete}
                    className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                  >
                    Back to Tutorial
                  </button>
                  <button
                    onClick={newGame}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-400"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          {showPromotion && (
            <PromotionModal gameState={gameState} dispatch={dispatch} />
          )}
          {showRansom && (
            <RansomModal gameState={gameState} dispatch={dispatch} />
          )}
        </div>

        {/* Sidebar */}
        <div className="mt-4 w-full max-w-[640px] space-y-3 lg:mt-0 lg:w-72">
          {/* Coach intro */}
          <div className="rounded-xl border border-amber-800/40 bg-gray-800/90 px-5 py-4">
            <p className="text-sm leading-relaxed text-gray-300">
              Time to put it all together! This is a practice game against a
              training dummy. Use everything you&apos;ve learned — movement,
              captures, pushback, longshots, and capture points.
            </p>
          </div>

          <div className="rounded-lg bg-gray-800 px-4 py-3 text-center">
            <div className="text-sm font-semibold text-gray-200">
              vs Training Dummy
            </div>
            <div className="text-xs text-gray-500">Practice Opponent</div>
          </div>

          <TurnIndicator
            turn={gameState.turn}
            gamePhase={gameState.gamePhase}
          />

          {isBotThinking && (
            <BotThinkingIndicator botName="Training Dummy" />
          )}

          <CapturedPiecesTray capturedPieces={gameState.capturedPieces} />

          <Link
            href="/tutorial"
            className="block text-center text-xs text-gray-500 transition-colors hover:text-gray-400"
          >
            Skip Tutorial
          </Link>
        </div>
      </div>
    </div>
  );
}
