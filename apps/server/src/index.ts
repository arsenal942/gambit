import { createServer } from "node:http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@gambit/shared";
import { config } from "./config.js";
import { handleCreateGame, handleJoinGame } from "./handlers/game.js";
import { handleMakeMove } from "./handlers/moves.js";
import {
  handleForfeit,
  handleOfferDraw,
  handleAcceptDraw,
  handleDeclineDraw,
} from "./handlers/meta.js";
import { handleDisconnect } from "./handlers/connection.js";
import { getAllRooms, removeRoom } from "./rooms.js";

const httpServer = createServer();

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create_game", handleCreateGame(socket));
  socket.on("join_game", handleJoinGame(socket, io));
  socket.on("make_move", handleMakeMove(socket, io));
  socket.on("forfeit", handleForfeit(socket, io));
  socket.on("offer_draw", handleOfferDraw(socket, io));
  socket.on("accept_draw", handleAcceptDraw(socket, io));
  socket.on("decline_draw", handleDeclineDraw(socket, io));
  socket.on("disconnect", handleDisconnect(socket, io));
});

// Stale room cleanup: every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of getAllRooms()) {
    if (room.status === "ended" && now - room.createdAt > 60 * 60 * 1000) {
      removeRoom(id);
    }
    if (room.status === "waiting" && now - room.createdAt > 30 * 60 * 1000) {
      removeRoom(id);
    }
  }
}, 5 * 60 * 1000);

httpServer.listen(config.port, () => {
  console.log(`Gambit server listening on port ${config.port}`);
});
