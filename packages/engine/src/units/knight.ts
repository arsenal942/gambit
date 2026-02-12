import {
  GameState,
  Piece,
  Position,
} from "../types.js";
import {
  getPieceAt,
  isValidPosition,
  indexToPos,
  posToIndex,
} from "../board.js";

/** Direction offset: [rowDelta, colDelta] */
type Direction = [number, number];

/**
 * The 4 primary orthogonal directions used as the first leg (2-tile) of the L-shape.
 * Each entry is [rowDelta, colDelta] for a single step.
 */
const PRIMARY_DIRS: Direction[] = [
  [-1, 0], // up (toward A)
  [1, 0],  // down (toward K)
  [0, -1], // left
  [0, 1],  // right
];

/**
 * For each primary 2-tile direction, the two perpendicular 1-tile offsets.
 * Maps a primary direction to its two perpendicular options.
 */
function getPerpendicularOffsets(dir: Direction): Direction[] {
  const [dr, dc] = dir;
  if (dr !== 0) {
    // Primary is vertical → perpendicular is horizontal
    return [[0, -1], [0, 1]];
  }
  // Primary is horizontal → perpendicular is vertical
  return [[-1, 0], [1, 0]];
}

function offsetPosition(pos: Position, rowDelta: number, colDelta: number): Position | null {
  const [rowIndex, colIndex] = posToIndex(pos);
  const newRow = rowIndex + rowDelta;
  const newCol = colIndex + colDelta;
  if (newRow < 0 || newRow > 10 || newCol < 0 || newCol > 9) return null;
  return indexToPos(newCol, newRow);
}

/**
 * Checks if a specific 2-tile direction is blocked by the "Leg Cut" rule.
 *
 * The intermediate tile is the FIRST step in the 2-tile primary direction.
 * If that tile is occupied by ANY piece (friendly or enemy), the entire
 * direction is blocked — both L-shaped destinations from that direction are illegal.
 */
export function isLegCut(
  piece: Piece,
  direction: Direction,
  gameState: GameState,
): boolean {
  const { board } = gameState;
  const { position } = piece;
  const [dr, dc] = direction;

  // The intermediate tile is 1 step in the primary direction
  const intermediate = offsetPosition(position, dr, dc);
  if (!intermediate || !isValidPosition(intermediate)) return true;

  const occupant = getPieceAt(board, intermediate);
  return occupant !== null;
}

/**
 * Returns all legal movement positions for a Knight (empty destination tiles).
 *
 * L-shaped jump: 2 tiles in one orthogonal direction, then 1 tile perpendicular.
 * - Knights CAN jump over the piece on the final bend tile
 * - Leg Cut: if the first step of the 2-tile direction is occupied, that direction is blocked
 * - Cannot land on a tile occupied by a friendly piece
 * - Knights are NOT affected by the River
 */
export function getKnightMoves(piece: Piece, gameState: GameState): Position[] {
  const { board } = gameState;
  const { position, player } = piece;
  const moves: Position[] = [];

  for (const primaryDir of PRIMARY_DIRS) {
    // Check leg cut for this primary direction
    if (isLegCut(piece, primaryDir, gameState)) continue;

    const [dr, dc] = primaryDir;

    // Move 2 tiles in primary direction
    const afterTwo = offsetPosition(position, dr * 2, dc * 2);
    if (!afterTwo || !isValidPosition(afterTwo)) continue;

    // Then 1 tile in each perpendicular direction
    for (const [perpDr, perpDc] of getPerpendicularOffsets(primaryDir)) {
      const dest = offsetPosition(afterTwo, perpDr, perpDc);
      if (!dest || !isValidPosition(dest)) continue;

      const occupant = getPieceAt(board, dest);
      if (occupant && occupant.player === player) continue; // can't land on friendly
      if (occupant && occupant.player !== player) continue; // enemy → capture, not move
      moves.push(dest);
    }
  }

  return moves;
}

/**
 * Returns all legal capture positions for a Knight (tiles with enemy pieces).
 *
 * Same L-shaped movement rules apply, including Leg Cut.
 * Capture by displacement: land on an enemy-occupied tile.
 */
export function getKnightCaptures(
  piece: Piece,
  gameState: GameState,
): { position: Position; targetPiece: Piece }[] {
  const { board } = gameState;
  const { position, player } = piece;
  const captures: { position: Position; targetPiece: Piece }[] = [];

  for (const primaryDir of PRIMARY_DIRS) {
    if (isLegCut(piece, primaryDir, gameState)) continue;

    const [dr, dc] = primaryDir;

    const afterTwo = offsetPosition(position, dr * 2, dc * 2);
    if (!afterTwo || !isValidPosition(afterTwo)) continue;

    for (const [perpDr, perpDc] of getPerpendicularOffsets(primaryDir)) {
      const dest = offsetPosition(afterTwo, perpDr, perpDc);
      if (!dest || !isValidPosition(dest)) continue;

      const occupant = getPieceAt(board, dest);
      if (occupant && occupant.player !== player) {
        captures.push({ position: dest, targetPiece: occupant });
      }
    }
  }

  return captures;
}

/**
 * Returns ransom options when a Knight captures an enemy Knight.
 *
 * When a Knight captures an enemy Knight specifically, the capturing player MAY
 * return one previously captured Footman or Archer to any unoccupied tile in
 * their first three rows.
 *
 * Returns empty arrays if:
 * - The captured piece is not a Knight
 * - No eligible captured pieces exist (only Footmen and Archers, not Knights)
 * - No valid placement positions exist
 */
export function getRansomOptions(
  piece: Piece,
  capturedPiece: Piece,
  gameState: GameState,
): { capturedPieces: Piece[]; placementPositions: Position[] } {
  const { board, capturedPieces } = gameState;
  const { player } = piece;

  // Ransom only triggers on knight-captures-knight
  if (capturedPiece.type !== "knight") {
    return { capturedPieces: [], placementPositions: [] };
  }

  // Get captured friendly Footmen and Archers (not Knights)
  const eligiblePieces = capturedPieces[player].filter(
    (p) => p.type === "footman" || p.type === "archer",
  );

  if (eligiblePieces.length === 0) {
    return { capturedPieces: [], placementPositions: [] };
  }

  // Valid placement positions: first 3 rows for the capturing player, unoccupied
  const homeRows = player === "white" ? ["A", "B", "C"] : ["I", "J", "K"];
  const placementPositions: Position[] = [];

  for (const row of homeRows) {
    for (let col = 1; col <= 10; col++) {
      const pos: Position = { col, row };
      if (!getPieceAt(board, pos)) {
        placementPositions.push(pos);
      }
    }
  }

  if (placementPositions.length === 0) {
    return { capturedPieces: [], placementPositions: [] };
  }

  return {
    capturedPieces: [...eligiblePieces],
    placementPositions,
  };
}
