"use client";

import { useState, useMemo, useCallback } from "react";
import {
  createGame,
  executeMove,
  forfeit,
  offerDraw,
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type Player,
  type PieceActions,
} from "@gambit/engine";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => createGame());
  const [error, setError] = useState<string | null>(null);

  const legalMoves: PieceActions[] = useMemo(() => {
    if (gameState.gamePhase === "ended") return [];
    if (
      gameState.gamePhase === "awaitingPromotion" ||
      gameState.gamePhase === "awaitingRansom"
    ) {
      return [];
    }
    return getAllLegalMoves(gameState.turn, gameState);
  }, [gameState]);

  const dispatch = useCallback(
    (action: GameAction) => {
      try {
        const newState = executeMove(gameState, action);
        setGameState(newState);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [gameState],
  );

  const newGame = useCallback(() => {
    setGameState(createGame());
    setError(null);
  }, []);

  const forfeitGame = useCallback(
    (player: Player) => {
      try {
        setGameState(forfeit(gameState, player));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [gameState],
  );

  const offerDrawGame = useCallback(() => {
    try {
      setGameState(offerDraw(gameState));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [gameState]);

  const lastMove = useMemo(() => {
    if (gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  }, [gameState.moveHistory]);

  return {
    gameState,
    legalMoves,
    dispatch,
    newGame,
    forfeitGame,
    offerDrawGame,
    lastMove,
    error,
  };
}
