"use client";

import { useScrollReveal } from "./useScrollReveal";

export function TrailerSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-gray-800/30 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-amber-100 sm:text-4xl">
          See It in Action
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          Watch a game unfold and see what makes Gambit different.
        </p>

        <div
          ref={ref}
          className={`mt-10 overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl shadow-black/30 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative aspect-video w-full">
            <iframe
              src="https://www.youtube-nocookie.com/embed/R2Car7kOm9w"
              title="Gambit Gameplay Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
