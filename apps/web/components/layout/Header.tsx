"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export function Header() {
  const { user, profile, loading, signOut, isConfigured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#1a1a2e]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-amber-100"
          >
            Gambit
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/tutorial"
              className="text-sm text-gray-400 transition-colors hover:text-gray-200"
            >
              Learn
            </Link>
            <Link
              href="/game/online"
              className="text-sm text-gray-400 transition-colors hover:text-gray-200"
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-gray-400 transition-colors hover:text-gray-200"
            >
              Leaderboard
            </Link>
          </nav>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center">
          {!isConfigured ? null : loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-800" />
          ) : user && profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-200 transition-colors hover:bg-gray-800"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
                  {profile.username[0].toUpperCase()}
                </span>
                <span>{profile.username}</span>
                {profile.rating !== null && (
                  <span className="text-xs text-amber-400">
                    {Math.round(profile.rating)}
                  </span>
                )}
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-lg">
                    <Link
                      href={`/profile/${profile.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : user && !profile ? (
            <Link
              href="/auth/profile-setup"
              className="rounded-lg bg-amber-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Complete Setup
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-in"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-amber-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
