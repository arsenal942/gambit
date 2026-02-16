import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReplayClient } from "@/components/game/ReplayClient";

interface GameData {
  id: string;
  result: string | null;
  win_condition: string | null;
  moves_json: unknown[];
  ended_at: string | null;
  white_profile: { username: string } | null;
  black_profile: { username: string } | null;
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const { data: game } = await supabase
    .from("games")
    .select(
      `
      id,
      result,
      win_condition,
      moves_json,
      ended_at,
      white_profile:profiles!games_white_player_id_fkey(username),
      black_profile:profiles!games_black_player_id_fkey(username)
    `,
    )
    .eq("id", gameId)
    .eq("status", "completed")
    .single();

  if (!game) {
    notFound();
  }

  const typedGame = game as unknown as GameData;
  const whiteUsername = typedGame.white_profile?.username ?? "Anonymous";
  const blackUsername = typedGame.black_profile?.username ?? "Anonymous";

  const resultText =
    typedGame.result === "white_wins"
      ? `${whiteUsername} wins`
      : typedGame.result === "black_wins"
        ? `${blackUsername} wins`
        : "Draw";

  const winConditionText = typedGame.win_condition
    ? ` by ${typedGame.win_condition}`
    : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-amber-100">
            {whiteUsername} vs {blackUsername}
          </h1>
          <p className="text-sm text-gray-400">
            {resultText}
            {winConditionText} &middot;{" "}
            {typedGame.moves_json.length} moves
            {typedGame.ended_at && (
              <>
                {" "}
                &middot;{" "}
                {new Date(typedGame.ended_at).toLocaleDateString()}
              </>
            )}
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to Home
        </Link>
      </div>

      <ReplayClient moves={typedGame.moves_json} />
    </main>
  );
}
