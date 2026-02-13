import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./LeaderboardClient";

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

export default async function LeaderboardPage() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-amber-100">Leaderboard</h1>
        <p className="text-sm text-gray-500">Leaderboard unavailable.</p>
      </main>
    );
  }

  const { data: leaderboard } = await supabase
    .from("ratings")
    .select(
      `
      user_id,
      rating,
      rd,
      games_played,
      profiles!inner(username, games_won)
    `,
    )
    .gte("games_played", 1)
    .order("rating", { ascending: false })
    .limit(100);

  return (
    <LeaderboardClient
      entries={(leaderboard as unknown as LeaderboardEntry[]) ?? []}
    />
  );
}
