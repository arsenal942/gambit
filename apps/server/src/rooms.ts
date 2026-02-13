import type { GameRoom, PlayerInfo } from "@gambit/shared";
import { MAX_ROOMS } from "@gambit/shared";
import { createGame, type Player } from "@gambit/engine";
import { generateGameId, generatePlayerToken } from "./util/id.js";

const rooms = new Map<string, GameRoom>();

export function getRoom(gameId: string): GameRoom | undefined {
  return rooms.get(gameId);
}

export function createRoom(): GameRoom {
  if (rooms.size >= MAX_ROOMS) {
    throw new Error("Server is at maximum room capacity");
  }

  const id = generateGameId();
  const room: GameRoom = {
    id,
    status: "waiting",
    gameState: createGame(),
    players: { white: null, black: null },
    createdAt: Date.now(),
    pendingDrawOffer: null,
    disconnectTimers: new Map(),
  };
  rooms.set(id, room);
  return room;
}

export function addPlayerToRoom(
  room: GameRoom,
  socketId: string,
  preferredColor?: Player,
): { color: Player; playerToken: string } {
  let color: Player;

  if (room.players.white === null && room.players.black === null) {
    // First player: honor preference or default to white
    color = preferredColor ?? "white";
  } else if (room.players.white === null) {
    color = "white";
  } else if (room.players.black === null) {
    color = "black";
  } else {
    throw new Error("Room is full");
  }

  const playerToken = generatePlayerToken();
  const playerInfo: PlayerInfo = {
    socketId,
    playerToken,
    color,
    connected: true,
    disconnectedAt: null,
  };

  room.players[color] = playerInfo;

  if (room.players.white && room.players.black) {
    room.status = "playing";
  }

  return { color, playerToken };
}

export function removeRoom(gameId: string): void {
  const room = rooms.get(gameId);
  if (room) {
    for (const timer of room.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    rooms.delete(gameId);
  }
}

export function findRoomBySocketId(
  socketId: string,
): { room: GameRoom; color: Player } | null {
  for (const room of rooms.values()) {
    if (room.players.white?.socketId === socketId) {
      return { room, color: "white" };
    }
    if (room.players.black?.socketId === socketId) {
      return { room, color: "black" };
    }
  }
  return null;
}

export function getAllRooms(): Map<string, GameRoom> {
  return rooms;
}
