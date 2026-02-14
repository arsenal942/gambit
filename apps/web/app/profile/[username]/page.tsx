import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RatingHistoryChart } from "@/components/game/RatingHistoryChart";

interface GameRecord {
  id: string;
  white_player_id: string | null;
  black_player_id: string | null;
  result: string | null;
  win_condition: string | null;
  ended_at: string | null;
  moves_json: unknown[] | null;
  white_profile: { username: string } | null;
  black_profile: { username: string } | null;
  is_bot_game: boolean;
  bot_id: string | null;
}

interface RatedGameRecord {
  white_player_id: string | null;
  white_rating_after: number | null;
  black_rating_after: number | null;
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

const BOT_DISPLAY_NAMES: Record<string, string> = {
  squire: "Squire (600)",
  soldier: "Soldier (900)",
  captain: "Captain (1200)",
  commander: "Commander (1500)",
  warlord: "Warlord (1800)",
};

function getOpponentName(game: GameRecord, profileId: string): string {
  if (game.is_bot_game && game.bot_id) {
    return BOT_DISPLAY_NAMES[game.bot_id] ?? `Bot (${game.bot_id})`;
  }
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

  // Fetch rating
  const { data: ratingData } = await supabase
    .from("ratings")
    .select("rating, rd, games_played")
    .eq("user_id", profile.id)
    .maybeSingle();

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
      moves_json,
      is_bot_game,
      bot_id,
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

  // Fetch last 30 rated games for rating history chart
  const { data: ratedGames } = await supabase
    .from("games")
    .select("white_player_id, white_rating_after, black_rating_after")
    .or(
      `white_player_id.eq.${profile.id},black_player_id.eq.${profile.id}`,
    )
    .eq("is_rated", true)
    .not("white_rating_after", "is", null)
    .order("ended_at", { ascending: true })
    .limit(30);

  const ratingHistory = (ratedGames as RatedGameRecord[] | null)
    ?.map((g) => {
      const isWhite = g.white_player_id === profile.id;
      const rating = isWhite ? g.white_rating_after : g.black_rating_after;
      return rating !== null ? { rating } : null;
    })
    .filter((d): d is { rating: number } => d !== null);

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.games_won / profile.games_played) * 100)
      : 0;

  const isProvisional = ratingData ? ratingData.games_played < 20 : false;

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

      {/* Rating display */}
      {ratingData && (
        <div className="mb-4 rounded-lg bg-gray-800 p-4 text-center">
          <div className="text-3xl font-bold text-amber-100">
            {Math.round(ratingData.rating)}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ±{Math.round(ratingData.rd)}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Glicko-2 Rating
            {isProvisional && (
              <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-amber-300">
                Provisional
              </span>
            )}
          </div>
        </div>
      )}

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

      {/* Rating history chart */}
      {ratingHistory && ratingHistory.length >= 2 && (
        <RatingHistoryChart data={ratingHistory} />
      )}

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
            const moveCount = Array.isArray(game.moves_json)
              ? game.moves_json.length
              : 0;
            return (
              <Link
                key={game.id}
                href={`/game/${game.id}/replay`}
                className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3 transition-colors hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${color}`}>{label}</span>
                  <span className="text-sm text-gray-200">
                    vs {getOpponentName(game, profile.id)}
                  </span>
                  {game.is_bot_game && (
                    <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-300">
                      Bot
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{moveCount} moves</span>
                  {game.win_condition && (
                    <span className="capitalize">{game.win_condition}</span>
                  )}
                  {game.ended_at && (
                    <span>
                      {new Date(game.ended_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
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
