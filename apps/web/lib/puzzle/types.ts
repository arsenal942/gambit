import type { GameAction, Player } from "@gambit/engine";
import type { BoardSetup } from "@/lib/tutorial/types";

export interface SolutionStep {
  /** One or more accepted correct player moves for this step */
  playerMoves: GameAction[];
  /** Auto-played opponent response after correct player move (omit on final step) */
  opponentResponse?: GameAction;
}

export interface Puzzle {
  id: number;
  title: string;
  objective: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  boardSetup: BoardSetup;
  solution: SolutionStep[];
  hint: string;
}

export interface PuzzleProgress {
  solved: Record<number, boolean>;
  currentStreak: number;
  lastSolvedDate: string | null;
}
