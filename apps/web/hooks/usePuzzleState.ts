"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  executeMove,
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type PieceActions,
} from "@gambit/engine";
import { buildGameState } from "@/lib/tutorial/board-setup";
import type { Puzzle } from "@/lib/puzzle/types";

type PuzzleStatus = "solving" | "solved" | "failed";

interface PuzzleStateResult {
  gameState: GameState;
  legalMoves: PieceActions[];
  dispatch: (action: GameAction) => void;
  status: PuzzleStatus;
  moveIndex: number;
  totalMoves: number;
  feedback: string | null;
  hintVisible: boolean;
  showHint: () => void;
  reset: () => void;
}

function actionsMatch(a: GameAction, b: GameAction): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function usePuzzleState(puzzle: Puzzle): PuzzleStateResult {
  const [gameState, setGameState] = useState<GameState>(() =>
    buildGameState(puzzle.boardSetup),
  );
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>("solving");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const puzzleIdRef = useRef(puzzle.id);

  // Reset when puzzle changes
  if (puzzleIdRef.current !== puzzle.id) {
    puzzleIdRef.current = puzzle.id;
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState(buildGameState(puzzle.boardSetup));
    setMoveIndex(0);
    setStatus("solving");
    setFeedback(null);
    setHintVisible(false);
  }

  const totalMoves = puzzle.solution.length;

  const legalMoves = useMemo(() => {
    if (status !== "solving") return [];
    return getAllLegalMoves(gameState.turn, gameState);
  }, [gameState, status]);

  const showHint = useCallback(() => {
    setHintVisible(true);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState(buildGameState(puzzle.boardSetup));
    setMoveIndex(0);
    setStatus("solving");
    setFeedback(null);
    setHintVisible(false);
  }, [puzzle]);

  const dispatch = useCallback(
    (action: GameAction) => {
      if (status !== "solving") return;

      const step = puzzle.solution[moveIndex];
      if (!step) return;

      // Handle promotion/ransom modal actions as passthrough
      if (
        action.type === "promotion" ||
        action.type === "declinePromotion" ||
        action.type === "ransom" ||
        action.type === "declineRansom"
      ) {
        try {
          const newState = executeMove(gameState, action);
          setGameState(newState);

          // Check if this was the final step
          if (moveIndex >= totalMoves - 1) {
            setStatus("solved");
            setFeedback("Solved!");
          }
        } catch {
          // Ignore modal action errors
        }
        return;
      }

      // Check if the action matches any of the accepted player moves
      const isCorrect = step.playerMoves.some((pm) => actionsMatch(action, pm));

      if (!isCorrect) {
        // Wrong move — show feedback, reset after delay
        setFeedback("Incorrect — try again");
        setStatus("failed");
        timerRef.current = setTimeout(() => {
          setGameState(buildGameState(puzzle.boardSetup));
          setMoveIndex(0);
          setStatus("solving");
          setFeedback(null);
        }, 1500);
        return;
      }

      // Correct move — execute it
      try {
        const newState = executeMove(gameState, action);
        setGameState(newState);
        setFeedback(null);

        // Check if game entered a pending phase (promotion/ransom)
        if (
          newState.gamePhase === "awaitingPromotion" ||
          newState.gamePhase === "awaitingRansom"
        ) {
          // Wait for modal action — don't advance yet
          return;
        }

        // Check if this was the final step
        if (moveIndex >= totalMoves - 1) {
          setStatus("solved");
          setFeedback("Solved!");
          return;
        }

        // Auto-play opponent response after delay
        const opponentResponse = step.opponentResponse;
        if (opponentResponse) {
          const nextMoveIndex = moveIndex + 1;
          timerRef.current = setTimeout(() => {
            try {
              setGameState((prev) => {
                const afterOpponent = executeMove(prev, opponentResponse);
                return afterOpponent;
              });
              setMoveIndex(nextMoveIndex);
            } catch {
              // If opponent response fails, just advance
              setMoveIndex(nextMoveIndex);
            }
          }, 600);
        } else {
          setMoveIndex(moveIndex + 1);
        }
      } catch {
        setFeedback("Invalid move — try again");
        setTimeout(() => setFeedback(null), 2000);
      }
    },
    [status, puzzle, moveIndex, totalMoves, gameState],
  );

  return {
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
  };
}
