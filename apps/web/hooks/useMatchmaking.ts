"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Player } from "@gambit/engine";
import type { QueueMatchedPayload } from "@gambit/shared";
import { getSocket, disconnectSocket, type GameSocket } from "@/lib/socket";
import { setPlayerToken, setPlayerColor } from "@/lib/player-token";
import { createClient } from "@/lib/supabase/client";
import { soundManager } from "@/lib/sound-manager";

export type MatchmakingStatus = "idle" | "searching" | "matched";

export interface MatchmakingState {
  status: MatchmakingStatus;
  matchedGameId: string | null;
  onlineCount: number;
  connectionStatus: "connecting" | "connected" | "disconnected";
  error: string | null;
  joinQueue: () => void;
  leaveQueue: () => void;
}

export function useMatchmaking(): MatchmakingState {
  const [status, setStatus] = useState<MatchmakingStatus>("idle");
  const [matchedGameId, setMatchedGameId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<GameSocket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("online_count", (payload) => {
      setOnlineCount(payload.count);
    });

    socket.on("queue_matched", (payload: QueueMatchedPayload) => {
      setStatus("matched");
      setMatchedGameId(payload.gameId);
      // Store player token and color for the matched game
      setPlayerToken(payload.gameId, payload.playerToken);
      setPlayerColor(payload.gameId, payload.color);
      soundManager.play("match-found");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("disconnected");
      setError("Unable to reach game server");
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("online_count");
      socket.off("queue_matched");
      socket.off("connect_error");
      disconnectSocket();
    };
  }, []);

  const joinQueue = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket) return;

    setStatus("searching");
    setError(null);

    let supabaseToken: string | undefined;
    try {
      const supabase = createClient();
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        supabaseToken = session?.access_token ?? undefined;
      }
    } catch {
      // Continue without token
    }

    socket.emit("queue_join", { supabaseToken }, (response) => {
      if (!response.success) {
        setError(response.error ?? "Failed to join queue");
        setStatus("idle");
      }
    });
  }, []);

  const leaveQueue = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("queue_leave");
    setStatus("idle");
  }, []);

  return {
    status,
    matchedGameId,
    onlineCount,
    connectionStatus,
    error,
    joinQueue,
    leaveQueue,
  };
}
