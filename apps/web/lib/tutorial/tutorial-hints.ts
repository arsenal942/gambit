import { isCapturePoint, type GameState, type PieceActions } from "@gambit/engine";

/**
 * Scans the current legal moves and returns a contextual hint for the player.
 * Returns null if no specific hint is appropriate.
 */
export function getContextualHint(
  legalMoves: PieceActions[],
  _gameState: GameState,
): string | null {
  // Check for longshot opportunities
  for (const pa of legalMoves) {
    if (pa.piece.type === "archer" && pa.longshots.length > 0) {
      return "You could try a Longshot here — your Archer has a target through a screen piece!";
    }
  }

  // Check for capture opportunities
  for (const pa of legalMoves) {
    if (pa.captures.length > 0) {
      const targetType = pa.captures[0].targetPiece.type;
      return `Your ${capitalize(pa.piece.type)} could capture that ${capitalize(targetType)}!`;
    }
  }

  // Check for pushback near capture points
  for (const pa of legalMoves) {
    for (const pb of pa.pushbacks) {
      if (isCapturePoint(pb.targetPiece.position)) {
        return "Try pushing that piece off the Capture Point!";
      }
    }
  }

  // Check for moves onto capture points
  for (const pa of legalMoves) {
    for (const move of pa.moves) {
      if (isCapturePoint(move)) {
        return "There's an open Capture Point — try moving a piece onto it!";
      }
    }
  }

  // Generic hint
  return "Look for pieces you can advance toward the River to control territory.";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
