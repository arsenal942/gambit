"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSoundPreferences } from "@/hooks/useSoundPreferences";
import { SoundSettings } from "@/components/SoundSettings";

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Header() {
  const { user, profile, loading, signOut, isConfigured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const { preferences, toggleEnabled } = useSoundPreferences();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#1a1a2e]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          {/* Left: Logo + Nav (desktop) */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-amber-100"
            >
              Gambit
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/tutorial"
                className="text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                Learn
              </Link>
              <Link
                href="/puzzle"
                className="text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                Puzzles
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

          {/* Right: Sound + Auth (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={toggleEnabled}
              onContextMenu={(e) => {
                e.preventDefault();
                setSoundSettingsOpen(true);
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
              title={
                preferences.enabled
                  ? "Mute sound (right-click for settings)"
                  : "Unmute sound (right-click for settings)"
              }
              aria-label={preferences.enabled ? "Mute sound" : "Unmute sound"}
            >
              <SpeakerIcon muted={!preferences.enabled} />
            </button>

            {/* Sound settings gear icon — desktop only */}
            <button
              onClick={() => setSoundSettingsOpen(true)}
              className="hidden rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 sm:block"
              title="Sound settings"
              aria-label="Sound settings"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Desktop auth */}
            <div className="hidden sm:block">
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
                    <span className="max-w-[120px] truncate">{profile.username}</span>
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

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 sm:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-800 sm:hidden">
            <nav className="flex flex-col px-4 py-3">
              <Link
                href="/tutorial"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Learn
              </Link>
              <Link
                href="/puzzle"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Puzzles
              </Link>
              <Link
                href="/game/online"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Play
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Leaderboard
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSoundSettingsOpen(true);
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                Sound Settings
              </button>

              <div className="my-2 border-t border-gray-800" />

              {!isConfigured ? null : loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-gray-800" />
              ) : user && profile ? (
                <>
                  <Link
                    href={`/profile/${profile.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
                      {profile.username[0].toUpperCase()}
                    </span>
                    <span className="truncate">{profile.username}</span>
                    {profile.rating !== null && (
                      <span className="text-xs text-amber-400">
                        {Math.round(profile.rating)}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : user && !profile ? (
                <Link
                  href="/auth/profile-setup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-gray-800"
                >
                  Complete Setup
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-gray-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Sound settings modal */}
      {soundSettingsOpen && (
        <SoundSettings onClose={() => setSoundSettingsOpen(false)} />
      )}
    </>
  );
}
