import { describe, it, expect } from "vitest";
import {
  getKnightMoves,
  getKnightCaptures,
  isLegCut,
  getRansomOptions,
} from "../src/units/knight.js";
import {
  createEmptyBoard,
  setPieceAt,
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
  };
}

/** Helper to create a Piece. */
function makePiece(overrides: Partial<Piece> & Pick<Piece, "player" | "position">): Piece {
  return {
    id: overrides.id ?? `${overrides.player}-${overrides.type ?? "knight"}-test`,
    type: overrides.type ?? "knight",
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

/** Helper: check if captures list includes a given position. */
function includesCaptureAt(
  captures: { position: Position; targetPiece: Piece }[],
  pos: Position,
): boolean {
  return captures.some((c) => c.position.col === pos.col && c.position.row === pos.row);
}

// ─── MOVEMENT ───────────────────────────────────────────────────────────────

describe("getKnightMoves", () => {
  describe("all 8 L-shaped moves from a central position", () => {
    it("white knight on E5 has 8 moves with no obstructions", () => {
      // E5 = row E (index 4), col 5 (index 4) — well-centered
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up (toward A), 1 left/right: C4, C6
      expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);
      // 2 down (toward K), 1 left/right: G4, G6
      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "G" })).toBe(true);
      // 2 left, 1 up/down: D3, F3
      expect(includesPos(moves, { col: 3, row: "D" })).toBe(true);
      expect(includesPos(moves, { col: 3, row: "F" })).toBe(true);
      // 2 right, 1 up/down: D7, F7
      expect(includesPos(moves, { col: 7, row: "D" })).toBe(true);
      expect(includesPos(moves, { col: 7, row: "F" })).toBe(true);

      expect(moves).toHaveLength(8);
    });

    it("black knight on F6 has 8 moves with no obstructions", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 6, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up, 1 left/right: D5, D7
      expect(includesPos(moves, { col: 5, row: "D" })).toBe(true);
      expect(includesPos(moves, { col: 7, row: "D" })).toBe(true);
      // 2 down, 1 left/right: H5, H7
      expect(includesPos(moves, { col: 5, row: "H" })).toBe(true);
      expect(includesPos(moves, { col: 7, row: "H" })).toBe(true);
      // 2 left, 1 up/down: E4, G4
      expect(includesPos(moves, { col: 4, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 4, row: "G" })).toBe(true);
      // 2 right, 1 up/down: E8, G8
      expect(includesPos(moves, { col: 8, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 8, row: "G" })).toBe(true);

      expect(moves).toHaveLength(8);
    });
  });

  describe("edge of board (reduced moves)", () => {
    it("knight on A5 (top edge) cannot go 2 up", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "A" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up is off-board → no moves from that direction
      // 2 down (toward K): C4, C6
      expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);
      expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);
      // 2 left: B3 (1 up from position after going left)
      // Actually: 2 left from col 5 = col 3, then 1 up/down
      // But 1 up from A is off-board. So only B3 (1 down).
      // Wait, let me re-check. "up" = toward A = row index decrease.
      // Position is A (index 0). 2 left = col 3. Then perpendicular = vertical.
      // 1 up from row 0 is off-board. 1 down from row 0 = row B.
      // So: B3
      expect(includesPos(moves, { col: 3, row: "B" })).toBe(true);
      // 2 right from col 5 = col 7. Then 1 up (off-board), 1 down = B7
      expect(includesPos(moves, { col: 7, row: "B" })).toBe(true);

      // No move with 2 up, and 2 left/right only yields 1 dest each
      expect(moves).toHaveLength(4);
    });

    it("knight on F1 (left edge) cannot go 2 left", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 left off-board
      // 2 up: D1 then perp → D2 (right only, left off-board from col 1... wait)
      // 2 up from F1: row F=5, 2 up = row 3 = D. col stays 1. Then perp = col±1.
      // col 0 = off-board, col 2 = D2. So only D2.
      expect(includesPos(moves, { col: 2, row: "D" })).toBe(true);
      // 2 down from F1: row 5+2=7 = H. col 1. Then col±1: col 0 off, col 2 = H2.
      expect(includesPos(moves, { col: 2, row: "H" })).toBe(true);
      // 2 right from F1: col 1+2=3 = col 3. Then row±1: E3, G3.
      expect(includesPos(moves, { col: 3, row: "E" })).toBe(true);
      expect(includesPos(moves, { col: 3, row: "G" })).toBe(true);

      expect(moves).toHaveLength(4);
    });

    it("knight on K10 (bottom-right edge) has limited moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 10, row: "K" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up from K(10): row 8 = I. col 10. Then col±1: col 9=I9, col 11 off-board.
      expect(includesPos(moves, { col: 9, row: "I" })).toBe(true);
      // 2 down from K(10): off-board
      // 2 left from col 10: col 8. Then row±1: J8 (row 9), off-board (row 11).
      expect(includesPos(moves, { col: 8, row: "J" })).toBe(true);
      // 2 right from col 10: off-board

      expect(moves).toHaveLength(2);
    });
  });

  describe("corner positions (minimal moves)", () => {
    it("knight on A1 (top-left corner) has exactly 2 moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 1, row: "A" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up: off-board
      // 2 down: C1, then perp col±1: col 0 off, col 2 = C2
      expect(includesPos(moves, { col: 2, row: "C" })).toBe(true);
      // 2 left: off-board
      // 2 right: col 3, then row±1: row -1 off, row 1 = B3
      expect(includesPos(moves, { col: 3, row: "B" })).toBe(true);

      expect(moves).toHaveLength(2);
    });

    it("knight on K1 (bottom-left corner) has exactly 2 moves", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "black",
        position: { col: 1, row: "K" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      // 2 up: I1, then col±1: col 0 off, col 2 = I2
      expect(includesPos(moves, { col: 2, row: "I" })).toBe(true);
      // 2 down: off-board
      // 2 left: off-board
      // 2 right: col 3, then row±1: J3 (row 9), row 11 off-board
      expect(includesPos(moves, { col: 3, row: "J" })).toBe(true);

      expect(moves).toHaveLength(2);
    });
  });

  describe("cannot land on friendly piece", () => {
    it("friendly piece at destination blocks that move only", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "E" },
      }));
      // Place friendly piece at C4 (one of 8 destinations)
      placePiece(board, makePiece({
        id: "white-footman-blocker",
        player: "white",
        type: "footman",
        position: { col: 4, row: "C" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      expect(includesPos(moves, { col: 4, row: "C" })).toBe(false);
      // Other 7 moves should still be available
      expect(moves).toHaveLength(7);
    });
  });

  describe("can land on empty tile", () => {
    it("all 8 empty destinations are available from central position", () => {
      const board = createEmptyBoard();
      const piece = placePiece(board, makePiece({
        player: "white",
        position: { col: 5, row: "F" },
      }));
      const state = makeState({ board });
      const moves = getKnightMoves(piece, state);

      expect(moves).toHaveLength(8);
      for (const m of moves) {
        expect(isValidPosition(m)).toBe(true);
      }
    });
  });
});

// ─── LEG CUT ────────────────────────────────────────────────────────────────

describe("isLegCut", () => {
  it("piece on intermediate tile blocks that primary direction", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place a piece at D5 (1 step up from E5)
    placePiece(board, makePiece({
      id: "blocker",
      player: "black",
      type: "footman",
      position: { col: 5, row: "D" },
    }));
    const state = makeState({ board });

    // Direction up [-1, 0]: intermediate is D5 — blocked
    expect(isLegCut(piece, [-1, 0], state)).toBe(true);
    // Other directions are not blocked
    expect(isLegCut(piece, [1, 0], state)).toBe(false);  // down
    expect(isLegCut(piece, [0, -1], state)).toBe(false);  // left
    expect(isLegCut(piece, [0, 1], state)).toBe(false);  // right
  });

  it("blocks BOTH L-moves in that 2-tile direction", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Block the "up" direction: place piece at D5
    placePiece(board, makePiece({
      id: "blocker",
      player: "black",
      type: "footman",
      position: { col: 5, row: "D" },
    }));
    const state = makeState({ board });
    const moves = getKnightMoves(piece, state);

    // Both 2-up destinations should be gone: C4, C6
    expect(includesPos(moves, { col: 4, row: "C" })).toBe(false);
    expect(includesPos(moves, { col: 6, row: "C" })).toBe(false);

    // Other 6 should remain
    expect(moves).toHaveLength(6);
  });

  it("friendly piece causes leg cut", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place friendly piece at F5 (1 step down from E5)
    placePiece(board, makePiece({
      id: "white-friend",
      player: "white",
      type: "footman",
      position: { col: 5, row: "F" },
    }));
    const state = makeState({ board });

    expect(isLegCut(piece, [1, 0], state)).toBe(true); // down direction blocked
    const moves = getKnightMoves(piece, state);
    expect(includesPos(moves, { col: 4, row: "G" })).toBe(false);
    expect(includesPos(moves, { col: 6, row: "G" })).toBe(false);
  });

  it("enemy piece causes leg cut", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place enemy piece at E4 (1 step left from E5)
    placePiece(board, makePiece({
      id: "black-enemy",
      player: "black",
      type: "archer",
      position: { col: 4, row: "E" },
    }));
    const state = makeState({ board });

    expect(isLegCut(piece, [0, -1], state)).toBe(true); // left direction blocked
    const moves = getKnightMoves(piece, state);
    // 2 left destinations gone: D3, F3
    expect(includesPos(moves, { col: 3, row: "D" })).toBe(false);
    expect(includesPos(moves, { col: 3, row: "F" })).toBe(false);
  });

  it("piece on FINAL tile (bend tile) does NOT cause leg cut", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place piece at C5 (2 steps up from E5 — the bend tile, NOT intermediate)
    placePiece(board, makePiece({
      id: "bend-piece",
      player: "black",
      type: "footman",
      position: { col: 5, row: "C" },
    }));
    const state = makeState({ board });

    // The intermediate for "up" is D5, which is empty → no leg cut
    expect(isLegCut(piece, [-1, 0], state)).toBe(false);
    // Knight can still reach destinations through the bend tile
    const moves = getKnightMoves(piece, state);
    expect(includesPos(moves, { col: 4, row: "C" })).toBe(true);
    expect(includesPos(moves, { col: 6, row: "C" })).toBe(true);
  });

  it("multiple directions blocked simultaneously", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Block up: D5
    placePiece(board, makePiece({
      id: "blocker-up",
      player: "black",
      type: "footman",
      position: { col: 5, row: "D" },
    }));
    // Block down: F5
    placePiece(board, makePiece({
      id: "blocker-down",
      player: "white",
      type: "footman",
      position: { col: 5, row: "F" },
    }));
    // Block left: E4
    placePiece(board, makePiece({
      id: "blocker-left",
      player: "black",
      type: "archer",
      position: { col: 4, row: "E" },
    }));
    const state = makeState({ board });

    expect(isLegCut(piece, [-1, 0], state)).toBe(true);  // up
    expect(isLegCut(piece, [1, 0], state)).toBe(true);   // down
    expect(isLegCut(piece, [0, -1], state)).toBe(true);   // left
    expect(isLegCut(piece, [0, 1], state)).toBe(false);   // right is free

    const moves = getKnightMoves(piece, state);
    // Only right direction available: D7, F7
    expect(moves).toHaveLength(2);
    expect(includesPos(moves, { col: 7, row: "D" })).toBe(true);
    expect(includesPos(moves, { col: 7, row: "F" })).toBe(true);
  });

  it("all four directions blocked leaves no moves", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    placePiece(board, makePiece({ id: "b1", player: "black", type: "footman", position: { col: 5, row: "D" } }));
    placePiece(board, makePiece({ id: "b2", player: "white", type: "footman", position: { col: 5, row: "F" } }));
    placePiece(board, makePiece({ id: "b3", player: "black", type: "archer", position: { col: 4, row: "E" } }));
    placePiece(board, makePiece({ id: "b4", player: "white", type: "archer", position: { col: 6, row: "E" } }));
    const state = makeState({ board });

    const moves = getKnightMoves(piece, state);
    expect(moves).toHaveLength(0);
  });
});

// ─── CAPTURE ────────────────────────────────────────────────────────────────

describe("getKnightCaptures", () => {
  it("can capture enemy piece via L-shaped move", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place enemy at C4 (2 up, 1 left from E5)
    const enemy = placePiece(board, makePiece({
      id: "black-footman-1",
      player: "black",
      type: "footman",
      position: { col: 4, row: "C" },
    }));
    const state = makeState({ board });
    const captures = getKnightCaptures(piece, state);

    expect(includesCaptureAt(captures, { col: 4, row: "C" })).toBe(true);
    const capture = captures.find((c) => c.position.col === 4 && c.position.row === "C");
    expect(capture!.targetPiece.id).toBe("black-footman-1");
  });

  it("can capture multiple enemies in different directions", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    placePiece(board, makePiece({ id: "e1", player: "black", type: "footman", position: { col: 4, row: "C" } }));
    placePiece(board, makePiece({ id: "e2", player: "black", type: "archer", position: { col: 6, row: "G" } }));
    placePiece(board, makePiece({ id: "e3", player: "black", type: "knight", position: { col: 7, row: "D" } }));
    const state = makeState({ board });
    const captures = getKnightCaptures(piece, state);

    expect(captures).toHaveLength(3);
    expect(includesCaptureAt(captures, { col: 4, row: "C" })).toBe(true);
    expect(includesCaptureAt(captures, { col: 6, row: "G" })).toBe(true);
    expect(includesCaptureAt(captures, { col: 7, row: "D" })).toBe(true);
  });

  it("cannot capture friendly piece", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place friendly piece at C4 (valid L-move destination)
    placePiece(board, makePiece({
      id: "white-footman-1",
      player: "white",
      type: "footman",
      position: { col: 4, row: "C" },
    }));
    const state = makeState({ board });
    const captures = getKnightCaptures(piece, state);

    expect(includesCaptureAt(captures, { col: 4, row: "C" })).toBe(false);
    expect(captures).toHaveLength(0);
  });

  it("leg cut still applies when trying to capture", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Place enemy at C4 (2 up, 1 left)
    placePiece(board, makePiece({
      id: "target",
      player: "black",
      type: "footman",
      position: { col: 4, row: "C" },
    }));
    // Block the up direction: piece at D5
    placePiece(board, makePiece({
      id: "blocker",
      player: "black",
      type: "archer",
      position: { col: 5, row: "D" },
    }));
    const state = makeState({ board });
    const captures = getKnightCaptures(piece, state);

    // C4 is unreachable because the up direction is leg-cut
    expect(includesCaptureAt(captures, { col: 4, row: "C" })).toBe(false);
  });

  it("capture and move destinations are disjoint", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "E" },
    }));
    // Enemy at G4 (2 down, 1 left)
    placePiece(board, makePiece({
      id: "enemy",
      player: "black",
      type: "footman",
      position: { col: 4, row: "G" },
    }));
    const state = makeState({ board });

    const moves = getKnightMoves(piece, state);
    const captures = getKnightCaptures(piece, state);

    // G4 should be in captures, not moves
    expect(includesPos(moves, { col: 4, row: "G" })).toBe(false);
    expect(includesCaptureAt(captures, { col: 4, row: "G" })).toBe(true);
    // Other 7 empty destinations should be moves
    expect(moves).toHaveLength(7);
    expect(captures).toHaveLength(1);
  });
});

// ─── RANSOM ─────────────────────────────────────────────────────────────────

describe("getRansomOptions", () => {
  it("knight captures enemy knight → ransom available for captured footman", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-1",
      player: "black",
      type: "knight",
      position: { col: 4, row: "C" },
    });
    const capturedFootman: Piece = {
      id: "white-footman-captured",
      type: "footman",
      player: "white",
      position: { col: 1, row: "C" }, // original position (doesn't matter for ransom)
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedFootman], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(1);
    expect(options.capturedPieces[0].id).toBe("white-footman-captured");
    expect(options.placementPositions.length).toBeGreaterThan(0);
  });

  it("knight captures enemy knight → ransom available for captured archer", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-2",
      player: "black",
      type: "knight",
      position: { col: 6, row: "G" },
    });
    const capturedArcher: Piece = {
      id: "white-archer-captured",
      type: "archer",
      player: "white",
      position: { col: 2, row: "B" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedArcher], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(1);
    expect(options.capturedPieces[0].type).toBe("archer");
    expect(options.placementPositions.length).toBeGreaterThan(0);
  });

  it("knight captures enemy knight → cannot ransom a captured knight", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-3",
      player: "black",
      type: "knight",
      position: { col: 4, row: "C" },
    });
    const capturedKnight: Piece = {
      id: "white-knight-captured",
      type: "knight",
      player: "white",
      position: { col: 1, row: "A" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedKnight], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    // Knight is not eligible for ransom
    expect(options.capturedPieces).toHaveLength(0);
    expect(options.placementPositions).toHaveLength(0);
  });

  it("knight captures enemy footman → no ransom (not knight-on-knight)", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-footman-1",
      player: "black",
      type: "footman",
      position: { col: 4, row: "C" },
    });
    const capturedFootman: Piece = {
      id: "white-footman-captured",
      type: "footman",
      player: "white",
      position: { col: 1, row: "C" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedFootman], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(0);
    expect(options.placementPositions).toHaveLength(0);
  });

  it("knight captures enemy archer → no ransom (not knight-on-knight)", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-archer-1",
      player: "black",
      type: "archer",
      position: { col: 6, row: "G" },
    });
    const state = makeState({
      board,
      capturedPieces: { white: [{ id: "cap", type: "footman", player: "white", position: { col: 1, row: "A" }, hasMoved: true }], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(0);
  });

  it("no captured pieces available → ransom not possible", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-4",
      player: "black",
      type: "knight",
      position: { col: 4, row: "C" },
    });
    const state = makeState({
      board,
      capturedPieces: { white: [], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(0);
    expect(options.placementPositions).toHaveLength(0);
  });

  it("valid ransom placement positions are in first 3 rows, unoccupied", () => {
    const board = createEmptyBoard();
    // Place some pieces in white's home rows to limit placement
    placePiece(board, makePiece({ id: "w1", player: "white", type: "footman", position: { col: 1, row: "A" } }));
    placePiece(board, makePiece({ id: "w2", player: "white", type: "footman", position: { col: 2, row: "A" } }));

    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-5",
      player: "black",
      type: "knight",
      position: { col: 4, row: "C" },
    });
    const capturedFootman: Piece = {
      id: "white-footman-cap",
      type: "footman",
      player: "white",
      position: { col: 3, row: "C" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedFootman], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    // 30 total positions in rows A-C (10 cols × 3 rows), minus 2 occupied = 28
    expect(options.placementPositions).toHaveLength(28);
    // Ensure occupied positions are excluded
    expect(includesPos(options.placementPositions, { col: 1, row: "A" })).toBe(false);
    expect(includesPos(options.placementPositions, { col: 2, row: "A" })).toBe(false);
    // Ensure unoccupied positions are included
    expect(includesPos(options.placementPositions, { col: 3, row: "A" })).toBe(true);
    expect(includesPos(options.placementPositions, { col: 1, row: "B" })).toBe(true);
  });

  it("black knight ransom places in rows I-K", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "black", position: { col: 5, row: "G" } });
    const capturedPiece = makePiece({
      id: "white-knight-1",
      player: "white",
      type: "knight",
      position: { col: 4, row: "E" },
    });
    const capturedArcher: Piece = {
      id: "black-archer-cap",
      type: "archer",
      player: "black",
      position: { col: 2, row: "J" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [], black: [capturedArcher] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    expect(options.capturedPieces).toHaveLength(1);
    // All 30 positions in I-K should be available (board is empty)
    expect(options.placementPositions).toHaveLength(30);
    // Verify they're all in rows I, J, K
    for (const pos of options.placementPositions) {
      expect(["I", "J", "K"]).toContain(pos.row);
    }
  });

  it("ransom returns both captured footmen and archers", () => {
    const board = createEmptyBoard();
    const piece = makePiece({ player: "white", position: { col: 5, row: "E" } });
    const capturedPiece = makePiece({
      id: "black-knight-6",
      player: "black",
      type: "knight",
      position: { col: 4, row: "C" },
    });
    const capturedF: Piece = {
      id: "white-footman-cap",
      type: "footman",
      player: "white",
      position: { col: 1, row: "C" },
      hasMoved: true,
    };
    const capturedA: Piece = {
      id: "white-archer-cap",
      type: "archer",
      player: "white",
      position: { col: 2, row: "B" },
      hasMoved: true,
    };
    const capturedK: Piece = {
      id: "white-knight-cap",
      type: "knight",
      player: "white",
      position: { col: 1, row: "A" },
      hasMoved: true,
    };
    const state = makeState({
      board,
      capturedPieces: { white: [capturedF, capturedA, capturedK], black: [] },
    });

    const options = getRansomOptions(piece, capturedPiece, state);

    // Only footman and archer should be eligible, not knight
    expect(options.capturedPieces).toHaveLength(2);
    const types = options.capturedPieces.map((p) => p.type);
    expect(types).toContain("footman");
    expect(types).toContain("archer");
    expect(types).not.toContain("knight");
  });
});

// ─── RIVER INDEPENDENCE ─────────────────────────────────────────────────────

describe("river independence", () => {
  it("same move count behind river", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "D" }, // behind river for white
    }));
    const state = makeState({ board });
    const moves = getKnightMoves(piece, state);

    expect(moves).toHaveLength(8);
  });

  it("same move count at river", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "F" }, // at river
    }));
    const state = makeState({ board });
    const moves = getKnightMoves(piece, state);

    expect(moves).toHaveLength(8);
  });

  it("same move count beyond river", () => {
    const board = createEmptyBoard();
    const piece = placePiece(board, makePiece({
      player: "white",
      position: { col: 5, row: "H" }, // beyond river for white
    }));
    const state = makeState({ board });
    const moves = getKnightMoves(piece, state);

    expect(moves).toHaveLength(8);
  });

  it("black knight has same move count at all river positions", () => {
    const behindBoard = createEmptyBoard();
    const behindPiece = placePiece(behindBoard, makePiece({
      player: "black",
      position: { col: 5, row: "H" }, // behind river for black
    }));
    const behindState = makeState({ board: behindBoard });

    const atBoard = createEmptyBoard();
    const atPiece = placePiece(atBoard, makePiece({
      player: "black",
      position: { col: 5, row: "F" }, // at river
    }));
    const atState = makeState({ board: atBoard });

    const beyondBoard = createEmptyBoard();
    const beyondPiece = placePiece(beyondBoard, makePiece({
      player: "black",
      position: { col: 5, row: "D" }, // beyond river for black
    }));
    const beyondState = makeState({ board: beyondBoard });

    const behindMoves = getKnightMoves(behindPiece, behindState);
    const atMoves = getKnightMoves(atPiece, atState);
    const beyondMoves = getKnightMoves(beyondPiece, beyondState);

    expect(behindMoves).toHaveLength(8);
    expect(atMoves).toHaveLength(8);
    expect(beyondMoves).toHaveLength(8);
  });

  it("captures work the same across river", () => {
    // Place enemy at capture target position relative to knight behind river
    const behindBoard = createEmptyBoard();
    const behindPiece = placePiece(behindBoard, makePiece({
      player: "white",
      position: { col: 5, row: "C" }, // behind river
    }));
    placePiece(behindBoard, makePiece({
      id: "enemy-behind",
      player: "black",
      type: "footman",
      position: { col: 4, row: "A" }, // 2 up, 1 left
    }));
    const behindState = makeState({ board: behindBoard });

    // Place enemy at capture target position relative to knight beyond river
    const beyondBoard = createEmptyBoard();
    const beyondPiece = placePiece(beyondBoard, makePiece({
      player: "white",
      position: { col: 5, row: "H" }, // beyond river
    }));
    placePiece(beyondBoard, makePiece({
      id: "enemy-beyond",
      player: "black",
      type: "footman",
      position: { col: 4, row: "F" }, // 2 up, 1 left
    }));
    const beyondState = makeState({ board: beyondBoard });

    const behindCaptures = getKnightCaptures(behindPiece, behindState);
    const beyondCaptures = getKnightCaptures(beyondPiece, beyondState);

    expect(behindCaptures).toHaveLength(1);
    expect(beyondCaptures).toHaveLength(1);
  });
});

// Need to import isValidPosition for one of the tests above
import { isValidPosition } from "../src/board.js";
