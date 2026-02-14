import { supabaseAdmin } from "../lib/supabase.js";
import type { GameRoom, GameOverRatingChanges } from "@gambit/shared";
import type { Player } from "@gambit/engine";
import { processRatingUpdate } from "./ratings.js";

/**
 * Persist a game record at start (status = 'playing') so that
 * active games can be queried from the database.
 */
export async function persistGameStart(room: GameRoom): Promise<void> {
  if (!supabaseAdmin) return;

  const whiteUserId = room.players.white?.userId ?? null;
  const blackUserId = room.players.black?.userId ?? null;

  if (!whiteUserId && !blackUserId) return;

  try {
    const { data, error } = await supabaseAdmin
      .from("games")
      .insert({
        white_player_id: whiteUserId,
        black_player_id: blackUserId,
        status: "playing",
        room_id: room.id,
        started_at: new Date(room.createdAt).toISOString(),
        moves_json: [],
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to persist game start:", error);
      return;
    }

    room.supabaseGameId = data.id;
  } catch (e) {
    console.error("Game start persistence error:", e);
  }
}

export async function persistGameRecord(
  room: GameRoom,
  winner: Player | null,
  winCondition: string | null,
): Promise<GameOverRatingChanges | undefined> {
  if (!supabaseAdmin) return undefined;

  const whiteUserId = room.players.white?.userId ?? null;
  const blackUserId = room.players.black?.userId ?? null;

  // Only persist if at least one player is authenticated
  if (!whiteUserId && !blackUserId) return undefined;

  const result =
    winner === "white"
      ? "white_wins"
      : winner === "black"
        ? "black_wins"
        : "draw";

  try {
    // If we already have a Supabase record from game start, update it
    if (room.supabaseGameId) {
      const { error: gameError } = await supabaseAdmin
        .from("games")
        .update({
          status: "completed",
          result: winner !== null ? result : null,
          win_condition: winCondition,
          moves_json: room.gameState.moveHistory,
          final_state_json: room.gameState,
          ended_at: new Date().toISOString(),
        })
        .eq("id", room.supabaseGameId);

      if (gameError) {
        console.error("Failed to update game record:", gameError);
        return undefined;
      }
    } else {
      // Fallback: insert new record (backward compatible)
      const { error: gameError } = await supabaseAdmin.from("games").insert({
        white_player_id: whiteUserId,
        black_player_id: blackUserId,
        status: "completed",
        result: winner !== null ? result : null,
        win_condition: winCondition,
        moves_json: room.gameState.moveHistory,
        final_state_json: room.gameState,
        started_at: new Date(room.createdAt).toISOString(),
        ended_at: new Date().toISOString(),
      });

      if (gameError) {
        console.error("Failed to persist game:", gameError);
        return undefined;
      }
    }

    // Update player stats
    if (whiteUserId) {
      await supabaseAdmin.rpc("increment_games_played", {
        user_id: whiteUserId,
      });
      if (winner === "white") {
        await supabaseAdmin.rpc("increment_games_won", {
          user_id: whiteUserId,
        });
      }
    }
    if (blackUserId) {
      await supabaseAdmin.rpc("increment_games_played", {
        user_id: blackUserId,
      });
      if (winner === "black") {
        await supabaseAdmin.rpc("increment_games_won", {
          user_id: blackUserId,
        });
      }
    }

    // Process rating update (only for games where both players are logged in)
    const ratingChanges = await processRatingUpdate(room, winner);
    return ratingChanges ?? undefined;
  } catch (e) {
    console.error("Game persistence error:", e);
    return undefined;
  }
}
