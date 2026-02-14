import type { GameState, GameAction, Player } from "../types.js";
import { executeMove } from "../game.js";

/**
 * Opening book entry: a sequence of moves for a specific variation.
 */
interface OpeningVariation {
  name: string;
  weight: number;
  moves: GameAction[];
}

/*
 * Piece ID reference from setupInitialBoard():
 *
 * White knights (A, oddCols):  white-knight-1=A1, -2=A3, -3=A5, -4=A7, -5=A9
 * White archers (B, evenCols): white-archer-6=B2, -7=B4, -8=B6, -9=B8, -10=B10
 * White footmen (C, oddCols):  white-footman-11=C1, -12=C3, -13=C5, -14=C7, -15=C9
 *
 * Black footmen (I, evenCols): black-footman-16=I2, -17=I4, -18=I6, -19=I8, -20=I10
 * Black archers (J, oddCols):  black-archer-21=J1, -22=J3, -23=J5, -24=J7, -25=J9
 * Black knights (K, evenCols): black-knight-26=K2, -27=K4, -28=K6, -29=K8, -30=K10
 */

const WHITE_OPENINGS: OpeningVariation[] = [
  {
    name: "Aggressive Center",
    weight: 3,
    moves: [
      // Advance center footman C5 -> E5 (first-move double-step)
      { type: "move", pieceId: "white-footman-13", to: { col: 5, row: "E" } },
      // Advance footman C7 -> E7 (first-move double-step)
      { type: "move", pieceId: "white-footman-14", to: { col: 7, row: "E" } },
      // Advance footman C3 -> D3 (single step forward)
      { type: "move", pieceId: "white-footman-12", to: { col: 3, row: "D" } },
    ],
  },
  {
    name: "Knight Development",
    weight: 2,
    moves: [
      // Knight A5 -> C4 (2 forward, 1 left; leg B5 empty, bend C5 has footman=jumpable)
      { type: "move", pieceId: "white-knight-3", to: { col: 4, row: "C" } },
      // Advance footman C5 -> E5 (first-move double-step)
      { type: "move", pieceId: "white-footman-13", to: { col: 5, row: "E" } },
      // Knight A7 -> C6 (2 forward, 1 left; leg B7 empty, bend C7 has footman=jumpable)
      { type: "move", pieceId: "white-knight-4", to: { col: 6, row: "C" } },
    ],
  },
  {
    name: "Flanking Left",
    weight: 1,
    moves: [
      // Advance footman C1 -> E1 (first-move double-step)
      { type: "move", pieceId: "white-footman-11", to: { col: 1, row: "E" } },
      // Advance footman C3 -> E3 (first-move double-step)
      { type: "move", pieceId: "white-footman-12", to: { col: 3, row: "E" } },
      // Advance footman C5 -> D5 (single step forward)
      { type: "move", pieceId: "white-footman-13", to: { col: 5, row: "D" } },
    ],
  },
];

const BLACK_OPENINGS: OpeningVariation[] = [
  {
    name: "Aggressive Center",
    weight: 3,
    moves: [
      // Advance footman I6 -> G6 (first-move double-step toward A)
      { type: "move", pieceId: "black-footman-18", to: { col: 6, row: "G" } },
      // Advance footman I8 -> G8 (first-move double-step)
      { type: "move", pieceId: "black-footman-19", to: { col: 8, row: "G" } },
      // Advance footman I4 -> H4 (single step forward toward A)
      { type: "move", pieceId: "black-footman-17", to: { col: 4, row: "H" } },
    ],
  },
  {
    name: "Knight Development",
    weight: 2,
    moves: [
      // Knight K6 -> I5 (2 forward toward A, 1 left; leg J6 empty, bend I6 has footman=jumpable)
      { type: "move", pieceId: "black-knight-28", to: { col: 5, row: "I" } },
      // Advance footman I6 -> G6 (first-move double-step)
      { type: "move", pieceId: "black-footman-18", to: { col: 6, row: "G" } },
      // Knight K4 -> I3 (2 forward, 1 left; leg J4 empty, bend I4 has footman=jumpable)
      { type: "move", pieceId: "black-knight-27", to: { col: 3, row: "I" } },
    ],
  },
  {
    name: "Flanking Right",
    weight: 1,
    moves: [
      // Advance footman I10 -> G10 (first-move double-step)
      { type: "move", pieceId: "black-footman-20", to: { col: 10, row: "G" } },
      // Advance footman I8 -> G8 (first-move double-step)
      { type: "move", pieceId: "black-footman-19", to: { col: 8, row: "G" } },
      // Advance footman I6 -> H6 (single step forward)
      { type: "move", pieceId: "black-footman-18", to: { col: 6, row: "H" } },
    ],
  },
];

/**
 * Selects an opening variation based on weighted random choice.
 */
function selectVariation(variations: OpeningVariation[]): OpeningVariation {
  const totalWeight = variations.reduce((sum, v) => sum + v.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const variation of variations) {
    roll -= variation.weight;
    if (roll <= 0) return variation;
  }
  return variations[variations.length - 1];
}

// Cache the selected variation per game to maintain consistency
let cachedWhiteVariation: OpeningVariation | null = null;
let cachedBlackVariation: OpeningVariation | null = null;
let cachedMoveCount = -1;

/**
 * Returns an opening book move for the given game state and player,
 * or null if we're past the opening book or the move is invalid.
 */
export function getOpeningMove(state: GameState, player: Player): GameAction | null {
  if (state.gamePhase !== "playing") return null;

  const moveNumber = state.moveHistory.length;

  // Reset cache if we're starting a new game
  if (moveNumber < cachedMoveCount) {
    cachedWhiteVariation = null;
    cachedBlackVariation = null;
  }
  cachedMoveCount = moveNumber;

  const variations = player === "white" ? WHITE_OPENINGS : BLACK_OPENINGS;
  const playerMoveIndex = Math.floor(moveNumber / 2);

  const maxBookDepth = Math.max(...variations.map((v) => v.moves.length));
  if (playerMoveIndex >= maxBookDepth) return null;

  // Select and cache variation
  let variation: OpeningVariation;
  if (player === "white") {
    if (!cachedWhiteVariation) cachedWhiteVariation = selectVariation(variations);
    variation = cachedWhiteVariation;
  } else {
    if (!cachedBlackVariation) cachedBlackVariation = selectVariation(variations);
    variation = cachedBlackVariation;
  }

  if (playerMoveIndex >= variation.moves.length) return null;

  const action = variation.moves[playerMoveIndex];

  // Validate the move is actually legal in the current position
  try {
    executeMove(state, action);
    return action;
  } catch {
    // Opening move is invalid (opponent disrupted the line). Abandon the book.
    if (player === "white") cachedWhiteVariation = null;
    else cachedBlackVariation = null;
    return null;
  }
}

/**
 * Resets the opening book cache. Call when starting a new game.
 */
export function resetOpeningBook(): void {
  cachedWhiteVariation = null;
  cachedBlackVariation = null;
  cachedMoveCount = -1;
}
