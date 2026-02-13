import type { Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  QueueJoinPayload,
} from "@gambit/shared";
import type { Server } from "socket.io";
import { addToQueue, removeFromQueue } from "../matchmaking.js";
import { verifySupabaseJwt } from "../util/jwt.js";

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

      addToQueue({ socketId: socket.id, userId }, io);
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
