"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { PuzzleProgress } from "@/lib/puzzle/types";
import { TOTAL_PUZZLES } from "@/lib/puzzle/daily";

const STORAGE_KEY = "gambit-puzzle-progress";

function loadProgress(): PuzzleProgress {
  if (typeof window === "undefined") {
    return { solved: {}, currentStreak: 0, lastSolvedDate: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { solved: {}, currentStreak: 0, lastSolvedDate: null };
    return JSON.parse(raw) as PuzzleProgress;
  } catch {
    return { solved: {}, currentStreak: 0, lastSolvedDate: null };
  }
}

function saveProgress(progress: PuzzleProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function usePuzzleProgress() {
  const [progress, setProgress] = useState<PuzzleProgress>(loadProgress);
  const { user } = useAuth();

  // Sync from Supabase on mount if logged in
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    supabase
      .from("profiles")
      .select("puzzles_solved, puzzle_streak, puzzle_last_solved_date")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const local = loadProgress();
        const remoteSolved: number[] = data.puzzles_solved ?? [];
        const localSolvedIds = Object.keys(local.solved).map(Number);

        // Merge: use whichever has more puzzles solved
        if (remoteSolved.length > localSolvedIds.length) {
          const solvedMap: Record<number, boolean> = {};
          for (const id of remoteSolved) {
            solvedMap[id] = true;
          }
          const synced: PuzzleProgress = {
            solved: solvedMap,
            currentStreak: data.puzzle_streak ?? 0,
            lastSolvedDate: data.puzzle_last_solved_date ?? null,
          };
          setProgress(synced);
          saveProgress(synced);
        } else if (localSolvedIds.length > remoteSolved.length) {
          // Local has more — push to Supabase
          supabase
            .from("profiles")
            .update({
              puzzles_solved: localSolvedIds,
              puzzle_streak: local.currentStreak,
              puzzle_last_solved_date: local.lastSolvedDate,
            })
            .eq("id", user.id)
            .then(() => {});
        }
      });
  }, [user]);

  const markSolved = useCallback(
    (puzzleId: number) => {
      setProgress((prev) => {
        if (prev.solved[puzzleId]) return prev;

        const today = todayString();
        let newStreak = prev.currentStreak;

        if (prev.lastSolvedDate === null) {
          newStreak = 1;
        } else {
          const lastDate = new Date(prev.lastSolvedDate);
          const todayDate = new Date(today);
          const diffMs = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffMs / 86_400_000);

          if (diffDays === 1) {
            newStreak = prev.currentStreak + 1;
          } else if (diffDays === 0) {
            newStreak = prev.currentStreak;
          } else {
            newStreak = 1;
          }
        }

        const next: PuzzleProgress = {
          solved: { ...prev.solved, [puzzleId]: true },
          currentStreak: newStreak,
          lastSolvedDate: today,
        };
        saveProgress(next);

        // Persist to Supabase
        if (user) {
          const supabase = createClient();
          if (supabase) {
            const solvedIds = Object.keys(next.solved).map(Number);
            supabase
              .from("profiles")
              .update({
                puzzles_solved: solvedIds,
                puzzle_streak: newStreak,
                puzzle_last_solved_date: today,
              })
              .eq("id", user.id)
              .then(() => {});
          }
        }

        return next;
      });
    },
    [user],
  );

  const isSolved = useCallback(
    (puzzleId: number) => !!progress.solved[puzzleId],
    [progress.solved],
  );

  const solvedCount = Object.keys(progress.solved).length;

  return {
    progress,
    solvedCount,
    totalPuzzles: TOTAL_PUZZLES,
    currentStreak: progress.currentStreak,
    markSolved,
    isSolved,
  };
}
