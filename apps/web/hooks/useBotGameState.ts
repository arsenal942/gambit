"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  createGame,
  executeMove,
  forfeit,
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type Player,
  type PieceActions,
} from "@gambit/engine";
import type { BotProfile } from "@gambit/engine";
import { useAIWorker } from "./useAIWorker";
import { persistBotGame } from "@/lib/bot-persistence";

export interface BotGameConfig {
  botProfile: BotProfile;
  playerColor: Player;
}

export function useBotGameState(config: BotGameConfig) {
  const [gameState, setGameState] = useState<GameState>(() => createGame());
  const [error, setError] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const { compute } = useAIWorker();
  const botTurnRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;

  const { botProfile, playerColor } = config;
  const botColor: Player = playerColor === "white" ? "black" : "white";

  // Only compute legal moves for the human player on their turn
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
  }, [gameState, playerColor]);

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
    setIsBotThinking(false);
    botTurnRef.current = false;
  }, []);

  const forfeitGame = useCallback(() => {
    try {
      setGameState(forfeit(gameState, playerColor));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [gameState, playerColor]);

  const lastMove = useMemo(() => {
    if (gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  }, [gameState.moveHistory]);

  // Persist game when it ends
  useEffect(() => {
    if (gameState.gamePhase === "ended") {
      persistBotGame(gameState, playerColor, botProfile).catch(console.error);
    }
  }, [gameState.gamePhase, gameState, playerColor, botProfile]);

  // Bot turn logic
  useEffect(() => {
    const currentConfig = configRef.current;
    const isBotTurn = gameState.turn === botColor && gameState.gamePhase !== "ended";
    const isBotPhase =
      isBotTurn ||
      ((gameState.gamePhase === "awaitingPromotion" ||
        gameState.gamePhase === "awaitingRansom") &&
        gameState.turn === botColor);

    if (!isBotPhase || botTurnRef.current) return;

    botTurnRef.current = true;
    setIsBotThinking(true);

    const startTime = Date.now();

    compute(gameState, currentConfig.botProfile)
      .then((result) => {
        // Apply artificial delay
        const elapsed = Date.now() - startTime;
        const [minDelay, maxDelay] = currentConfig.botProfile.artificialDelayMs;
        const targetDelay =
          minDelay + Math.random() * (maxDelay - minDelay);
        const remainingDelay = Math.max(0, targetDelay - elapsed);

        return new Promise<GameAction>((resolve) => {
          setTimeout(() => resolve(result.action), remainingDelay);
        });
      })
      .then((action) => {
        setGameState((prevState) => {
          try {
            return executeMove(prevState, action);
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Bot made an invalid move",
            );
            return prevState;
          }
        });
      })
      .catch((e) => {
        if (e.message !== "Cancelled") {
          setError(
            e instanceof Error ? e.message : "Bot computation failed",
          );
        }
      })
      .finally(() => {
        setIsBotThinking(false);
        botTurnRef.current = false;
      });
  }, [gameState, botColor, compute]);

  return {
    gameState,
    legalMoves,
    dispatch,
    newGame,
    forfeitGame,
    lastMove,
    error,
    isBotThinking,
    playerColor,
    botProfile,
  };
}
