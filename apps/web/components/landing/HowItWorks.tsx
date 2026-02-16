"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

const steps = [
  {
    number: 1,
    title: "Learn",
    description:
      "Eight hands-on lessons teach movement, capture, and special abilities. Takes about five minutes.",
    link: "/tutorial",
    linkLabel: "Start Tutorial",
  },
  {
    number: 2,
    title: "Play",
    description:
      "Challenge five AI bots from Squire to Warlord difficulty. No account required.",
    link: "/game/bot",
    linkLabel: "Play vs Bot",
  },
  {
    number: 3,
    title: "Compete",
    description:
      "Create a free account. Find opponents online. Climb the Glicko-2 ranked leaderboard.",
    link: "/game/online",
    linkLabel: "Play Online",
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-amber-100 sm:text-4xl">
          Play in Three Steps
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          From beginner to competitor in minutes.
        </p>

        <div
          ref={ref}
          className={`relative mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Connecting line — hidden on mobile */}
          <div className="absolute left-[16.67%] right-[16.67%] top-7 hidden border-t border-dashed border-gray-600 md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-amber-700 text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-bold text-amber-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {step.description}
              </p>
              <Link
                href={step.link}
                className="mt-3 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                {step.linkLabel} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
