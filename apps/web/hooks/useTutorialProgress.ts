"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { TutorialProgress } from "@/lib/tutorial/types";
import { LESSONS } from "@/lib/tutorial/lessons";

const STORAGE_KEY = "gambit-tutorial-progress";

function loadProgress(): TutorialProgress {
  if (typeof window === "undefined") {
    return { completedLessons: [], lastLesson: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [], lastLesson: null };
    return JSON.parse(raw) as TutorialProgress;
  } catch {
    return { completedLessons: [], lastLesson: null };
  }
}

function saveProgress(progress: TutorialProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useTutorialProgress() {
  const [progress, setProgress] = useState<TutorialProgress>(loadProgress);
  const { user } = useAuth();

  // Sync from Supabase on mount if logged in
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    supabase
      .from("profiles")
      .select("tutorial_completed, tutorial_lessons_completed")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const local = loadProgress();
        const supabaseCount = data.tutorial_lessons_completed ?? 0;

        // Use whichever has more progress
        if (supabaseCount > local.completedLessons.length) {
          const completedLessons = LESSONS.slice(0, supabaseCount).map((l) => l.id);
          const synced: TutorialProgress = {
            completedLessons,
            lastLesson: local.lastLesson,
          };
          setProgress(synced);
          saveProgress(synced);
        }
      });
  }, [user]);

  const markLessonComplete = useCallback(
    (lessonId: string) => {
      setProgress((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;

        const next: TutorialProgress = {
          completedLessons: [...prev.completedLessons, lessonId],
          lastLesson: prev.lastLesson,
        };
        saveProgress(next);

        // Persist to Supabase
        if (user) {
          const supabase = createClient();
          if (supabase) {
            const isAllComplete = next.completedLessons.length >= LESSONS.length;
            supabase
              .from("profiles")
              .update({
                tutorial_lessons_completed: next.completedLessons.length,
                tutorial_completed: isAllComplete,
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

  const setLastLesson = useCallback((lessonId: string) => {
    setProgress((prev) => {
      const next: TutorialProgress = { ...prev, lastLesson: lessonId };
      saveProgress(next);
      return next;
    });
  }, []);

  const isLessonComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons],
  );

  const getNextLesson = useCallback(() => {
    for (const lesson of LESSONS) {
      if (!progress.completedLessons.includes(lesson.id)) {
        return lesson;
      }
    }
    return null;
  }, [progress.completedLessons]);

  const resetProgress = useCallback(() => {
    const empty: TutorialProgress = { completedLessons: [], lastLesson: null };
    setProgress(empty);
    saveProgress(empty);
  }, []);

  return {
    progress,
    completedCount: progress.completedLessons.length,
    totalLessons: LESSONS.length,
    markLessonComplete,
    setLastLesson,
    isLessonComplete,
    getNextLesson,
    resetProgress,
  };
}
