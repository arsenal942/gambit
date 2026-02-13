"use client";

import { useCallback, useRef } from "react";
import type { Board, Piece, Position } from "@gambit/engine";
import { indexToPos } from "@gambit/engine";
import {
  TILE_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_COLS,
  BOARD_ROWS,
  ROWS,
  HIGHLIGHT_COLORS,
} from "@/lib/constants";
import { posToSvgX, posToSvgY, svgToPos } from "@/lib/engine-helpers";
import { BoardTile } from "./BoardTile";
import { CapturePointMarkers } from "./CapturePointMarker";
import { PieceIcon } from "./PieceIcon";
import { ActionDots, type TileHighlight } from "./ActionDots";
import { PushbackArrows } from "./PushbackArrows";

interface LastMoveHighlight {
  from: Position;
  to: Position;
}

interface PushbackArrow {
  fromPosition: Position;
  direction: [number, number];
  resultingPosition: Position;
}

interface GameBoardProps {
  board: Board;
  selectedPieceId: string | null;
  highlights: TileHighlight[];
  pushbackArrows: PushbackArrow[];
  lastMove: LastMoveHighlight | null;
  onTileClick: (position: Position) => void;
  onPushDirectionClick: (direction: [number, number], resultingPosition: Position) => void;
}

export function GameBoard({
  board,
  selectedPieceId,
  highlights,
  pushbackArrows,
  lastMove,
  onTileClick,
  onPushDirectionClick,
}: GameBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = BOARD_WIDTH / rect.width;
      const scaleY = BOARD_HEIGHT / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      const pos = svgToPos(svgX, svgY);
      if (pos) onTileClick(pos);
    },
    [onTileClick],
  );

  // Collect all pieces from the board
  const pieces: Piece[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece) pieces.push(piece);
    }
  }

  // Generate tile positions
  const tilePositions: Position[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      tilePositions.push(indexToPos(c, r));
    }
  }

  return (
    <div className="w-full max-w-[640px]" style={{ aspectRatio: "10/11" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Layer 1: Tiles */}
        {tilePositions.map((pos) => (
          <BoardTile key={`tile-${pos.row}${pos.col}`} position={pos} />
        ))}

        {/* Layer 2: Capture point markers */}
        <CapturePointMarkers />

        {/* Layer 3: Last-move highlight */}
        {lastMove && (
          <>
            <rect
              x={posToSvgX(lastMove.from)}
              y={posToSvgY(lastMove.from)}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill={HIGHLIGHT_COLORS.lastMoveFrom}
              className="pointer-events-none"
            />
            <rect
              x={posToSvgX(lastMove.to)}
              y={posToSvgY(lastMove.to)}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill={HIGHLIGHT_COLORS.lastMoveTo}
              className="pointer-events-none"
            />
          </>
        )}

        {/* Layer 3b: Selected piece highlight */}
        {selectedPieceId &&
          pieces.find((p) => p.id === selectedPieceId) && (
            <rect
              x={posToSvgX(pieces.find((p) => p.id === selectedPieceId)!.position)}
              y={posToSvgY(pieces.find((p) => p.id === selectedPieceId)!.position)}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill={HIGHLIGHT_COLORS.selected}
              className="pointer-events-none"
            />
          )}

        {/* Layer 4: Action dots */}
        <ActionDots highlights={highlights} />

        {/* Layer 5: Pieces */}
        {pieces.map((piece) => (
          <PieceIcon
            key={piece.id}
            piece={piece}
            isSelected={piece.id === selectedPieceId}
          />
        ))}

        {/* Layer 6: Pushback arrows */}
        <PushbackArrows arrows={pushbackArrows} onArrowClick={onPushDirectionClick} />

        {/* Layer 7: Labels */}
        {/* Row labels (A-K on left) */}
        {Array.from({ length: BOARD_ROWS }, (_, r) => {
          const label = ROWS[r];
          const y = (10 - r) * TILE_SIZE + TILE_SIZE / 2;
          return (
            <text
              key={`row-${label}`}
              x={-4}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fill="#9CA3AF"
              className="pointer-events-none select-none"
            >
              {label}
            </text>
          );
        })}
        {/* Column labels (1-10 on bottom) */}
        {Array.from({ length: BOARD_COLS }, (_, c) => {
          const x = c * TILE_SIZE + TILE_SIZE / 2;
          return (
            <text
              key={`col-${c + 1}`}
              x={x}
              y={BOARD_HEIGHT + 14}
              textAnchor="middle"
              fontSize={11}
              fill="#9CA3AF"
              className="pointer-events-none select-none"
            >
              {c + 1}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
