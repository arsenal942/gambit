"use client";

import type { Position } from "@gambit/engine";
import { TILE_SIZE, ACTION_COLORS } from "@/lib/constants";
import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";

interface PushbackArrow {
  fromPosition: Position;
  direction: [number, number];
  resultingPosition: Position;
}

interface PushbackArrowsProps {
  arrows: PushbackArrow[];
  onArrowClick: (direction: [number, number], resultingPosition: Position) => void;
}

export function PushbackArrows({ arrows, onArrowClick }: PushbackArrowsProps) {
  return (
    <>
      {arrows.map((arrow) => {
        const fromX = posToSvgX(arrow.fromPosition) + TILE_SIZE / 2;
        const fromY = posToSvgY(arrow.fromPosition) + TILE_SIZE / 2;

        // Arrow direction in SVG space: row delta is flipped (positive = up in game, down in SVG)
        const dx = arrow.direction[1] * 25;
        const dy = -arrow.direction[0] * 25; // flip row delta for SVG

        const endX = fromX + dx;
        const endY = fromY + dy;

        // Arrowhead
        const angle = Math.atan2(dy, dx);
        const headLen = 8;
        const ax1 = endX - headLen * Math.cos(angle - 0.5);
        const ay1 = endY - headLen * Math.sin(angle - 0.5);
        const ax2 = endX - headLen * Math.cos(angle + 0.5);
        const ay2 = endY - headLen * Math.sin(angle + 0.5);

        const key = `arrow-${arrow.direction[0]}-${arrow.direction[1]}`;

        return (
          <g
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              onArrowClick(arrow.direction, arrow.resultingPosition);
            }}
            className="cursor-pointer"
          >
            {/* Hit area */}
            <circle
              cx={endX}
              cy={endY}
              r={16}
              fill="transparent"
            />
            <line
              x1={fromX}
              y1={fromY}
              x2={endX}
              y2={endY}
              stroke={ACTION_COLORS.pushback}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <polygon
              points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`}
              fill={ACTION_COLORS.pushback}
            />
          </g>
        );
      })}
    </>
  );
}
