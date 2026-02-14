"use client";

import { LESSONS } from "@/lib/tutorial/lessons";

interface TutorialProgressBarProps {
  currentLessonNumber: number;
  completedLessons: string[];
}

export function TutorialProgressBar({
  currentLessonNumber,
  completedLessons,
}: TutorialProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {LESSONS.map((lesson) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isCurrent = lesson.number === currentLessonNumber;

        return (
          <div
            key={lesson.id}
            className="flex flex-col items-center gap-1"
            title={`Lesson ${lesson.number}: ${lesson.title}`}
          >
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                isCompleted
                  ? "bg-amber-500"
                  : isCurrent
                    ? "bg-amber-400 ring-2 ring-amber-400/40 ring-offset-1 ring-offset-gray-900"
                    : "bg-gray-700"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
