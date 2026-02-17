"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  puzzleNumber: number;
}

export function ShareButton({ puzzleNumber }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const text = [
      `\u2694\uFE0F Gambit Daily Puzzle #${puzzleNumber}`,
      `\uD83C\uDFC6 Solved!`,
      `playgambit.com/puzzle`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }, [puzzleNumber]);

  return (
    <button
      onClick={handleShare}
      className="w-full rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
    >
      {copied ? "Copied!" : "Share Result"}
    </button>
  );
}
