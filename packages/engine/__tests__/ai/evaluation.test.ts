import { describe, it, expect } from "vitest";
import { createGame, executeMove } from "../../src/game.js";
import {
  evaluate,
  evaluateMaterial,
  evaluateCapturePoints,
  evaluateRiverAdvancement,
  evaluateCenterControl,
} from "../../src/ai/evaluation.js";
import { createEmptyBoard, setPieceAt } from "../../src/board.js";
import type { GameState, Piece } from "../../src/types.js";
import type { EvaluationWeights } from "../../src/ai/types.js";

const FULL_WEIGHTS: EvaluationWeights = {
  material: 1,
  capturePointControl: 1,
  centerControl: 1,
  riverAdvancement: 1,
  mobility: 1,
  longshotThreats: 1,
  pushbackAvailability: 1,
  promotionPotential: 1,
  backRowDefense: 1,
  capturedPiecesValue: 1,
  pawnStructure: 1,
};

function makePiece(
  id: string,
  type: Piece["type"],
  player: Piece["player"],
  row: string,
  col: number,
): Piece {
  return { id, type, player, position: { row, col }, hasMoved: false };
}

describe("evaluate", () => {
  it("returns approximately 0 for the initial symmetric board", () => {
    const state = createGame();
    const score = evaluate(state, "white", FULL_WEIGHTS, 0);
    // Should be near 0 since the board is symmetric
    expect(Math.abs(score)).toBeLessThan(20);
  });

  it("returns WIN_SCORE when the maximizing player wins", () => {
    const state = createGame();
    const endedState: GameState = {
      ...state,
      gamePhase: "ended",
      winner: "white",
      winCondition: "annihilation",
    };
    const score = evaluate(endedState, "white", FULL_WEIGHTS, 0);
    expect(score).toBe(100000);
  });

  it("returns -WIN_SCORE when the maximizing player loses", () => {
    const state = createGame();
    const endedState: GameState = {
      ...state,
      gamePhase: "ended",
      winner: "black",
      winCondition: "annihilation",
    };
    const score = evaluate(endedState, "white", FULL_WEIGHTS, 0);
    expect(score).toBe(-100000);
  });

  it("returns 0 for a draw", () => {
    const state = createGame();
    const endedState: GameState = {
      ...state,
      gamePhase: "ended",
      winner: null,
      winCondition: "draw",
    };
    const score = evaluate(endedState, "white", FULL_WEIGHTS, 0);
    expect(score).toBe(0);
  });
});

describe("evaluateMaterial", () => {
  it("returns 0 for an equal position", () => {
    const state = createGame();
    expect(evaluateMaterial(state, "white")).toBe(0);
  });

  it("returns positive when player has more material", () => {
    const state = createGame();
    // Remove a black footman from the board
    const board = state.board;
    // I2 has a black footman (black-footman-16)
    board[8][1] = null; // row I=index 8, col 2=index 1
    expect(evaluateMaterial(state, "white")).toBe(100); // one footman advantage
  });

  it("returns negative when opponent has more material", () => {
    const state = createGame();
    // Remove a white knight from the board
    state.board[0][0] = null; // row A=index 0, col 1=index 0
    expect(evaluateMaterial(state, "white")).toBe(-175); // one knight disadvantage
  });
});

describe("evaluateCapturePoints", () => {
  it("returns 0 when no capture points are controlled", () => {
    const state = createGame();
    expect(evaluateCapturePoints(state, "white")).toBe(0);
  });

  it("returns positive when player controls capture points", () => {
    const state = createGame();
    state.capturePoints = { F1: "white", F4: null, F7: null, F10: null };
    expect(evaluateCapturePoints(state, "white")).toBe(80);
  });

  it("gives massive bonus for controlling 3 capture points", () => {
    const state = createGame();
    state.capturePoints = { F1: "white", F4: "white", F7: "white", F10: null };
    const score = evaluateCapturePoints(state, "white");
    // 3*80 - 0 + 500 bonus = 740
    expect(score).toBe(740);
  });

  it("penalizes heavily when opponent controls 3 points", () => {
    const state = createGame();
    state.capturePoints = { F1: "black", F4: "black", F7: "black", F10: null };
    const score = evaluateCapturePoints(state, "white");
    // 0 - 3*80 - 600 = -840
    expect(score).toBe(-840);
  });
});

describe("evaluateRiverAdvancement", () => {
  it("rewards footmen beyond the river", () => {
    const state = createGame();
    // Place a white footman beyond the river (row G, which is beyond for white)
    const footman = makePiece("test-f", "footman", "white", "G", 5);
    setPieceAt(state.board, { row: "G", col: 5 }, footman);

    const score = evaluateRiverAdvancement(state, "white");
    // This footman gets +30 for being beyond river
    // Other footmen are in starting positions (behind river, no bonus)
    expect(score).toBeGreaterThan(0);
  });

  it("rewards archers behind the river", () => {
    // In the initial position, archers start behind the river
    const state = createGame();
    const score = evaluateRiverAdvancement(state, "white");
    // White archers on B (behind) get +20 each = +100
    // Black archers on J (behind for black) get +20 each = +100
    // Symmetric = 0
    expect(Math.abs(score)).toBeLessThan(5);
  });
});

describe("evaluateCenterControl", () => {
  it("returns 0 for symmetric initial position", () => {
    const state = createGame();
    const score = evaluateCenterControl(state, "white");
    expect(Math.abs(score)).toBeLessThan(5);
  });
});
