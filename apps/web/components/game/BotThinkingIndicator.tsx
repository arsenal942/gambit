"use client";

export function BotThinkingIndicator({ botName }: { botName: string }) {
  return (
    <div className="rounded-lg bg-gray-800 px-4 py-2 text-center text-xs text-amber-200">
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          <div
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span>{botName} is thinking...</span>
      </div>
    </div>
  );
}
