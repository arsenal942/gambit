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

export interface QueueEntry {
  socketId: string;
  userId: string | null;
  rating: number | null;
  joinedAt: number;
}

const queue: QueueEntry[] = [];

const RATING_BRACKET_INITIAL = 200;
const RATING_BRACKET_WIDEN_STEP = 100;
const RATING_BRACKET_WIDEN_DELAY_MS = 30_000;
const RATING_BRACKET_WIDEN_INTERVAL_MS = 15_000;
const MATCHMAKING_RECHECK_MS = 5_000;

let matchInterval: ReturnType<typeof setInterval> | null = null;

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

export function startMatchmakingLoop(io: GameServer): void {
  if (matchInterval) return;
  matchInterval = setInterval(() => tryMatch(io), MATCHMAKING_RECHECK_MS);
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

function getRatingBracket(entry: QueueEntry): number {
  const waitTime = Date.now() - entry.joinedAt;
  if (waitTime < RATING_BRACKET_WIDEN_DELAY_MS) {
    return RATING_BRACKET_INITIAL;
  }
  const widenSteps = Math.floor(
    (waitTime - RATING_BRACKET_WIDEN_DELAY_MS) / RATING_BRACKET_WIDEN_INTERVAL_MS,
  );
  return RATING_BRACKET_INITIAL + widenSteps * RATING_BRACKET_WIDEN_STEP;
}

function arePlayersCompatible(a: QueueEntry, b: QueueEntry): boolean {
  // If either player has no rating, they match anyone (FIFO fallback)
  if (a.rating === null || b.rating === null) return true;

  const bracketA = getRatingBracket(a);
  const bracketB = getRatingBracket(b);
  const diff = Math.abs(a.rating - b.rating);

  return diff <= Math.max(bracketA, bracketB);
}

function tryMatch(io: GameServer): void {
  if (queue.length < 2) return;

  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      if (arePlayersCompatible(queue[i], queue[j])) {
        const player1 = queue[i];
        const player2 = queue[j];

        // Remove both from queue (remove higher index first)
        queue.splice(j, 1);
        queue.splice(i, 1);

        matchPlayers(player1, player2, io);
        return;
      }
    }
  }
}

function matchPlayers(
  player1: QueueEntry,
  player2: QueueEntry,
  io: GameServer,
): void {
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
