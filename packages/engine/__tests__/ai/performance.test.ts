import { describe, it, expect } from "vitest";
import { findBestAction } from "../../src/ai/search.js";
import { BOT_PROFILES } from "../../src/ai/bots.js";
import { createGame, executeMove } from "../../src/game.js";

function createMidGameState() {
  let state = createGame();
  // Advance a few pieces to create a mid-game position
  state = executeMove(state, { type: "move", pieceId: "white-footman-13", to: { col: 5, row: "E" } });
  state = executeMove(state, { type: "move", pieceId: "black-footman-18", to: { col: 6, row: "G" } });
  state = executeMove(state, { type: "move", pieceId: "white-footman-14", to: { col: 7, row: "E" } });
  state = executeMove(state, { type: "move", pieceId: "black-footman-19", to: { col: 8, row: "G" } });
  state = executeMove(state, { type: "move", pieceId: "white-knight-3", to: { col: 4, row: "C" } });
  state = executeMove(state, { type: "move", pieceId: "black-knight-28", to: { col: 5, row: "I" } });
  return state;
}

describe("performance benchmarks", () => {
  const midGame = createMidGameState();

  it("squire responds in < 500ms", () => {
    const start = Date.now();
    const result = findBestAction(midGame, BOT_PROFILES.squire);
    const elapsed = Date.now() - start;
    expect(result.action).toBeDefined();
    expect(elapsed).toBeLessThan(500);
  });

  it("soldier responds in < 1500ms", () => {
    const start = Date.now();
    const result = findBestAction(midGame, BOT_PROFILES.soldier);
    const elapsed = Date.now() - start;
    expect(result.action).toBeDefined();
    expect(elapsed).toBeLessThan(1500);
  });

  it("captain responds in < 3000ms", () => {
    const start = Date.now();
    const result = findBestAction(midGame, BOT_PROFILES.captain);
    const elapsed = Date.now() - start;
    expect(result.action).toBeDefined();
    expect(elapsed).toBeLessThan(3000);
  });

  it("commander responds in < 6000ms", () => {
    const start = Date.now();
    const result = findBestAction(midGame, BOT_PROFILES.commander);
    const elapsed = Date.now() - start;
    expect(result.action).toBeDefined();
    expect(elapsed).toBeLessThan(6000);
  });

  it("warlord responds in < 8000ms", () => {
    const start = Date.now();
    const result = findBestAction(midGame, BOT_PROFILES.warlord);
    const elapsed = Date.now() - start;
    expect(result.action).toBeDefined();
    expect(elapsed).toBeLessThan(8000);
  });
});
