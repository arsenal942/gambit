import { describe, it, expect } from "vitest";
import {
  createGame,
  executeMove,
  forfeit,
  offerDraw,
} from "../src/game.js";
import {
  createEmptyBoard,
  setupInitialBoard,
  setPieceAt,
  getPieceAt,
  removePieceAt,
} from "../src/board.js";
import {
  updateCapturePointControl,
  countControlledPoints,
  checkAnnihilation,
  checkCapturePointVictory,
  isGameOver,
} from "../src/victory.js";
import {
  getAllLegalMoves,
  getAllPieces,
  hasLegalMoves,
} from "../src/moves.js";
import type {
  Board,
  GameState,
  Piece,
  Position,
  GameAction,
} from "../src/types.js";

// ── Test helpers ─────────────────────────────────────────────────────

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: overrides.board ?? createEmptyBoard(),
    turn: overrides.turn ?? "white",
    moveHistory: overrides.moveHistory ?? [],
    capturedPieces: overrides.capturedPieces ?? { white: [], black: [] },
    capturePoints: overrides.capturePoints ?? {
      F1: null,
      F4: null,
      F7: null,
      F10: null,
    },
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

function makePiece(
  overrides: Partial<Piece> & Pick<Piece, "player" | "position">,
): Piece {
  return {
    id:
      overrides.id ??
      `${overrides.player}-${overrides.type ?? "footman"}-test`,
    type: overrides.type ?? "footman",
    player: overrides.player,
    position: overrides.position,
    hasMoved: overrides.hasMoved ?? true,
  };
}

function placePiece(board: Board, piece: Piece): Piece {
  setPieceAt(board, piece.position, piece);
  return piece;
}

/** Places a dummy piece for the given player so annihilation isn't triggered. */
function placeDummy(board: Board, player: "white" | "black"): Piece {
  const pos = player === "black" ? { col: 10, row: "K" } : { col: 10, row: "A" };
  return placePiece(board, makePiece({ id: `${player}-dummy`, player, position: pos, type: "footman" }));
}

// ── createGame ───────────────────────────────────────────────────────

describe("createGame", () => {
  it("returns initial state with white to move", () => {
    const game = createGame();
    expect(game.turn).toBe("white");
    expect(game.gamePhase).toBe("playing");
    expect(game.winner).toBeNull();
    expect(game.checkPlayer).toBeNull();
    expect(game.moveHistory).toHaveLength(0);
    expect(game.turnsSinceCapture).toBe(0);
    expect(game.pendingPromotion).toBeNull();
    expect(game.pendingRansom).toBeNull();
  });

  it("places 30 pieces on the board", () => {
    const game = createGame();
    const whitePieces = getAllPieces("white", game.board);
    const blackPieces = getAllPieces("black", game.board);
    expect(whitePieces).toHaveLength(15);
    expect(blackPieces).toHaveLength(15);
  });

  it("initializes capture points as neutral", () => {
    const game = createGame();
    expect(game.capturePoints.F1).toBeNull();
    expect(game.capturePoints.F4).toBeNull();
    expect(game.capturePoints.F7).toBeNull();
    expect(game.capturePoints.F10).toBeNull();
  });
});

// ── Basic move execution ─────────────────────────────────────────────

describe("executeMove — MoveAction", () => {
  it("moves a piece and switches turn", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "E" },
    });

    expect(next.turn).toBe("black");
    expect(getPieceAt(next.board, { col: 5, row: "E" })?.id).toBe("w-footman-1");
    expect(getPieceAt(next.board, { col: 5, row: "D" })).toBeNull();
  });

  it("sets hasMoved to true after move", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "B" },
      type: "footman",
      hasMoved: false,
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "C" },
    });

    const movedPiece = getPieceAt(next.board, { col: 5, row: "C" });
    expect(movedPiece?.hasMoved).toBe(true);
  });

  it("records move in moveHistory", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "E" },
    });

    expect(next.moveHistory).toHaveLength(1);
    expect(next.moveHistory[0].type).toBe("move");
    expect(next.moveHistory[0].from).toEqual({ col: 5, row: "D" });
    expect(next.moveHistory[0].to).toEqual({ col: 5, row: "E" });
  });

  it("increments turnsSinceCapture on non-capture move", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white", turnsSinceCapture: 3 });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "E" },
    });

    expect(next.turnsSinceCapture).toBe(4);
  });

  it("does not mutate the original state (immutability)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });
    const originalTurn = state.turn;
    const originalPiece = getPieceAt(state.board, { col: 5, row: "D" });

    executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "E" },
    });

    expect(state.turn).toBe(originalTurn);
    expect(getPieceAt(state.board, { col: 5, row: "D" })?.id).toBe(originalPiece?.id);
    expect(state.moveHistory).toHaveLength(0);
  });
});

// ── Validation errors ────────────────────────────────────────────────

describe("executeMove — validation", () => {
  it("throws when trying to move opponent's piece", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "H" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white" });

    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "b-footman-1",
        to: { col: 5, row: "G" },
      }),
    ).toThrow("Cannot move opponent's piece");
  });

  it("throws when game is already over", () => {
    const state = makeState({ gamePhase: "ended", winner: "white" });

    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "w-footman-1",
        to: { col: 5, row: "E" },
      }),
    ).toThrow("Game is already over");
  });

  it("throws when piece does not exist", () => {
    const state = makeState({ turn: "white" });

    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "nonexistent",
        to: { col: 5, row: "E" },
      }),
    ).toThrow("not found");
  });

  it("throws for invalid move destination", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white" });

    // Diagonal is not a valid footman move (behind river)
    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "w-footman-1",
        to: { col: 6, row: "E" },
      }),
    ).toThrow("Invalid move");
  });
});

// ── Capture execution ────────────────────────────────────────────────

describe("executeMove — CaptureAction", () => {
  it("footman captures diagonally and removes enemy", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 6, row: "E" },
      type: "footman",
    }));
    // Second black piece to avoid annihilation
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-footman-1",
      to: { col: 6, row: "E" },
    });

    expect(getPieceAt(next.board, { col: 6, row: "E" })?.id).toBe("w-footman-1");
    expect(getPieceAt(next.board, { col: 5, row: "D" })).toBeNull();
    expect(next.capturedPieces.black.some((p) => p.id === "b-footman-1")).toBe(true);
    expect(next.turn).toBe("black");
  });

  it("knight captures via L-move", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "knight",
    }));
    // 2 up + 1 right from D5 = F6
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 6, row: "F" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-knight-1",
      to: { col: 6, row: "F" },
    });

    expect(getPieceAt(next.board, { col: 6, row: "F" })?.id).toBe("w-knight-1");
    expect(next.capturedPieces.black.some((p) => p.id === "b-footman-1")).toBe(true);
  });

  it("resets turnsSinceCapture on capture", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 6, row: "E" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white", turnsSinceCapture: 15 });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-footman-1",
      to: { col: 6, row: "E" },
    });

    expect(next.turnsSinceCapture).toBe(0);
  });

  it("throws for archer capture (archers cannot capture by displacement)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-archer-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "archer",
    }));
    const state = makeState({ board, turn: "white" });

    expect(() =>
      executeMove(state, {
        type: "capture",
        pieceId: "w-archer-1",
        to: { col: 6, row: "E" },
      }),
    ).toThrow("cannot capture by displacement");
  });
});

// ── Longshot execution ───────────────────────────────────────────────

describe("executeMove — LongshotAction", () => {
  it("archer longshot removes enemy and archer stays in place", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-archer-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "archer",
    }));
    // Screen piece at E5
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "E" },
      type: "footman",
    }));
    // Target at F5
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "F" },
      type: "footman",
    }));
    // Second black piece to avoid annihilation
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "longshot",
      pieceId: "w-archer-1",
      targetPosition: { col: 5, row: "F" },
    });

    expect(getPieceAt(next.board, { col: 5, row: "D" })?.id).toBe("w-archer-1");
    expect(getPieceAt(next.board, { col: 5, row: "F" })).toBeNull();
    expect(getPieceAt(next.board, { col: 5, row: "E" })?.id).toBe("w-footman-1");
    expect(next.capturedPieces.black.some((p) => p.id === "b-footman-1")).toBe(true);
    expect(next.turn).toBe("black");
  });

  it("resets turnsSinceCapture on longshot", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-archer-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "archer",
    }));
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "E" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "F" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white", turnsSinceCapture: 10 });

    const next = executeMove(state, {
      type: "longshot",
      pieceId: "w-archer-1",
      targetPosition: { col: 5, row: "F" },
    });

    expect(next.turnsSinceCapture).toBe(0);
  });
});

// ── Pushback execution ───────────────────────────────────────────────

describe("executeMove — PushbackAction", () => {
  it("pushes enemy piece and records lastPushback", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "E" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "pushback",
      pieceId: "w-footman-1",
      targetPieceId: "b-footman-1",
      pushDirection: [1, 0],
    });

    // Black piece moved from E5 to F5
    expect(getPieceAt(next.board, { col: 5, row: "F" })?.id).toBe("b-footman-1");
    expect(getPieceAt(next.board, { col: 5, row: "E" })).toBeNull();
    // White piece stays at D5
    expect(getPieceAt(next.board, { col: 5, row: "D" })?.id).toBe("w-footman-1");
    // lastPushback set
    expect(next.lastPushback).toEqual({
      targetPieceId: "w-footman-1",
      byPlayer: "white",
    });
    expect(next.turn).toBe("black");
  });

  it("increments turnsSinceCapture (pushback is not a capture)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "E" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white", turnsSinceCapture: 5 });

    const next = executeMove(state, {
      type: "pushback",
      pieceId: "w-footman-1",
      targetPieceId: "b-footman-1",
      pushDirection: [1, 0],
    });

    expect(next.turnsSinceCapture).toBe(6);
  });

  it("anti-retaliation: cannot push the piece that pushed you last turn", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 5, row: "E" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    const state = makeState({
      board,
      turn: "white",
      lastPushback: { targetPieceId: "b-footman-1", byPlayer: "black" },
    });

    expect(() =>
      executeMove(state, {
        type: "pushback",
        pieceId: "w-footman-1",
        targetPieceId: "b-footman-1",
        pushDirection: [1, 0],
      }),
    ).toThrow("Invalid pushback");
  });

  it("lastPushback is cleared on a normal move", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      lastPushback: { targetPieceId: "b-footman-1", byPlayer: "black" },
    });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "E" },
    });

    expect(next.lastPushback).toBeNull();
  });
});

// ── Capture point control ────────────────────────────────────────────

describe("capture point control", () => {
  it("piece on F1 gives control to that player", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 1, row: "F" },
      type: "footman",
    }));
    const control = updateCapturePointControl(board);
    expect(control.F1).toBe("white");
    expect(control.F4).toBeNull();
  });

  it("removing piece makes capture point neutral", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 4, row: "F" },
      type: "footman",
    }));
    removePieceAt(board, { col: 4, row: "F" });
    const control = updateCapturePointControl(board);
    expect(control.F4).toBeNull();
  });

  it("countControlledPoints counts correctly", () => {
    const control = { F1: "white" as const, F4: "white" as const, F7: "black" as const, F10: null };
    expect(countControlledPoints(control, "white")).toBe(2);
    expect(countControlledPoints(control, "black")).toBe(1);
  });
});

// ── Check and Checkmate ──────────────────────────────────────────────

describe("check and checkmate (capture point victory)", () => {
  it("controlling 3 capture points declares check on opponent", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w2", player: "white", position: { col: 4, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w3", player: "white", position: { col: 7, row: "F" }, type: "footman" }));
    const state = makeState({
      board,
      turn: "white",
      capturePoints: updateCapturePointControl(board),
    });

    const result = checkCapturePointVictory(state, "white");
    expect(result.checkPlayer).toBe("black");
    expect(result.winner).toBeNull();
  });

  it("opponent breaks check by removing a capture point", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w2", player: "white", position: { col: 4, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "b1", player: "black", position: { col: 7, row: "F" }, type: "footman" }));
    const state = makeState({
      board,
      turn: "black",
      checkPlayer: "black",
      capturePoints: updateCapturePointControl(board),
    });

    const result = checkCapturePointVictory(state, "black");
    expect(result.checkPlayer).toBeNull();
    expect(result.winner).toBeNull();
  });

  it("checkmate when opponent fails to break 3 capture points", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w2", player: "white", position: { col: 4, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w3", player: "white", position: { col: 7, row: "F" }, type: "footman" }));
    const state = makeState({
      board,
      turn: "black",
      checkPlayer: "black",
      capturePoints: updateCapturePointControl(board),
    });

    const result = checkCapturePointVictory(state, "black");
    expect(result.winner).toBe("white");
    expect(result.checkPlayer).toBeNull();
  });

  it("full checkmate scenario through executeMove", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w2", player: "white", position: { col: 4, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "w3", player: "white", position: { col: 7, row: "F" }, type: "footman" }));
    placePiece(board, makePiece({ id: "b1", player: "black", position: { col: 2, row: "H" }, type: "footman" }));

    const state = makeState({
      board,
      turn: "black",
      checkPlayer: "black",
      capturePoints: updateCapturePointControl(board),
    });

    // Black moves but doesn't break any capture point
    const next = executeMove(state, {
      type: "move",
      pieceId: "b1",
      to: { col: 2, row: "G" },
    });

    expect(next.gamePhase).toBe("ended");
    expect(next.winner).toBe("white");
    expect(next.winCondition).toBe("checkmate");
  });
});

// ── Annihilation ─────────────────────────────────────────────────────

describe("annihilation", () => {
  it("returns null when both players have pieces", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "A" }, type: "footman" }));
    placePiece(board, makePiece({ id: "b1", player: "black", position: { col: 1, row: "K" }, type: "footman" }));
    expect(checkAnnihilation(board)).toBeNull();
  });

  it("returns winner when opponent has zero pieces", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "A" }, type: "footman" }));
    expect(checkAnnihilation(board)).toBe("white");
  });

  it("triggers on capture that removes last enemy piece", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    // Only one black piece — capturing it triggers annihilation
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 6, row: "E" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-footman-1",
      to: { col: 6, row: "E" },
    });

    expect(next.gamePhase).toBe("ended");
    expect(next.winner).toBe("white");
    expect(next.winCondition).toBe("annihilation");
  });
});

// ── Forfeit ──────────────────────────────────────────────────────────

describe("forfeit", () => {
  it("ends the game with opponent winning", () => {
    const state = makeState();
    const next = forfeit(state, "white");
    expect(next.gamePhase).toBe("ended");
    expect(next.winner).toBe("black");
    expect(next.winCondition).toBe("forfeit");
  });

  it("throws if game is already over", () => {
    const state = makeState({ gamePhase: "ended" });
    expect(() => forfeit(state, "white")).toThrow("Game is already over");
  });
});

// ── Draw ─────────────────────────────────────────────────────────────

describe("offerDraw", () => {
  it("ends game in draw when turnsSinceCapture >= 20", () => {
    const state = makeState({ turnsSinceCapture: 20 });
    const next = offerDraw(state);
    expect(next.gamePhase).toBe("ended");
    expect(next.winner).toBeNull();
    expect(next.winCondition).toBe("draw");
  });

  it("throws when turnsSinceCapture < 20", () => {
    const state = makeState({ turnsSinceCapture: 19 });
    expect(() => offerDraw(state)).toThrow("Draw not available");
  });
});

// ── Promotion ────────────────────────────────────────────────────────

describe("promotion", () => {
  it("footman reaching back row triggers awaitingPromotion", () => {
    const board = createEmptyBoard();
    // White footman on I5 — beyond river, 2 tiles forward reaches K5
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "I" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      capturedPieces: {
        white: [
          makePiece({ id: "w-archer-captured", player: "white", position: { col: 1, row: "A" }, type: "archer" }),
        ],
        black: [],
      },
    });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "K" },
    });

    expect(next.gamePhase).toBe("awaitingPromotion");
    expect(next.pendingPromotion).toEqual({ pieceId: "w-footman-1" });
    expect(next.turn).toBe("white"); // Turn not switched yet
  });

  it("PromotionAction removes footman and places captured piece", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "K" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const capturedArcher = makePiece({
      id: "w-archer-captured",
      player: "white",
      position: { col: 1, row: "A" },
      type: "archer",
    });
    const state = makeState({
      board,
      turn: "white",
      gamePhase: "awaitingPromotion",
      pendingPromotion: { pieceId: "w-footman-1" },
      capturedPieces: { white: [capturedArcher], black: [] },
    });

    const next = executeMove(state, {
      type: "promotion",
      capturedPieceId: "w-archer-captured",
      placementPosition: { col: 3, row: "A" },
    });

    expect(getPieceAt(next.board, { col: 5, row: "K" })).toBeNull();
    expect(getPieceAt(next.board, { col: 3, row: "A" })?.id).toBe("w-archer-captured");
    expect(next.capturedPieces.white.some((p) => p.id === "w-archer-captured")).toBe(false);
    expect(next.gamePhase).toBe("playing");
    expect(next.pendingPromotion).toBeNull();
    expect(next.turn).toBe("black");
  });

  it("DeclinePromotionAction leaves footman on back row and switches turn", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "K" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      gamePhase: "awaitingPromotion",
      pendingPromotion: { pieceId: "w-footman-1" },
    });

    const next = executeMove(state, { type: "declinePromotion" });

    expect(getPieceAt(next.board, { col: 5, row: "K" })?.id).toBe("w-footman-1");
    expect(next.gamePhase).toBe("playing");
    expect(next.turn).toBe("black");
  });

  it("auto-skips promotion when no captured pieces to return", () => {
    const board = createEmptyBoard();
    // White footman on I5, can move 2 forward to K5
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "I" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      capturedPieces: { white: [], black: [] },
    });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 5, row: "K" },
    });

    expect(next.gamePhase).toBe("playing");
    expect(next.pendingPromotion).toBeNull();
    expect(next.turn).toBe("black");
  });

  it("rejects non-promotion actions during awaitingPromotion", () => {
    const state = makeState({
      gamePhase: "awaitingPromotion",
      pendingPromotion: { pieceId: "w-footman-1" },
    });

    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "w-footman-1",
        to: { col: 5, row: "E" },
      }),
    ).toThrow("Must resolve promotion");
  });
});

// ── Ransom ───────────────────────────────────────────────────────────

describe("ransom", () => {
  it("knight capturing knight triggers awaitingRansom when eligible pieces exist", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "knight",
    }));
    // Black knight at F6 (L-move from D5: 2 up + 1 right)
    placePiece(board, makePiece({
      id: "b-knight-1",
      player: "black",
      position: { col: 6, row: "F" },
      type: "knight",
    }));
    // Second black piece to avoid annihilation
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      capturedPieces: {
        white: [
          makePiece({ id: "w-footman-captured", player: "white", position: { col: 1, row: "A" }, type: "footman" }),
        ],
        black: [],
      },
    });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-knight-1",
      to: { col: 6, row: "F" },
    });

    expect(next.gamePhase).toBe("awaitingRansom");
    expect(next.pendingRansom).toEqual({
      pieceId: "w-knight-1",
      capturedPieceId: "b-knight-1",
    });
    expect(next.turn).toBe("white"); // Turn not switched
  });

  it("RansomAction returns captured piece to board", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 6, row: "F" },
      type: "knight",
    }));
    placeDummy(board, "black");
    const capturedFootman = makePiece({
      id: "w-footman-captured",
      player: "white",
      position: { col: 1, row: "A" },
      type: "footman",
    });
    const state = makeState({
      board,
      turn: "white",
      gamePhase: "awaitingRansom",
      pendingRansom: { pieceId: "w-knight-1", capturedPieceId: "b-knight-1" },
      capturedPieces: { white: [capturedFootman], black: [] },
    });

    const next = executeMove(state, {
      type: "ransom",
      capturedPieceId: "w-footman-captured",
      placementPosition: { col: 2, row: "B" },
    });

    expect(getPieceAt(next.board, { col: 2, row: "B" })?.id).toBe("w-footman-captured");
    expect(next.capturedPieces.white.some((p) => p.id === "w-footman-captured")).toBe(false);
    expect(next.gamePhase).toBe("playing");
    expect(next.turn).toBe("black");
  });

  it("DeclineRansomAction switches turn without returning a piece", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 6, row: "F" },
      type: "knight",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      gamePhase: "awaitingRansom",
      pendingRansom: { pieceId: "w-knight-1", capturedPieceId: "b-knight-1" },
      capturedPieces: {
        white: [makePiece({ id: "w-footman-captured", player: "white", position: { col: 1, row: "A" }, type: "footman" })],
        black: [],
      },
    });

    const next = executeMove(state, { type: "declineRansom" });

    expect(next.gamePhase).toBe("playing");
    expect(next.turn).toBe("black");
    expect(next.capturedPieces.white.some((p) => p.id === "w-footman-captured")).toBe(true);
  });

  it("auto-skips ransom when no eligible captured pieces", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "knight",
    }));
    placePiece(board, makePiece({
      id: "b-knight-1",
      player: "black",
      position: { col: 6, row: "F" },
      type: "knight",
    }));
    placeDummy(board, "black");
    const state = makeState({
      board,
      turn: "white",
      capturedPieces: { white: [], black: [] },
    });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-knight-1",
      to: { col: 6, row: "F" },
    });

    expect(next.gamePhase).toBe("playing");
    expect(next.pendingRansom).toBeNull();
    expect(next.turn).toBe("black");
  });

  it("cannot ransom a knight (only footmen and archers)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 6, row: "F" },
      type: "knight",
    }));
    placeDummy(board, "black");
    const capturedKnight = makePiece({
      id: "w-knight-captured",
      player: "white",
      position: { col: 1, row: "A" },
      type: "knight",
    });
    const state = makeState({
      board,
      turn: "white",
      gamePhase: "awaitingRansom",
      pendingRansom: { pieceId: "w-knight-1", capturedPieceId: "b-knight-1" },
      capturedPieces: { white: [capturedKnight], black: [] },
    });

    expect(() =>
      executeMove(state, {
        type: "ransom",
        capturedPieceId: "w-knight-captured",
        placementPosition: { col: 2, row: "B" },
      }),
    ).toThrow("Cannot ransom a knight");
  });

  it("rejects non-ransom actions during awaitingRansom", () => {
    const state = makeState({
      gamePhase: "awaitingRansom",
      pendingRansom: { pieceId: "w-knight-1", capturedPieceId: "b-knight-1" },
    });

    expect(() =>
      executeMove(state, {
        type: "move",
        pieceId: "w-knight-1",
        to: { col: 5, row: "E" },
      }),
    ).toThrow("Must resolve ransom");
  });
});

// ── Move aggregation ─────────────────────────────────────────────────

describe("getAllLegalMoves", () => {
  it("returns actions for all player pieces on initial board", () => {
    const game = createGame();
    const moves = getAllLegalMoves("white", game);
    expect(moves.length).toBeGreaterThan(0);
    for (const pa of moves) {
      expect(pa.piece.player).toBe("white");
    }
  });

  it("returns empty for a player with no pieces", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w1",
      player: "white",
      position: { col: 1, row: "A" },
      type: "footman",
    }));
    const state = makeState({ board });
    const moves = getAllLegalMoves("black", state);
    expect(moves).toHaveLength(0);
  });

  it("only includes pieces belonging to the specified player", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 5, row: "D" }, type: "footman" }));
    placePiece(board, makePiece({ id: "b1", player: "black", position: { col: 5, row: "H" }, type: "footman" }));
    const state = makeState({ board });

    const whiteMoves = getAllLegalMoves("white", state);
    const blackMoves = getAllLegalMoves("black", state);

    expect(whiteMoves.every((pa) => pa.piece.player === "white")).toBe(true);
    expect(blackMoves.every((pa) => pa.piece.player === "black")).toBe(true);
  });
});

describe("hasLegalMoves", () => {
  it("returns true on initial board", () => {
    const game = createGame();
    expect(hasLegalMoves("white", game)).toBe(true);
    expect(hasLegalMoves("black", game)).toBe(true);
  });

  it("returns false when player has no pieces", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w1",
      player: "white",
      position: { col: 1, row: "A" },
      type: "footman",
    }));
    const state = makeState({ board });
    expect(hasLegalMoves("black", state)).toBe(false);
  });
});

// ── isGameOver ───────────────────────────────────────────────────────

describe("isGameOver", () => {
  it("returns false for a normal playing state with both players", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({ id: "w1", player: "white", position: { col: 1, row: "A" }, type: "footman" }));
    placePiece(board, makePiece({ id: "b1", player: "black", position: { col: 1, row: "K" }, type: "footman" }));
    const state = makeState({ board });
    const result = isGameOver(state);
    expect(result.gameOver).toBe(false);
  });

  it("returns true for ended phase", () => {
    const state = makeState({
      gamePhase: "ended",
      winner: "white",
      winCondition: "forfeit",
    });
    const result = isGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe("white");
    expect(result.winCondition).toBe("forfeit");
  });

  it("detects annihilation", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w1",
      player: "white",
      position: { col: 1, row: "A" },
      type: "footman",
    }));
    const state = makeState({ board });
    const result = isGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe("white");
    expect(result.winCondition).toBe("annihilation");
  });
});

// ── Edge cases ───────────────────────────────────────────────────────

describe("edge cases", () => {
  it("multiple captures across turns — turnsSinceCapture resets each time", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-1",
      player: "black",
      position: { col: 6, row: "E" },
      type: "footman",
    }));
    placePiece(board, makePiece({
      id: "b-footman-2",
      player: "black",
      position: { col: 3, row: "H" },
      type: "footman",
    }));
    const state = makeState({ board, turn: "white", turnsSinceCapture: 5 });

    const next = executeMove(state, {
      type: "capture",
      pieceId: "w-footman-1",
      to: { col: 6, row: "E" },
    });
    expect(next.turnsSinceCapture).toBe(0);
  });

  it("capture point control updates after move onto capture point", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-footman-1",
      player: "white",
      position: { col: 1, row: "E" },
      type: "footman",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    const next = executeMove(state, {
      type: "move",
      pieceId: "w-footman-1",
      to: { col: 1, row: "F" },
    });

    expect(next.capturePoints.F1).toBe("white");
  });

  it("archer move (non-capture)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-archer-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "archer",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    // Archer behind river: 2 tiles forward (orthogonal slide)
    const next = executeMove(state, {
      type: "move",
      pieceId: "w-archer-1",
      to: { col: 5, row: "F" },
    });

    expect(getPieceAt(next.board, { col: 5, row: "F" })?.id).toBe("w-archer-1");
    expect(next.turn).toBe("black");
  });

  it("knight move (non-capture)", () => {
    const board = createEmptyBoard();
    placePiece(board, makePiece({
      id: "w-knight-1",
      player: "white",
      position: { col: 5, row: "D" },
      type: "knight",
    }));
    placeDummy(board, "black");
    const state = makeState({ board, turn: "white" });

    // Knight L-move: 2 forward + 1 right = F6
    const next = executeMove(state, {
      type: "move",
      pieceId: "w-knight-1",
      to: { col: 6, row: "F" },
    });

    expect(getPieceAt(next.board, { col: 6, row: "F" })?.id).toBe("w-knight-1");
    expect(next.turn).toBe("black");
  });
});
