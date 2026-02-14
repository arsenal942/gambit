"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  executeMove,
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type PieceActions,
  type Position,
} from "@gambit/engine";
import { buildGameState } from "@/lib/tutorial/board-setup";
import type {
  TutorialLesson,
  TutorialStep,
  ExpectedAction,
  InteractStep,
  ScriptedStep,
} from "@/lib/tutorial/types";

type StepStatus = "active" | "success" | "wrong";

interface TutorialStateResult {
  gameState: GameState;
  legalMoves: PieceActions[];
  currentStep: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  stepStatus: StepStatus;
  successText: string | null;
  wrongMoveText: string | null;
  hintText: string | null;
  isInteractive: boolean;
  isComplete: boolean;
  advance: () => void;
  resetStep: () => void;
  dispatch: (action: GameAction) => void;
}

function matchesExpected(
  action: GameAction,
  expected: ExpectedAction | undefined,
): boolean {
  if (!expected) return true;

  switch (expected.type) {
    case "any":
      return true;

    case "exact":
      return JSON.stringify(action) === JSON.stringify(expected.action);

    case "any_of":
      return expected.actions.some(
        (a) => JSON.stringify(action) === JSON.stringify(a),
      );

    case "move_type":
      return action.type === expected.moveType;

    case "piece_to_position": {
      if (action.type === "move" || action.type === "capture" || action.type === "longshot") {
        const to: Position = action.type === "longshot"
          ? (action as { targetPosition: Position }).targetPosition
          : (action as { to: Position }).to;
        const pieceId = (action as { pieceId: string }).pieceId;
        return (
          pieceId === expected.pieceId &&
          to.col === expected.targetPosition.col &&
          to.row === expected.targetPosition.row
        );
      }
      if (action.type === "pushback") {
        return (action as { pieceId: string }).pieceId === expected.pieceId;
      }
      return false;
    }

    default:
      return true;
  }
}

export function useTutorialState(lesson: TutorialLesson): TutorialStateResult {
  const [stepIndex, setStepIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => {
    const step = lesson.steps[0];
    if ("boardSetup" in step) {
      return buildGameState(step.boardSetup);
    }
    return buildGameState({ pieces: [], turn: "white" });
  });
  const [stepStatus, setStepStatus] = useState<StepStatus>("active");
  const [successText, setSuccessText] = useState<string | null>(null);
  const [wrongMoveText, setWrongMoveText] = useState<string | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = lesson.steps[stepIndex];
  const totalSteps = lesson.steps.length;
  const isComplete = stepIndex >= totalSteps;

  // Compute legal moves (filtered by allowedPieceIds if set)
  const legalMoves = useMemo(() => {
    if (!currentStep) return [];
    if (currentStep.type !== "interact" && currentStep.type !== "freeplay") {
      return [];
    }

    const allMoves = getAllLegalMoves(gameState.turn, gameState);

    const interactStep = currentStep as InteractStep;
    if (interactStep.allowedPieceIds) {
      return allMoves.filter((pa) =>
        interactStep.allowedPieceIds!.includes(pa.piece.id),
      );
    }

    return allMoves;
  }, [gameState, currentStep]);

  const isInteractive = useMemo(() => {
    if (!currentStep) return false;
    return currentStep.type === "interact" || currentStep.type === "freeplay";
  }, [currentStep]);

  // Initialize board state when step changes
  useEffect(() => {
    if (!currentStep) return;

    if ("boardSetup" in currentStep) {
      setGameState(buildGameState(currentStep.boardSetup));
    }
    setStepStatus("active");
    setSuccessText(null);
    setWrongMoveText(null);
    setHintText(null);

    // Clear existing timers
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);

    // Set up hint timer for interact steps
    if (currentStep.type === "interact" && currentStep.hints && currentStep.hints.length > 0) {
      const hint = currentStep.hints[0];
      hintTimerRef.current = setTimeout(() => {
        setHintText(hint.text);
      }, hint.delayMs);
    }

    // Auto-execute scripted steps
    if (currentStep.type === "scripted") {
      const scriptedStep = currentStep as ScriptedStep;
      const timer = setTimeout(() => {
        try {
          const newState = executeMove(
            buildGameState(scriptedStep.boardSetup),
            scriptedStep.action,
          );
          setGameState(newState);
          setSuccessText(scriptedStep.afterText);
          setStepStatus("success");
        } catch {
          // If the scripted move fails, just advance
          setStepStatus("success");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, currentStep]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const advance = useCallback(() => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  }, [stepIndex, totalSteps]);

  const resetStep = useCallback(() => {
    if (currentStep && "boardSetup" in currentStep) {
      setGameState(buildGameState(currentStep.boardSetup));
    }
    setStepStatus("active");
    setSuccessText(null);
    setWrongMoveText(null);
    setHintText(null);
  }, [currentStep]);

  const dispatch = useCallback(
    (action: GameAction) => {
      if (!currentStep || stepStatus !== "active") return;

      if (currentStep.type === "interact") {
        const step = currentStep;

        // Handle promotion/ransom modal actions (after a move triggered a pending phase)
        if (
          action.type === "promotion" ||
          action.type === "declinePromotion" ||
          action.type === "ransom" ||
          action.type === "declineRansom"
        ) {
          try {
            const newState = executeMove(gameState, action);
            setGameState(newState);
            setSuccessText(step.successText || "Well done!");
            setStepStatus("success");
            successTimerRef.current = setTimeout(() => {
              advance();
            }, 1800);
          } catch {
            // Ignore errors from modal actions
          }
          return;
        }

        // Validate against expected action
        if (step.expectedAction && !matchesExpected(action, step.expectedAction)) {
          setWrongMoveText(
            step.wrongMoveText || "That's a valid move, but not quite what we're looking for. Try again!",
          );
          setStepStatus("wrong");
          setTimeout(() => {
            setGameState(buildGameState(step.boardSetup));
            setStepStatus("active");
            setWrongMoveText(null);
          }, 2000);
          return;
        }

        // Correct move — execute
        try {
          const newState = executeMove(gameState, action);
          setGameState(newState);
          setHintText(null);
          if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

          // Check if the game entered a pending phase (promotion/ransom)
          if (
            newState.gamePhase === "awaitingPromotion" ||
            newState.gamePhase === "awaitingRansom"
          ) {
            // Don't auto-advance — wait for the modal action
            return;
          }

          // Show success and auto-advance
          setSuccessText(step.successText || "Well done!");
          setStepStatus("success");
          successTimerRef.current = setTimeout(() => {
            advance();
          }, 1800);
        } catch {
          setWrongMoveText("Something went wrong. Try a different move.");
          setTimeout(() => setWrongMoveText(null), 2000);
        }
        return;
      }

      if (currentStep.type === "freeplay") {
        try {
          const newState = executeMove(gameState, action);
          setGameState(newState);
          setHintText(null);

          // Check victory condition
          if (currentStep.victoryCondition(newState)) {
            setSuccessText("Objective complete!");
            setStepStatus("success");
            successTimerRef.current = setTimeout(() => {
              advance();
            }, 1800);
          }
        } catch {
          // Silently ignore invalid moves in freeplay
        }
      }
    },
    [currentStep, stepStatus, gameState, advance],
  );

  return {
    gameState,
    legalMoves,
    currentStep: currentStep || lesson.steps[lesson.steps.length - 1],
    stepIndex,
    totalSteps,
    stepStatus,
    successText,
    wrongMoveText,
    hintText,
    isInteractive,
    isComplete,
    advance,
    resetStep,
    dispatch,
  };
}
