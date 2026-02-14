"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  createGame,
  executeMove,
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type PieceActions,
} from "@gambit/engine";
import { getTutorialBotMove } from "@/lib/tutorial/tutorial-bot";
import { getContextualHint } from "@/lib/tutorial/tutorial-hints";

const HINT_DELAY_MS = 10_000;
const BOT_DELAY_MIN_MS = 500;
const BOT_DELAY_MAX_MS = 1000;

export function useTutorialGameState() {
  const [gameState, setGameState] = useState<GameState>(() => createGame());
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const botTurnRef = useRef(false);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  const playerColor = "white" as const;
  const botColor = "black" as const;

  const legalMoves: PieceActions[] = useMemo(() => {
    if (gameState.gamePhase === "ended") return [];
    if (gameState.turn !== playerColor) return [];
    if (
      gameState.gamePhase === "awaitingPromotion" ||
      gameState.gamePhase === "awaitingRansom"
    ) {
      return [];
    }
    return getAllLegalMoves(playerColor, gameState);
  }, [gameState]);

  // Start hint timer when it's the player's turn
  useEffect(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setHintText(null);

    if (
      gameState.turn === playerColor &&
      gameState.gamePhase === "playing"
    ) {
      const moves = getAllLegalMoves(playerColor, gameState);
      hintTimerRef.current = setTimeout(() => {
        const hint = getContextualHint(moves, gameState);
        setHintText(hint);
      }, HINT_DELAY_MS);
    }

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [gameState]);

  const dispatch = useCallback(
    (action: GameAction) => {
      try {
        const newState = executeMove(gameState, action);
        setGameState(newState);
        setError(null);
        setHintText(null);
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [gameState],
  );

  const newGame = useCallback(() => {
    setGameState(createGame());
    setError(null);
    setIsBotThinking(false);
    setHintText(null);
    botTurnRef.current = false;
  }, []);

  const lastMove = useMemo(() => {
    if (gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  }, [gameState.moveHistory]);

  // Tutorial bot turn logic
  useEffect(() => {
    const isBotTurn = gameState.turn === botColor && gameState.gamePhase === "playing";

    if (!isBotTurn || botTurnRef.current) return;
    if (gameState.gamePhase === "ended") return;

    botTurnRef.current = true;
    setIsBotThinking(true);

    const delay = BOT_DELAY_MIN_MS + Math.random() * (BOT_DELAY_MAX_MS - BOT_DELAY_MIN_MS);

    const timer = setTimeout(() => {
      const botAction = getTutorialBotMove(gameState);
      if (botAction) {
        setGameState((prev) => {
          try {
            return executeMove(prev, botAction);
          } catch {
            return prev;
          }
        });
      }
      setIsBotThinking(false);
      botTurnRef.current = false;
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState]);

  // Handle bot promotion/ransom by auto-declining
  useEffect(() => {
    if (gameState.turn !== botColor) return;
    if (gameState.gamePhase === "awaitingPromotion") {
      setTimeout(() => {
        setGameState((prev) => {
          try {
            return executeMove(prev, { type: "declinePromotion" });
          } catch {
            return prev;
          }
        });
      }, 300);
    }
    if (gameState.gamePhase === "awaitingRansom") {
      setTimeout(() => {
        setGameState((prev) => {
          try {
            return executeMove(prev, { type: "declineRansom" });
          } catch {
            return prev;
          }
        });
      }, 300);
    }
  }, [gameState.gamePhase, gameState.turn]);

  return {
    gameState,
    legalMoves,
    dispatch,
    newGame,
    lastMove,
    error,
    isBotThinking,
    hintText,
    playerColor,
    isGameOver: gameState.gamePhase === "ended",
    winner: gameState.winner,
  };
}
