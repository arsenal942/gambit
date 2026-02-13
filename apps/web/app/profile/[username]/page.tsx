import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface GameRecord {
  id: string;
  white_player_id: string | null;
  black_player_id: string | null;
  result: string | null;
  win_condition: string | null;
  ended_at: string | null;
  white_profile: { username: string } | null;
  black_profile: { username: string } | null;
}

function formatResult(
  game: GameRecord,
  profileId: string,
): { label: string; color: string } {
  if (!game.result) return { label: "-", color: "text-gray-400" };
  const isWhite = game.white_player_id === profileId;
  const won =
    (isWhite && game.result === "white_wins") ||
    (!isWhite && game.result === "black_wins");
  if (game.result === "draw") return { label: "D", color: "text-gray-400" };
  return won
    ? { label: "W", color: "text-green-400" }
    : { label: "L", color: "text-red-400" };
}

function getOpponentName(game: GameRecord, profileId: string): string {
  const isWhite = game.white_player_id === profileId;
  if (isWhite) {
    return game.black_profile?.username ?? "Anonymous";
  }
  return game.white_profile?.username ?? "Anonymous";
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    notFound();
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch recent games
  const { data: games } = await supabase
    .from("games")
    .select(
      `
      id,
      white_player_id,
      black_player_id,
      result,
      win_condition,
      ended_at,
      white_profile:profiles!games_white_player_id_fkey(username),
      black_profile:profiles!games_black_player_id_fkey(username)
    `,
    )
    .or(
      `white_player_id.eq.${profile.id},black_player_id.eq.${profile.id}`,
    )
    .eq("status", "completed")
    .order("ended_at", { ascending: false })
    .limit(20);

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.games_won / profile.games_played) * 100)
      : 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-700 text-2xl font-bold text-white">
          {profile.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-100">
            {profile.username}
          </h1>
          <p className="text-sm text-gray-400">
            Member since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-amber-100">
            {profile.games_played}
          </div>
          <div className="text-xs text-gray-400">Games Played</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {profile.games_won}
          </div>
          <div className="text-xs text-gray-400">Wins</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-amber-100">{winRate}%</div>
          <div className="text-xs text-gray-400">Win Rate</div>
        </div>
      </div>

      {/* Recent games */}
      <h2 className="mb-4 text-lg font-semibold text-gray-200">
        Recent Games
      </h2>
      {!games || games.length === 0 ? (
        <p className="text-sm text-gray-500">No games played yet.</p>
      ) : (
        <div className="space-y-2">
          {(games as unknown as GameRecord[]).map((game) => {
            const { label, color } = formatResult(game, profile.id);
            return (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${color}`}>{label}</span>
                  <span className="text-sm text-gray-200">
                    vs {getOpponentName(game, profile.id)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {game.win_condition && (
                    <span className="capitalize">{game.win_condition}</span>
                  )}
                  {game.ended_at && (
                    <span>
                      {new Date(game.ended_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
