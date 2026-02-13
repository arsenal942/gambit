import { nanoid } from "nanoid";

/** Generate a 12-character game room ID (URL-friendly). */
export function generateGameId(): string {
  return nanoid(12);
}

/** Generate a 21-character player token (secure, unguessable). */
export function generatePlayerToken(): string {
  return nanoid(21);
}
