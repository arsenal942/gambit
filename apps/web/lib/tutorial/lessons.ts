import type { GameState } from "@gambit/engine";
import type { TutorialLesson, TutorialStep, BoardSetup } from "./types";

// ── Helper: shorthand for piece placements ─────────────────────

function footman(
  id: string,
  player: "white" | "black",
  col: number,
  row: string,
  hasMoved = true,
) {
  return { id, type: "footman" as const, player, position: { col, row }, hasMoved };
}

function archer(
  id: string,
  player: "white" | "black",
  col: number,
  row: string,
  hasMoved = true,
) {
  return { id, type: "archer" as const, player, position: { col, row }, hasMoved };
}

function knight(
  id: string,
  player: "white" | "black",
  col: number,
  row: string,
  hasMoved = true,
) {
  return { id, type: "knight" as const, player, position: { col, row }, hasMoved };
}

// ═══════════════════════════════════════════════════════════════
// LESSON 1: The Board & Moving Footmen
// ═══════════════════════════════════════════════════════════════

const lesson1: TutorialLesson = {
  id: "board-and-footmen",
  number: 1,
  title: "The Board & Moving Footmen",
  description: "Learn the board layout and how Footmen move",
  steps: [
    {
      id: "l1-intro",
      type: "observe",
      coachText:
        "Welcome to Gambit! This is the battlefield — a 10-column, 11-row grid. The blue band across the middle is the River. It divides the board and changes how your units behave when they cross it.",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "C", false)],
        turn: "white",
      },
      highlights: [
        { position: { col: 1, row: "F" }, color: "rgba(123, 196, 196, 0.4)" },
        { position: { col: 4, row: "F" }, color: "rgba(123, 196, 196, 0.4)" },
        { position: { col: 7, row: "F" }, color: "rgba(123, 196, 196, 0.4)" },
        { position: { col: 10, row: "F" }, color: "rgba(123, 196, 196, 0.4)" },
      ],
      pieceHighlights: ["w-f-1"],
    },
    {
      id: "l1-footman-intro",
      type: "observe",
      coachText:
        "The shield icon is a Footman — your frontline infantry and the backbone of your army. Footmen move 1 tile forward, backward, or sideways. Click Continue to try it.",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "C", false)],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
    },
    {
      id: "l1-move-1",
      type: "interact",
      coachText:
        "Click your Footman, then move it one tile forward toward the River.",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "C")],
        turn: "white",
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-1",
        targetPosition: { col: 5, row: "D" },
      },
      wrongMoveText:
        "That's a valid move, but try moving forward — click the tile directly above your Footman.",
      successText: "Great! Your Footman advances bravely.",
      hints: [
        { delayMs: 6000, text: "Click the Footman first, then click the tile directly above it (row D)." },
      ],
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l1-move-2",
      type: "interact",
      coachText: "Keep going! Move forward again.",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "D")],
        turn: "white",
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-1",
        targetPosition: { col: 5, row: "E" },
      },
      wrongMoveText: "Almost — try moving forward toward the River.",
      successText: "Almost at the River!",
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l1-move-3",
      type: "interact",
      coachText: "One more step to the River — move forward!",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "E")],
        turn: "white",
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-1",
        targetPosition: { col: 5, row: "F" },
      },
      wrongMoveText: "So close! Move forward to the River on row F.",
      successText: "You've reached the River! Well done.",
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l1-double-step-intro",
      type: "observe",
      coachText:
        "Footmen have a secret weapon for their very first move — they can leap 2 tiles forward! Let's try it with a fresh Footman.",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "C", false)],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
    },
    {
      id: "l1-double-step",
      type: "interact",
      coachText:
        "Click the Footman — notice the extra move option 2 tiles ahead. Use the double-step!",
      boardSetup: {
        pieces: [footman("w-f-1", "white", 5, "C", false)],
        turn: "white",
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-1",
        targetPosition: { col: 5, row: "E" },
      },
      wrongMoveText: "Try the double-step — click the tile 2 rows ahead (row E).",
      successText: "The double-step! Footmen can do this once, on their very first move.",
      hints: [
        { delayMs: 5000, text: "Click the Footman, then click the blue dot 2 tiles forward on row E." },
      ],
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l1-complete",
      type: "complete",
      coachText: "Footman Movement Mastered!",
      summaryPoints: [
        "Footmen move 1 tile forward, backward, or sideways (never diagonally)",
        "First move: can leap 2 tiles forward (one-time bonus)",
        "Beyond the River: up to 2 tiles forward/backward, but only 1 sideways",
        "The River divides the board and changes movement rules",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 2: Footman Captures
// ═══════════════════════════════════════════════════════════════

const lesson2: TutorialLesson = {
  id: "footman-captures",
  number: 2,
  title: "Footman Captures",
  description: "Learn how Footmen capture enemy pieces",
  steps: [
    {
      id: "l2-intro",
      type: "observe",
      coachText:
        "Footmen capture diagonally forward — not straight ahead! This is different from how they move. Let's practice.",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "E"),
          footman("b-f-1", "black", 6, "F"),
        ],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
      arrows: [
        { from: { col: 5, row: "E" }, to: { col: 6, row: "F" }, color: "#EF4444" },
      ],
    },
    {
      id: "l2-capture-1",
      type: "interact",
      coachText:
        "Click your Footman. See the red ring on the enemy? That's a capture target. Click it to capture!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "E"),
          footman("b-f-1", "black", 6, "F"),
        ],
        turn: "white",
      },
      expectedAction: { type: "move_type", moveType: "capture" },
      successText: "Nice capture! The enemy is removed from the board.",
      hints: [
        { delayMs: 5000, text: "Click your Footman, then click the red ring on the enemy Footman." },
      ],
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l2-beyond-river-intro",
      type: "observe",
      coachText:
        "Beyond the River, Footmen become even more dangerous — they can capture diagonally in ALL directions, not just forward!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "G"),
          footman("b-f-1", "black", 4, "F"),
          footman("b-f-2", "black", 6, "F"),
          footman("b-f-3", "black", 4, "H"),
          footman("b-f-4", "black", 6, "H"),
        ],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
      arrows: [
        { from: { col: 5, row: "G" }, to: { col: 4, row: "F" }, color: "#EF4444" },
        { from: { col: 5, row: "G" }, to: { col: 6, row: "F" }, color: "#EF4444" },
        { from: { col: 5, row: "G" }, to: { col: 4, row: "H" }, color: "#EF4444" },
        { from: { col: 5, row: "G" }, to: { col: 6, row: "H" }, color: "#EF4444" },
      ],
    },
    {
      id: "l2-capture-2",
      type: "interact",
      coachText:
        "Capture any of the surrounding enemies — try a backward diagonal capture!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "G"),
          footman("b-f-1", "black", 4, "F"),
          footman("b-f-2", "black", 6, "F"),
          footman("b-f-3", "black", 4, "H"),
          footman("b-f-4", "black", 6, "H"),
        ],
        turn: "white",
      },
      expectedAction: { type: "move_type", moveType: "capture" },
      successText: "Well done! Beyond the River, Footmen are fearsome in all directions.",
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l2-complete",
      type: "complete",
      coachText: "Footman Captures Mastered!",
      summaryPoints: [
        "Footmen capture diagonally — not straight ahead",
        "Behind the River: only forward diagonals (2 directions)",
        "Beyond the River: all 4 diagonal directions",
        "Captured pieces are removed and stored in the capture tray",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 3: Footman Pushback
// ═══════════════════════════════════════════════════════════════

const lesson3: TutorialLesson = {
  id: "footman-pushback",
  number: 3,
  title: "Footman Pushback",
  description: "Push enemies out of position without moving",
  steps: [
    {
      id: "l3-intro",
      type: "observe",
      coachText:
        "Footmen have a special ability: Pushback! Instead of moving, a Footman next to an enemy can PUSH that enemy 1 tile directly away — without moving itself.",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 4, "F"),
          footman("b-f-1", "black", 5, "F"),
        ],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
    },
    {
      id: "l3-push-1",
      type: "interact",
      coachText:
        "Click your Footman. See the orange ring on the enemy? Click it to push the enemy away!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 4, "F"),
          footman("b-f-1", "black", 5, "F"),
        ],
        turn: "white",
      },
      expectedAction: { type: "move_type", moveType: "pushback" },
      successText:
        "Notice your Footman didn't move — Pushback keeps you in place while displacing the enemy!",
      hints: [
        { delayMs: 6000, text: "Click your Footman, then the orange ring on the enemy to push them away." },
      ],
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l3-blocked-intro",
      type: "observe",
      coachText:
        "The enemy is always pushed in the direction away from your Footman. If there's a piece behind the enemy or the push would go off the board, the push is blocked entirely.",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 4, "F"),
          footman("b-f-1", "black", 5, "F"),
          archer("b-a-1", "black", 6, "F"),
        ],
        turn: "white",
      },
      pieceHighlights: ["b-a-1"],
    },
    {
      id: "l3-push-2",
      type: "interact",
      coachText:
        "Now try pushing from a different angle! Your Footman pushes the enemy directly away.",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "E"),
          footman("b-f-1", "black", 5, "F"),
        ],
        turn: "white",
      },
      expectedAction: { type: "move_type", moveType: "pushback" },
      successText: "You're getting the hang of this! Pushback is great for controlling territory.",
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l3-complete",
      type: "complete",
      coachText: "Footman Pushback Mastered!",
      summaryPoints: [
        "Pushback shoves an adjacent enemy 1 tile away from your Footman — your Footman stays put",
        "The push doesn't capture — it just displaces the enemy",
        "Can't push if a piece is behind the enemy or the push goes off the board",
        "Powerful for controlling Capture Points and disrupting enemy formations",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 4: Archers — Movement & Longshot
// ═══════════════════════════════════════════════════════════════

const lesson4: TutorialLesson = {
  id: "archer-movement-longshot",
  number: 4,
  title: "Archers — Movement & Longshot",
  description: "Master the Archer's ranged attack",
  steps: [
    {
      id: "l4-intro",
      type: "observe",
      coachText:
        "The bow-and-arrow icon is an Archer — your ranged specialist. Behind the River, Archers slide 2 tiles forward, backward, or sideways, OR 1 tile diagonally.",
      boardSetup: {
        pieces: [archer("w-a-1", "white", 5, "B")],
        turn: "white",
      },
      pieceHighlights: ["w-a-1"],
    },
    {
      id: "l4-move-free",
      type: "interact",
      coachText:
        "Click the Archer to see its movement range. Move it anywhere you like — explore!",
      boardSetup: {
        pieces: [archer("w-a-1", "white", 5, "B")],
        turn: "white",
      },
      expectedAction: { type: "any" },
      successText: "Notice how the Archer slides 2 tiles — farther than a Footman!",
      allowedPieceIds: ["w-a-1"],
    },
    {
      id: "l4-longshot-intro",
      type: "observe",
      coachText:
        "Archers can't capture by moving into enemies. Instead, they use a devastating ranged attack: the Longshot! It fires through a 'screen' piece to hit a target beyond it.",
      boardSetup: {
        pieces: [
          archer("w-a-1", "white", 3, "C"),
          footman("w-f-1", "white", 3, "D"),
          footman("b-f-1", "black", 3, "F"),
        ],
        turn: "white",
      },
      arrows: [
        { from: { col: 3, row: "C" }, to: { col: 3, row: "D" }, color: "#F97316" },
        { from: { col: 3, row: "D" }, to: { col: 3, row: "F" }, color: "#A855F7" },
      ],
      pieceHighlights: ["w-f-1"],
    },
    {
      id: "l4-longshot-explain",
      type: "observe",
      coachText:
        "Your Footman at D3 is the 'screen' — exactly one piece between the Archer and the enemy. The Archer fires through the screen and moves to the target's position.",
      boardSetup: {
        pieces: [
          archer("w-a-1", "white", 3, "C"),
          footman("w-f-1", "white", 3, "D"),
          footman("b-f-1", "black", 3, "F"),
        ],
        turn: "white",
      },
      highlights: [
        { position: { col: 3, row: "D" }, color: "rgba(249, 115, 22, 0.3)", label: "Screen" },
        { position: { col: 3, row: "F" }, color: "rgba(168, 85, 247, 0.3)", label: "Target" },
      ],
    },
    {
      id: "l4-longshot-execute",
      type: "interact",
      coachText:
        "Click your Archer. The purple ring marks the Longshot target — click it to fire!",
      boardSetup: {
        pieces: [
          archer("w-a-1", "white", 3, "C"),
          footman("w-f-1", "white", 3, "D"),
          footman("b-f-1", "black", 3, "F"),
        ],
        turn: "white",
      },
      expectedAction: { type: "move_type", moveType: "longshot" },
      successText:
        "Direct hit! Your Archer captured the enemy and moved to its position. The screen piece is unharmed.",
      hints: [
        { delayMs: 6000, text: "Click the Archer, then click the purple ring on the enemy Footman." },
      ],
      allowedPieceIds: ["w-a-1"],
    },
    {
      id: "l4-no-screen",
      type: "observe",
      coachText:
        "Without a screen piece, the Longshot can't fire. Here, there's nothing between the Archer and the enemy — no Longshot available. Your own pieces make the best screens!",
      boardSetup: {
        pieces: [
          archer("w-a-1", "white", 3, "C"),
          footman("b-f-1", "black", 3, "E"),
        ],
        turn: "white",
      },
      highlights: [
        { position: { col: 3, row: "D" }, color: "rgba(156, 163, 175, 0.3)", label: "Empty" },
      ],
    },
    {
      id: "l4-complete",
      type: "complete",
      coachText: "Archer Mastered!",
      summaryPoints: [
        "Behind the River: Archers slide 2 tiles orthogonally or 1 tile diagonally",
        "Beyond the River: only 1 tile in any direction",
        "Longshot: ranged capture through exactly 1 screen piece",
        "Forward range: 3 tiles. Sideways: 2 tiles. No backward longshot",
        "The Archer moves to the target's position after firing",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 5: Knights — Movement & Leg Cut
// ═══════════════════════════════════════════════════════════════

const lesson5: TutorialLesson = {
  id: "knight-movement",
  number: 5,
  title: "Knights — Movement & Leg Cut",
  description: "Master the Knight's L-shaped movement",
  steps: [
    {
      id: "l5-intro",
      type: "observe",
      coachText:
        "The horse icon is a Knight — your heavy cavalry. Knights move in an L-shape: 2 tiles in one direction, then 1 tile perpendicular. They can jump over pieces at the bend!",
      boardSetup: {
        pieces: [knight("w-k-1", "white", 5, "D")],
        turn: "white",
      },
      pieceHighlights: ["w-k-1"],
    },
    {
      id: "l5-move-free",
      type: "interact",
      coachText:
        "Click the Knight to see all 8 possible L-shaped destinations. Move it anywhere!",
      boardSetup: {
        pieces: [knight("w-k-1", "white", 5, "D")],
        turn: "white",
      },
      expectedAction: { type: "any" },
      successText: "Well done! Knights are your most mobile unit on the board.",
      allowedPieceIds: ["w-k-1"],
    },
    {
      id: "l5-legcut-intro",
      type: "observe",
      coachText:
        "Beware the Leg Cut! If any piece sits on the first step of the Knight's 2-tile direction, that entire direction is blocked. Watch — the piece on E5 cuts off two destinations.",
      boardSetup: {
        pieces: [
          knight("w-k-1", "white", 5, "D"),
          footman("w-f-1", "white", 5, "E"),
        ],
        turn: "white",
      },
      pieceHighlights: ["w-f-1"],
      highlights: [
        { position: { col: 5, row: "E" }, color: "rgba(239, 68, 68, 0.3)", label: "Blocks" },
      ],
    },
    {
      id: "l5-legcut-move",
      type: "interact",
      coachText:
        "Click the Knight — notice fewer destinations are available. The Leg Cut has blocked the downward L-shapes. Move to any open position.",
      boardSetup: {
        pieces: [
          knight("w-k-1", "white", 5, "D"),
          footman("w-f-1", "white", 5, "E"),
        ],
        turn: "white",
      },
      expectedAction: { type: "any" },
      successText:
        "You worked around the Leg Cut! Remember: Knights move the same everywhere — the River doesn't affect them.",
      allowedPieceIds: ["w-k-1"],
    },
    {
      id: "l5-complete",
      type: "complete",
      coachText: "Knight Movement Mastered!",
      summaryPoints: [
        "Knights move in an L-shape: 2 tiles + 1 tile perpendicular",
        "Leg Cut: a piece on the first step blocks that direction",
        "Knights CAN jump over the piece at the bend",
        "Knights are NOT affected by the River — same movement everywhere",
        "Knights capture by landing on enemy pieces (same L-shape)",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 6: Capture Points & Winning
// ═══════════════════════════════════════════════════════════════

const lesson6: TutorialLesson = {
  id: "capture-points",
  number: 6,
  title: "Capture Points & Winning",
  description: "Control the Capture Points to achieve victory",
  steps: [
    {
      id: "l6-intro",
      type: "observe",
      coachText:
        "The 4 red diamonds on the River are Capture Points — the key to territorial victory! Control a Capture Point by placing a piece on it.",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 1, "F"),
          footman("w-f-2", "white", 4, "F"),
          footman("w-f-3", "white", 7, "E"),
          footman("b-f-1", "black", 2, "J"),
          footman("b-f-2", "black", 5, "J"),
          footman("b-f-3", "black", 8, "J"),
        ],
        turn: "white",
        capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
      },
      highlights: [
        { position: { col: 1, row: "F" }, color: "rgba(250, 204, 21, 0.4)" },
        { position: { col: 4, row: "F" }, color: "rgba(250, 204, 21, 0.4)" },
        { position: { col: 7, row: "F" }, color: "rgba(239, 68, 68, 0.4)" },
        { position: { col: 10, row: "F" }, color: "rgba(156, 163, 175, 0.2)" },
      ],
    },
    {
      id: "l6-explain",
      type: "observe",
      coachText:
        "You already control 2 Capture Points (F1 and F4). Move your Footman onto F7 to control 3 — that triggers Check!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 1, "F"),
          footman("w-f-2", "white", 4, "F"),
          footman("w-f-3", "white", 7, "E"),
          footman("b-f-1", "black", 2, "J"),
          footman("b-f-2", "black", 5, "J"),
          footman("b-f-3", "black", 8, "J"),
        ],
        turn: "white",
        capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
      },
      arrows: [
        { from: { col: 7, row: "E" }, to: { col: 7, row: "F" }, color: "#FACC15" },
      ],
    },
    {
      id: "l6-take-point",
      type: "interact",
      coachText:
        "Move your Footman forward onto the Capture Point at F7!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 1, "F"),
          footman("w-f-2", "white", 4, "F"),
          footman("w-f-3", "white", 7, "E"),
          footman("b-f-1", "black", 2, "J"),
          footman("b-f-2", "black", 5, "J"),
          footman("b-f-3", "black", 8, "J"),
        ],
        turn: "white",
        capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-3",
        targetPosition: { col: 7, row: "F" },
      },
      wrongMoveText: "Move the Footman near F7 forward onto the Capture Point!",
      successText: "CHECK! You now control 3 of the 4 Capture Points!",
      allowedPieceIds: ["w-f-3"],
    },
    {
      id: "l6-check-explain",
      type: "observe",
      coachText:
        "Your opponent is in Check! They must break your hold on their turn — knock a piece off a Capture Point — or it's Checkmate. Let's see if they can...",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 1, "F"),
          footman("w-f-2", "white", 4, "F"),
          footman("w-f-3", "white", 7, "F"),
          footman("b-f-1", "black", 2, "J"),
          footman("b-f-2", "black", 5, "J"),
          footman("b-f-3", "black", 8, "J"),
        ],
        turn: "black",
        capturePoints: { F1: "white", F4: "white", F7: "white", F10: null },
      },
    },
    {
      id: "l6-scripted-move",
      type: "scripted",
      coachText: "The enemy advances a Footman, but they're too far away to challenge your flags...",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 1, "F"),
          footman("w-f-2", "white", 4, "F"),
          footman("w-f-3", "white", 7, "F"),
          footman("b-f-1", "black", 2, "J"),
          footman("b-f-2", "black", 5, "J"),
          footman("b-f-3", "black", 8, "J"),
        ],
        turn: "black",
        capturePoints: { F1: "white", F4: "white", F7: "white", F10: null },
      },
      action: {
        type: "move",
        pieceId: "b-f-2",
        to: { col: 5, row: "I" },
      },
      afterText:
        "CHECKMATE! You held 3 Capture Points for a full turn — VICTORY! You can also win by eliminating all enemy pieces (Annihilation) or if your opponent forfeits.",
    },
    {
      id: "l6-complete",
      type: "complete",
      coachText: "Capture Points & Victory Mastered!",
      summaryPoints: [
        "4 Capture Points on the River: F1, F4, F7, F10",
        "Control 3+ to put your opponent in Check",
        "If they can't break your hold — Checkmate!",
        "Alternative wins: Annihilation (all enemies captured) or Forfeit",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 7: Promotion & Ransom
// ═══════════════════════════════════════════════════════════════

const lesson7: TutorialLesson = {
  id: "promotion-ransom",
  number: 7,
  title: "Promotion & Ransom",
  description: "Recover lost pieces with these special abilities",
  steps: [
    {
      id: "l7-promo-intro",
      type: "observe",
      coachText:
        "When a Footman reaches the enemy's back row, you can sacrifice it to bring back a previously captured piece. This is called Promotion!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "J"),
        ],
        turn: "white",
        capturedPieces: {
          white: [archer("w-a-cap", "white", 0, "A")],
          black: [],
        },
      },
      pieceHighlights: ["w-f-1"],
      arrows: [
        { from: { col: 5, row: "J" }, to: { col: 5, row: "K" }, color: "#FACC15" },
      ],
    },
    {
      id: "l7-promo-move",
      type: "interact",
      coachText:
        "Move your Footman forward to the enemy's back row (row K) to trigger Promotion!",
      boardSetup: {
        pieces: [
          footman("w-f-1", "white", 5, "J"),
        ],
        turn: "white",
        capturedPieces: {
          white: [archer("w-a-cap", "white", 0, "A")],
          black: [],
        },
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-f-1",
        targetPosition: { col: 5, row: "K" },
      },
      wrongMoveText: "Move the Footman forward to row K — the enemy's back row!",
      successText: "The Footman has reached the back row! Now choose a piece to bring back.",
      allowedPieceIds: ["w-f-1"],
    },
    {
      id: "l7-ransom-intro",
      type: "observe",
      coachText:
        "Excellent! Your Archer is back in action. Knights have a similar trick — Ransom. When your Knight captures an enemy Knight, you can return a captured Footman or Archer to your home rows.",
      boardSetup: {
        pieces: [
          knight("w-k-1", "white", 5, "D"),
          knight("b-k-1", "black", 6, "F"),
        ],
        turn: "white",
        capturedPieces: {
          white: [footman("w-f-cap", "white", 0, "A")],
          black: [],
        },
      },
      pieceHighlights: ["w-k-1"],
      arrows: [
        { from: { col: 5, row: "D" }, to: { col: 6, row: "F" }, color: "#EF4444" },
      ],
    },
    {
      id: "l7-ransom-capture",
      type: "interact",
      coachText:
        "Capture the enemy Knight with your Knight to trigger Ransom!",
      boardSetup: {
        pieces: [
          knight("w-k-1", "white", 5, "D"),
          knight("b-k-1", "black", 6, "F"),
        ],
        turn: "white",
        capturedPieces: {
          white: [footman("w-f-cap", "white", 0, "A")],
          black: [],
        },
      },
      expectedAction: {
        type: "piece_to_position",
        pieceId: "w-k-1",
        targetPosition: { col: 6, row: "F" },
      },
      wrongMoveText: "Capture the enemy Knight — move your Knight to its position!",
      successText: "Knight takes Knight! Now choose a captured piece to ransom.",
      hints: [
        { delayMs: 8000, text: "Click your Knight, then click the red ring on the enemy Knight." },
      ],
      allowedPieceIds: ["w-k-1"],
    },
    {
      id: "l7-complete",
      type: "complete",
      coachText: "Promotion & Ransom Mastered!",
      summaryPoints: [
        "Promotion: Footman on enemy back row → sacrifice to return any captured piece",
        "Ransom: Knight captures Knight → return a captured Footman or Archer",
        "Returned pieces are placed on your home rows (first 3 rows)",
        "Two powerful ways to recover lost pieces — use them wisely!",
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LESSON 8: Guided Practice Game (metadata only — rendered by PracticeGameClient)
// ═══════════════════════════════════════════════════════════════

const lesson8: TutorialLesson = {
  id: "practice-game",
  number: 8,
  title: "Your First Battle",
  description: "Put it all together against a practice opponent",
  steps: [], // Handled by PracticeGameClient
};

// ── Exports ───────────────────────────────────────────────────

export const LESSONS: TutorialLesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
];

export function getLessonById(id: string): TutorialLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonByNumber(num: number): TutorialLesson | undefined {
  return LESSONS.find((l) => l.number === num);
}
