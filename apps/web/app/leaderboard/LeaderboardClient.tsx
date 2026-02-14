"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  rating: number;
  rd: number;
  games_played: number;
  profiles: {
    username: string;
    games_won: number;
  };
}

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardClient({ entries }: LeaderboardClientProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [userRank, setUserRank] = useState<number | null>(null);

  const currentUserInList = entries.some((e) => e.user_id === user?.id);

  // Fetch current user's rank if not in top 100
  useEffect(() => {
    if (!user || currentUserInList) return;

    const supabase = createClient();
    if (!supabase) return;

    supabase
      .rpc("get_user_rank", { p_user_id: user.id })
      .then(({ data }) => {
        if (data && data > 0) {
          setUserRank(data);
        }
      });
  }, [user, currentUserInList]);

  const filtered = search
    ? entries.filter((e) =>
        e.profiles.username.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-amber-100">Leaderboard</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search players..."
        className="mb-6 w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-700 focus:ring-amber-500"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">
          {search ? "No players found." : "No rated players yet."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs text-gray-400">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Games</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const rank = entries.indexOf(entry) + 1;
                const winRate =
                  entry.games_played > 0
                    ? Math.round(
                        (entry.profiles.games_won / entry.games_played) * 100,
                      )
                    : 0;
                const isCurrentUser = entry.user_id === user?.id;
                const provisional = entry.games_played < 20;

                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b border-gray-700/50 ${
                      isCurrentUser
                        ? "bg-amber-900/20"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-400">#{rank}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/profile/${entry.profiles.username}`}
                        className="text-gray-200 hover:text-amber-200"
                      >
                        {entry.profiles.username}
                      </Link>
                      {provisional && (
                        <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-xs text-amber-300">
                          ?
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-100">
                      {Math.round(entry.rating)}
                      <span className="ml-1 text-xs text-gray-500">
                        ±{Math.round(entry.rd)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {entry.games_played}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {winRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {user && !currentUserInList && userRank !== null && userRank > 0 && (
        <div className="mt-4 rounded-lg bg-gray-800 px-4 py-3 text-center text-sm text-gray-400">
          Your rank: <span className="font-semibold text-amber-200">#{userRank}</span>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
