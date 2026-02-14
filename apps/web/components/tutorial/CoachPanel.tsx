"use client";

interface CoachPanelProps {
  text: string;
  showContinue?: boolean;
  onContinue?: () => void;
  successText?: string | null;
  wrongMoveText?: string | null;
  hintText?: string | null;
  stepLabel?: string;
}

export function CoachPanel({
  text,
  showContinue = false,
  onContinue,
  successText,
  wrongMoveText,
  hintText,
  stepLabel,
}: CoachPanelProps) {
  return (
    <div className="space-y-3">
      {/* Main coach message */}
      <div className="tutorial-coach-enter rounded-xl border border-amber-800/40 bg-gray-800/90 px-5 py-4">
        {stepLabel && (
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-500/70">
            {stepLabel}
          </div>
        )}
        <p className="text-base leading-relaxed text-gray-200">{text}</p>

        {showContinue && onContinue && (
          <button
            onClick={onContinue}
            className="mt-4 rounded-lg bg-amber-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Continue
          </button>
        )}
      </div>

      {/* Success message */}
      {successText && (
        <div className="tutorial-coach-enter rounded-lg border border-green-700/40 bg-green-950/80 px-4 py-3">
          <p className="text-sm text-green-300">{successText}</p>
        </div>
      )}

      {/* Wrong move message */}
      {wrongMoveText && (
        <div className="tutorial-coach-enter rounded-lg border border-yellow-700/40 bg-yellow-950/80 px-4 py-3">
          <p className="text-sm text-yellow-300">{wrongMoveText}</p>
        </div>
      )}

      {/* Hint */}
      {hintText && !successText && !wrongMoveText && (
        <div className="tutorial-coach-enter rounded-lg border border-blue-700/30 bg-blue-950/60 px-4 py-3">
          <p className="text-sm text-blue-300">
            <span className="mr-1.5">&#128161;</span>
            {hintText}
          </p>
        </div>
      )}
    </div>
  );
}
