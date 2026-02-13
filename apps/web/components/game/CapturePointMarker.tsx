"use client";

import { CAPTURE_POINT_POSITIONS, type Position } from "@gambit/engine";
import { TILE_SIZE } from "@/lib/constants";
import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";

export function CapturePointMarkers() {
  return (
    <>
      {CAPTURE_POINT_POSITIONS.map((pos) => {
        const x = posToSvgX(pos) + TILE_SIZE / 2;
        const y = posToSvgY(pos) + TILE_SIZE / 2;
        return (
          <g key={`cp-${pos.row}${pos.col}`}>
            {/* Diamond shape marker */}
            <polygon
              points={`${x},${y - 10} ${x + 7},${y} ${x},${y + 10} ${x - 7},${y}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth={2}
              opacity={0.7}
            />
          </g>
        );
      })}
    </>
  );
}
