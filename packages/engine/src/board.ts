import {
  Board,
  CAPTURE_POINT_POSITIONS,
  Piece,
  Player,
  Position,
  RiverStatus,
  UnitType,
} from "./types.js";

const ROWS = "ABCDEFGHIJK";
const NUM_COLS = 10;
const NUM_ROWS = 11;

/**
 * Creates an empty 10×11 board. The board is indexed as board[rowIndex][colIndex],
 * where rowIndex 0 = row A and colIndex 0 = column 1.
 */
export function createEmptyBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < NUM_ROWS; r++) {
    board.push(new Array(NUM_COLS).fill(null));
  }
  return board;
}

/** Converts a Position (col 1-10, row A-K) to 0-based array indices [rowIndex, colIndex]. */
export function posToIndex(pos: Position): [number, number] {
  const rowIndex = ROWS.indexOf(pos.row);
  const colIndex = pos.col - 1;
  return [rowIndex, colIndex];
}

/** Converts 0-based array indices to a Position. */
export function indexToPos(colIndex: number, rowIndex: number): Position {
  return {
    col: colIndex + 1,
    row: ROWS[rowIndex],
  };
}

/** Returns true if the position is within the 10×11 board. */
export function isValidPosition(pos: Position): boolean {
  if (pos.row.length !== 1) return false;
  const rowIndex = ROWS.indexOf(pos.row);
  if (rowIndex === -1) return false;
  if (pos.col < 1 || pos.col > NUM_COLS) return false;
  return true;
}

/** Returns the piece at the given position, or null. */
export function getPieceAt(board: Board, pos: Position): Piece | null {
  const [rowIndex, colIndex] = posToIndex(pos);
  return board[rowIndex][colIndex];
}

/** Places a piece on the board at the given position (mutates the board). */
export function setPieceAt(
  board: Board,
  pos: Position,
  piece: Piece | null,
): void {
  const [rowIndex, colIndex] = posToIndex(pos);
  board[rowIndex][colIndex] = piece;
}

/** Removes the piece at the given position and returns it (mutates the board). */
export function removePieceAt(board: Board, pos: Position): Piece | null {
  const [rowIndex, colIndex] = posToIndex(pos);
  const piece = board[rowIndex][colIndex];
  board[rowIndex][colIndex] = null;
  return piece;
}

/** Returns true if the position is on the River (row F). */
export function isRiver(pos: Position): boolean {
  return pos.row === "F";
}

/** Returns true if the position is one of the 4 capture points (F1, F4, F7, F10). */
export function isCapturePoint(pos: Position): boolean {
  return CAPTURE_POINT_POSITIONS.some(
    (cp) => cp.col === pos.col && cp.row === pos.row,
  );
}

/**
 * Returns the river status of a position relative to the given player.
 * - White: behind = A-E, at = F, beyond = G-K
 * - Black: behind = G-K, at = F, beyond = A-E
 */
export function getRiverStatus(pos: Position, player: Player): RiverStatus {
  const rowIndex = ROWS.indexOf(pos.row);
  if (rowIndex === 5) return "at"; // Row F

  if (player === "white") {
    return rowIndex < 5 ? "behind" : "beyond";
  } else {
    return rowIndex > 5 ? "behind" : "beyond";
  }
}

/**
 * Returns the forward direction for a player in terms of row index change.
 * White moves from A→K (+1), Black moves from K→A (-1).
 */
export function getForwardDirection(player: Player): number {
  return player === "white" ? 1 : -1;
}

/**
 * Returns true if the tile at the given position is dark.
 * Uses a checkerboard pattern where A1 (index 0,0) is dark.
 */
export function isDarkTile(pos: Position): boolean {
  const [rowIndex, colIndex] = posToIndex(pos);
  return (rowIndex + colIndex) % 2 === 0;
}

/**
 * Creates the initial board with all 30 pieces in their starting positions.
 *
 * White (on dark tiles):
 *   - Knights on Row A: cols 1,3,5,7,9
 *   - Archers on Row B: cols 2,4,6,8,10
 *   - Footmen on Row C: cols 1,3,5,7,9
 *
 * Black (on light tiles):
 *   - Footmen on Row I: cols 2,4,6,8,10
 *   - Archers on Row J: cols 1,3,5,7,9
 *   - Knights on Row K: cols 2,4,6,8,10
 */
export function setupInitialBoard(): Board {
  const board = createEmptyBoard();

  let pieceId = 1;

  function placePieces(
    row: string,
    cols: number[],
    type: UnitType,
    player: Player,
  ): void {
    for (const col of cols) {
      const pos: Position = { col, row };
      const piece: Piece = {
        id: `${player}-${type}-${pieceId++}`,
        type,
        player,
        position: { ...pos },
        hasMoved: false,
      };
      setPieceAt(board, pos, piece);
    }
  }

  const oddCols = [1, 3, 5, 7, 9];
  const evenCols = [2, 4, 6, 8, 10];

  // White pieces (dark tiles)
  placePieces("A", oddCols, "knight", "white");
  placePieces("B", evenCols, "archer", "white");
  placePieces("C", oddCols, "footman", "white");

  // Black pieces (light tiles)
  placePieces("I", evenCols, "footman", "black");
  placePieces("J", oddCols, "archer", "black");
  placePieces("K", evenCols, "knight", "black");

  return board;
}
