"use client";

import { useState, useEffect } from "react";

interface OpponentDisconnectedBannerProps {
  gracePeriodMs: number | null;
}

export function OpponentDisconnectedBanner({
  gracePeriodMs,
}: OpponentDisconnectedBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    gracePeriodMs ? Math.ceil(gracePeriodMs / 1000) : 60,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-lg border border-yellow-600 bg-yellow-950 px-4 py-2 shadow-lg">
      <p className="text-sm text-yellow-300">
        Opponent disconnected. They have{" "}
        <span className="font-bold">{secondsLeft}s</span> to reconnect.
      </p>
    </div>
  );
}
