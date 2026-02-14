import type { Socket } from "socket.io";

const WINDOW_MS = 1000;
const MAX_EVENTS = 2;

const clientTimestamps = new Map<string, number[]>();

export function rateLimitMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  clientTimestamps.set(socket.id, []);

  socket.use((event, nextEvent) => {
    const timestamps = clientTimestamps.get(socket.id);
    if (!timestamps) {
      nextEvent();
      return;
    }

    const now = Date.now();
    // Remove timestamps outside the window
    while (timestamps.length > 0 && now - timestamps[0] >= WINDOW_MS) {
      timestamps.shift();
    }

    if (timestamps.length >= MAX_EVENTS) {
      console.warn(`Rate limit exceeded for socket ${socket.id}`);
      nextEvent(new Error("Rate limit exceeded"));
      return;
    }

    timestamps.push(now);
    nextEvent();
  });

  socket.on("disconnect", () => {
    clientTimestamps.delete(socket.id);
  });

  next();
}
