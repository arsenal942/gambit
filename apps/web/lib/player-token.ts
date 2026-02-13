const TOKEN_PREFIX = "gambit_token_";
const COLOR_PREFIX = "gambit_color_";

export function getPlayerToken(gameId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${TOKEN_PREFIX}${gameId}`);
}

export function setPlayerToken(gameId: string, token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${TOKEN_PREFIX}${gameId}`, token);
}

export function getPlayerColor(gameId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${COLOR_PREFIX}${gameId}`);
}

export function setPlayerColor(gameId: string, color: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${COLOR_PREFIX}${gameId}`, color);
}
