import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  CreateGamePayload,
  JoinGamePayload,
  GameCreatedResponse,
  JoinGameResponse,
} from "@gambit/shared";
import { createRoom, getRoom, addPlayerToRoom } from "../rooms.js";
import { authenticatePlayer } from "../util/auth.js";
import { verifySupabaseJwt } from "../util/jwt.js";
import { supabaseAdmin } from "../lib/supabase.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

async function fetchUsername(userId: string | null): Promise<string | null> {
  if (!userId || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data?.username ?? null;
}

export function handleCreateGame(socket: GameSocket) {
  return async (
    payload: CreateGamePayload,
    callback: (resp: GameCreatedResponse) => void,
  ) => {
    try {
      const userId = payload.supabaseToken
        ? await verifySupabaseJwt(payload.supabaseToken)
        : null;

      const room = createRoom();
      const { color, playerToken } = addPlayerToRoom(
        room,
        socket.id,
        payload.preferredColor,
        userId,
      );

      socket.join(room.id);

      callback({
        success: true,
        gameId: room.id,
        playerToken,
        color,
      });
    } catch (e) {
      callback({
        success: false,
        error: e instanceof Error ? e.message : "Failed to create game",
      });
    }
  };
}

export function handleJoinGame(socket: GameSocket, io: GameServer) {
  return async (
    payload: JoinGamePayload,
    callback: (resp: JoinGameResponse) => void,
  ) => {
    const room = getRoom(payload.gameId);
    if (!room) {
      callback({ success: false, error: "Game not found" });
      return;
    }

    // Reconnection: player provides a valid token
    if (payload.playerToken) {
      const color = authenticatePlayer(room, payload.playerToken);
      if (color) {
        const playerInfo = room.players[color]!;
        playerInfo.socketId = socket.id;
        playerInfo.connected = true;
        playerInfo.disconnectedAt = null;

        // Clear disconnect timer
        const timer = room.disconnectTimers.get(color);
        if (timer) {
          clearTimeout(timer);
          room.disconnectTimers.delete(color);
        }

        socket.join(room.id);

        // Notify opponent of reconnection
        socket.to(room.id).emit("opponent_reconnected");

        const opponentColor = color === "white" ? "black" : "white";
        const opponentUsername = await fetchUsername(
          room.players[opponentColor]?.userId ?? null,
        );

        callback({
          success: true,
          color,
          playerToken: payload.playerToken,
          gameState: room.gameState,
          roomStatus: room.status,
          opponentUsername,
        });
        return;
      }
      // Token invalid — fall through to try joining as new player
    }

    // New player joining
    if (room.status !== "waiting") {
      callback({ success: false, error: "Game already in progress" });
      return;
    }

    try {
      const userId = payload.supabaseToken
        ? await verifySupabaseJwt(payload.supabaseToken)
        : null;

      const { color, playerToken } = addPlayerToRoom(
        room,
        socket.id,
        undefined,
        userId,
      );
      socket.join(room.id);

      const opponentColor = color === "white" ? "black" : "white";
      const opponentUsername = await fetchUsername(
        room.players[opponentColor]?.userId ?? null,
      );

      callback({
        success: true,
        color,
        playerToken,
        gameState: room.gameState,
        roomStatus: room.status,
        opponentUsername,
      });

      // If room is now full (addPlayerToRoom mutates status), notify both
      if ((room.status as string) === "playing") {
        const whiteUsername = await fetchUsername(
          room.players.white?.userId ?? null,
        );
        const blackUsername = await fetchUsername(
          room.players.black?.userId ?? null,
        );
        io.to(room.id).emit("game_started", {
          gameState: room.gameState,
          whiteUsername,
          blackUsername,
        });
      }
    } catch (e) {
      callback({
        success: false,
        error: e instanceof Error ? e.message : "Failed to join game",
      });
    }
  };
}
