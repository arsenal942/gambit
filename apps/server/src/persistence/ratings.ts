import { supabaseAdmin } from "../lib/supabase.js";
import type { GameRoom } from "@gambit/shared";
import type { Player } from "@gambit/engine";
import type { GameOverRatingChanges } from "@gambit/shared";
import {
  calculateRatings,
  isProvisional,
  DEFAULT_RATING,
  type PlayerRating,
} from "../ratings/calculate.js";

async function fetchRating(userId: string): Promise<PlayerRating> {
  if (!supabaseAdmin) return DEFAULT_RATING;

  await supabaseAdmin.rpc("ensure_rating_exists", { p_user_id: userId });

  const { data } = await supabaseAdmin
    .from("ratings")
    .select("rating, rd, volatility, games_played")
    .eq("user_id", userId)
    .single();

  if (!data) return DEFAULT_RATING;

  return {
    rating: data.rating,
    rd: data.rd,
    volatility: data.volatility,
    gamesPlayed: data.games_played,
  };
}

/**
 * Process rating update for a completed game.
 * Returns null if game is not rated (missing user IDs or no Supabase).
 */
export async function processRatingUpdate(
  room: GameRoom,
  winner: Player | null,
): Promise<GameOverRatingChanges | null> {
  if (!supabaseAdmin) return null;

  const whiteUserId = room.players.white?.userId ?? null;
  const blackUserId = room.players.black?.userId ?? null;

  // Only rated if BOTH players are logged in
  if (!whiteUserId || !blackUserId) return null;

  const [whiteRating, blackRating] = await Promise.all([
    fetchRating(whiteUserId),
    fetchRating(blackUserId),
  ]);

  const score = winner === "white" ? 1 : winner === "black" ? 0 : 0.5;
  const result = calculateRatings(whiteRating, blackRating, score);

  const now = new Date().toISOString();

  // Update both players' ratings
  await Promise.all([
    supabaseAdmin
      .from("ratings")
      .update({
        rating: result.white.after.rating,
        rd: result.white.after.rd,
        volatility: result.white.after.volatility,
        games_played: result.white.after.gamesPlayed,
        last_game_at: now,
      })
      .eq("user_id", whiteUserId),
    supabaseAdmin
      .from("ratings")
      .update({
        rating: result.black.after.rating,
        rd: result.black.after.rd,
        volatility: result.black.after.volatility,
        games_played: result.black.after.gamesPlayed,
        last_game_at: now,
      })
      .eq("user_id", blackUserId),
  ]);

  // Update game record with rating snapshots
  if (room.supabaseGameId) {
    await supabaseAdmin
      .from("games")
      .update({
        white_rating_before: result.white.before.rating,
        white_rating_after: result.white.after.rating,
        black_rating_before: result.black.before.rating,
        black_rating_after: result.black.after.rating,
        is_rated: true,
      })
      .eq("id", room.supabaseGameId);
  }

  return {
    white: {
      before: result.white.before.rating,
      after: result.white.after.rating,
      rd: result.white.after.rd,
      provisional: isProvisional(result.white.after.gamesPlayed),
    },
    black: {
      before: result.black.before.rating,
      after: result.black.after.rating,
      rd: result.black.after.rd,
      provisional: isProvisional(result.black.after.gamesPlayed),
    },
  };
}
