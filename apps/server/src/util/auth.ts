import type { Player } from "@gambit/engine";
import type { GameRoom } from "@gambit/shared";

/**
 * Given a game room and a player token, returns which color the player is,
 * or null if the token does not match either player.
 */
export function authenticatePlayer(
  room: GameRoom,
  playerToken: string,
): Player | null {
  if (room.players.white?.playerToken === playerToken) return "white";
  if (room.players.black?.playerToken === playerToken) return "black";
  return null;
}
