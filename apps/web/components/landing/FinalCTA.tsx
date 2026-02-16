"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

interface FinalCTAProps {
  isLoggedIn: boolean;
}

export function FinalCTA({ isLoggedIn }: FinalCTAProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-gray-800/30 px-4 py-20">
      <div
        ref={ref}
        className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="text-3xl font-bold text-amber-100 sm:text-4xl">
          Ready to Play?
        </h2>
        <p className="mt-3 text-lg text-gray-400">
          No account required. No download. Just click and play.
        </p>

        <div className="mt-8">
          <Link
            href="/game/bot"
            className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-600 hover:shadow-xl hover:shadow-amber-900/50 sm:text-xl"
          >
            Play Free Now
          </Link>
        </div>

        {!isLoggedIn && (
          <p className="mt-6 text-sm text-gray-500">
            Want to track your rating?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              Sign up free &rarr;
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
