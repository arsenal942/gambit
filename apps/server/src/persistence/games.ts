import { supabaseAdmin } from "../lib/supabase.js";
import type { GameRoom } from "@gambit/shared";
import type { Player } from "@gambit/engine";

export async function persistGameRecord(
  room: GameRoom,
  winner: Player | null,
  winCondition: string | null,
): Promise<void> {
  if (!supabaseAdmin) return;

  const whiteUserId = room.players.white?.userId ?? null;
  const blackUserId = room.players.black?.userId ?? null;

  // Only persist if at least one player is authenticated
  if (!whiteUserId && !blackUserId) return;

  const result =
    winner === "white"
      ? "white_wins"
      : winner === "black"
        ? "black_wins"
        : "draw";

  try {
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
      return;
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
  } catch (e) {
    console.error("Game persistence error:", e);
  }
}
