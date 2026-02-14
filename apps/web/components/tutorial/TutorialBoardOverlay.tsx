"use client";

import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";
import { TILE_SIZE } from "@/lib/constants";
import type { TileHighlightDef, AnnotationArrow } from "@/lib/tutorial/types";
import type { Position } from "@gambit/engine";

interface TutorialBoardOverlayProps {
  highlights?: TileHighlightDef[];
  arrows?: AnnotationArrow[];
  pulsingPiecePositions?: Position[];
}

export function TutorialBoardOverlay({
  highlights,
  arrows,
  pulsingPiecePositions,
}: TutorialBoardOverlayProps) {
  return (
    <g className="pointer-events-none">
      {/* Tile highlights */}
      {highlights?.map((h, i) => (
        <g key={`highlight-${i}`}>
          <rect
            x={posToSvgX(h.position)}
            y={posToSvgY(h.position)}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={h.color}
            className="tutorial-highlight-pulse"
          />
          {h.label && (
            <text
              x={posToSvgX(h.position) + TILE_SIZE / 2}
              y={posToSvgY(h.position) + TILE_SIZE / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight="bold"
              fill="white"
              opacity={0.8}
            >
              {h.label}
            </text>
          )}
        </g>
      ))}

      {/* Annotation arrows */}
      {arrows?.map((arrow, i) => {
        const fromX = posToSvgX(arrow.from) + TILE_SIZE / 2;
        const fromY = posToSvgY(arrow.from) + TILE_SIZE / 2;
        const toX = posToSvgX(arrow.to) + TILE_SIZE / 2;
        const toY = posToSvgY(arrow.to) + TILE_SIZE / 2;

        // Shorten arrow so it doesn't overlap with pieces
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        const shortenBy = 12;
        const endX = toX - (dx / len) * shortenBy;
        const endY = toY - (dy / len) * shortenBy;

        const markerId = `arrow-head-${i}`;

        return (
          <g key={`arrow-${i}`}>
            <defs>
              <marker
                id={markerId}
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={arrow.color} />
              </marker>
            </defs>
            <line
              x1={fromX}
              y1={fromY}
              x2={endX}
              y2={endY}
              stroke={arrow.color}
              strokeWidth={3}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
              opacity={0.8}
            />
          </g>
        );
      })}

      {/* Pulsing rings on specific pieces */}
      {pulsingPiecePositions?.map((pos, i) => (
        <circle
          key={`pulse-${i}`}
          cx={posToSvgX(pos) + TILE_SIZE / 2}
          cy={posToSvgY(pos) + TILE_SIZE / 2}
          r={TILE_SIZE * 0.4}
          fill="none"
          stroke="#FACC15"
          strokeWidth={2.5}
          opacity={0.7}
          className="tutorial-highlight-pulse"
        />
      ))}
    </g>
  );
}
