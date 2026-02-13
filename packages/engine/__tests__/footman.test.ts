import { describe, it, expect } from "vitest";
import {
  getFootmanMoves,
  getFootmanCaptures,
  getFootmanPushbacks,
  canPromote,
  getPromotionOptions,
} from "../src/units/footman.js";
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
    id: overrides.id ?? `${overrides.player}-footman-test`,
    type: overrides.type ?? "footman",
    player: overrides.player,
    position: overrides.position,
    hasMoved: overrides.hasMoved ?? false,
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

describe("getFootmanMoves", () => {
  describe("behind river (1 tile orthogonal)", () => {
    it("white footman on D5 can move forward, backward, left, right", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(true);  // forward
      expect(includesPos(moves, { col: 5, row: "C" })).toBe(true);  // backward
      expect(includesPos(moves, { col: 4, row: "D" })).toBe(true);  // left
      expect(includesPos(moves, { col: 6, row: "D" })).toBe(true);  // right
      expect(moves).toHaveLength(4);
    });

    it("black footman on H3 can move forward, backward, left, right", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 3, row: "H" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Black forward is toward A (row index decreasing)
      expect(includesPos(moves, { col: 3, row: "G" })).toBe(true);  // forward
      expect(includesPos(moves, { col: 3, row: "I" })).toBe(true);  // backward
      expect(includesPos(moves, { col: 2, row: "H" })).toBe(true);  // left
      expect(includesPos(moves, { col: 4, row: "H" })).toBe(true);  // right
      expect(moves).toHaveLength(4);
    });
  });

  describe("at river (1 tile orthogonal)", () => {
    it("white footman on F5 can move in all 4 orthogonal directions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "G" })).toBe(true);  // forward
      expect(includesPos(moves, { col: 5, row: "E" })).toBe(true);  // backward
      expect(includesPos(moves, { col: 4, row: "F" })).toBe(true);  // left
      expect(includesPos(moves, { col: 6, row: "F" })).toBe(true);  // right
      expect(moves).toHaveLength(4);
    });

    it("black footman on F5 can move in all 4 orthogonal directions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(true);  // forward (toward A)
      expect(includesPos(moves, { col: 5, row: "G" })).toBe(true);  // backward
      expect(includesPos(moves, { col: 4, row: "F" })).toBe(true);  // left
      expect(includesPos(moves, { col: 6, row: "F" })).toBe(true);  // right
      expect(moves).toHaveLength(4);
    });
  });

  describe("beyond river (2 tiles forward/backward, 1 tile sideways)", () => {
    it("white footman on H5 (beyond river) moves 2 fwd, 2 bwd, 1 sideways", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "J" })).toBe(true);  // 2 forward
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(true);  // 2 backward
      expect(includesPos(moves, { col: 4, row: "H" })).toBe(true);  // 1 left
      expect(includesPos(moves, { col: 6, row: "H" })).toBe(true);  // 1 right
      expect(moves).toHaveLength(4);
    });

    it("black footman on D5 (beyond river) moves 2 fwd, 2 bwd, 1 sideways", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Black forward = toward A
      expect(includesPos(moves, { col: 5, row: "B" })).toBe(true);  // 2 forward
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(true);  // 2 backward
      expect(includesPos(moves, { col: 4, row: "D" })).toBe(true);  // 1 left
      expect(includesPos(moves, { col: 6, row: "D" })).toBe(true);  // 1 right
      expect(moves).toHaveLength(4);
    });

    it("cannot move 2 tiles sideways beyond river", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 3, row: "H" })).toBe(false);  // 2 left
      expect(includesPos(moves, { col: 7, row: "H" })).toBe(false);  // 2 right
    });

    it("2 tiles forward blocked by piece on intermediate tile", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      // Block intermediate tile (I5)
      placePiece(board, makePiece({
        id: "blocker",
        player: "white",
        position: { col: 5, row: "I" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "J" })).toBe(false);  // 2 forward blocked
    });

    it("2 tiles forward blocked by piece on destination tile", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      // Block destination tile (J5) with a friendly piece
      placePiece(board, makePiece({
        id: "blocker",
        player: "white",
        position: { col: 5, row: "J" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "J" })).toBe(false);
    });

    it("2 tiles backward blocked by piece on intermediate tile", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      // Block intermediate tile (G5)
      placePiece(board, makePiece({
        id: "blocker",
        player: "black",
        position: { col: 5, row: "G" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "F" })).toBe(false);  // 2 backward blocked
    });
  });

  describe("cannot move onto friendly pieces", () => {
    it("behind river: blocked by friendly piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      // Place friendly piece forward
      placePiece(board, makePiece({
        id: "friendly",
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(false);
      expect(moves).toHaveLength(3); // backward, left, right
    });
  });

  describe("cannot move off board (edge/corner cases)", () => {
    it("white footman on A1: limited moves (behind river, edges)", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "A" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // A1 is top-left corner for array. Forward for white = toward K (B).
      // Backward = off board. Left = off board.
      expect(includesPos(moves, { col: 1, row: "B" })).toBe(true);  // forward
      expect(includesPos(moves, { col: 2, row: "A" })).toBe(true);  // right
      expect(moves).toHaveLength(2);
    });

    it("white footman at K10 (corner beyond river): limited moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 10, row: "K" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Beyond river for white. Forward 2 = off board. Backward 2 = I10.
      // Sideways right = off board. Sideways left = K9.
      expect(includesPos(moves, { col: 10, row: "I" })).toBe(true);  // 2 backward
      expect(includesPos(moves, { col: 9, row: "K" })).toBe(true);   // 1 left
      expect(moves).toHaveLength(2);
    });

    it("beyond river, 2 tiles forward goes off board", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "J" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // 2 forward from J = L (off board) — not available
      expect(includesPos(moves, { col: 5, row: "H" })).toBe(true);  // 2 backward
      expect(includesPos(moves, { col: 4, row: "J" })).toBe(true);  // 1 left
      expect(includesPos(moves, { col: 6, row: "J" })).toBe(true);  // 1 right
      expect(moves).toHaveLength(3);
    });
  });

  // ─── FIRST-MOVE DOUBLE-STEP ─────────────────────────────────────────────

  describe("first-move double-step", () => {
    it("unmoved white footman on C1 can move 2 tiles forward to E1", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "C" },
        hasMoved: false,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 1, row: "E" })).toBe(true);
    });

    it("unmoved black footman on I2 can move 2 tiles forward to G2", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 2, row: "I" },
        hasMoved: false,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 2, row: "G" })).toBe(true);
    });

    it("double-step blocked by piece on intermediate tile", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
        hasMoved: false,
      }));
      // Block D5
      placePiece(board, makePiece({
        id: "blocker",
        player: "black",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(false);
    });

    it("double-step blocked by piece on destination tile", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
        hasMoved: false,
      }));
      // Block E5
      placePiece(board, makePiece({
        id: "blocker",
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      expect(includesPos(moves, { col: 5, row: "E" })).toBe(false);
    });

    it("double-step not available after footman has already moved", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Behind river: only 1 tile orthogonal moves, no double-step
      expect(includesPos(moves, { col: 5, row: "E" })).toBe(false);
    });

    it("double-step cannot go backward or sideways — forward only", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: false,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Forward double-step: D→F (2 forward)
      expect(includesPos(moves, { col: 5, row: "F" })).toBe(true);
      // Backward double-step should NOT exist: D→B
      expect(includesPos(moves, { col: 5, row: "B" })).toBe(false);
      // Sideways double-step should NOT exist
      expect(includesPos(moves, { col: 3, row: "D" })).toBe(false);
      expect(includesPos(moves, { col: 7, row: "D" })).toBe(false);
    });

    it("double-step appears alongside normal 1-tile moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "C" },
        hasMoved: false,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Normal 1-tile moves (behind river)
      expect(includesPos(moves, { col: 5, row: "D" })).toBe(true);  // forward 1
      expect(includesPos(moves, { col: 5, row: "B" })).toBe(true);  // backward 1
      expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);  // left 1
      expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);  // right 1
      // Double-step
      expect(includesPos(moves, { col: 5, row: "E" })).toBe(true);  // forward 2
      expect(moves).toHaveLength(5);
    });

    it("black unmoved double-step forward is toward row A", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "I" },
        hasMoved: false,
      }));
      const state = makeState({ board });
      const moves = getFootmanMoves(piece, state);

      // Black forward is toward A: I → G
      expect(includesPos(moves, { col: 5, row: "G" })).toBe(true);
      // Should NOT have backward double-step (toward K)
      expect(includesPos(moves, { col: 5, row: "K" })).toBe(false);
    });
  });
});

// ─── CAPTURES ───────────────────────────────────────────────────────────────

describe("getFootmanCaptures", () => {
  describe("behind river (diagonal forward only)", () => {
    it("white footman on D5: captures diagonally forward only", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      // Place enemies in all 4 diagonals
      const enemyFL = placePiece(board, makePiece({
        id: "e1", player: "black", position: { col: 4, row: "E" }, hasMoved: true,
      }));
      const enemyFR = placePiece(board, makePiece({
        id: "e2", player: "black", position: { col: 6, row: "E" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e3", player: "black", position: { col: 4, row: "C" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e4", player: "black", position: { col: 6, row: "C" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(2);
      expect(captures.some((c) => c.position.col === 4 && c.position.row === "E")).toBe(true);
      expect(captures.some((c) => c.position.col === 6 && c.position.row === "E")).toBe(true);
    });

    it("diagonal backward is NOT allowed behind river", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      // Place enemies diagonally backward only
      placePiece(board, makePiece({
        id: "e1", player: "black", position: { col: 4, row: "C" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e2", player: "black", position: { col: 6, row: "C" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(0);
    });

    it("black footman behind river: forward diagonals are toward row A", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      // Forward diagonal for black: toward A = row G
      placePiece(board, makePiece({
        id: "e1", player: "white", position: { col: 4, row: "G" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e2", player: "white", position: { col: 6, row: "G" }, hasMoved: true,
      }));
      // Backward diagonal for black: toward K = row I (should NOT be capturable)
      placePiece(board, makePiece({
        id: "e3", player: "white", position: { col: 4, row: "I" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(2);
      expect(captures.some((c) => c.position.row === "G")).toBe(true);
    });
  });

  describe("at river (diagonal forward only)", () => {
    it("white footman on F5: only forward diagonals", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e1", player: "black", position: { col: 4, row: "G" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e2", player: "black", position: { col: 6, row: "G" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e3", player: "black", position: { col: 4, row: "E" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(2);
      expect(captures.every((c) => c.position.row === "G")).toBe(true);
    });
  });

  describe("beyond river (all 4 diagonals)", () => {
    it("white footman on H5 (beyond river): all 4 diagonal captures", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e1", player: "black", position: { col: 4, row: "I" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e2", player: "black", position: { col: 6, row: "I" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e3", player: "black", position: { col: 4, row: "G" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "e4", player: "black", position: { col: 6, row: "G" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(4);
    });

    it("cannot capture friendly pieces even beyond river", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "H" },
        hasMoved: true,
      }));
      // Friendly pieces on diagonals
      placePiece(board, makePiece({
        id: "f1", player: "white", position: { col: 4, row: "I" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "f2", player: "white", position: { col: 6, row: "I" }, hasMoved: true,
      }));
      const state = makeState({ board });
      const captures = getFootmanCaptures(piece, state);

      expect(captures).toHaveLength(0);
    });
  });
});

// ─── PUSHBACK ───────────────────────────────────────────────────────────────

describe("getFootmanPushbacks", () => {
  describe("basic push in each direction", () => {
    it("can push adjacent enemy in all 4 orthogonal directions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      // Enemy is adjacent (forward). Can push in 4 directions (wherever destination is empty + on board).
      // Push up: F5 → E5 (occupied by our footman) — blocked
      // Push down: F5 → G5 — valid
      // Push left: F5 → F4 — valid
      // Push right: F5 → F6 — valid
      expect(pushbacks).toHaveLength(3);
      expect(pushbacks.some((p) => p.resultingPosition.row === "G" && p.resultingPosition.col === 5)).toBe(true);
      expect(pushbacks.some((p) => p.resultingPosition.row === "F" && p.resultingPosition.col === 4)).toBe(true);
      expect(pushbacks.some((p) => p.resultingPosition.row === "F" && p.resultingPosition.col === 6)).toBe(true);
    });

    it("can push enemy that is to the left", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 4, row: "D" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      // Enemy at D4, push directions: up(C4), down(E4), left(D3), right(D5=our piece blocked)
      expect(pushbacks).toHaveLength(3);
    });
  });

  describe("blocked by piece behind target", () => {
    it("cannot push if destination is occupied by any piece", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      // Block all possible push destinations
      placePiece(board, makePiece({
        id: "b1", player: "black", position: { col: 5, row: "G" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "b2", player: "white", position: { col: 4, row: "F" }, hasMoved: true,
      }));
      placePiece(board, makePiece({
        id: "b3", player: "white", position: { col: 6, row: "F" }, hasMoved: true,
      }));
      // Push toward E5 is blocked by our footman
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      expect(pushbacks).toHaveLength(0);
    });
  });

  describe("blocked by board edge", () => {
    it("cannot push off the board", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 2, row: "A" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 1, row: "A" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      // Enemy at A1. Push up = off board. Push left = off board.
      // Push down = B1 (valid). Push right = A2 (our piece, blocked).
      expect(pushbacks).toHaveLength(1);
      expect(pushbacks[0].resultingPosition).toEqual({ col: 1, row: "B" });
    });
  });

  describe("anti-retaliation rule", () => {
    it("cannot push the piece that pushed one of your pieces last turn", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "black-footman-1",
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({
        board,
        // Black pushed one of white's pieces last turn, the pushing piece was black-footman-1
        // The lastPushback records the TARGET piece that was pushed (a white piece),
        // but we need to track which piece DID the pushing...
        // Actually re-reading the types: lastPushback has targetPieceId and byPlayer.
        // The anti-retaliation rule: "cannot push the piece that pushed one of YOUR pieces"
        // So if black pushed a white piece, targetPieceId = the white piece that was pushed,
        // byPlayer = "black". But we need the ID of the PUSHING piece...
        // Wait, let me re-read the rule: "The target piece is the same piece that pushed
        // one of YOUR pieces on the opponent's immediately previous turn"
        // So the "target piece" of our pushback attempt is the enemy. We check if that
        // enemy is the one who pushed us last turn.
        // The lastPushback.targetPieceId seems to store who was pushed. But the rule
        // needs to know who DID the pushing... Let me reconsider the data model.
        // Actually, looking at the anti-retaliation check in footman.ts:
        // lastPushback.targetPieceId === adjacentPiece.id
        // This means targetPieceId stores the ID of the piece that DID the pushing
        // (i.e., the piece we're not allowed to push back).
        // Actually no - re-reading the code: the check is whether the target we want to
        // push is the piece identified by targetPieceId. So targetPieceId should be
        // the piece that performed the push (and now we can't retaliate against it).
        // Let me just align with how the code uses it.
        lastPushback: { targetPieceId: "black-footman-1", byPlayer: "black" },
      });
      const pushbacks = getFootmanPushbacks(piece, state);

      // The enemy (black-footman-1) matches lastPushback.targetPieceId and byPlayer is the opponent
      expect(pushbacks).toHaveLength(0);
    });

    it("CAN push a different enemy even when anti-retaliation is active", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
        hasMoved: true,
      }));
      const enemy = placePiece(board, makePiece({
        id: "black-footman-2",
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({
        board,
        // Anti-retaliation against a DIFFERENT piece
        lastPushback: { targetPieceId: "black-footman-1", byPlayer: "black" },
      });
      const pushbacks = getFootmanPushbacks(piece, state);

      // This enemy is not the one that pushed us, so pushback is allowed
      expect(pushbacks.length).toBeGreaterThan(0);
    });
  });

  describe("must be adjacent at START of turn", () => {
    it("non-adjacent enemy cannot be pushed", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      // Enemy 2 tiles away
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 5, row: "F" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      expect(pushbacks).toHaveLength(0);
    });

    it("diagonally adjacent enemy cannot be pushed (not orthogonally adjacent)", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "D" },
        hasMoved: true,
      }));
      // Enemy diagonally adjacent
      placePiece(board, makePiece({
        id: "enemy",
        player: "black",
        position: { col: 6, row: "E" },
        hasMoved: true,
      }));
      const state = makeState({ board });
      const pushbacks = getFootmanPushbacks(piece, state);

      expect(pushbacks).toHaveLength(0);
    });
  });
});

// ─── PROMOTION ──────────────────────────────────────────────────────────────

describe("canPromote", () => {
  it("white footman on row K can promote", () => {
    const piece = makePiece({ player: "white", position: { col: 5, row: "K" }, hasMoved: true });
    const state = makeState();
    expect(canPromote(piece, state)).toBe(true);
  });

  it("white footman NOT on row K cannot promote", () => {
    const piece = makePiece({ player: "white", position: { col: 5, row: "J" }, hasMoved: true });
    const state = makeState();
    expect(canPromote(piece, state)).toBe(false);
  });

  it("black footman on row A can promote", () => {
    const piece = makePiece({ player: "black", position: { col: 5, row: "A" }, hasMoved: true });
    const state = makeState();
    expect(canPromote(piece, state)).toBe(true);
  });

  it("black footman NOT on row A cannot promote", () => {
    const piece = makePiece({ player: "black", position: { col: 5, row: "B" }, hasMoved: true });
    const state = makeState();
    expect(canPromote(piece, state)).toBe(false);
  });
});

describe("getPromotionOptions", () => {
  it("returns captured pieces and placement positions for white", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "K" },
      hasMoved: true,
    }));
    const capturedArcher: Piece = {
      id: "white-archer-1",
      type: "archer",
      player: "white",
      position: { col: 0, row: "" }, // captured, off-board
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedArcher], black: [] },
    });
    const options = getPromotionOptions(piece, state);

    expect(options.capturedPieces).toHaveLength(1);
    expect(options.capturedPieces[0].id).toBe("white-archer-1");
    // Placement positions: all unoccupied tiles in rows A-C
    // Only K5 is occupied (by the footman, which is on row K, not A-C), so all 30 tiles in A-C are open
    expect(options.placementPositions).toHaveLength(30);
  });

  it("returns empty captured pieces when none have been captured", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "K" },
      hasMoved: true,
    }));
    const state = makeState({ board });
    const options = getPromotionOptions(piece, state);

    expect(options.capturedPieces).toHaveLength(0);
    // Placement positions are still available even with no captured pieces
    expect(options.placementPositions).toHaveLength(30);
  });

  it("excludes occupied tiles from placement positions", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "K" },
      hasMoved: true,
    }));
    // Place some pieces in the home rows
    placePiece(board, makePiece({
      id: "home1", player: "white", position: { col: 1, row: "A" }, hasMoved: false,
    }));
    placePiece(board, makePiece({
      id: "home2", player: "white", position: { col: 3, row: "B" }, hasMoved: false,
    }));
    const capturedKnight: Piece = {
      id: "white-knight-1",
      type: "knight",
      player: "white",
      position: { col: 0, row: "" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedKnight], black: [] },
    });
    const options = getPromotionOptions(piece, state);

    expect(options.placementPositions).toHaveLength(28); // 30 - 2 occupied
    expect(options.placementPositions.some((p) => p.col === 1 && p.row === "A")).toBe(false);
    expect(options.placementPositions.some((p) => p.col === 3 && p.row === "B")).toBe(false);
  });

  it("black promotion: placement in rows I-K", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "black",
      position: { col: 5, row: "A" },
      hasMoved: true,
    }));
    const capturedPiece: Piece = {
      id: "black-archer-1",
      type: "archer",
      player: "black",
      position: { col: 0, row: "" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [], black: [capturedPiece] },
    });
    const options = getPromotionOptions(piece, state);

    expect(options.capturedPieces).toHaveLength(1);
    // All tiles in I-K should be open (30 tiles)
    expect(options.placementPositions).toHaveLength(30);
    // Verify they're all in rows I, J, K
    for (const pos of options.placementPositions) {
      expect(["I", "J", "K"]).toContain(pos.row);
    }
  });

  it("returns nothing when footman is not on promotion row", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "J" },
      hasMoved: true,
    }));
    const state = makeState({
      board,
      capturedPieces: {
        white: [{
          id: "white-archer-1", type: "archer", player: "white",
          position: { col: 0, row: "" }, hasMoved: true,
        }],
        black: [],
      },
    });
    const options = getPromotionOptions(piece, state);

    expect(options.capturedPieces).toHaveLength(0);
    expect(options.placementPositions).toHaveLength(0);
  });
});
