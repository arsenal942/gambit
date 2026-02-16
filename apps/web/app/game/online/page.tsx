"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOnlineGameState } from "@/hooks/useOnlineGameState";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useActiveGames } from "@/hooks/useActiveGames";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OnlineLobbyPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);

  // Matchmaking (Quick Play)
  const matchmaking = useMatchmaking();

  // Private game (create/join)
  const privateGame = useOnlineGameState();

  // Active games
  const { activeGames, loading: activeGamesLoading } = useActiveGames();

  // Redirect on matchmaking match
  useEffect(() => {
    if (matchmaking.status === "matched" && matchmaking.matchedGameId) {
      router.push(`/game/${matchmaking.matchedGameId}`);
    }
  }, [matchmaking.status, matchmaking.matchedGameId, router]);

  // Redirect on private game creation/join
  useEffect(() => {
    if (privateGame.gameId && privateGame.onlinePhase !== "error") {
      router.push(`/game/${privateGame.gameId}`);
    }
  }, [privateGame.gameId, privateGame.onlinePhase, router]);

  const isConnected = matchmaking.connectionStatus === "connected";
  const isSearching = matchmaking.status === "searching";

  const btnBase =
    "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-amber-100">
            Play Online
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-400">
            <span>Unrated</span>
            <span className="text-gray-600">&middot;</span>
            <span>
              {matchmaking.onlineCount}{" "}
              {matchmaking.onlineCount === 1 ? "player" : "players"} online
            </span>
            <span className="text-gray-600">&middot;</span>
            <span
              className={
                isConnected ? "text-green-400" : "text-yellow-400"
              }
            >
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Quick Play */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-200">
            Quick Play
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Find a random opponent instantly.
          </p>
          {isSearching ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-amber-200">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Searching for opponent...
              </div>
              <button
                onClick={matchmaking.leaveQueue}
                className={`${btnBase} w-full bg-gray-700 text-gray-300 hover:bg-gray-600`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={matchmaking.joinQueue}
              disabled={!isConnected}
              className={`${btnBase} w-full bg-amber-700 text-white hover:bg-amber-600`}
            >
              Quick Play
            </button>
          )}
        </div>

        {/* Private Game */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-200">
            Private Game
          </h2>

          {!showPrivate ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setShowPrivate(true)}
                className={`${btnBase} w-full bg-gray-700 text-gray-200 hover:bg-gray-600 sm:flex-1`}
              >
                Create Game
              </button>
              <div className="flex w-full gap-2 sm:flex-1">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.trim())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode)
                      privateGame.joinGame(joinCode);
                  }}
                  placeholder="Game code"
                  className="min-w-0 flex-1 rounded-lg bg-gray-700 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-600 focus:ring-amber-500"
                />
                <button
                  onClick={() => privateGame.joinGame(joinCode)}
                  disabled={
                    !isConnected ||
                    !joinCode ||
                    privateGame.onlinePhase === "joining"
                  }
                  className={`${btnBase} bg-amber-700 text-white hover:bg-amber-600`}
                >
                  Join
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Choose your color:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => privateGame.createGame("white")}
                  disabled={
                    !isConnected ||
                    privateGame.onlinePhase === "creating"
                  }
                  className={`${btnBase} flex-1 bg-amber-100 text-gray-900 hover:bg-amber-200`}
                >
                  White
                </button>
                <button
                  onClick={() => privateGame.createGame("black")}
                  disabled={
                    !isConnected ||
                    privateGame.onlinePhase === "creating"
                  }
                  className={`${btnBase} flex-1 bg-gray-900 text-amber-100 ring-1 ring-gray-600 hover:bg-gray-700`}
                >
                  Black
                </button>
                <button
                  onClick={() => privateGame.createGame()}
                  disabled={
                    !isConnected ||
                    privateGame.onlinePhase === "creating"
                  }
                  className={`${btnBase} flex-1 bg-amber-700 text-white hover:bg-amber-600`}
                >
                  Random
                </button>
              </div>
              <button
                onClick={() => setShowPrivate(false)}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Active Games */}
        {profile && (
          <div className="rounded-xl bg-gray-800 p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-200">
              Active Games
            </h2>
            {activeGamesLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : activeGames.length === 0 ? (
              <p className="text-sm text-gray-500">No active games.</p>
            ) : (
              <div className="space-y-2">
                {activeGames.map((game) => (
                  <Link
                    key={game.id}
                    href={game.roomId ? `/game/${game.roomId}` : "#"}
                    className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-3 transition-colors hover:bg-gray-600"
                  >
                    <span className="text-sm text-gray-200">
                      vs {game.opponentUsername}
                    </span>
                    <span className="text-xs text-amber-400">Resume</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {(matchmaking.error || privateGame.error) && (
          <p className="text-center text-sm text-red-400">
            {matchmaking.error || privateGame.error}
          </p>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
