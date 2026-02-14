import { createClient } from "@/lib/supabase/client";
import type { GameState, Player } from "@gambit/engine";
import type { BotProfile } from "@gambit/engine";

/**
 * Persists a completed bot game to the database.
 * Only persists if the user is authenticated.
 */
export async function persistBotGame(
  gameState: GameState,
  playerColor: Player,
  botProfile: BotProfile,
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const isWhite = playerColor === "white";
  const winner = gameState.winner;
  const winCondition = gameState.winCondition;

  let result: string | null = null;
  if (winner === "white") result = "white_wins";
  else if (winner === "black") result = "black_wins";
  else if (winCondition === "draw") result = "draw";

  const { error } = await supabase.from("games").insert({
    white_player_id: isWhite ? user.id : null,
    black_player_id: isWhite ? null : user.id,
    status: "completed",
    result,
    win_condition: winCondition,
    moves_json: gameState.moveHistory,
    final_state_json: gameState,
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    is_rated: false,
    is_bot_game: true,
    bot_id: botProfile.id,
  });

  if (error) {
    console.error("Failed to persist bot game:", error);
    return;
  }

  // Update profile stats
  await supabase.rpc("increment_games_played", { user_id: user.id });

  const playerWon =
    (winner === "white" && isWhite) || (winner === "black" && !isWhite);
  if (playerWon) {
    await supabase.rpc("increment_games_won", { user_id: user.id });
  }
}
