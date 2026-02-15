"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getPieceAt,
  type GameState,
  type GameAction,
  type Position,
  type PieceActions,
} from "@gambit/engine";
import type { TileHighlight } from "@/components/game/ActionDots";
import { soundManager } from "@/lib/sound-manager";

type InteractionMode =
  | { type: "idle" }
  | { type: "pieceSelected"; pieceId: string }
  | {
      type: "pushbackTarget";
      pusherId: string;
      targetPieceId: string;
      targetPosition: Position;
    };

interface PushbackArrow {
  fromPosition: Position;
  direction: [number, number];
  resultingPosition: Position;
}

export function useBoardInteraction(
  gameState: GameState,
  legalMoves: PieceActions[],
  dispatch: (action: GameAction) => void,
) {
  const [interaction, setInteraction] = useState<InteractionMode>({
    type: "idle",
  });

  const selectedPieceActions = useMemo(() => {
    if (interaction.type !== "pieceSelected") return null;
    return legalMoves.find((pm) => pm.piece.id === interaction.pieceId) ?? null;
  }, [interaction, legalMoves]);

  const highlights = useMemo((): TileHighlight[] => {
    if (!selectedPieceActions) return [];
    const result: TileHighlight[] = [];

    for (const pos of selectedPieceActions.moves) {
      result.push({ type: "move", position: pos });
    }
    for (const cap of selectedPieceActions.captures) {
      result.push({
        type: "capture",
        position: cap.position,
        targetPiece: cap.targetPiece,
      });
    }

    // Show pushback targets (the enemy piece positions)
    const seenPushTargets = new Set<string>();
    for (const pb of selectedPieceActions.pushbacks) {
      const key = `${pb.targetPiece.position.row}${pb.targetPiece.position.col}`;
      if (!seenPushTargets.has(key)) {
        seenPushTargets.add(key);
        result.push({
          type: "pushback",
          position: pb.targetPiece.position,
          targetPiece: pb.targetPiece,
        });
      }
    }

    for (const ls of selectedPieceActions.longshots) {
      result.push({
        type: "longshot",
        position: ls.targetPosition,
        targetPiece: ls.targetPiece,
      });
    }

    return result;
  }, [selectedPieceActions]);

  const pushbackArrows = useMemo((): PushbackArrow[] => {
    if (interaction.type !== "pushbackTarget") return [];
    if (!legalMoves) return [];

    const pusherActions = legalMoves.find(
      (pm) => pm.piece.id === interaction.pusherId,
    );
    if (!pusherActions) return [];

    return pusherActions.pushbacks
      .filter((pb) => pb.targetPiece.id === interaction.targetPieceId)
      .map((pb) => ({
        fromPosition: interaction.targetPosition,
        direction: pb.pushDirection,
        resultingPosition: pb.resultingPosition,
      }));
  }, [interaction, legalMoves]);

  const onTileClick = useCallback(
    (position: Position) => {
      const clickedPiece = getPieceAt(gameState.board, position);

      // In idle mode
      if (interaction.type === "idle") {
        if (
          clickedPiece &&
          clickedPiece.player === gameState.turn &&
          legalMoves.some((pm) => pm.piece.id === clickedPiece.id)
        ) {
          soundManager.play("select");
          setInteraction({ type: "pieceSelected", pieceId: clickedPiece.id });
        }
        return;
      }

      // In pushbackTarget mode
      if (interaction.type === "pushbackTarget") {
        // Clicking elsewhere cancels pushback
        soundManager.play("deselect");
        setInteraction({ type: "idle" });
        return;
      }

      // In pieceSelected mode
      if (interaction.type === "pieceSelected") {
        const actions = selectedPieceActions;
        if (!actions) {
          setInteraction({ type: "idle" });
          return;
        }

        // Click the same piece → deselect
        if (clickedPiece && clickedPiece.id === interaction.pieceId) {
          soundManager.play("deselect");
          setInteraction({ type: "idle" });
          return;
        }

        // Click a different friendly piece → switch selection
        if (
          clickedPiece &&
          clickedPiece.player === gameState.turn &&
          legalMoves.some((pm) => pm.piece.id === clickedPiece.id)
        ) {
          soundManager.play("select");
          setInteraction({ type: "pieceSelected", pieceId: clickedPiece.id });
          return;
        }

        // Check if clicking a move target
        const moveTarget = actions.moves.find(
          (m) => m.row === position.row && m.col === position.col,
        );
        if (moveTarget) {
          dispatch({
            type: "move",
            pieceId: actions.piece.id,
            to: position,
          });
          setInteraction({ type: "idle" });
          return;
        }

        // Check if clicking a capture target
        const captureTarget = actions.captures.find(
          (c) => c.position.row === position.row && c.position.col === position.col,
        );
        if (captureTarget) {
          dispatch({
            type: "capture",
            pieceId: actions.piece.id,
            to: position,
          });
          setInteraction({ type: "idle" });
          return;
        }

        // Check if clicking a pushback target (enemy piece)
        const pushTarget = actions.pushbacks.find(
          (pb) =>
            pb.targetPiece.position.row === position.row &&
            pb.targetPiece.position.col === position.col,
        );
        if (pushTarget) {
          setInteraction({
            type: "pushbackTarget",
            pusherId: actions.piece.id,
            targetPieceId: pushTarget.targetPiece.id,
            targetPosition: pushTarget.targetPiece.position,
          });
          return;
        }

        // Check if clicking a longshot target
        const longshotTarget = actions.longshots.find(
          (ls) =>
            ls.targetPosition.row === position.row &&
            ls.targetPosition.col === position.col,
        );
        if (longshotTarget) {
          dispatch({
            type: "longshot",
            pieceId: actions.piece.id,
            targetPosition: position,
          });
          setInteraction({ type: "idle" });
          return;
        }

        // Click elsewhere → deselect
        soundManager.play("deselect");
        setInteraction({ type: "idle" });
      }
    },
    [gameState, interaction, selectedPieceActions, legalMoves, dispatch],
  );

  const onPushDirectionClick = useCallback(
    (direction: [number, number], _resultingPosition: Position) => {
      if (interaction.type !== "pushbackTarget") return;
      dispatch({
        type: "pushback",
        pieceId: interaction.pusherId,
        targetPieceId: interaction.targetPieceId,
        pushDirection: direction,
      });
      setInteraction({ type: "idle" });
    },
    [interaction, dispatch],
  );

  const clearSelection = useCallback(() => {
    setInteraction({ type: "idle" });
  }, []);

  return {
    interaction,
    selectedPieceId:
      interaction.type === "pieceSelected"
        ? interaction.pieceId
        : interaction.type === "pushbackTarget"
          ? interaction.pusherId
          : null,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
    clearSelection,
  };
}
