import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  MakeMovePayload,
} from "@gambit/shared";
import { executeMove, isGameOver } from "@gambit/engine";
import { getRoom } from "../rooms.js";
import { authenticatePlayer } from "../util/auth.js";
import { persistGameRecord } from "../persistence/games.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function handleMakeMove(socket: GameSocket, io: GameServer) {
  return (payload: MakeMovePayload) => {
    const room = getRoom(payload.gameId);
    if (!room) {
      socket.emit("move_rejected", { reason: "Game not found" });
      return;
    }

    if (room.status !== "playing") {
      socket.emit("move_rejected", { reason: "Game is not in progress" });
      return;
    }

    const color = authenticatePlayer(room, payload.playerToken);
    if (!color) {
      socket.emit("move_rejected", { reason: "Invalid player token" });
      return;
    }

    // Verify it is this player's turn
    if (room.gameState.turn !== color) {
      socket.emit("move_rejected", { reason: "Not your turn" });
      return;
    }

    // Clear any pending draw offer when a move is made
    room.pendingDrawOffer = null;

    // Execute the move through the engine (server-authoritative)
    try {
      const newState = executeMove(room.gameState, payload.action);
      room.gameState = newState;

      io.to(room.id).emit("game_updated", {
        gameState: newState,
        lastAction: payload.action,
      });

      const result = isGameOver(newState);
      if (result.gameOver) {
        room.status = "ended";
        io.to(room.id).emit("game_over", {
          gameState: newState,
          winner: result.winner,
          winCondition: result.winCondition,
        });
        persistGameRecord(room, result.winner, result.winCondition).catch(
          (e) => console.error("Persistence error:", e),
        );
      }
    } catch (e) {
      socket.emit("move_rejected", {
        reason: e instanceof Error ? e.message : "Invalid move",
      });
    }
  };
}
