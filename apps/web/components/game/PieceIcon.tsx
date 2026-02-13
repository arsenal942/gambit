"use client";

import type { Piece } from "@gambit/engine";
import { TILE_SIZE, PIECE_COLORS } from "@/lib/constants";
import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";

interface PieceIconProps {
  piece: Piece;
  isSelected?: boolean;
}

export function PieceIcon({ piece, isSelected }: PieceIconProps) {
  const x = posToSvgX(piece.position) + TILE_SIZE / 2;
  const y = posToSvgY(piece.position) + TILE_SIZE / 2;
  const colors = PIECE_COLORS[piece.player];

  return (
    <g>
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={26}
          fill="none"
          stroke="#FACC15"
          strokeWidth={3}
          opacity={0.8}
        >
          <animate
            attributeName="r"
            values="24;27;24"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {piece.type === "footman" && (
        <FootmanShape x={x} y={y} fill={colors.fill} stroke={colors.stroke} />
      )}
      {piece.type === "archer" && (
        <ArcherShape x={x} y={y} fill={colors.fill} stroke={colors.stroke} />
      )}
      {piece.type === "knight" && (
        <KnightShape x={x} y={y} fill={colors.fill} stroke={colors.stroke} />
      )}
    </g>
  );
}

function FootmanShape({ x, y, fill, stroke }: { x: number; y: number; fill: string; stroke: string }) {
  // Shield shape
  return (
    <g>
      <path
        d={`M ${x - 12} ${y - 14} L ${x + 12} ${y - 14} L ${x + 12} ${y + 4} L ${x} ${y + 18} L ${x - 12} ${y + 4} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={stroke} strokeWidth={1.5} />
      <line x1={x - 7} y1={y - 2} x2={x + 7} y2={y - 2} stroke={stroke} strokeWidth={1.5} />
    </g>
  );
}

function ArcherShape({ x, y, fill, stroke }: { x: number; y: number; fill: string; stroke: string }) {
  // Bow and arrow
  return (
    <g>
      <circle cx={x} cy={y} r={18} fill={fill} stroke={stroke} strokeWidth={2} />
      {/* Bow arc */}
      <path
        d={`M ${x - 6} ${y - 14} Q ${x + 12} ${y} ${x - 6} ${y + 14}`}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
      />
      {/* Arrow */}
      <line x1={x - 12} y1={y} x2={x + 8} y2={y} stroke={stroke} strokeWidth={1.5} />
      <polygon
        points={`${x + 8},${y - 3} ${x + 14},${y} ${x + 8},${y + 3}`}
        fill={stroke}
      />
    </g>
  );
}

function KnightShape({ x, y, fill, stroke }: { x: number; y: number; fill: string; stroke: string }) {
  // Horse head silhouette
  return (
    <g>
      <circle cx={x} cy={y} r={18} fill={fill} stroke={stroke} strokeWidth={2} />
      {/* Simplified horse head */}
      <path
        d={`M ${x - 8} ${y + 12} L ${x - 8} ${y - 4} L ${x - 4} ${y - 12} L ${x + 4} ${y - 14} L ${x + 8} ${y - 8} L ${x + 6} ${y - 2} L ${x + 10} ${y + 2} L ${x + 6} ${y + 4} L ${x + 4} ${y + 12} Z`}
        fill={stroke}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Eye */}
      <circle cx={x + 2} cy={y - 6} r={2} fill={fill} />
    </g>
  );
}
