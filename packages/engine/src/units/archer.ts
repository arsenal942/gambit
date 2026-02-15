import {
  GameState,
  Piece,
  Position,
} from "../types.js";
import {
  getPieceAt,
  getRiverStatus,
  getForwardDirection,
  isValidPosition,
  indexToPos,
  posToIndex,
} from "../board.js";

/** Direction offset: [rowDelta, colDelta] */
type Direction = [number, number];

const ORTHOGONAL_DIRS: Direction[] = [
  [-1, 0], // up (toward A)
  [1, 0],  // down (toward K)
  [0, -1], // left
  [0, 1],  // right
];

const DIAGONAL_DIRS: Direction[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const ALL_DIRS: Direction[] = [...ORTHOGONAL_DIRS, ...DIAGONAL_DIRS];

function offsetPosition(pos: Position, rowDelta: number, colDelta: number): Position | null {
  const [rowIndex, colIndex] = posToIndex(pos);
  const newRow = rowIndex + rowDelta;
  const newCol = colIndex + colDelta;
  if (newRow < 0 || newRow > 10 || newCol < 0 || newCol > 9) return null;
  return indexToPos(newCol, newRow);
}

/**
 * Returns all legal movement positions for an Archer.
 *
 * Behind or At River: up to 2 tiles forward, backward, or sideways (orthogonal, sliding) — OR 1 tile diagonally
 * Beyond River: 1 tile in any direction (orthogonal or diagonal — like a king in chess)
 *
 * Archers CANNOT capture by moving — they cannot land on any occupied tile.
 */
export function getArcherMoves(piece: Piece, gameState: GameState): Position[] {
  const { board } = gameState;
  const { position, player } = piece;
  const riverStatus = getRiverStatus(position, player);
  const moves: Position[] = [];

  if (riverStatus === "behind" || riverStatus === "at") {
    // Up to 2 tiles in any orthogonal direction (sliding — intermediate must be empty to reach 2)
    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const intermediate = offsetPosition(position, dr, dc);
      if (!intermediate || !isValidPosition(intermediate)) continue;
      const intOccupant = getPieceAt(board, intermediate);
      if (intOccupant) continue; // blocked — cannot move here or slide past

      // 1 tile is valid
      moves.push(intermediate);

      // 2 tiles if the destination is also empty
      const target = offsetPosition(position, dr * 2, dc * 2);
      if (!target || !isValidPosition(target)) continue;
      const occupant = getPieceAt(board, target);
      if (occupant) continue; // cannot land on any occupied tile
      moves.push(target);
    }

    // 1 tile diagonally (all 4 diagonal directions)
    for (const [dr, dc] of DIAGONAL_DIRS) {
      const target = offsetPosition(position, dr, dc);
      if (!target || !isValidPosition(target)) continue;
      const occupant = getPieceAt(board, target);
      if (occupant) continue; // cannot land on any occupied tile
      moves.push(target);
    }
  } else {
    // Beyond river: 1 tile in any direction (orthogonal or diagonal)
    for (const [dr, dc] of ALL_DIRS) {
      const target = offsetPosition(position, dr, dc);
      if (!target || !isValidPosition(target)) continue;
      const occupant = getPieceAt(board, target);
      if (occupant) continue; // cannot land on any occupied tile
      moves.push(target);
    }
  }

  return moves;
}

/**
 * Returns all legal longshot targets for an Archer.
 *
 * Longshot is a ranged capture — the Archer fires through a screen piece and moves to the target position.
 *
 * Forward Longshot: up to 3 tiles directly forward.
 * Sideways Longshot: up to 2 tiles directly left or right.
 * Backward Longshot: not allowed.
 *
 * Rules:
 * - Only orthogonal directions (no diagonal)
 * - Exactly 1 screen piece must be between the Archer and the target
 * - Target must be an enemy piece
 * - Minimum distance is 2 (adjacent pieces cannot be longshot)
 */
export function getArcherLongshots(
  piece: Piece,
  gameState: GameState,
): { targetPiece: Piece; targetPosition: Position; screenPiece: Piece; direction: Direction }[] {
  const { board } = gameState;
  const { position, player } = piece;
  const fwd = getForwardDirection(player);

  const longshots: {
    targetPiece: Piece;
    targetPosition: Position;
    screenPiece: Piece;
    direction: Direction;
  }[] = [];

  // Define directions with their maximum longshot range
  // Archers can only longshot forward (up to 3 tiles) and sideways (up to 2 tiles).
  // Backward longshot is not allowed.
  const directionConfigs: { dir: Direction; maxRange: number }[] = [
    { dir: [fwd, 0], maxRange: 3 },   // forward
    { dir: [0, -1], maxRange: 2 },     // left
    { dir: [0, 1], maxRange: 2 },      // right
  ];

  for (const { dir, maxRange } of directionConfigs) {
    const [dr, dc] = dir;

    for (let dist = 2; dist <= maxRange; dist++) {
      const targetPos = offsetPosition(position, dr * dist, dc * dist);
      if (!targetPos || !isValidPosition(targetPos)) break; // further distances also off-board

      const target = getPieceAt(board, targetPos);
      if (!target || target.player === player) continue; // must be an enemy piece

      // Count pieces between archer and target (exclusive of both endpoints)
      const betweenPieces: Piece[] = [];
      let pathValid = true;
      for (let i = 1; i < dist; i++) {
        const betweenPos = offsetPosition(position, dr * i, dc * i);
        if (!betweenPos || !isValidPosition(betweenPos)) {
          pathValid = false;
          break;
        }
        const occupant = getPieceAt(board, betweenPos);
        if (occupant) {
          betweenPieces.push(occupant);
        }
      }

      if (!pathValid) continue;
      if (betweenPieces.length !== 1) continue; // exactly 1 screen required

      longshots.push({
        targetPiece: target,
        targetPosition: targetPos,
        screenPiece: betweenPieces[0],
        direction: dir,
      });
    }
  }

  return longshots;
}
