"use client";

import Link from "next/link";
import { useTutorialProgress } from "@/hooks/useTutorialProgress";
import { LESSONS } from "@/lib/tutorial/lessons";

export function TutorialHub() {
  const { progress, completedCount, totalLessons } = useTutorialProgress();

  const allComplete = completedCount >= totalLessons;
  const percentage = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-amber-100">
          Learn to Play
        </h1>
        <p className="mt-2 text-gray-400">
          Master every unit and mechanic in 8 hands-on lessons
        </p>

        {/* Overall progress */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">
            {completedCount}/{totalLessons}
          </span>
        </div>

        {allComplete && (
          <p className="mt-3 text-sm text-green-400">
            Tutorial complete! You&apos;re ready for battle.
          </p>
        )}
      </div>

      {/* Lesson list */}
      <div className="space-y-3">
        {LESSONS.map((lesson) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const nextLesson = LESSONS.find(
            (l) => !progress.completedLessons.includes(l.id),
          );
          const isNext = nextLesson?.id === lesson.id;
          const isPastNext =
            !isCompleted &&
            !isNext &&
            lesson.number > (nextLesson?.number ?? 0);

          return (
            <Link
              key={lesson.id}
              href={`/tutorial/${lesson.id}`}
              className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all ${
                isCompleted
                  ? "border-green-800/30 bg-green-950/20 hover:bg-green-950/30"
                  : isNext
                    ? "border-amber-700/50 bg-amber-950/20 hover:bg-amber-950/30 shadow-md shadow-amber-900/10"
                    : isPastNext
                      ? "border-gray-700/30 bg-gray-800/30 opacity-50 hover:opacity-70"
                      : "border-gray-700/40 bg-gray-800/40 hover:bg-gray-800/60"
              }`}
            >
              {/* Number / check */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted
                    ? "bg-green-800 text-green-200"
                    : isNext
                      ? "bg-amber-700 text-white"
                      : "bg-gray-700 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <span>&#10003;</span>
                ) : (
                  lesson.number
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-semibold ${
                    isCompleted
                      ? "text-green-200"
                      : isNext
                        ? "text-amber-100"
                        : "text-gray-300"
                  }`}
                >
                  {lesson.title}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {lesson.description}
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <span className="text-xs text-gray-500">Replay</span>
                ) : isNext ? (
                  <span className="rounded-md bg-amber-700 px-3 py-1 text-xs font-semibold text-white">
                    {progress.completedLessons.length === 0 ? "Start" : "Continue"}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {allComplete && (
          <Link
            href="/game/bot"
            className="rounded-lg bg-amber-700 px-8 py-3 text-center font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Play vs Squire Bot
          </Link>
        )}
        <Link
          href="/"
          className="text-sm text-gray-500 transition-colors hover:text-gray-400"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
