import type { Position, Piece, Move, Player } from "@gambit/engine";
import { TILE_SIZE, ROWS } from "./constants";

// Board flip mode: when true, row K is at bottom and row A is at top.
// Set by GameBoard before each render cycle.
let flipMode = false;

/** Set the board flip mode. Called by GameBoard before rendering. */
export function setFlipMode(flip: boolean): void {
  flipMode = flip;
}

/** Get current flip mode. */
export function getFlipMode(): boolean {
  return flipMode;
}

/** Convert a Position to a display label like "A1" or "F10". */
export function posToLabel(pos: Position): string {
  return `${pos.row}${pos.col}`;
}

/** Convert a Position to SVG x coordinate. */
export function posToSvgX(pos: Position): number {
  return (pos.col - 1) * TILE_SIZE;
}

/** Convert a Position to SVG y coordinate. Respects flip mode. */
export function posToSvgY(pos: Position): number {
  const rowIndex = ROWS.indexOf(pos.row);
  return flipMode ? rowIndex * TILE_SIZE : (10 - rowIndex) * TILE_SIZE;
}

/** Convert SVG coordinates to a Position, or null if out of bounds. */
export function svgToPos(svgX: number, svgY: number): Position | null {
  const colIndex = Math.floor(svgX / TILE_SIZE);
  const rowIndex = flipMode
    ? Math.floor(svgY / TILE_SIZE)
    : 10 - Math.floor(svgY / TILE_SIZE);
  if (colIndex < 0 || colIndex > 9 || rowIndex < 0 || rowIndex > 10) return null;
  return { col: colIndex + 1, row: ROWS[rowIndex] };
}

/** Describe a move action for display in move history. */
export function describeMoveAction(move: Move): string {
  const from = posToLabel(move.from);
  const to = posToLabel(move.to);
  const pieceType = move.piece.type.charAt(0).toUpperCase() + move.piece.type.slice(1);

  switch (move.type) {
    case "move":
      return `${pieceType} ${from} → ${to}`;
    case "capture":
      return `${pieceType} ${from} × ${to}`;
    case "pushback":
      return `${pieceType} pushes → ${to}`;
    case "longshot":
      return `${pieceType} ${from} ⟶ ${to}`;
    case "promotion":
      return `${pieceType} promotes at ${from}`;
    case "ransom":
      return `Ransom: ${move.ransomPiece?.type ?? "piece"} → ${to}`;
    default:
      return `${pieceType} ${from} → ${to}`;
  }
}

/** Get the player display name. */
export function playerName(player: Player): string {
  return player === "white" ? "White" : "Black";
}
