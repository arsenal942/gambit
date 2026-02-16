"use client";

import Link from "next/link";
import { FootmanIcon, ArcherIcon, KnightIcon } from "./DecorativePieces";

interface HeroSectionProps {
  profile: { username: string; rating: number | null; games_played: number } | null;
  loading: boolean;
}

export function HeroSection({ profile, loading }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative floating pieces — hidden on mobile */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <FootmanIcon
          size={80}
          className="absolute left-[8%] top-[15%] animate-float-piece text-amber-400"
        />
        <ArcherIcon
          size={64}
          className="absolute right-[10%] top-[20%] animate-float-piece-slow text-amber-300"
        />
        <KnightIcon
          size={72}
          className="absolute left-[12%] bottom-[20%] animate-float-piece-slow text-amber-500"
        />
        <FootmanIcon
          size={56}
          className="absolute right-[15%] bottom-[25%] animate-float-piece text-amber-200"
        />
        <ArcherIcon
          size={48}
          className="absolute left-[25%] top-[8%] animate-float-piece text-amber-400/50"
        />
        <KnightIcon
          size={60}
          className="absolute right-[25%] bottom-[12%] animate-float-piece-slow text-amber-300/50"
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center">
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl">
          GAMBIT
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300 sm:text-xl">
          A free tactical board game where three unique units fight across a
          river for territory
        </p>
        <p className="mt-3 text-base text-gray-500 italic sm:text-lg">
          Think chess meets Advance Wars. Play in your browser in 30 seconds.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/game/bot"
            className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-600 hover:shadow-xl hover:shadow-amber-900/50 sm:text-xl"
          >
            Play Free Now
          </Link>
          <Link
            href="/tutorial"
            className="text-base font-medium text-amber-400 transition-colors hover:text-amber-300 sm:text-lg"
          >
            Learn to Play &rarr;
          </Link>
        </div>

        {/* Logged-in user welcome */}
        {!loading && profile && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
            <span>
              Welcome back, <span className="text-amber-200">{profile.username}</span>
              {profile.rating !== null && (
                <> &middot; {Math.round(profile.rating)}</>
              )}
            </span>
            <span className="text-gray-600">|</span>
            <Link
              href="/game/online"
              className="text-amber-400/80 transition-colors hover:text-amber-300"
            >
              Play Online
            </Link>
            <Link
              href="/leaderboard"
              className="text-amber-400/80 transition-colors hover:text-amber-300"
            >
              Leaderboard
            </Link>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce-down text-gray-600">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
