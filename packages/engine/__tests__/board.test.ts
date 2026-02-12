import { describe, it, expect } from "vitest";
import {
  createEmptyBoard,
  posToIndex,
  indexToPos,
  isValidPosition,
  getPieceAt,
  setPieceAt,
  removePieceAt,
  isRiver,
  isCapturePoint,
  getRiverStatus,
  getForwardDirection,
  isDarkTile,
  setupInitialBoard,
} from "../src/board.js";
import type { Piece, Position } from "../src/types.js";

describe("createEmptyBoard", () => {
  it("creates a board with 11 rows", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(11);
  });

  it("creates a board with 10 columns per row", () => {
    const board = createEmptyBoard();
    for (const row of board) {
      expect(row).toHaveLength(10);
    }
  });

  it("all cells are null", () => {
    const board = createEmptyBoard();
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });
});

describe("posToIndex", () => {
  it("converts A1 to [0, 0]", () => {
    expect(posToIndex({ col: 1, row: "A" })).toEqual([0, 0]);
  });

  it("converts K10 to [10, 9]", () => {
    expect(posToIndex({ col: 10, row: "K" })).toEqual([10, 9]);
  });

  it("converts F5 to [5, 4]", () => {
    expect(posToIndex({ col: 5, row: "F" })).toEqual([5, 4]);
  });

  it("converts B3 to [1, 2]", () => {
    expect(posToIndex({ col: 3, row: "B" })).toEqual([1, 2]);
  });
});

describe("indexToPos", () => {
  it("converts [0, 0] to A1", () => {
    expect(indexToPos(0, 0)).toEqual({ col: 1, row: "A" });
  });

  it("converts [9, 10] to K10", () => {
    expect(indexToPos(9, 10)).toEqual({ col: 10, row: "K" });
  });

  it("converts [4, 5] to F5", () => {
    expect(indexToPos(4, 5)).toEqual({ col: 5, row: "F" });
  });
});

describe("posToIndex / indexToPos roundtrip", () => {
  it("roundtrips all valid positions", () => {
    const rows = "ABCDEFGHIJK";
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c <= 10; c++) {
        const pos: Position = { col: c, row: rows[r] };
        const [rowIdx, colIdx] = posToIndex(pos);
        const result = indexToPos(colIdx, rowIdx);
        expect(result).toEqual(pos);
      }
    }
  });
});

describe("isValidPosition", () => {
  it("accepts A1", () => {
    expect(isValidPosition({ col: 1, row: "A" })).toBe(true);
  });

  it("accepts K10", () => {
    expect(isValidPosition({ col: 10, row: "K" })).toBe(true);
  });

  it("accepts F5 (center)", () => {
    expect(isValidPosition({ col: 5, row: "F" })).toBe(true);
  });

  it("rejects col 0", () => {
    expect(isValidPosition({ col: 0, row: "A" })).toBe(false);
  });

  it("rejects col 11", () => {
    expect(isValidPosition({ col: 11, row: "A" })).toBe(false);
  });

  it("rejects row L", () => {
    expect(isValidPosition({ col: 1, row: "L" })).toBe(false);
  });

  it("rejects row Z", () => {
    expect(isValidPosition({ col: 1, row: "Z" })).toBe(false);
  });

  it("rejects empty row", () => {
    expect(isValidPosition({ col: 1, row: "" })).toBe(false);
  });

  it("rejects negative col", () => {
    expect(isValidPosition({ col: -1, row: "A" })).toBe(false);
  });
});

describe("getPieceAt / setPieceAt / removePieceAt", () => {
  it("returns null for empty cell", () => {
    const board = createEmptyBoard();
    expect(getPieceAt(board, { col: 1, row: "A" })).toBeNull();
  });

  it("sets and gets a piece", () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      id: "test-1",
      type: "footman",
      player: "white",
      position: { col: 3, row: "C" },
      hasMoved: false,
    };
    setPieceAt(board, { col: 3, row: "C" }, piece);
    expect(getPieceAt(board, { col: 3, row: "C" })).toBe(piece);
  });

  it("removes a piece and returns it", () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      id: "test-2",
      type: "archer",
      player: "black",
      position: { col: 5, row: "F" },
      hasMoved: false,
    };
    setPieceAt(board, { col: 5, row: "F" }, piece);
    const removed = removePieceAt(board, { col: 5, row: "F" });
    expect(removed).toBe(piece);
    expect(getPieceAt(board, { col: 5, row: "F" })).toBeNull();
  });

  it("returns null when removing from empty cell", () => {
    const board = createEmptyBoard();
    const removed = removePieceAt(board, { col: 1, row: "A" });
    expect(removed).toBeNull();
  });
});

describe("isRiver", () => {
  it("returns true for row F", () => {
    expect(isRiver({ col: 1, row: "F" })).toBe(true);
    expect(isRiver({ col: 5, row: "F" })).toBe(true);
    expect(isRiver({ col: 10, row: "F" })).toBe(true);
  });

  it("returns false for non-F rows", () => {
    expect(isRiver({ col: 1, row: "A" })).toBe(false);
    expect(isRiver({ col: 1, row: "E" })).toBe(false);
    expect(isRiver({ col: 1, row: "G" })).toBe(false);
    expect(isRiver({ col: 1, row: "K" })).toBe(false);
  });
});

describe("isCapturePoint", () => {
  it("identifies all 4 capture points", () => {
    expect(isCapturePoint({ col: 1, row: "F" })).toBe(true);
    expect(isCapturePoint({ col: 4, row: "F" })).toBe(true);
    expect(isCapturePoint({ col: 7, row: "F" })).toBe(true);
    expect(isCapturePoint({ col: 10, row: "F" })).toBe(true);
  });

  it("rejects non-capture-point positions on river", () => {
    expect(isCapturePoint({ col: 2, row: "F" })).toBe(false);
    expect(isCapturePoint({ col: 3, row: "F" })).toBe(false);
    expect(isCapturePoint({ col: 5, row: "F" })).toBe(false);
    expect(isCapturePoint({ col: 6, row: "F" })).toBe(false);
    expect(isCapturePoint({ col: 8, row: "F" })).toBe(false);
    expect(isCapturePoint({ col: 9, row: "F" })).toBe(false);
  });

  it("rejects positions not on the river", () => {
    expect(isCapturePoint({ col: 1, row: "A" })).toBe(false);
    expect(isCapturePoint({ col: 4, row: "E" })).toBe(false);
    expect(isCapturePoint({ col: 7, row: "G" })).toBe(false);
  });
});

describe("getRiverStatus", () => {
  describe("for white", () => {
    it("returns 'behind' for rows A-E", () => {
      for (const row of "ABCDE") {
        expect(getRiverStatus({ col: 1, row }, "white")).toBe("behind");
      }
    });

    it("returns 'at' for row F", () => {
      expect(getRiverStatus({ col: 1, row: "F" }, "white")).toBe("at");
    });

    it("returns 'beyond' for rows G-K", () => {
      for (const row of "GHIJK") {
        expect(getRiverStatus({ col: 1, row }, "white")).toBe("beyond");
      }
    });
  });

  describe("for black", () => {
    it("returns 'behind' for rows G-K", () => {
      for (const row of "GHIJK") {
        expect(getRiverStatus({ col: 1, row }, "black")).toBe("behind");
      }
    });

    it("returns 'at' for row F", () => {
      expect(getRiverStatus({ col: 1, row: "F" }, "black")).toBe("at");
    });

    it("returns 'beyond' for rows A-E", () => {
      for (const row of "ABCDE") {
        expect(getRiverStatus({ col: 1, row }, "black")).toBe("beyond");
      }
    });
  });
});

describe("getForwardDirection", () => {
  it("returns +1 for white", () => {
    expect(getForwardDirection("white")).toBe(1);
  });

  it("returns -1 for black", () => {
    expect(getForwardDirection("black")).toBe(-1);
  });
});

describe("isDarkTile", () => {
  it("A1 is dark (0,0 is even)", () => {
    expect(isDarkTile({ col: 1, row: "A" })).toBe(true);
  });

  it("A2 is light", () => {
    expect(isDarkTile({ col: 2, row: "A" })).toBe(false);
  });

  it("B1 is light", () => {
    expect(isDarkTile({ col: 1, row: "B" })).toBe(false);
  });

  it("B2 is dark", () => {
    expect(isDarkTile({ col: 2, row: "B" })).toBe(true);
  });

  it("checkerboard pattern alternates correctly", () => {
    const rows = "ABCDEFGHIJK";
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c <= 10; c++) {
        const pos = { col: c, row: rows[r] };
        const colIdx = c - 1;
        const expected = (r + colIdx) % 2 === 0;
        expect(isDarkTile(pos)).toBe(expected);
      }
    }
  });
});

describe("setupInitialBoard", () => {
  it("places exactly 30 pieces total", () => {
    const board = setupInitialBoard();
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell !== null) count++;
      }
    }
    expect(count).toBe(30);
  });

  it("places 15 white pieces and 15 black pieces", () => {
    const board = setupInitialBoard();
    let white = 0;
    let black = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell?.player === "white") white++;
        if (cell?.player === "black") black++;
      }
    }
    expect(white).toBe(15);
    expect(black).toBe(15);
  });

  it("places 5 of each unit type per player", () => {
    const board = setupInitialBoard();
    const counts = {
      white: { footman: 0, archer: 0, knight: 0 },
      black: { footman: 0, archer: 0, knight: 0 },
    };
    for (const row of board) {
      for (const cell of row) {
        if (cell) {
          counts[cell.player][cell.type]++;
        }
      }
    }
    expect(counts.white.footman).toBe(5);
    expect(counts.white.archer).toBe(5);
    expect(counts.white.knight).toBe(5);
    expect(counts.black.footman).toBe(5);
    expect(counts.black.archer).toBe(5);
    expect(counts.black.knight).toBe(5);
  });

  describe("white piece positions", () => {
    it("places knights on row A at cols 1,3,5,7,9", () => {
      const board = setupInitialBoard();
      for (const col of [1, 3, 5, 7, 9]) {
        const piece = getPieceAt(board, { col, row: "A" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("knight");
        expect(piece!.player).toBe("white");
      }
    });

    it("places archers on row B at cols 2,4,6,8,10", () => {
      const board = setupInitialBoard();
      for (const col of [2, 4, 6, 8, 10]) {
        const piece = getPieceAt(board, { col, row: "B" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("archer");
        expect(piece!.player).toBe("white");
      }
    });

    it("places footmen on row C at cols 1,3,5,7,9", () => {
      const board = setupInitialBoard();
      for (const col of [1, 3, 5, 7, 9]) {
        const piece = getPieceAt(board, { col, row: "C" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("footman");
        expect(piece!.player).toBe("white");
      }
    });

    it("has no pieces on non-starting columns in white rows", () => {
      const board = setupInitialBoard();
      for (const col of [2, 4, 6, 8, 10]) {
        expect(getPieceAt(board, { col, row: "A" })).toBeNull();
        expect(getPieceAt(board, { col, row: "C" })).toBeNull();
      }
      for (const col of [1, 3, 5, 7, 9]) {
        expect(getPieceAt(board, { col, row: "B" })).toBeNull();
      }
    });
  });

  describe("black piece positions", () => {
    it("places footmen on row I at cols 2,4,6,8,10", () => {
      const board = setupInitialBoard();
      for (const col of [2, 4, 6, 8, 10]) {
        const piece = getPieceAt(board, { col, row: "I" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("footman");
        expect(piece!.player).toBe("black");
      }
    });

    it("places archers on row J at cols 1,3,5,7,9", () => {
      const board = setupInitialBoard();
      for (const col of [1, 3, 5, 7, 9]) {
        const piece = getPieceAt(board, { col, row: "J" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("archer");
        expect(piece!.player).toBe("black");
      }
    });

    it("places knights on row K at cols 2,4,6,8,10", () => {
      const board = setupInitialBoard();
      for (const col of [2, 4, 6, 8, 10]) {
        const piece = getPieceAt(board, { col, row: "K" });
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe("knight");
        expect(piece!.player).toBe("black");
      }
    });

    it("has no pieces on non-starting columns in black rows", () => {
      const board = setupInitialBoard();
      for (const col of [1, 3, 5, 7, 9]) {
        expect(getPieceAt(board, { col, row: "I" })).toBeNull();
        expect(getPieceAt(board, { col, row: "K" })).toBeNull();
      }
      for (const col of [2, 4, 6, 8, 10]) {
        expect(getPieceAt(board, { col, row: "J" })).toBeNull();
      }
    });
  });

  it("white pieces are on dark tiles", () => {
    const board = setupInitialBoard();
    for (const row of board) {
      for (const cell of row) {
        if (cell?.player === "white") {
          expect(isDarkTile(cell.position)).toBe(true);
        }
      }
    }
  });

  it("black pieces are on light tiles", () => {
    const board = setupInitialBoard();
    for (const row of board) {
      for (const cell of row) {
        if (cell?.player === "black") {
          expect(isDarkTile(cell.position)).toBe(false);
        }
      }
    }
  });

  it("no pieces on rows D-H (middle of board is empty)", () => {
    const board = setupInitialBoard();
    for (const row of "DEFGH") {
      for (let col = 1; col <= 10; col++) {
        expect(getPieceAt(board, { col, row })).toBeNull();
      }
    }
  });

  it("each piece has a unique id", () => {
    const board = setupInitialBoard();
    const ids = new Set<string>();
    for (const row of board) {
      for (const cell of row) {
        if (cell) {
          expect(ids.has(cell.id)).toBe(false);
          ids.add(cell.id);
        }
      }
    }
    expect(ids.size).toBe(30);
  });

  it("each piece's position matches its actual board location", () => {
    const board = setupInitialBoard();
    const rows = "ABCDEFGHIJK";
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < 10; c++) {
        const piece = board[r][c];
        if (piece) {
          expect(piece.position.col).toBe(c + 1);
          expect(piece.position.row).toBe(rows[r]);
        }
      }
    }
  });
});
