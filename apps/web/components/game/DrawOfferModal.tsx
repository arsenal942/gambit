"use client";

interface DrawOfferModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function DrawOfferModal({ onAccept, onDecline }: DrawOfferModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="w-72 rounded-xl bg-gray-800 p-6 text-center shadow-2xl">
        <h3 className="text-lg font-bold text-amber-100">Draw Offered</h3>
        <p className="mt-2 text-sm text-gray-400">
          Your opponent offers a draw.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex-1 rounded-lg bg-gray-600 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-500"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
