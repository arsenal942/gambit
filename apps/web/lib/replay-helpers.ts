import type {
  Move,
  GameState,
  GameAction,
  Position,
} from "@gambit/engine";
import { createGame, executeMove, getPieceAt } from "@gambit/engine";
import { describeMoveAction, playerName } from "./engine-helpers";

const ROWS = "ABCDEFGHIJK";

export interface ReplayFrame {
  state: GameState;
  moveDescription: string | null;
  moveIndex: number | null; // index into original moves array, null for initial + injected frames
}

/**
 * Convert a stored Move record back into a GameAction that can be
 * passed to `executeMove`. The tricky part is pushbacks where we need
 * to scan the current board state to find the target piece and direction.
 */
function moveToAction(move: Move, currentState: GameState): GameAction {
  switch (move.type) {
    case "move":
      return { type: "move", pieceId: move.piece.id, to: move.to };

    case "capture":
      return { type: "capture", pieceId: move.piece.id, to: move.to };

    case "pushback": {
      // The pushing footman is at move.from (= move.piece.position).
      // move.to is where the pushed piece ends up.
      // We need to find which adjacent enemy piece was pushed.
      const pusherPos = move.from;
      const resultPos = move.to;
      const pusherRowIdx = ROWS.indexOf(pusherPos.row);
      const resultRowIdx = ROWS.indexOf(resultPos.row);

      const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const adjRowIdx = pusherRowIdx + dr;
        const adjCol = pusherPos.col + dc;
        if (adjRowIdx < 0 || adjRowIdx > 10 || adjCol < 1 || adjCol > 10) continue;

        const adjPos: Position = { row: ROWS[adjRowIdx], col: adjCol };
        const piece = getPieceAt(currentState.board, adjPos);
        if (!piece || piece.player === move.piece.player) continue;

        // Check if pushing this piece one step results in move.to
        const pushDr = resultRowIdx - adjRowIdx;
        const pushDc = resultPos.col - adjCol;
        if (
          (Math.abs(pushDr) === 1 && pushDc === 0) ||
          (pushDr === 0 && Math.abs(pushDc) === 1)
        ) {
          return {
            type: "pushback",
            pieceId: move.piece.id,
            targetPieceId: piece.id,
            pushDirection: [pushDr, pushDc] as [number, number],
          };
        }
      }
      throw new Error("Could not reconstruct pushback action from move history");
    }

    case "longshot":
      return {
        type: "longshot",
        pieceId: move.piece.id,
        targetPosition: move.to,
      };

    case "promotion":
      return {
        type: "promotion",
        capturedPieceId: move.promotedPiece!.id,
        placementPosition: move.to,
      };

    case "ransom":
      return {
        type: "ransom",
        capturedPieceId: move.ransomPiece!.id,
        placementPosition: move.to,
      };

    default:
      return { type: "move", pieceId: move.piece.id, to: move.to };
  }
}

/**
 * Pre-compute all replay frames from a moves array.
 * Starts from initial game state and applies each move via executeMove.
 * Automatically injects declinePromotion/declineRansom when needed.
 */
export function computeReplayFrames(moves: Move[]): ReplayFrame[] {
  const frames: ReplayFrame[] = [];
  let current = createGame();

  // Initial frame
  frames.push({ state: current, moveDescription: null, moveIndex: null });

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const action = moveToAction(move, current);
    current = executeMove(current, action);

    const player = playerName(move.piece.player);
    const desc = `${player} ${describeMoveAction(move)}`;
    frames.push({ state: current, moveDescription: desc, moveIndex: i });

    // Auto-inject decline if the state is awaiting but next move isn't the expected type
    if (current.gamePhase === "awaitingPromotion") {
      const nextMove = moves[i + 1];
      if (!nextMove || nextMove.type !== "promotion") {
        current = executeMove(current, { type: "declinePromotion" });
        frames.push({
          state: current,
          moveDescription: `${player} declines promotion`,
          moveIndex: null,
        });
      }
    }
    if (current.gamePhase === "awaitingRansom") {
      const nextMove = moves[i + 1];
      if (!nextMove || nextMove.type !== "ransom") {
        current = executeMove(current, { type: "declineRansom" });
        frames.push({
          state: current,
          moveDescription: `${player} declines ransom`,
          moveIndex: null,
        });
      }
    }
  }

  return frames;
}
