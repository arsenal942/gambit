import { describe, it, expect } from "vitest";
import { BOT_PROFILES, getBotProfile, getAllBotProfiles } from "../../src/ai/bots.js";
import { findBestAction } from "../../src/ai/search.js";
import { createGame, executeMove } from "../../src/game.js";

describe("BOT_PROFILES", () => {
  it("has all 5 expected profiles", () => {
    expect(Object.keys(BOT_PROFILES)).toHaveLength(5);
    expect(BOT_PROFILES.squire).toBeDefined();
    expect(BOT_PROFILES.soldier).toBeDefined();
    expect(BOT_PROFILES.captain).toBeDefined();
    expect(BOT_PROFILES.commander).toBeDefined();
    expect(BOT_PROFILES.warlord).toBeDefined();
  });

  it("has increasing depths", () => {
    const profiles = getAllBotProfiles();
    for (let i = 1; i < profiles.length; i++) {
      expect(profiles[i].depth).toBeGreaterThanOrEqual(profiles[i - 1].depth);
    }
  });

  it("has increasing ratings", () => {
    const profiles = getAllBotProfiles();
    for (let i = 1; i < profiles.length; i++) {
      expect(profiles[i].rating).toBeGreaterThan(profiles[i - 1].rating);
    }
  });

  it("has decreasing randomness", () => {
    const profiles = getAllBotProfiles();
    for (let i = 1; i < profiles.length; i++) {
      expect(profiles[i].randomness).toBeLessThanOrEqual(profiles[i - 1].randomness);
    }
  });

  it("all profiles have valid fields", () => {
    for (const profile of getAllBotProfiles()) {
      expect(profile.id).toBeTruthy();
      expect(profile.name).toBeTruthy();
      expect(profile.description).toBeTruthy();
      expect(profile.rating).toBeGreaterThan(0);
      expect(profile.depth).toBeGreaterThanOrEqual(1);
      expect(profile.timeLimitMs).toBeGreaterThan(0);
      expect(profile.randomness).toBeGreaterThanOrEqual(0);
      expect(profile.randomness).toBeLessThanOrEqual(1);
      expect(profile.artificialDelayMs[0]).toBeLessThanOrEqual(profile.artificialDelayMs[1]);
      expect(profile.evaluationWeights.material).toBeGreaterThan(0);
    }
  });
});

describe("getBotProfile", () => {
  it("returns the correct profile by id", () => {
    expect(getBotProfile("squire")).toBe(BOT_PROFILES.squire);
    expect(getBotProfile("warlord")).toBe(BOT_PROFILES.warlord);
  });

  it("returns undefined for unknown id", () => {
    expect(getBotProfile("unknown")).toBeUndefined();
  });
});

describe("getAllBotProfiles", () => {
  it("returns all 5 profiles in order", () => {
    const profiles = getAllBotProfiles();
    expect(profiles).toHaveLength(5);
    expect(profiles[0].id).toBe("squire");
    expect(profiles[4].id).toBe("warlord");
  });
});

describe("bot behavior differences", () => {
  it("all bots produce a legal move for the initial position", () => {
    const state = createGame();
    for (const profile of getAllBotProfiles()) {
      const result = findBestAction(state, profile);
      expect(result.action).toBeDefined();
      expect(() => executeMove(state, result.action)).not.toThrow();
    }
  });

  it("all bots produce a legal move for various mid-game positions", () => {
    // Position 1: After some development
    let state1 = createGame();
    state1 = executeMove(state1, { type: "move", pieceId: "white-footman-13", to: { col: 5, row: "E" } });
    state1 = executeMove(state1, { type: "move", pieceId: "black-footman-18", to: { col: 6, row: "G" } });

    // Position 2: After more development
    let state2 = state1;
    state2 = executeMove(state2, { type: "move", pieceId: "white-knight-3", to: { col: 4, row: "C" } });
    state2 = executeMove(state2, { type: "move", pieceId: "black-knight-28", to: { col: 5, row: "I" } });

    for (const profile of getAllBotProfiles()) {
      const result1 = findBestAction(state1, profile);
      expect(() => executeMove(state1, result1.action)).not.toThrow();

      const result2 = findBestAction(state2, profile);
      expect(() => executeMove(state2, result2.action)).not.toThrow();
    }
  });
});
