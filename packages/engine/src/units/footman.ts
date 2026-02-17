import {
  GameState,
  Move,
  Piece,
  Player,
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

const ROWS = "ABCDEFGHIJK";

/** Orthogonal direction offsets: [rowDelta, colDelta] */
type Direction = [number, number];

const ORTHOGONAL_DIRS: Direction[] = [
  [-1, 0], // up (toward A)
  [1, 0],  // down (toward K)
  [0, -1], // left
  [0, 1],  // right
];

function offsetPosition(pos: Position, rowDelta: number, colDelta: number): Position | null {
  const [rowIndex, colIndex] = posToIndex(pos);
  const newRow = rowIndex + rowDelta;
  const newCol = colIndex + colDelta;
  if (newRow < 0 || newRow > 10 || newCol < 0 || newCol > 9) return null;
  return indexToPos(newCol, newRow);
}

function isForwardDir(rowDelta: number, player: Player): boolean {
  const fwd = getForwardDirection(player);
  return rowDelta === fwd;
}

function isBackwardDir(rowDelta: number, player: Player): boolean {
  const fwd = getForwardDirection(player);
  return rowDelta === -fwd;
}

function isSidewaysDir(rowDelta: number): boolean {
  return rowDelta === 0;
}

/**
 * Returns all legal movement positions for a Footman.
 *
 * Behind or At River: 1 tile forward, backward, or sideways (orthogonal only)
 * Beyond River: up to 2 tiles forward or backward, OR 1 tile sideways
 * First-move double-step: 2 tiles forward if hasMoved === false (cannot jump)
 */
export function getFootmanMoves(piece: Piece, gameState: GameState): Position[] {
  const { board } = gameState;
  const { position, player } = piece;
  const riverStatus = getRiverStatus(position, player);
  const moves: Position[] = [];

  if (riverStatus === "behind" || riverStatus === "at") {
    // 1 tile in any orthogonal direction
    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const target = offsetPosition(position, dr, dc);
      if (!target) continue;
      if (!isValidPosition(target)) continue;
      const occupant = getPieceAt(board, target);
      if (occupant && occupant.player === player) continue;
      if (occupant && occupant.player !== player) continue; // enemy piece: that's a capture, not a move
      moves.push(target);
    }
  } else {
    // Beyond river: up to 2 tiles forward or backward, 1 tile sideways
    const fwd = getForwardDirection(player);

    // Forward: 1 or 2 tiles
    {
      const oneStep = offsetPosition(position, fwd, 0);
      if (oneStep && isValidPosition(oneStep)) {
        const oneOccupant = getPieceAt(board, oneStep);
        if (!oneOccupant) {
          moves.push(oneStep);
          // 2 tiles forward (only if 1-tile was clear)
          const twoStep = offsetPosition(position, fwd * 2, 0);
          if (twoStep && isValidPosition(twoStep)) {
            const twoOccupant = getPieceAt(board, twoStep);
            if (!twoOccupant) {
              moves.push(twoStep);
            }
          }
        }
      }
    }

    // Backward: 1 or 2 tiles
    {
      const bwd = -fwd;
      const oneStep = offsetPosition(position, bwd, 0);
      if (oneStep && isValidPosition(oneStep)) {
        const oneOccupant = getPieceAt(board, oneStep);
        if (!oneOccupant) {
          moves.push(oneStep);
          // 2 tiles backward (only if 1-tile was clear)
          const twoStep = offsetPosition(position, bwd * 2, 0);
          if (twoStep && isValidPosition(twoStep)) {
            const twoOccupant = getPieceAt(board, twoStep);
            if (!twoOccupant) {
              moves.push(twoStep);
            }
          }
        }
      }
    }

    // 1 tile sideways
    for (const dc of [-1, 1]) {
      const target = offsetPosition(position, 0, dc);
      if (!target) continue;
      if (!isValidPosition(target)) continue;
      const occupant = getPieceAt(board, target);
      if (occupant) continue; // occupied (friendly or enemy — enemy would be a capture)
      moves.push(target);
    }
  }

  // First-move double-step: 2 tiles forward (regardless of river position)
  if (!piece.hasMoved) {
    const fwd = getForwardDirection(player);
    const intermediate = offsetPosition(position, fwd, 0);
    if (intermediate && isValidPosition(intermediate)) {
      const intOccupant = getPieceAt(board, intermediate);
      if (!intOccupant) {
        const target = offsetPosition(position, fwd * 2, 0);
        if (target && isValidPosition(target)) {
          const occupant = getPieceAt(board, target);
          if (!occupant) {
            // Only add if not already in the moves list
            // (could already be there if beyond river and going forward)
            const alreadyIncluded = moves.some(
              (m) => m.col === target.col && m.row === target.row,
            );
            if (!alreadyIncluded) {
              moves.push(target);
            }
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Returns all legal capture positions for a Footman, with the target piece.
 *
 * Behind or At River: 1 tile diagonally forward ONLY
 * Beyond River: 1 tile diagonally in ANY direction
 */
export function getFootmanCaptures(
  piece: Piece,
  gameState: GameState,
): { position: Position; targetPiece: Piece }[] {
  const { board } = gameState;
  const { position, player } = piece;
  const riverStatus = getRiverStatus(position, player);
  const fwd = getForwardDirection(player);
  const captures: { position: Position; targetPiece: Piece }[] = [];

  const diagonals: Direction[] =
    riverStatus === "beyond"
      ? [
          [fwd, -1],
          [fwd, 1],
          [-fwd, -1],
          [-fwd, 1],
        ]
      : [
          [fwd, -1],
          [fwd, 1],
        ];

  for (const [dr, dc] of diagonals) {
    const target = offsetPosition(position, dr, dc);
    if (!target) continue;
    if (!isValidPosition(target)) continue;
    const occupant = getPieceAt(board, target);
    if (occupant && occupant.player !== player) {
      captures.push({ position: target, targetPiece: occupant });
    }
  }

  return captures;
}

/**
 * Returns all legal pushback actions for a Footman.
 *
 * A Footman adjacent (orthogonally) to an enemy piece may push that enemy 1 tile
 * in any orthogonal direction.
 *
 * Pushback is blocked if:
 * - The destination tile is occupied (by any piece)
 * - The push would move the target off the board
 * - Anti-retaliation: target is the piece that pushed one of the player's pieces last turn
 */
export function getFootmanPushbacks(
  piece: Piece,
  gameState: GameState,
): { targetPiece: Piece; pushDirection: Direction; resultingPosition: Position }[] {
  const { board, lastPushback } = gameState;
  const { position, player } = piece;
  const pushbacks: {
    targetPiece: Piece;
    pushDirection: Direction;
    resultingPosition: Position;
  }[] = [];

  // Check all orthogonally adjacent tiles for enemy pieces
  for (const [dr, dc] of ORTHOGONAL_DIRS) {
    const adjacentPos = offsetPosition(position, dr, dc);
    if (!adjacentPos) continue;
    if (!isValidPosition(adjacentPos)) continue;

    const adjacentPiece = getPieceAt(board, adjacentPos);
    if (!adjacentPiece || adjacentPiece.player === player) continue;

    // Anti-retaliation check: cannot push the piece that pushed one of your pieces last turn
    if (
      lastPushback &&
      lastPushback.byPlayer !== player &&
      lastPushback.targetPieceId === adjacentPiece.id
    ) {
      continue;
    }

    // Push direction is the same as from the footman to the enemy (away from the footman)
    const pushTarget = offsetPosition(adjacentPos, dr, dc);
    if (!pushTarget) continue;
    if (!isValidPosition(pushTarget)) continue;

    const pushTargetOccupant = getPieceAt(board, pushTarget);
    if (pushTargetOccupant) continue; // blocked by any piece

    pushbacks.push({
      targetPiece: adjacentPiece,
      pushDirection: [dr, dc],
      resultingPosition: pushTarget,
    });
  }

  return pushbacks;
}

/**
 * Returns true if the footman is on the enemy's back row.
 * White's enemy back row is K; Black's enemy back row is A.
 */
export function canPromote(piece: Piece, gameState: GameState): boolean {
  const { player, position } = piece;
  if (player === "white") return position.row === "K";
  return position.row === "A";
}

/**
 * Returns captured pieces that could be returned and valid placement positions.
 *
 * Promotion: The player may sacrifice the Footman on the enemy back row to return
 * a previously captured friendly piece to any unoccupied tile in the player's
 * first three rows (A-C for White, I-K for Black).
 */
export function getPromotionOptions(
  piece: Piece,
  gameState: GameState,
): { capturedPieces: Piece[]; placementPositions: Position[] } {
  const { board, capturedPieces } = gameState;
  const { player } = piece;

  if (!canPromote(piece, gameState)) {
    return { capturedPieces: [], placementPositions: [] };
  }

  // Get captured friendly pieces
  const friendlyCaptured = capturedPieces[player];

  // Get valid placement positions (player's first 3 rows, unoccupied)
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

  return {
    capturedPieces: [...friendlyCaptured],
    placementPositions,
  };
}
