"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getAllLegalMoves,
  type GameState,
  type GameAction,
  type Player,
  type PieceActions,
} from "@gambit/engine";
import type {
  GameUpdatedPayload,
  MoveRejectedPayload,
  GameOverPayload,
  OpponentDisconnectedPayload,
  DrawOfferedPayload,
  DrawDeclinedPayload,
} from "@gambit/shared";
import { getSocket, disconnectSocket, type GameSocket } from "@/lib/socket";
import {
  getPlayerToken,
  setPlayerToken,
  setPlayerColor,
} from "@/lib/player-token";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export type OnlineGamePhase =
  | "connecting"
  | "creating"
  | "waiting"
  | "joining"
  | "playing"
  | "ended"
  | "error";

export interface DrawOfferState {
  pending: boolean;
  offeredBy: Player | null;
  isOurs: boolean;
}

export interface OnlineGameState {
  // Core game state (same shape as useGameState for component compatibility)
  gameState: GameState | null;
  legalMoves: PieceActions[];
  dispatch: (action: GameAction) => void;
  lastMove: GameState["moveHistory"][number] | null;
  error: string | null;

  // Online-specific
  gameId: string | null;
  playerColor: Player | null;
  onlinePhase: OnlineGamePhase;
  connectionStatus: ConnectionStatus;
  opponentDisconnected: boolean;
  opponentDisconnectGraceMs: number | null;
  drawOffer: DrawOfferState;
  isMyTurn: boolean;

  // Actions
  createGame: (preferredColor?: Player) => void;
  joinGame: (gameId: string) => void;
  forfeitGame: () => void;
  offerDrawGame: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
}

export function useOnlineGameState(): OnlineGameState {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColorState] = useState<Player | null>(null);
  const [onlinePhase, setOnlinePhase] =
    useState<OnlineGamePhase>("connecting");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [opponentDisconnectGraceMs, setOpponentDisconnectGraceMs] = useState<
    number | null
  >(null);
  const [drawOffer, setDrawOffer] = useState<DrawOfferState>({
    pending: false,
    offeredBy: null,
    isOurs: false,
  });

  const socketRef = useRef<GameSocket | null>(null);
  const playerTokenRef = useRef<string | null>(null);
  const gameIdRef = useRef<string | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  const legalMoves: PieceActions[] = useMemo(() => {
    if (!gameState || !playerColor) return [];
    if (gameState.gamePhase === "ended") return [];
    if (
      gameState.gamePhase === "awaitingPromotion" ||
      gameState.gamePhase === "awaitingRansom"
    ) {
      return [];
    }
    if (gameState.turn !== playerColor) return [];
    return getAllLegalMoves(playerColor, gameState);
  }, [gameState, playerColor]);

  const isMyTurn = useMemo(() => {
    if (!gameState || !playerColor) return false;
    return gameState.turn === playerColor;
  }, [gameState, playerColor]);

  const lastMove = useMemo(() => {
    if (!gameState || gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  }, [gameState]);

  // Dispatch action to server
  const dispatch = useCallback(
    (action: GameAction) => {
      const socket = socketRef.current;
      if (!socket || !gameIdRef.current || !playerTokenRef.current) return;

      socket.emit("make_move", {
        gameId: gameIdRef.current,
        playerToken: playerTokenRef.current,
        action,
      });
    },
    [],
  );

  // Setup socket event listeners
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setConnectionStatus("connected");
      // Re-join the game room on reconnection
      const currentGameId = gameIdRef.current;
      const currentToken = playerTokenRef.current;
      if (currentGameId && currentToken) {
        socket.emit(
          "join_game",
          { gameId: currentGameId, playerToken: currentToken },
          (response) => {
            if (response.success && response.gameState) {
              setGameState(response.gameState);
            }
            if (response.success && response.roomStatus === "waiting") {
              setOnlinePhase("waiting");
            }
          },
        );
      }
    });

    socket.on("game_started", (payload) => {
      setGameState(payload.gameState);
      setOnlinePhase("playing");
    });

    socket.on("game_updated", (payload: GameUpdatedPayload) => {
      setGameState(payload.gameState);
      setDrawOffer({ pending: false, offeredBy: null, isOurs: false });
    });

    socket.on("move_rejected", (payload: MoveRejectedPayload) => {
      setError(payload.reason);
      setTimeout(() => setError(null), 3000);
    });

    socket.on("game_over", (payload: GameOverPayload) => {
      setGameState(payload.gameState);
      setOnlinePhase("ended");
    });

    socket.on(
      "opponent_disconnected",
      (payload: OpponentDisconnectedPayload) => {
        setOpponentDisconnected(true);
        setOpponentDisconnectGraceMs(payload.gracePeriodMs);
      },
    );

    socket.on("opponent_reconnected", () => {
      setOpponentDisconnected(false);
      setOpponentDisconnectGraceMs(null);
    });

    socket.on("draw_offered", (payload: DrawOfferedPayload) => {
      setDrawOffer({
        pending: true,
        offeredBy: payload.offeredBy,
        isOurs: false,
      });
    });

    socket.on("draw_declined", (_payload: DrawDeclinedPayload) => {
      setDrawOffer({ pending: false, offeredBy: null, isOurs: false });
    });

    socket.on("error", (payload) => {
      setError(payload.message);
      setTimeout(() => setError(null), 3000);
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      disconnectSocket();
    };
  }, []);

  // Create game
  const createGame = useCallback((preferredColor?: Player) => {
    const socket = socketRef.current;
    if (!socket) return;

    setOnlinePhase("creating");
    socket.emit("create_game", { preferredColor }, (response) => {
      if (
        response.success &&
        response.gameId &&
        response.playerToken &&
        response.color
      ) {
        setGameId(response.gameId);
        gameIdRef.current = response.gameId;
        setPlayerColorState(response.color);
        playerTokenRef.current = response.playerToken;
        setPlayerToken(response.gameId, response.playerToken);
        setPlayerColor(response.gameId, response.color);
        setOnlinePhase("waiting");
      } else {
        setError(response.error ?? "Failed to create game");
        setOnlinePhase("error");
      }
    });
  }, []);

  // Join game
  const joinGame = useCallback((targetGameId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    setOnlinePhase("joining");
    const existingToken = getPlayerToken(targetGameId);

    socket.emit(
      "join_game",
      {
        gameId: targetGameId,
        playerToken: existingToken ?? undefined,
      },
      (response) => {
        if (response.success && response.color && response.playerToken) {
          setGameId(targetGameId);
          gameIdRef.current = targetGameId;
          setPlayerColorState(response.color);
          playerTokenRef.current = response.playerToken;
          setPlayerToken(targetGameId, response.playerToken);
          setPlayerColor(targetGameId, response.color);
          if (response.gameState) {
            setGameState(response.gameState);
          }
          if (response.roomStatus === "waiting") {
            setOnlinePhase("waiting");
          } else {
            setOnlinePhase("playing");
          }
        } else {
          setError(response.error ?? "Failed to join game");
          setOnlinePhase("error");
        }
      },
    );
  }, []);

  // Forfeit
  const forfeitGame = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !gameIdRef.current || !playerTokenRef.current) return;
    socket.emit("forfeit", {
      gameId: gameIdRef.current,
      playerToken: playerTokenRef.current,
    });
  }, []);

  // Draw flow
  const offerDrawGame = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !gameIdRef.current || !playerTokenRef.current) return;
    socket.emit("offer_draw", {
      gameId: gameIdRef.current,
      playerToken: playerTokenRef.current,
    });
    setDrawOffer({ pending: true, offeredBy: playerColor, isOurs: true });
  }, [playerColor]);

  const acceptDraw = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !gameIdRef.current || !playerTokenRef.current) return;
    socket.emit("accept_draw", {
      gameId: gameIdRef.current,
      playerToken: playerTokenRef.current,
    });
  }, []);

  const declineDraw = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !gameIdRef.current || !playerTokenRef.current) return;
    socket.emit("decline_draw", {
      gameId: gameIdRef.current,
      playerToken: playerTokenRef.current,
    });
    setDrawOffer({ pending: false, offeredBy: null, isOurs: false });
  }, []);

  return {
    gameState,
    legalMoves,
    dispatch,
    lastMove,
    error,
    gameId,
    playerColor,
    onlinePhase,
    connectionStatus,
    opponentDisconnected,
    opponentDisconnectGraceMs,
    drawOffer,
    isMyTurn,
    createGame,
    joinGame,
    forfeitGame,
    offerDrawGame,
    acceptDraw,
    declineDraw,
  };
}
