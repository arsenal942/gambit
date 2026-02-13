import type { Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  QueueJoinPayload,
} from "@gambit/shared";
import type { Server } from "socket.io";
import { addToQueue, removeFromQueue } from "../matchmaking.js";
import { verifySupabaseJwt } from "../util/jwt.js";
import { supabaseAdmin } from "../lib/supabase.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function handleQueueJoin(socket: GameSocket, io: GameServer) {
  return async (
    payload: QueueJoinPayload,
    callback: (response: { success: boolean; error?: string }) => void,
  ) => {
    try {
      const userId = payload.supabaseToken
        ? await verifySupabaseJwt(payload.supabaseToken)
        : null;

      // Fetch rating for matchmaking
      let rating: number | null = null;
      if (userId && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from("ratings")
          .select("rating")
          .eq("user_id", userId)
          .single();
        rating = data?.rating ?? null;
      }

      addToQueue(
        { socketId: socket.id, userId, rating, joinedAt: Date.now() },
        io,
      );
      callback({ success: true });
    } catch (e) {
      callback({
        success: false,
        error: e instanceof Error ? e.message : "Failed to join queue",
      });
    }
  };
}

export function handleQueueLeave(socket: GameSocket) {
  return () => {
    removeFromQueue(socket.id);
  };
}
