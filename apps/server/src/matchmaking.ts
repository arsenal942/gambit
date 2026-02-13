import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@gambit/shared";
import type { Player } from "@gambit/engine";
import { createRoom, addPlayerToRoom } from "./rooms.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { persistGameStart } from "./persistence/games.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface QueueEntry {
  socketId: string;
  userId: string | null;
}

const queue: QueueEntry[] = [];

export function addToQueue(
  entry: QueueEntry,
  io: GameServer,
): void {
  // Prevent duplicate entries
  if (queue.some((e) => e.socketId === entry.socketId)) return;
  queue.push(entry);
  tryMatch(io);
}

export function removeFromQueue(socketId: string): void {
  const index = queue.findIndex((e) => e.socketId === socketId);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}

export function getQueueSize(): number {
  return queue.length;
}

async function fetchUsername(userId: string | null): Promise<string | null> {
  if (!userId || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data?.username ?? null;
}

function tryMatch(io: GameServer): void {
  if (queue.length < 2) return;

  const player1 = queue.shift()!;
  const player2 = queue.shift()!;

  // Random color assignment
  const firstIsWhite = Math.random() < 0.5;
  const whiteEntry = firstIsWhite ? player1 : player2;
  const blackEntry = firstIsWhite ? player2 : player1;

  try {
    const room = createRoom();

    const white = addPlayerToRoom(
      room,
      whiteEntry.socketId,
      "white" as Player,
      whiteEntry.userId,
    );
    const black = addPlayerToRoom(
      room,
      blackEntry.socketId,
      "black" as Player,
      blackEntry.userId,
    );

    // Join both sockets to the Socket.IO room
    const whiteSocket = io.sockets.sockets.get(whiteEntry.socketId);
    const blackSocket = io.sockets.sockets.get(blackEntry.socketId);

    if (!whiteSocket || !blackSocket) {
      return;
    }

    whiteSocket.join(room.id);
    blackSocket.join(room.id);

    whiteSocket.emit("queue_matched", {
      gameId: room.id,
      playerToken: white.playerToken,
      color: "white" as Player,
    });

    blackSocket.emit("queue_matched", {
      gameId: room.id,
      playerToken: black.playerToken,
      color: "black" as Player,
    });

    // Fetch usernames and emit game_started asynchronously
    Promise.all([
      fetchUsername(whiteEntry.userId),
      fetchUsername(blackEntry.userId),
    ]).then(([whiteUsername, blackUsername]) => {
      io.to(room.id).emit("game_started", {
        gameState: room.gameState,
        whiteUsername,
        blackUsername,
      });

      persistGameStart(room).catch((e) =>
        console.error("Game start persistence error:", e),
      );
    });
  } catch (e) {
    console.error("Matchmaking error:", e);
  }
}
