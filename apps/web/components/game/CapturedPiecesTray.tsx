"use client";

import type { Piece, Player } from "@gambit/engine";
import { PIECE_COLORS } from "@/lib/constants";
import { playerName } from "@/lib/engine-helpers";

interface CapturedPiecesTrayProps {
  capturedPieces: { white: Piece[]; black: Piece[] };
}

export function CapturedPiecesTray({ capturedPieces }: CapturedPiecesTrayProps) {
  return (
    <div className="space-y-2">
      <PlayerCaptures player="white" pieces={capturedPieces.white} />
      <PlayerCaptures player="black" pieces={capturedPieces.black} />
    </div>
  );
}

function PlayerCaptures({ player, pieces }: { player: Player; pieces: Piece[] }) {
  if (pieces.length === 0) return null;
  const colors = PIECE_COLORS[player];

  return (
    <div className="rounded-lg bg-gray-800 px-3 py-2">
      <div className="mb-1 text-xs text-gray-400">
        Captured {playerName(player)} pieces
      </div>
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
            style={{
              backgroundColor: colors.fill,
              color: colors.stroke,
              border: `1px solid ${colors.stroke}`,
            }}
            title={`${piece.type} (${piece.id})`}
          >
            {piece.type[0].toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
