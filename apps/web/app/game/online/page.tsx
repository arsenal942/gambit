"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useOnlineGameState,
  type OnlineGamePhase,
} from "@/hooks/useOnlineGameState";
import type { Player } from "@gambit/engine";

export default function OnlineLobbyPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const { createGame, joinGame, gameId, onlinePhase, error, connectionStatus } =
    useOnlineGameState();

  // Redirect to game page once we have a gameId
  useEffect(() => {
    if (gameId && onlinePhase !== "error") {
      router.push(`/game/${gameId}`);
    }
  }, [gameId, onlinePhase, router]);

  const isConnected = connectionStatus === "connected";

  const buttonBase =
    "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-amber-100">
          Play Online
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {isConnected ? "Connected to server" : "Connecting..."}
        </p>
      </div>

      {/* Create Game */}
      <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-200">
          Create Game
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => createGame("white")}
            disabled={!isConnected || onlinePhase === "creating"}
            className={`${buttonBase} flex-1 bg-amber-100 text-gray-900 hover:bg-amber-200`}
          >
            White
          </button>
          <button
            onClick={() => createGame("black")}
            disabled={!isConnected || onlinePhase === "creating"}
            className={`${buttonBase} flex-1 bg-gray-900 text-amber-100 ring-1 ring-gray-600 hover:bg-gray-700`}
          >
            Black
          </button>
          <button
            onClick={() => createGame()}
            disabled={!isConnected || onlinePhase === "creating"}
            className={`${buttonBase} flex-1 bg-amber-700 text-white hover:bg-amber-600`}
          >
            Random
          </button>
        </div>
      </div>

      {/* Join Game */}
      <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-200">
          Join Game
        </h2>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && joinCode) joinGame(joinCode);
            }}
            placeholder="Enter game code"
            className="flex-1 rounded-lg bg-gray-700 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-600 focus:ring-amber-500"
          />
          <button
            onClick={() => joinGame(joinCode)}
            disabled={!isConnected || !joinCode || onlinePhase === "joining"}
            className={`${buttonBase} bg-amber-700 text-white hover:bg-amber-600`}
          >
            Join
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}
