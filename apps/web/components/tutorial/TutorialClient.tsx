"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Position } from "@gambit/engine";
import { useTutorialState } from "@/hooks/useTutorialState";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import { useTutorialProgress } from "@/hooks/useTutorialProgress";
import { GameBoard } from "@/components/game/GameBoard";
import { PromotionModal } from "@/components/game/PromotionModal";
import { RansomModal } from "@/components/game/RansomModal";
import { CoachPanel } from "./CoachPanel";
import { TutorialBoardOverlay } from "./TutorialBoardOverlay";
import { TutorialProgressBar } from "./TutorialProgressBar";
import type { TutorialLesson, ObserveStep } from "@/lib/tutorial/types";
import { LESSONS } from "@/lib/tutorial/lessons";

interface TutorialClientProps {
  lesson: TutorialLesson;
}

export function TutorialClient({ lesson }: TutorialClientProps) {
  const tutorial = useTutorialState(lesson);
  const { progress, markLessonComplete } = useTutorialProgress();

  const {
    gameState,
    legalMoves,
    currentStep,
    stepIndex,
    totalSteps,
    stepStatus,
    successText,
    wrongMoveText,
    hintText,
    isInteractive,
    advance,
    resetStep,
    dispatch,
  } = tutorial;

  // Use board interaction for interactive steps
  const {
    selectedPieceId,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
  } = useBoardInteraction(gameState, legalMoves, dispatch);

  // Determine if the board should be interactive
  const isObserve =
    currentStep.type === "observe" ||
    currentStep.type === "complete" ||
    currentStep.type === "scripted";

  const handleTileClick = (pos: Position) => {
    if (isObserve || stepStatus !== "active") return;
    onTileClick(pos);
  };

  const handlePushDirection = (
    direction: [number, number],
    resultingPosition: Position,
  ) => {
    if (isObserve || stepStatus !== "active") return;
    onPushDirectionClick(direction, resultingPosition);
  };

  // Get overlay annotations from the current step
  const overlayHighlights = useMemo(() => {
    if (currentStep.type === "observe") {
      return (currentStep as ObserveStep).highlights;
    }
    return undefined;
  }, [currentStep]);

  const overlayArrows = useMemo(() => {
    if (currentStep.type === "observe" && "arrows" in currentStep) {
      return (currentStep as ObserveStep).arrows;
    }
    return undefined;
  }, [currentStep]);

  const pulsingPositions = useMemo(() => {
    if ("pieceHighlights" in currentStep && currentStep.pieceHighlights) {
      const positions: Position[] = [];
      for (const pieceId of currentStep.pieceHighlights) {
        // Find the piece on the board
        for (let r = 0; r < 11; r++) {
          for (let c = 0; c < 10; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.id === pieceId) {
              positions.push(piece.position);
            }
          }
        }
      }
      return positions;
    }
    if ("highlightPieces" in currentStep && currentStep.highlightPieces) {
      const positions: Position[] = [];
      for (const pieceId of currentStep.highlightPieces) {
        for (let r = 0; r < 11; r++) {
          for (let c = 0; c < 10; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.id === pieceId) {
              positions.push(piece.position);
            }
          }
        }
      }
      return positions;
    }
    return undefined;
  }, [currentStep, gameState.board]);

  // Handle "Continue" for observe steps or advancing after success
  const handleContinue = () => {
    if (currentStep.type === "complete") {
      // Mark lesson as complete and navigate to next or hub
      markLessonComplete(lesson.id);
      const nextLesson = LESSONS.find(
        (l) => l.number === lesson.number + 1,
      );
      if (nextLesson) {
        window.location.href = `/tutorial/${nextLesson.id}`;
      } else {
        window.location.href = "/tutorial";
      }
      return;
    }
    advance();
  };

  // Show promotion/ransom modals
  const showPromotion =
    gameState.gamePhase === "awaitingPromotion" && gameState.turn === "white";
  const showRansom =
    gameState.gamePhase === "awaitingRansom" && gameState.turn === "white";

  const isCompleteStep = currentStep.type === "complete";
  const showContinueButton =
    isObserve || stepStatus === "success" || isCompleteStep;

  const continueLabel = isCompleteStep
    ? lesson.number < 8
      ? "Next Lesson"
      : "Finish Tutorial"
    : "Continue";

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
            Lesson {lesson.number} of {LESSONS.length}
          </span>
        </div>
        <div className="mt-2">
          <TutorialProgressBar
            currentLessonNumber={lesson.number}
            completedLessons={progress.completedLessons}
          />
        </div>
        <h1 className="mt-3 text-center text-xl font-bold text-amber-100">
          {lesson.title}
        </h1>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-4xl flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        {/* Board section */}
        <div className="relative w-full max-w-[640px]">
          {/* Coach panel above board on mobile */}
          <div className="mb-3 lg:hidden">
            <CoachPanel
              text={currentStep.coachText}
              showContinue={showContinueButton}
              onContinue={handleContinue}
              successText={successText}
              wrongMoveText={wrongMoveText}
              hintText={hintText}
              stepLabel={
                isCompleteStep
                  ? undefined
                  : `Step ${stepIndex + 1} of ${totalSteps}`
              }
            />
          </div>

          <GameBoard
            board={gameState.board}
            selectedPieceId={isInteractive ? selectedPieceId : null}
            highlights={isInteractive ? highlights : []}
            pushbackArrows={isInteractive ? pushbackArrows : []}
            lastMove={null}
            onTileClick={handleTileClick}
            onPushDirectionClick={handlePushDirection}
          >
            <TutorialBoardOverlay
              highlights={overlayHighlights}
              arrows={overlayArrows}
              pulsingPiecePositions={pulsingPositions}
            />
          </GameBoard>

          {/* Overlays */}
          {showPromotion && (
            <PromotionModal gameState={gameState} dispatch={dispatch} />
          )}
          {showRansom && (
            <RansomModal gameState={gameState} dispatch={dispatch} />
          )}
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden w-72 space-y-3 lg:block">
          <CoachPanel
            text={currentStep.coachText}
            showContinue={showContinueButton}
            onContinue={handleContinue}
            successText={successText}
            wrongMoveText={wrongMoveText}
            hintText={hintText}
            stepLabel={
              isCompleteStep
                ? undefined
                : `Step ${stepIndex + 1} of ${totalSteps}`
            }
          />

          {/* Complete step: summary bullets */}
          {isCompleteStep && "summaryPoints" in currentStep && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/80 px-5 py-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-400">
                What you learned:
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-300">
                {currentStep.summaryPoints.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-amber-500">&#10003;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep.type === "freeplay" && (
            <button
              onClick={resetStep}
              className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            >
              Reset Scenario
            </button>
          )}

          <Link
            href="/tutorial"
            className="block text-center text-xs text-gray-500 transition-colors hover:text-gray-400"
          >
            Skip Tutorial
          </Link>
        </div>

        {/* Mobile: summary + controls below board */}
        <div className="mt-3 w-full max-w-[640px] space-y-3 lg:hidden">
          {isCompleteStep && "summaryPoints" in currentStep && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/80 px-5 py-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-400">
                What you learned:
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-300">
                {currentStep.summaryPoints.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-amber-500">&#10003;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep.type === "freeplay" && (
            <button
              onClick={resetStep}
              className="w-full rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            >
              Reset Scenario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
