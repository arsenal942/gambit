import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ForfeitPayload,
  OfferDrawPayload,
  AcceptDrawPayload,
  DeclineDrawPayload,
} from "@gambit/shared";
import { forfeit, offerDraw, type Player } from "@gambit/engine";
import { getRoom } from "../rooms.js";
import { authenticatePlayer } from "../util/auth.js";
import { persistGameRecord } from "../persistence/games.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

function opponentColor(color: Player): Player {
  return color === "white" ? "black" : "white";
}

export function handleForfeit(socket: GameSocket, io: GameServer) {
  return async (payload: ForfeitPayload) => {
    const room = getRoom(payload.gameId);
    if (!room || room.status !== "playing") return;

    const color = authenticatePlayer(room, payload.playerToken);
    if (!color) return;

    try {
      const newState = forfeit(room.gameState, color);
      room.gameState = newState;
      room.status = "ended";

      try {
        const ratingChanges = await persistGameRecord(
          room,
          newState.winner,
          newState.winCondition,
        );
        io.to(room.id).emit("game_over", {
          gameState: newState,
          winner: newState.winner,
          winCondition: newState.winCondition,
          ratingChanges,
        });
      } catch (e) {
        console.error("Persistence error:", e);
        io.to(room.id).emit("game_over", {
          gameState: newState,
          winner: newState.winner,
          winCondition: newState.winCondition,
        });
      }
    } catch {
      // Game already ended
    }
  };
}

export function handleOfferDraw(socket: GameSocket, io: GameServer) {
  return (payload: OfferDrawPayload) => {
    const room = getRoom(payload.gameId);
    if (!room || room.status !== "playing") return;

    const color = authenticatePlayer(room, payload.playerToken);
    if (!color) return;

    if (room.gameState.turnsSinceCapture < 20) {
      socket.emit("error", { message: "Draw not available yet" });
      return;
    }

    if (room.pendingDrawOffer !== null) {
      socket.emit("error", { message: "Draw already offered" });
      return;
    }

    room.pendingDrawOffer = color;

    const opponentInfo = room.players[opponentColor(color)];
    if (opponentInfo?.socketId) {
      io.to(opponentInfo.socketId).emit("draw_offered", { offeredBy: color });
    }
  };
}

export function handleAcceptDraw(socket: GameSocket, io: GameServer) {
  return async (payload: AcceptDrawPayload) => {
    const room = getRoom(payload.gameId);
    if (!room || room.status !== "playing") return;

    const color = authenticatePlayer(room, payload.playerToken);
    if (!color) return;

    if (room.pendingDrawOffer === null || room.pendingDrawOffer === color) {
      socket.emit("error", { message: "No draw offer to accept" });
      return;
    }

    try {
      const newState = offerDraw(room.gameState);
      room.gameState = newState;
      room.status = "ended";
      room.pendingDrawOffer = null;

      try {
        const ratingChanges = await persistGameRecord(room, null, "draw");
        io.to(room.id).emit("game_over", {
          gameState: newState,
          winner: null,
          winCondition: "draw",
          ratingChanges,
        });
      } catch (e) {
        console.error("Persistence error:", e);
        io.to(room.id).emit("game_over", {
          gameState: newState,
          winner: null,
          winCondition: "draw",
        });
      }
    } catch {
      socket.emit("error", { message: "Draw could not be finalized" });
    }
  };
}

export function handleDeclineDraw(socket: GameSocket, io: GameServer) {
  return (payload: DeclineDrawPayload) => {
    const room = getRoom(payload.gameId);
    if (!room || room.status !== "playing") return;

    const color = authenticatePlayer(room, payload.playerToken);
    if (!color) return;

    if (room.pendingDrawOffer === null || room.pendingDrawOffer === color) return;

    room.pendingDrawOffer = null;

    const offererInfo = room.players[opponentColor(color)];
    if (offererInfo?.socketId) {
      io.to(offererInfo.socketId).emit("draw_declined", { declinedBy: color });
    }
  };
}
