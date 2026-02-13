"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useOnlineGameState } from "@/hooks/useOnlineGameState";
import { OnlineGameClient } from "@/components/game/OnlineGameClient";

export default function OnlineGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const onlineState = useOnlineGameState();

  // Auto-join game on mount (handles reconnection via stored token)
  useEffect(() => {
    if (!gameId) return;

    // Wait for socket to connect, then join
    if (onlineState.connectionStatus === "connected" && onlineState.onlinePhase === "connecting") {
      onlineState.joinGame(gameId);
    }
  }, [gameId, onlineState.connectionStatus, onlineState.onlinePhase]);

  return <OnlineGameClient gameId={gameId} onlineState={onlineState} />;
}
