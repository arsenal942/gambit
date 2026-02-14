"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { profile, loading } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-amber-100">
          Gambit
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          A tactical strategy board game
        </p>
        {!loading && profile && (
          <p className="mt-2 text-sm text-amber-200/70">
            Welcome back, {profile.username}
            {profile.rating !== null && (
              <> &middot; Rating: {Math.round(profile.rating)}</>
            )}
            {" "}&middot; {profile.games_played}{" "}
            game{profile.games_played !== 1 ? "s" : ""} played
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/game/local"
          className="rounded-lg bg-amber-700 px-8 py-3 text-center text-lg font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Play Local Game
        </Link>
        <Link
          href="/game/online"
          className="rounded-lg bg-gray-700 px-8 py-3 text-center text-lg font-semibold text-white transition-colors hover:bg-gray-600"
        >
          Play Online
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-lg bg-gray-700 px-8 py-3 text-center text-lg font-semibold text-white transition-colors hover:bg-gray-600"
        >
          Leaderboard
        </Link>
      </div>
    </main>
  );
}
