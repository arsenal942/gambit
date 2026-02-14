import { describe, it, expect } from "vitest";
import {
  getArcherMoves,
  getArcherLongshots,
} from "../src/units/archer.js";
import {
  createEmptyBoard,
  setPieceAt,
  getPieceAt,
} from "../src/board.js";
import type { Board, GameState, Piece, Position } from "../src/types.js";

/** Helper to create a minimal GameState with a given board. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: overrides.board ?? createEmptyBoard(),
    turn: overrides.turn ?? "white",
    moveHistory: overrides.moveHistory ?? [],
    capturedPieces: overrides.capturedPieces ?? { white: [], black: [] },
    capturePoints: overrides.capturePoints ?? {},
    checkPlayer: overrides.checkPlayer ?? null,
    lastPushback: overrides.lastPushback ?? null,
    turnsSinceCapture: overrides.turnsSinceCapture ?? 0,
    gamePhase: overrides.gamePhase ?? "playing",
    winner: overrides.winner ?? null,
    winCondition: overrides.winCondition ?? null,
    pendingPromotion: overrides.pendingPromotion ?? null,
    pendingRansom: overrides.pendingRansom ?? null,
  };
}

/** Helper to create a Piece. */
function makePiece(overrides: Partial<Piece> & Pick<Piece, "player" | "position">): Piece {
  return {
    id: overrides.id ?? `${overrides.player}-archer-test`,
    type: overrides.type ?? "archer",
    player: overrides.player,
    position: overrides.position,
    hasMoved: overrides.hasMoved ?? true,
  };
}

/** Helper: place a piece on the board and return the piece. */
function placePiece(board: Board, piece: Piece): Piece {
  setPieceAt(board, piece.position, piece);
  return piece;
}

/** Helper: check if a position list includes a given position. */
function includesPos(positions: Position[], pos: Position): boolean {
  return positions.some((p) => p.col === pos.col && p.row === pos.row);
}

// ─── MOVEMENT ───────────────────────────────────────────────────────────────

describe("getArcherMoves", () => {
  describe("behind river: 2 tiles orthogonal", () => {
    it("white archer on D5 can move 2 tiles in each orthogonal direction", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 tiles forward (toward K): D→F
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(true);
      // 2 tiles backward (toward A): D→B
      expect(includesPos(moves, { col: 5, row: "B" })).toBe(true);
      // 2 tiles left: col 5→3
      expect(includesPos(moves, { col: 3, row: "D" })).toBe(true);
      // 2 tiles right: col 5→7
      expect(includesPos(moves, { col: 7, row: "D" })).toBe(true);
    });

    it("black archer on H5 can move 2 tiles in each orthogonal direction", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "H" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // Black forward is toward A: H→F (2 forward)
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(true);
      // 2 backward (toward K): H→J
      expect(includesPos(moves, { col: 5, row: "J" })).toBe(true);
      // 2 left
      expect(includesPos(moves, { col: 3, row: "H" })).toBe(true);
      // 2 right
      expect(includesPos(moves, { col: 7, row: "H" })).toBe(true);
    });
  });

  describe("behind river: 1 tile diagonal", () => {
    it("white archer on D5 can move 1 tile in each diagonal direction", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);  // up-left
      expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);  // up-right
      expect(includesPos(moves, { col: 4, row: "E" })).toBe(true);  // down-left
      expect(includesPos(moves, { col: 6, row: "E" })).toBe(true);  // down-right
    });

    it("black archer on H5 can move 1 tile in each diagonal direction", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "H" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "I" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "I" })).toBe(true);
    });
  });

  describe("behind river: cannot move 2 tiles diagonally", () => {
    it("white archer on D5 cannot reach 2-tile diagonal positions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 3, row: "B" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "B" })).toBe(false);
      expect(includesPos(moves, { col: 3, row: "F" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "F" })).toBe(false);
    });
  });

  describe("behind river: cannot move 1 tile orthogonally", () => {
    it("white archer on D5 cannot move just 1 tile orthogonally", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(false);  // 1 forward
      expect(includesPos(moves, { col: 5, row: "C" })).toBe(false);  // 1 backward
      expect(includesPos(moves, { col: 4, row: "D" })).toBe(false);  // 1 left
      expect(includesPos(moves, { col: 6, row: "D" })).toBe(false);  // 1 right
    });
  });

  describe("behind river: total move count on open board", () => {
    it("white archer on D5 has exactly 8 moves (4 orthogonal-2 + 4 diagonal-1)", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(moves).toHaveLength(8);
    });
  });

  describe("at river: same as behind river", () => {
    it("white archer on F5 (at river) can move 2 orthogonal and 1 diagonal", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 tiles orthogonal
      expect(includesPos(moves, { col: 5, row: "H" })).toBe(true);  // 2 forward
      expect(includesPos(moves, { col: 5, row: "D" })).toBe(true);  // 2 backward
      expect(includesPos(moves, { col: 3, row: "F" })).toBe(true);  // 2 left
      expect(includesPos(moves, { col: 7, row: "F" })).toBe(true);  // 2 right

      // 1 tile diagonal
      expect(includesPos(moves, { col: 4, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "G" })).toBe(true);

      expect(moves).toHaveLength(8);
    });

    it("black archer on F5 (at river) can move 2 orthogonal and 1 diagonal", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 forward (toward A): F→D
      expect(includesPos(moves, { col: 5, row: "D" })).toBe(true);
      // 2 backward (toward K): F→H
      expect(includesPos(moves, { col: 5, row: "H" })).toBe(true);
      // 2 left, 2 right
      expect(includesPos(moves, { col: 3, row: "F" })).toBe(true);
      expect(includesPos(moves, { col: 7, row: "F" })).toBe(true);

      // 1 tile diagonals
      expect(includesPos(moves, { col: 4, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "G" })).toBe(true);

      expect(moves).toHaveLength(8);
    });
  });

  describe("beyond river: 1 tile in all 8 directions", () => {
    it("white archer on H5 (beyond river) moves 1 tile in all 8 directions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // Orthogonal
      expect(includesPos(moves, { col: 5, row: "I" })).toBe(true);  // down
      expect(includesPos(moves, { col: 5, row: "G" })).toBe(true);  // up
      expect(includesPos(moves, { col: 4, row: "H" })).toBe(true);  // left
      expect(includesPos(moves, { col: 6, row: "H" })).toBe(true);  // right

      // Diagonal
      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "I" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "I" })).toBe(true);

      expect(moves).toHaveLength(8);
    });

    it("black archer on D5 (beyond river) moves 1 tile in all 8 directions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // Beyond river for black (rows A-E)
      // Orthogonal
      expect(includesPos(moves, { col: 5, row: "C" })).toBe(true);
      expect(includesPos(moves, { col: 5, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "D" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "D" })).toBe(true);

      // Diagonal
      expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "E" })).toBe(true);

      expect(moves).toHaveLength(8);
    });
  });

  describe("beyond river: cannot move 2 tiles in any direction", () => {
    it("white archer on H5 (beyond river) cannot move 2 tiles in any direction", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2-tile orthogonal
      expect(includesPos(moves, { col: 5, row: "J" })).toBe(false);
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false);
      expect(includesPos(moves, { col: 3, row: "H" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "H" })).toBe(false);

      // 2-tile diagonal
      expect(includesPos(moves, { col: 3, row: "F" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "F" })).toBe(false);
      expect(includesPos(moves, { col: 3, row: "J" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "J" })).toBe(false);
    });
  });

  describe("sliding: 2-tile orthogonal move blocked by piece on intermediate tile", () => {
    it("piece on intermediate tile blocks 2-tile forward move", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Block intermediate tile E5
      placePiece(board, makePiece({
        id: "blocker",
        player: "white",
        position: { col: 5, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false); // blocked
    });

    it("enemy piece on intermediate tile also blocks sliding", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Enemy on intermediate tile
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 5, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false); // blocked
    });

    it("piece on intermediate tile blocks 2-tile sideways move", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Block intermediate tile col 6
      placePiece(board, makePiece({
        id: "blocker",
        player: "black",
        position: { col: 6, row: "D" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 7, row: "D" })).toBe(false); // blocked
    });

    it("piece on intermediate tile blocks 2-tile backward move", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Block intermediate tile C5
      placePiece(board, makePiece({
        id: "blocker",
        player: "white",
        position: { col: 5, row: "C" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "B" })).toBe(false); // blocked
    });
  });

  describe("cannot move onto friendly pieces", () => {
    it("behind river: 2-tile orthogonal blocked by friendly on destination", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Friendly piece at 2-tile forward destination
      placePiece(board, makePiece({
        id: "friendly",
        player: "white",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false);
    });

    it("behind river: 1-tile diagonal blocked by friendly piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      placePiece(board, makePiece({
        id: "friendly",
        player: "white",
        position: { col: 4, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 4, row: "E" })).toBe(false);
    });

    it("beyond river: 1-tile move blocked by friendly piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
      }));
      placePiece(board, makePiece({
        id: "friendly",
        player: "white",
        position: { col: 5, row: "I" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "I" })).toBe(false);
      expect(moves).toHaveLength(7); // 8 - 1 blocked
    });
  });

  describe("cannot move onto enemy pieces (archers cannot capture by moving)", () => {
    it("behind river: 2-tile orthogonal blocked by enemy on destination", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false);
    });

    it("behind river: 1-tile diagonal blocked by enemy piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 4, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 4, row: "E" })).toBe(false);
    });

    it("beyond river: 1-tile move blocked by enemy piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
      }));
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 6, row: "H" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      expect(includesPos(moves, { col: 6, row: "H" })).toBe(false);
    });
  });

  describe("board edge cases", () => {
    it("white archer on A1 (corner, behind river): limited moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "A" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 forward: A→C col 1 ✓
      expect(includesPos(moves, { col: 1, row: "C" })).toBe(true);
      // 2 right: col 1→3 ✓
      expect(includesPos(moves, { col: 3, row: "A" })).toBe(true);
      // 2 backward: off board
      // 2 left: off board
      // 1 diagonal down-right: B2 ✓
      expect(includesPos(moves, { col: 2, row: "B" })).toBe(true);
      // Other diagonals: off board
      expect(moves).toHaveLength(3);
    });

    it("white archer on K10 (corner, beyond river): limited moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 10, row: "K" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // Beyond river: 1 tile in any direction
      // Up: J10 ✓
      expect(includesPos(moves, { col: 10, row: "J" })).toBe(true);
      // Left: K9 ✓
      expect(includesPos(moves, { col: 9, row: "K" })).toBe(true);
      // Up-left diagonal: J9 ✓
      expect(includesPos(moves, { col: 9, row: "J" })).toBe(true);
      // All others off board
      expect(moves).toHaveLength(3);
    });

    it("white archer on B1 (left edge, behind river): 2-tile left goes off board", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "B" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 left from col 1: off board
      expect(moves.every((m) => m.col >= 1)).toBe(true);
      // 2 forward: B→D ✓
      expect(includesPos(moves, { col: 1, row: "D" })).toBe(true);
      // 2 right: col 1→3 ✓
      expect(includesPos(moves, { col: 3, row: "B" })).toBe(true);
    });

    it("archer on E10 (right edge, behind river): 2-tile right goes off board", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 10, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 right from col 10: off board
      expect(includesPos(moves, { col: 12, row: "E" })).toBe(false);
      // 2 left: col 10→8 ✓
      expect(includesPos(moves, { col: 8, row: "E" })).toBe(true);
    });

    it("archer behind river near top edge: 2-tile backward goes off board", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "A" },
      }));
      const state = makeState({ board });
      const moves = getArcherMoves(piece, state);

      // 2 backward from A: off board
      // 2 forward: A→C ✓
      expect(includesPos(moves, { col: 5, row: "C" })).toBe(true);
      // 1 diagonal: only downward diagonals available
      expect(includesPos(moves, { col: 4, row: "B" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "B" })).toBe(true);
    });
  });
});

// ─── LONGSHOT ───────────────────────────────────────────────────────────────

describe("getArcherLongshots", () => {
  describe("forward longshot at distance 2 with 1 screen (simplest case)", () => {
    it("white archer longshots enemy 2 tiles forward with screen at distance 1", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Screen at E5 (1 tile forward)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // Target at F5 (2 tiles forward)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      expect(longshots[0].targetPiece.id).toBe("target");
      expect(longshots[0].targetPosition).toEqual({ col: 5, row: "F" });
      expect(longshots[0].screenPiece.id).toBe("screen");
    });

    it("black archer longshots enemy 2 tiles forward (toward A)", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "H" },
      }));
      // Screen at G5 (1 tile forward for black)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "black",
        type: "footman",
        position: { col: 5, row: "G" },
      }));
      // Target at F5 (2 tiles forward for black)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "white",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      expect(longshots[0].targetPiece.id).toBe("target");
      expect(longshots[0].targetPosition).toEqual({ col: 5, row: "F" });
    });
  });

  describe("forward longshot at distance 3 with 1 screen at distance 1", () => {
    it("screen at dist 1, empty at dist 2, target at dist 3", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
      }));
      // Screen at D5 (distance 1)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "D" },
      }));
      // E5 is empty (distance 2)
      // Target at F5 (distance 3)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      expect(longshots[0].targetPiece.id).toBe("target");
      expect(longshots[0].targetPosition).toEqual({ col: 5, row: "F" });
      expect(longshots[0].screenPiece.id).toBe("screen");
    });
  });

  describe("forward longshot at distance 3 with 1 screen at distance 2", () => {
    it("empty at dist 1, screen at dist 2, target at dist 3", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
      }));
      // D5 is empty (distance 1)
      // Screen at E5 (distance 2)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "black",
        type: "archer",
        position: { col: 5, row: "E" },
      }));
      // Target at F5 (distance 3)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      expect(longshots[0].targetPiece.id).toBe("target");
      expect(longshots[0].screenPiece.id).toBe("screen");
    });
  });

  describe("cannot forward longshot at distance 4+", () => {
    it("enemy 4 tiles forward is out of range even with valid screen", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "B" },
      }));
      // Screen at C5 (distance 1)
      placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "C" },
      }));
      // Target at F5 (distance 4) — out of range
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Should not be able to hit F5 (4 tiles away)
      expect(longshots.some((l) => l.targetPosition.row === "F")).toBe(false);
    });
  });

  describe("backward longshot at distance 2 with 1 screen", () => {
    it("white archer longshots enemy 2 tiles backward", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
      }));
      // Screen at D5 (1 tile backward for white)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "D" },
      }));
      // Target at C5 (2 tiles backward for white)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "C" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      const backwardShot = longshots.find((l) => l.targetPosition.row === "C" && l.targetPosition.col === 5);
      expect(backwardShot).toBeDefined();
      expect(backwardShot!.targetPiece.id).toBe("target");
      expect(backwardShot!.screenPiece.id).toBe("screen");
    });
  });

  describe("sideways longshot (left and right) at distance 2 with 1 screen", () => {
    it("white archer longshots enemy 2 tiles to the right", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 3, row: "D" },
      }));
      // Screen at col 4 (1 tile right)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 4, row: "D" },
      }));
      // Target at col 5 (2 tiles right)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      const rightShot = longshots.find((l) => l.targetPosition.col === 5 && l.targetPosition.row === "D");
      expect(rightShot).toBeDefined();
      expect(rightShot!.targetPiece.id).toBe("target");
    });

    it("white archer longshots enemy 2 tiles to the left", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 7, row: "D" },
      }));
      // Screen at col 6 (1 tile left)
      const screen = placePiece(board, makePiece({
        id: "screen",
        player: "black",
        type: "footman",
        position: { col: 6, row: "D" },
      }));
      // Target at col 5 (2 tiles left)
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "knight",
        position: { col: 5, row: "D" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      const leftShot = longshots.find((l) => l.targetPosition.col === 5 && l.targetPosition.row === "D");
      expect(leftShot).toBeDefined();
      expect(leftShot!.targetPiece.id).toBe("target");
    });
  });

  describe("cannot backward/sideways longshot at distance 3+", () => {
    it("backward longshot at distance 3 is out of range", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "F" },
      }));
      // Screen at E5 (1 backward)
      placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // Target at C5 (3 tiles backward) — out of range for backward
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "C" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Should have backward shot to D5? No — D5 is empty, C5 is at distance 3
      expect(longshots.some((l) => l.targetPosition.row === "C" && l.targetPosition.col === 5)).toBe(false);
    });

    it("sideways longshot at distance 3 is out of range", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 3, row: "D" },
      }));
      // Screen at col 4 (1 right)
      placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 4, row: "D" },
      }));
      // Target at col 6 (3 tiles right) — out of range for sideways
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 6, row: "D" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots.some((l) => l.targetPosition.col === 6)).toBe(false);
    });
  });

  describe("longshot blocked: 2 pieces between archer and target (over-screen)", () => {
    it("forward longshot at distance 3 blocked by 2 pieces in between", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
      }));
      // Piece at D5 (distance 1)
      placePiece(board, makePiece({
        id: "piece1",
        player: "white",
        type: "footman",
        position: { col: 5, row: "D" },
      }));
      // Piece at E5 (distance 2)
      placePiece(board, makePiece({
        id: "piece2",
        player: "black",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // Target at F5 (distance 3)
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "knight",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Distance 3 forward: 2 pieces between (D5 and E5) — blocked
      // Distance 2 forward: piece at D5 is screen, but E5 has a black piece — that's a valid dist-2 shot at E5
      const dist3Shot = longshots.find((l) => l.targetPosition.row === "F");
      expect(dist3Shot).toBeUndefined();
    });

    it("backward longshot at distance 2 blocked by 0 pieces (no screen)", () => {
      // This actually tests "no screen" — covered below, but verifying here too
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
      }));
      // No screen between archer and target
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "C" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots.some((l) => l.targetPosition.row === "C" && l.targetPosition.col === 5)).toBe(false);
    });
  });

  describe("longshot blocked: no screen piece present", () => {
    it("forward longshot at distance 2 with empty intermediate tile", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // No screen at E5
      // Target at F5 (distance 2)
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(0);
    });

    it("forward longshot at distance 3 with no screen at all", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
      }));
      // D5 and E5 both empty
      // Target at F5 (distance 3)
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(0);
    });
  });

  describe("longshot blocked: target is friendly piece", () => {
    it("cannot longshot a friendly piece", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Screen at E5
      placePiece(board, makePiece({
        id: "screen",
        player: "black",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // Friendly piece at F5 — cannot target friendly
      placePiece(board, makePiece({
        id: "friendly-target",
        player: "white",
        type: "knight",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // The only forward shots would be at F5 (friendly — blocked) or E5 (dist 1 — too close)
      // E5 is actually the screen at dist 1, but longshot minimum distance is 2
      // Actually E5 is at dist 1 — can't longshot adjacent
      expect(longshots.some((l) => l.targetPosition.row === "F" && l.targetPosition.col === 5)).toBe(false);
    });
  });

  describe("longshot blocked: target tile is empty", () => {
    it("cannot longshot an empty tile", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Screen at E5
      placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // F5 is empty — no target
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots.some((l) => l.targetPosition.row === "F")).toBe(false);
    });
  });

  describe("screen can be a friendly piece", () => {
    it("friendly piece serves as a valid screen", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Friendly screen at E5
      const screen = placePiece(board, makePiece({
        id: "friendly-screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      // Enemy target at F5
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      expect(longshots[0].screenPiece.id).toBe("friendly-screen");
      expect(longshots[0].screenPiece.player).toBe("white");
    });
  });

  describe("screen can be an enemy piece", () => {
    it("enemy piece serves as a valid screen", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Enemy screen at E5
      const screen = placePiece(board, makePiece({
        id: "enemy-screen",
        player: "black",
        type: "archer",
        position: { col: 5, row: "E" },
      }));
      // Enemy target at F5
      const target = placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Should find both: dist-2 shot at F5 (screen=E5)
      // Also could find dist-2 backward/sideways, but there's no targets there
      const forwardShot = longshots.find((l) => l.targetPosition.row === "F" && l.targetPosition.col === 5);
      expect(forwardShot).toBeDefined();
      expect(forwardShot!.screenPiece.id).toBe("enemy-screen");
      expect(forwardShot!.screenPiece.player).toBe("black");
    });
  });

  describe("cannot longshot diagonally", () => {
    it("diagonal longshot with valid screen and target is not allowed", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Diagonal "screen" at E6
      placePiece(board, makePiece({
        id: "diag-screen",
        player: "white",
        type: "footman",
        position: { col: 6, row: "E" },
      }));
      // Diagonal "target" at F7
      placePiece(board, makePiece({
        id: "diag-target",
        player: "black",
        type: "footman",
        position: { col: 7, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // No diagonal longshots should be found
      expect(longshots.some((l) => l.targetPosition.col === 7 && l.targetPosition.row === "F")).toBe(false);
    });

    it("no longshot at all when only diagonal targets exist", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Diagonal screen + targets in all 4 diagonals
      placePiece(board, makePiece({
        id: "s1", player: "white", type: "footman", position: { col: 4, row: "C" },
      }));
      placePiece(board, makePiece({
        id: "t1", player: "black", type: "footman", position: { col: 3, row: "B" },
      }));
      placePiece(board, makePiece({
        id: "s2", player: "white", type: "footman", position: { col: 6, row: "C" },
      }));
      placePiece(board, makePiece({
        id: "t2", player: "black", type: "footman", position: { col: 7, row: "B" },
      }));

      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(0);
    });
  });

  describe("longshot target positions", () => {
    it("targetPosition is the enemy position where the archer will move", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      placePiece(board, makePiece({
        id: "screen",
        player: "white",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      placePiece(board, makePiece({
        id: "target",
        player: "black",
        type: "footman",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(1);
      // getArcherLongshots returns target candidates; archer movement is handled by executeMove
      expect(archer.position).toEqual({ col: 5, row: "D" });
      expect(longshots[0].targetPosition).toEqual({ col: 5, row: "F" });
    });
  });

  describe("multiple longshots from single position", () => {
    it("archer can have longshot targets in multiple directions", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
      }));

      // Forward: screen at F5, target at G5
      placePiece(board, makePiece({
        id: "fwd-screen", player: "white", type: "footman",
        position: { col: 5, row: "F" },
      }));
      placePiece(board, makePiece({
        id: "fwd-target", player: "black", type: "footman",
        position: { col: 5, row: "G" },
      }));

      // Right: screen at col 6, target at col 7
      placePiece(board, makePiece({
        id: "right-screen", player: "white", type: "footman",
        position: { col: 6, row: "E" },
      }));
      placePiece(board, makePiece({
        id: "right-target", player: "black", type: "footman",
        position: { col: 7, row: "E" },
      }));

      // Left: screen at col 4, target at col 3
      placePiece(board, makePiece({
        id: "left-screen", player: "black", type: "archer",
        position: { col: 4, row: "E" },
      }));
      placePiece(board, makePiece({
        id: "left-target", player: "black", type: "knight",
        position: { col: 3, row: "E" },
      }));

      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      expect(longshots).toHaveLength(3);
      expect(longshots.some((l) => l.targetPiece.id === "fwd-target")).toBe(true);
      expect(longshots.some((l) => l.targetPiece.id === "right-target")).toBe(true);
      expect(longshots.some((l) => l.targetPiece.id === "left-target")).toBe(true);
    });
  });

  describe("forward longshot can reach dist 2 AND dist 3 simultaneously", () => {
    it("different screen pieces enable both dist-2 and dist-3 targets", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "B" },
      }));
      // Screen at C5 (dist 1)
      placePiece(board, makePiece({
        id: "screen1", player: "white", type: "footman",
        position: { col: 5, row: "C" },
      }));
      // Enemy at D5 (dist 2) — valid target with screen at C5
      placePiece(board, makePiece({
        id: "target-d2", player: "black", type: "footman",
        position: { col: 5, row: "D" },
      }));
      // Enemy at E5 (dist 3) — 2 pieces between (C5, D5) → blocked
      placePiece(board, makePiece({
        id: "target-d3", player: "black", type: "footman",
        position: { col: 5, row: "E" },
      }));

      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Dist 2: screen at C5, target at D5 → valid
      expect(longshots.some((l) => l.targetPiece.id === "target-d2")).toBe(true);
      // Dist 3: 2 pieces between (C5 and D5) → invalid
      expect(longshots.some((l) => l.targetPiece.id === "target-d3")).toBe(false);
    });
  });

  describe("longshot at board edges", () => {
    it("archer at A5 cannot longshot backward (off board)", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "A" },
      }));
      // Forward screen and target
      placePiece(board, makePiece({
        id: "screen", player: "white", type: "footman",
        position: { col: 5, row: "B" },
      }));
      placePiece(board, makePiece({
        id: "target", player: "black", type: "footman",
        position: { col: 5, row: "C" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Forward works, backward is off board
      expect(longshots).toHaveLength(1);
      expect(longshots[0].targetPosition).toEqual({ col: 5, row: "C" });
    });

    it("archer at col 1 cannot longshot left (off board)", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "D" },
      }));
      // Right screen and target
      placePiece(board, makePiece({
        id: "screen", player: "white", type: "footman",
        position: { col: 2, row: "D" },
      }));
      placePiece(board, makePiece({
        id: "target", player: "black", type: "footman",
        position: { col: 3, row: "D" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Right longshot works, left would go off board
      const rightShot = longshots.find((l) => l.targetPosition.col === 3);
      expect(rightShot).toBeDefined();
      // No left longshot should exist
      expect(longshots.some((l) => l.targetPosition.col < 1)).toBe(false);
    });
  });

  describe("adjacent enemy cannot be longshot (minimum distance 2)", () => {
    it("enemy at distance 1 cannot be targeted", () => {
      const board = createEmptyBoard();
      const archer = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
      }));
      // Enemy right next to archer (distance 1) — no room for a screen
      placePiece(board, makePiece({
        id: "adjacent-enemy",
        player: "black",
        type: "footman",
        position: { col: 5, row: "E" },
      }));
      const state = makeState({ board });
      const longshots = getArcherLongshots(archer, state);

      // Distance 1 is not a valid longshot distance
      expect(longshots.some((l) => l.targetPosition.row === "E" && l.targetPosition.col === 5)).toBe(false);
    });
  });
});
