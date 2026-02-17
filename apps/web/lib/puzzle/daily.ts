import { PUZZLES } from "./puzzles";
import type { Puzzle } from "./types";

/** Epoch date for daily puzzle rotation */
const EPOCH = new Date("2026-02-16T00:00:00");

/** Milliseconds in a day */
const MS_PER_DAY = 86_400_000;

/**
 * Returns the daily puzzle number (1-indexed) for today.
 * Deterministic: same number for all users on the same day.
 */
export function getDailyPuzzleNumber(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceEpoch = Math.floor(
    (today.getTime() - EPOCH.getTime()) / MS_PER_DAY,
  );
  const index = ((daysSinceEpoch % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return index + 1;
}

/**
 * Returns a puzzle by its 1-indexed number.
 */
export function getPuzzleByNumber(n: number): Puzzle {
  const index = ((n - 1) % PUZZLES.length + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index];
}

/**
 * Returns today's daily puzzle.
 */
export function getDailyPuzzle(): Puzzle {
  return getPuzzleByNumber(getDailyPuzzleNumber());
}

/**
 * Total number of puzzles available.
 */
export const TOTAL_PUZZLES = PUZZLES.length;
