import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@gambit/shared";
import { RECONNECT_GRACE_PERIOD_MS } from "@gambit/shared";
import { forfeit } from "@gambit/engine";
import { findRoomBySocketId, getRoom } from "../rooms.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function handleDisconnect(socket: GameSocket, io: GameServer) {
  return () => {
    const result = findRoomBySocketId(socket.id);
    if (!result) return;

    const { room, color } = result;

    if (room.status !== "playing") return;

    const playerInfo = room.players[color];
    if (!playerInfo) return;

    playerInfo.connected = false;
    playerInfo.disconnectedAt = Date.now();

    // Notify opponent
    const opponentColor = color === "white" ? "black" : "white";
    const opponentInfo = room.players[opponentColor];
    if (opponentInfo?.socketId) {
      io.to(opponentInfo.socketId).emit("opponent_disconnected", {
        gracePeriodMs: RECONNECT_GRACE_PERIOD_MS,
      });
    }

    // Start grace period timer
    const timer = setTimeout(() => {
      const currentRoom = getRoom(room.id);
      if (!currentRoom || currentRoom.status !== "playing") return;

      const currentPlayerInfo = currentRoom.players[color];
      if (!currentPlayerInfo || currentPlayerInfo.connected) return;

      try {
        const newState = forfeit(currentRoom.gameState, color);
        currentRoom.gameState = newState;
        currentRoom.status = "ended";

        io.to(currentRoom.id).emit("game_over", {
          gameState: newState,
          winner: newState.winner,
          winCondition: "forfeit",
        });
      } catch {
        // Game already ended
      }
    }, RECONNECT_GRACE_PERIOD_MS);

    room.disconnectTimers.set(color, timer);
  };
}
