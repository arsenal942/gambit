"use client";

import { isDarkTile, isRiver, type Position } from "@gambit/engine";
import { TILE_SIZE, TILE_COLORS } from "@/lib/constants";
import { posToSvgX, posToSvgY } from "@/lib/engine-helpers";

interface BoardTileProps {
  position: Position;
}

export function BoardTile({ position }: BoardTileProps) {
  const x = posToSvgX(position);
  const y = posToSvgY(position);
  const dark = isDarkTile(position);
  const river = isRiver(position);

  let fill: string;
  if (river) {
    fill = dark ? TILE_COLORS.riverDark : TILE_COLORS.riverLight;
  } else {
    fill = dark ? TILE_COLORS.dark : TILE_COLORS.light;
  }

  return (
    <rect
      x={x}
      y={y}
      width={TILE_SIZE}
      height={TILE_SIZE}
      fill={fill}
    />
  );
}
