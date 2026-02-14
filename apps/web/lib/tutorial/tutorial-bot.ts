import {
  getAllLegalMoves,
  getForwardDirection,
  posToIndex,
  type GameState,
  type GameAction,
  type PieceActions,
} from "@gambit/engine";

/**
 * Tutorial bot: a punching bag that only moves Footmen forward.
 * No captures, no specials. If no footman forward moves exist, picks any random legal move.
 */
export function getTutorialBotMove(gameState: GameState): GameAction | null {
  const botColor = gameState.turn;
  const allMoves = getAllLegalMoves(botColor, gameState);

  if (allMoves.length === 0) return null;

  const fwd = getForwardDirection(botColor);

  // Collect all footman forward moves
  const footmanForwardMoves: { pieceActions: PieceActions; to: { col: number; row: string } }[] = [];

  for (const pa of allMoves) {
    if (pa.piece.type !== "footman") continue;
    const [currentRow] = posToIndex(pa.piece.position);

    for (const move of pa.moves) {
      const [targetRow] = posToIndex(move);
      if (targetRow - currentRow === fwd || targetRow - currentRow === fwd * 2) {
        footmanForwardMoves.push({ pieceActions: pa, to: move });
      }
    }
  }

  // Pick a random footman forward move
  if (footmanForwardMoves.length > 0) {
    const choice = footmanForwardMoves[Math.floor(Math.random() * footmanForwardMoves.length)];
    return {
      type: "move",
      pieceId: choice.pieceActions.piece.id,
      to: choice.to,
    };
  }

  // Fallback: pick any random legal move action
  const allActions: GameAction[] = [];
  for (const pa of allMoves) {
    for (const move of pa.moves) {
      allActions.push({ type: "move", pieceId: pa.piece.id, to: move });
    }
    for (const cap of pa.captures) {
      allActions.push({ type: "capture", pieceId: pa.piece.id, to: cap.position });
    }
  }

  if (allActions.length === 0) return null;
  return allActions[Math.floor(Math.random() * allActions.length)];
}
