"use client";

import { useState } from "react";
import Link from "next/link";

interface WaitingOverlayProps {
  gameId: string;
}

export function WaitingOverlay({ gameId }: WaitingOverlayProps) {
  const [copied, setCopied] = useState(false);

  const gameUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/game/${gameId}`
      : gameId;

  function handleCopy() {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-100">
          Waiting for Opponent
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Share this code with your opponent
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6 text-center">
        <p className="mb-2 text-xs text-gray-500 uppercase tracking-wider">
          Game Code
        </p>
        <p className="font-mono text-2xl font-bold text-amber-100 select-all">
          {gameId}
        </p>
        <button
          onClick={handleCopy}
          className="mt-4 w-full rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        <span className="text-sm">Waiting...</span>
      </div>

      <Link
        href="/game/online"
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        Cancel
      </Link>
    </main>
  );
}
