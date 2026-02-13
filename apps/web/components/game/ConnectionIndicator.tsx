"use client";

import type { ConnectionStatus } from "@/hooks/useOnlineGameState";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; label: string }
> = {
  connected: { color: "bg-green-500", label: "Connected" },
  connecting: { color: "bg-yellow-500", label: "Connecting" },
  reconnecting: { color: "bg-yellow-500", label: "Reconnecting" },
  disconnected: { color: "bg-red-500", label: "Disconnected" },
};

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const { color, label } = STATUS_CONFIG[status];

  return (
    <div className="fixed right-4 top-4 z-30 flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1.5 shadow-lg">
      <div
        className={`h-2 w-2 rounded-full ${color} ${status === "reconnecting" ? "animate-pulse" : ""}`}
      />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
