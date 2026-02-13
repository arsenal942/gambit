"use client";

import type { Position, Piece } from "@gambit/engine";
import { TILE_SIZE, ACTION_COLORS } from "@/lib/constants";
import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";

export type HighlightType = "move" | "capture" | "pushback" | "longshot";

export interface TileHighlight {
  type: HighlightType;
  position: Position;
  targetPiece?: Piece;
}

interface ActionDotsProps {
  highlights: TileHighlight[];
}

export function ActionDots({ highlights }: ActionDotsProps) {
  return (
    <>
      {highlights.map((h) => {
        const cx = posToSvgX(h.position) + TILE_SIZE / 2;
        const cy = posToSvgY(h.position) + TILE_SIZE / 2;
        const color = ACTION_COLORS[h.type];

        if (h.type === "move") {
          // Small circle for move
          return (
            <circle
              key={`dot-${h.position.row}${h.position.col}`}
              cx={cx}
              cy={cy}
              r={8}
              fill={color}
              opacity={0.6}
              className="pointer-events-none"
            />
          );
        }

        // Ring for captures/pushbacks/longshots
        return (
          <circle
            key={`dot-${h.position.row}${h.position.col}-${h.type}`}
            cx={cx}
            cy={cy}
            r={22}
            fill="none"
            stroke={color}
            strokeWidth={3}
            opacity={0.7}
            className="pointer-events-none"
          />
        );
      })}
    </>
  );
}
