import type { Puzzle } from "./types";

// ── Shorthand helpers (same pattern as lessons.ts) ─────────────

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
// BEGINNER (1–8) — Single-move puzzles in realistic positions
// ═══════════════════════════════════════════════════════════════

export const PUZZLES: Puzzle[] = [
  // ── 1: River Skirmish ────────────────────────────────────────
  // Mid-game river battle. w-f-1 at E6 captures forward diag to F7.
  // Distractor: w-f-2 at E3 could capture b-f-2 at F4 (capture point),
  // but the objective targets the archer.
  {
    id: 1,
    title: "River Skirmish",
    objective: "White to capture the archer",
    difficulty: "beginner",
    category: "capture",
    hint: "Your Footman at E6 can capture diagonally forward — look right.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 6, "E"),
        footman("w-f-2", "white", 3, "E"),
        footman("w-f-3", "white", 1, "F"),
        archer("w-a-1", "white", 5, "C"),
        knight("w-k-1", "white", 8, "B"),
        archer("b-a-1", "black", 7, "F"),  // TARGET
        footman("b-f-1", "black", 4, "F"),
        footman("b-f-2", "black", 5, "G"),
        knight("b-k-1", "black", 3, "H"),
        archer("b-a-2", "black", 7, "I"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: null, F10: null },
    },
    solution: [{
      // E6 forward diag right = F7 (b-a-1)
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 2: Behind the Lines ──────────────────────────────────────
  // White footman is beyond the river. Beyond river = all 4 diag captures.
  // b-k-1 at H6 is reachable by forward diag from G5. b-f-1 at F6 also
  // capturable (backward diag) but objective says "knight".
  {
    id: 2,
    title: "Behind the Lines",
    objective: "White to capture the knight",
    difficulty: "beginner",
    category: "capture",
    hint: "Beyond the River, Footmen capture in all four diagonal directions.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "G"),  // beyond river
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 1, "F"),
        archer("w-a-1", "white", 3, "D"),
        knight("w-k-1", "white", 7, "C"),
        knight("b-k-1", "black", 6, "H"),   // TARGET (forward diag from G5)
        footman("b-f-1", "black", 6, "F"),   // distractor (backward diag from G5)
        footman("b-f-2", "black", 3, "G"),
        archer("b-a-1", "black", 8, "I"),
        footman("b-f-3", "black", 10, "F"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: "black" },
    },
    solution: [{
      // G5 forward diag right = H6 (b-k-1)
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 6, row: "H" } },
      ],
    }],
  },

  // ── 3: Leg Cut Trap ──────────────────────────────────────────
  // Knight at D5 looks like it can capture at F6, but w-f-1 at E5 blocks
  // the leg (first step of down-2 path). Instead, w-f-1 at E5 itself can
  // capture forward diagonal to F6.
  {
    id: 3,
    title: "Leg Cut Trap",
    objective: "White to capture the archer",
    difficulty: "beginner",
    category: "capture",
    hint: "The Knight is blocked — look for another piece that can reach the target.",
    boardSetup: {
      pieces: [
        knight("w-k-1", "white", 5, "D"),
        footman("w-f-1", "white", 5, "E"),  // blocks knight leg AND can capture
        footman("w-f-2", "white", 4, "F"),
        archer("w-a-1", "white", 8, "C"),
        footman("w-f-3", "white", 2, "D"),
        archer("b-a-1", "black", 6, "F"),   // TARGET
        footman("b-f-1", "black", 7, "F"),
        footman("b-f-2", "black", 3, "G"),
        knight("b-k-1", "black", 9, "H"),
        footman("b-f-3", "black", 5, "I"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "white", F7: "black", F10: null },
    },
    solution: [{
      // w-f-1 at E5 captures forward diag right = F6 (b-a-1)
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 6, row: "F" } },
      ],
    }],
  },

  // ── 4: Sniper's Nest ─────────────────────────────────────────
  // Archer at C4 fires forward 3 tiles to F4 (capture point) through
  // screen at D4. E4 is empty.
  // Distractor: w-a-2 at B7 can't longshot because 2 screens block.
  {
    id: 4,
    title: "Sniper's Nest",
    objective: "White to capture with a longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "Fire forward through your Footman — exactly one screen is needed.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 4, "C"),    // can longshot to F4
        archer("w-a-2", "white", 7, "B"),    // blocked (2 screens)
        footman("w-f-1", "white", 4, "D"),   // screen for w-a-1
        footman("w-f-2", "white", 7, "C"),   // screen 1 for w-a-2
        knight("w-k-1", "white", 2, "E"),
        footman("b-f-1", "black", 4, "F"),   // TARGET (on capture point F4)
        footman("b-f-2", "black", 7, "D"),   // screen 2 for w-a-2 → blocks longshot
        footman("b-f-3", "black", 6, "G"),
        archer("b-a-1", "black", 8, "H"),
        knight("b-k-1", "black", 3, "I"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "black", F7: null, F10: null },
    },
    solution: [{
      // C4 → F4 (dist 3 forward). Screen at D4. E4 empty. Target at F4 (enemy).
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 4, row: "F" } },
      ],
    }],
  },

  // ── 5: Double Barrel ──────────────────────────────────────────
  // Two archers. w-a-1 at D3 can longshot to F3 (dist 2, screen at E3).
  // w-a-2 at C7 is blocked (D7 and E7 both occupied = 2 screens).
  {
    id: 5,
    title: "Double Barrel",
    objective: "White to capture with a longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "One archer has a clear line — the other is blocked by too many pieces.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 3, "D"),    // valid longshot to F3
        archer("w-a-2", "white", 7, "C"),    // blocked (2 screens)
        footman("w-f-1", "white", 3, "E"),   // screen for w-a-1
        footman("w-f-2", "white", 7, "D"),   // screen 1 for w-a-2
        knight("w-k-1", "white", 5, "B"),
        knight("b-k-1", "black", 3, "F"),    // TARGET for w-a-1
        footman("b-f-1", "black", 7, "E"),   // screen 2 for w-a-2
        footman("b-f-2", "black", 7, "F"),   // would-be target for w-a-2
        archer("b-a-1", "black", 5, "H"),
        footman("b-f-3", "black", 9, "I"),
      ],
      turn: "white",
    },
    solution: [{
      // D3 → F3 (dist 2 forward). Screen at E3 (w-f-1). Target at F3 (b-k-1).
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 3, row: "F" } },
      ],
    }],
  },

  // ── 6: Flanking Fire ──────────────────────────────────────────
  // Archer at E5 has forward blocked (2 screens at F5 and G5).
  // Sideways right to E7 (dist 2, screen at E6) works.
  {
    id: 6,
    title: "Flanking Fire",
    objective: "White to capture with a longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "The forward line is blocked — try firing sideways through your screen.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 5, "E"),
        footman("w-f-1", "white", 6, "E"),   // sideways screen
        footman("w-f-2", "white", 5, "F"),   // forward blocker 1
        footman("w-f-3", "white", 5, "G"),   // forward blocker 2 (2 screens)
        knight("w-k-1", "white", 3, "C"),
        archer("b-a-1", "black", 7, "E"),    // TARGET (sideways right dist 2)
        footman("b-f-1", "black", 4, "G"),
        knight("b-k-1", "black", 8, "H"),
        footman("b-f-2", "black", 10, "F"),
        footman("b-f-3", "black", 6, "I"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: null, F7: null, F10: "black" },
    },
    solution: [{
      // E5 sideways right → E7 (dist 2). Screen at E6 (w-f-1). Target at E7 (b-a-1).
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "E" } },
      ],
    }],
  },

  // ── 7: Shield Shove ───────────────────────────────────────────
  // Push enemy footman off capture point F4. Realistic mid-game with
  // multiple pieces around the river.
  {
    id: 7,
    title: "Shield Shove",
    objective: "White to push the enemy off the capture point",
    difficulty: "beginner",
    category: "pushback",
    hint: "Pushback shoves an adjacent enemy 1 tile away — push them off F4.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "E"),   // pusher (adjacent to F4)
        footman("w-f-2", "white", 1, "F"),
        archer("w-a-1", "white", 6, "D"),
        knight("w-k-1", "white", 8, "C"),
        footman("w-f-3", "white", 3, "D"),
        footman("b-f-1", "black", 4, "F"),   // target on capture point
        footman("b-f-2", "black", 7, "F"),
        archer("b-a-1", "black", 5, "H"),
        knight("b-k-1", "black", 9, "I"),
        footman("b-f-3", "black", 2, "G"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: "black", F10: null },
    },
    solution: [{
      // Push from E4 → F4 direction [1,0], pushes b-f-1 to G4
      playerMoves: [{
        type: "pushback",
        pieceId: "w-f-1",
        targetPieceId: "b-f-1",
        pushDirection: [1, 0] as [number, number],
      }],
    }],
  },

  // ── 8: Enemy Screen ───────────────────────────────────────────
  // Longshot using an enemy piece as the screen.
  // Archer at B7, enemy footman at C7 (screen), enemy knight at D7 (target).
  {
    id: 8,
    title: "Enemy Screen",
    objective: "White to capture with a longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "Any piece can be a screen — even an enemy piece blocking your line.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 7, "B"),    // longshot archer
        footman("w-f-1", "white", 4, "E"),
        footman("w-f-2", "white", 1, "F"),
        knight("w-k-1", "white", 9, "D"),
        archer("w-a-2", "white", 3, "C"),
        footman("b-f-1", "black", 7, "C"),   // enemy screen
        knight("b-k-1", "black", 7, "D"),    // TARGET
        footman("b-f-2", "black", 4, "F"),
        archer("b-a-1", "black", 6, "H"),
        footman("b-f-3", "black", 10, "I"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: null, F10: null },
    },
    solution: [{
      // B7 → D7 (dist 2 forward). Screen at C7 (b-f-1 — enemy). Target at D7 (b-k-1).
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "D" } },
      ],
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERMEDIATE (9–18) — Checkmate-in-1, 2-move combos
  // ═══════════════════════════════════════════════════════════════

  // ── 9: False Security ─────────────────────────────────────────
  // White has F1+F4. Can reach F7 (safe) or F10 (contestable).
  // b-f-1 at G9 captures forward diag F10 → F10 is a trap.
  {
    id: 9,
    title: "False Security",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Both capture points look open — but can the enemy contest one of them?",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 7, "E"),    // can move to F7 ✓
        footman("w-f-4", "white", 10, "E"),   // trap: can move to F10 ✗
        archer("w-a-1", "white", 3, "D"),
        knight("w-k-1", "white", 8, "C"),
        footman("b-f-1", "black", 9, "G"),    // can capture at F10 (forward diag from G9)
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 7, "I"),
        knight("b-k-1", "black", 3, "J"),
        footman("b-f-3", "black", 2, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
    },
    solution: [{
      // Move to F7 — safe from all black pieces.
      // F10 fails because b-f-1 at G9 captures forward diag left = F10.
      playerMoves: [
        { type: "move", pieceId: "w-f-3", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 10: Capture Checkmate ──────────────────────────────────────
  // White has F1+F10. Enemy sits on F7. Capture the enemy at F7 for
  // 3rd CP = checkmate. Other enemy at F4 stays.
  {
    id: 10,
    title: "Capture Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Capturing the enemy on a capture point gives you control of it.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 10, "F"),
        footman("w-f-3", "white", 6, "E"),    // forward diag right = F7
        footman("w-f-4", "white", 3, "E"),
        archer("w-a-1", "white", 5, "D"),
        knight("w-k-1", "white", 8, "C"),
        footman("b-f-1", "black", 7, "F"),    // TARGET on F7
        footman("b-f-2", "black", 4, "F"),    // on F4 (black-controlled)
        archer("b-a-1", "black", 2, "H"),
        knight("b-k-1", "black", 9, "J"),
        footman("b-f-3", "black", 5, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: "black", F10: "white" },
    },
    solution: [{
      // w-f-3 at E6 captures forward diag right F7 (b-f-1).
      // White now has F1 + F7 + F10 = 3 CPs.
      // Can black contest? b-f-2 at F4: forward diag for black = E3,E5. Can't reach F7/F1/F10.
      // b-a-1 at H2: too far. b-k-1 at J9: L-moves don't reach any CP.
      playerMoves: [
        { type: "capture", pieceId: "w-f-3", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 11: Knight's Landing ──────────────────────────────────────
  // White has F4+F7. Knight at D8 L-shapes to F7... wait, F7 is taken.
  // Let me use F1. Knight at D2 → F1 (down 2 = F, left 1 = 1).
  // First step: E2 must be empty.
  {
    id: 11,
    title: "Knight's Landing",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Your Knight can jump to a capture point in one L-shaped move.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "F"),
        footman("w-f-2", "white", 7, "F"),
        knight("w-k-1", "white", 2, "D"),    // D2 → F1 (down 2, left 1). Leg: E2 empty ✓
        archer("w-a-1", "white", 5, "C"),
        footman("w-f-3", "white", 9, "E"),
        footman("b-f-1", "black", 3, "K"),
        footman("b-f-2", "black", 6, "K"),
        archer("b-a-1", "black", 8, "J"),
        knight("b-k-1", "black", 5, "I"),
        footman("b-f-3", "black", 10, "H"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "white", F7: "white", F10: null },
    },
    solution: [{
      // Knight D2 → F1. White gets F1 + F4 + F7 = 3 CPs.
      // All black pieces are on rows H-K, can't reach F1/F4/F7.
      playerMoves: [
        { type: "move", pieceId: "w-k-1", to: { col: 1, row: "F" } },
      ],
    }],
  },

  // ── 12: Longshot Checkmate ────────────────────────────────────
  // White has F1+F4. Archer at C7 longshots to F7 (dist 3, screen at D7),
  // removing the enemy and occupying the CP.
  {
    id: 12,
    title: "Longshot Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Your Archer can fire through a screen to take the capture point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        archer("w-a-1", "white", 7, "C"),    // longshot to F7
        footman("w-f-3", "white", 7, "D"),   // screen
        knight("w-k-1", "white", 9, "B"),
        footman("w-f-4", "white", 3, "E"),
        footman("b-f-1", "black", 7, "F"),   // TARGET on F7
        footman("b-f-2", "black", 5, "G"),
        archer("b-a-1", "black", 2, "I"),
        knight("b-k-1", "black", 8, "J"),
        footman("b-f-3", "black", 6, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [{
      // C7 → F7 (dist 3 forward). Screen at D7. E7 empty. Target F7 (enemy).
      // Archer occupies F7. White has F1 + F4 + F7 = 3 CPs.
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 13: Push and Pounce ───────────────────────────────────────
  // 2-move: Push b-f-1 from F5 to G5, then w-f-2 at F4 captures
  // forward diag at G5 (F4 is "at" river → forward diag capture).
  {
    id: 13,
    title: "Push and Pounce",
    objective: "White to capture in 2 moves",
    difficulty: "intermediate",
    category: "tactical",
    hint: "Push the enemy into a position where your other Footman can capture.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "E"),   // pusher
        footman("w-f-2", "white", 4, "F"),   // capturer (at river, forward diag to G5)
        footman("w-f-3", "white", 1, "F"),
        archer("w-a-1", "white", 6, "C"),
        knight("w-k-1", "white", 8, "B"),
        footman("b-f-1", "black", 5, "F"),   // push target
        footman("b-f-2", "black", 7, "F"),
        archer("b-a-1", "black", 3, "H"),
        knight("b-k-1", "black", 9, "I"),
        footman("b-f-3", "black", 6, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [
      {
        // Push b-f-1 from F5 to G5 (direction [1,0])
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-1",
          targetPieceId: "b-f-1",
          pushDirection: [1, 0] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 6, row: "I" } },
      },
      {
        // w-f-2 at F4 captures forward diag right G5 (b-f-1)
        playerMoves: [
          { type: "capture", pieceId: "w-f-2", to: { col: 5, row: "G" } },
        ],
      },
    ],
  },

  // ── 14: Clear the Lane ────────────────────────────────────────
  // 2-move: Push b-f-1 at E5 sideways (to E6), clearing the lane for
  // w-a-1 at C5 to longshot forward to F5 (screen at D5, E5 now empty).
  {
    id: 14,
    title: "Clear the Lane",
    objective: "White to capture in 2 moves",
    difficulty: "intermediate",
    category: "tactical",
    hint: "Push the blocker out of the lane, then fire your longshot.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 5, "C"),    // longshot archer
        footman("w-f-1", "white", 4, "E"),   // pusher (adjacent to E5 enemy)
        footman("w-f-2", "white", 5, "D"),   // screen for longshot
        knight("w-k-1", "white", 2, "B"),
        footman("w-f-3", "white", 1, "F"),
        footman("b-f-1", "black", 5, "E"),   // blocking piece (2nd screen)
        knight("b-k-1", "black", 5, "F"),    // longshot target
        footman("b-f-2", "black", 7, "F"),
        archer("b-a-1", "black", 6, "H"),
        footman("b-f-3", "black", 3, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: "black", F10: null },
    },
    solution: [
      {
        // Push b-f-1 from E5 sideways right to E6 (direction [0,1] from E4)
        // Wait — pusher at E4, target at E5. Direction from E4 to E5 = [0,1]
        // (same row E, col increases from 4 to 5). Target pushed to E6.
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-1",
          targetPieceId: "b-f-1",
          pushDirection: [0, 1] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 3, row: "I" } },
      },
      {
        // Longshot: C5 → F5 (dist 3 forward). Screen at D5. E5 now empty. Target F5 (b-k-1).
        playerMoves: [
          { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 5, row: "F" } },
        ],
      },
    ],
  },

  // ── 15: Push Checkmate ────────────────────────────────────────
  // 2-move: Push enemy off F7, then move onto F7 for 3rd CP.
  {
    id: 15,
    title: "Push Checkmate",
    objective: "White to checkmate in 2 moves",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Push the enemy off the capture point, then claim it yourself.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 7, "E"),   // pusher → then advances to F7
        archer("w-a-1", "white", 5, "D"),
        knight("w-k-1", "white", 9, "C"),
        footman("b-f-1", "black", 7, "F"),   // on F7 — push target
        footman("b-f-2", "black", 3, "K"),
        archer("b-a-1", "black", 6, "I"),
        knight("b-k-1", "black", 8, "J"),
        footman("b-f-3", "black", 10, "H"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [
      {
        // Push b-f-1 from F7 to G7 (direction [1,0] from E7)
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-3",
          targetPieceId: "b-f-1",
          pushDirection: [1, 0] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 3, row: "J" } },
      },
      {
        // Advance w-f-3 from E7 to F7 (1 tile forward)
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 7, row: "F" } },
        ],
      },
    ],
  },

  // ── 16: Dual Advance ──────────────────────────────────────────
  // 2-move: Two footmen advance to CPs. All black pieces on back rows.
  {
    id: 16,
    title: "Dual Advance",
    objective: "White to checkmate in 2 moves",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Both footmen are one step from the river — advance one at a time.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "E"),   // one step from F4
        footman("w-f-3", "white", 10, "E"),  // one step from F10
        archer("w-a-1", "white", 6, "D"),
        knight("w-k-1", "white", 8, "C"),
        footman("b-f-1", "black", 3, "K"),
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 7, "J"),
        knight("b-k-1", "black", 9, "I"),
        footman("b-f-3", "black", 2, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: null, F10: null },
    },
    solution: [
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-2", to: { col: 4, row: "F" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-1", to: { col: 3, row: "J" } },
      },
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 10, row: "F" } },
        ],
      },
    ],
  },

  // ── 17: Capture and Seize ─────────────────────────────────────
  // 2-move: Capture enemy on F4 (step 1), then advance to F10 (step 2).
  {
    id: 17,
    title: "Capture and Seize",
    objective: "White to checkmate in 2 moves",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Take the contested point first, then claim the open one.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 3, "E"),   // forward diag right = F4
        footman("w-f-3", "white", 10, "E"),  // advances to F10
        archer("w-a-1", "white", 6, "D"),
        knight("w-k-1", "white", 8, "B"),
        footman("w-f-4", "white", 7, "F"),
        footman("b-f-1", "black", 4, "F"),   // on F4 — capture target
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 3, "I"),
        knight("b-k-1", "black", 9, "J"),
        footman("b-f-3", "black", 2, "H"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: "white", F10: null },
    },
    solution: [
      {
        // w-f-2 at E3 captures forward diag right F4 (b-f-1)
        playerMoves: [
          { type: "capture", pieceId: "w-f-2", to: { col: 4, row: "F" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 5, row: "J" } },
      },
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 10, row: "F" } },
        ],
      },
    ],
  },

  // ── 18: Longshot Setup ────────────────────────────────────────
  // 2-move: Move footman to create a screen, then archer longshots.
  // w-f-2 moves to D3, creating screen for w-a-1 at C3 → F3.
  {
    id: 18,
    title: "Longshot Setup",
    objective: "White to capture in 2 moves",
    difficulty: "intermediate",
    category: "tactical",
    hint: "Create a screen for your Archer by moving a Footman into position.",
    boardSetup: {
      pieces: [
        archer("w-a-1", "white", 3, "C"),    // needs screen at D3
        footman("w-f-1", "white", 3, "B"),   // can move to D3 (wait, B3 → C3 or D3)
        // Actually, B3 is behind river. 1 tile orthogonal = A3, C3, B2, B4.
        // C3 has the archer. So can't move there. Let me use a different piece.
        // Use w-f-2 at D4: can move to D3 (1 tile sideways).
        footman("w-f-2", "white", 4, "D"),   // moves to D3 (screen position)
        knight("w-k-1", "white", 7, "B"),
        footman("w-f-3", "white", 1, "F"),
        footman("w-f-4", "white", 5, "E"),
        archer("b-a-1", "black", 3, "F"),    // longshot target
        footman("b-f-1", "black", 4, "F"),
        knight("b-k-1", "black", 8, "H"),
        footman("b-f-2", "black", 6, "I"),
        footman("b-f-3", "black", 10, "J"),
      ],
      turn: "white",
    },
    solution: [
      {
        // Move w-f-2 from D4 to D3 (1 tile sideways left)
        playerMoves: [
          { type: "move", pieceId: "w-f-2", to: { col: 3, row: "D" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 10, row: "I" } },
      },
      {
        // Longshot: C3 → F3 (dist 3 forward). Screen at D3. E3 empty. Target at F3 (b-a-1).
        playerMoves: [
          { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 3, row: "F" } },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADVANCED (19–26) — Complex 2-move tactics
  // ═══════════════════════════════════════════════════════════════

  // ── 19: Knight Sacrifice ──────────────────────────────────────
  // Knight removes the defender of F10, then footman advances.
  // Knight at E9 → G10 (down 2 = G, right 1 = 10). Leg: F9 empty.
  {
    id: 19,
    title: "Knight Sacrifice",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Remove the defender with your Knight, then advance to the capture point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 10, "E"),  // advances to F10 after defender removed
        knight("w-k-1", "white", 9, "E"),    // captures defender at G10
        archer("w-a-1", "white", 6, "D"),
        footman("w-f-4", "white", 7, "F"),
        footman("b-f-1", "black", 10, "G"),  // defender of F10 (behind river, moves to F10)
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 3, "I"),
        knight("b-k-1", "black", 8, "J"),
        footman("b-f-3", "black", 2, "H"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "white", F10: null },
    },
    solution: [
      {
        // Knight E9 → G10 (down 2 = G, right 1 = 10). Leg: F9 empty ✓
        playerMoves: [
          { type: "capture", pieceId: "w-k-1", to: { col: 10, row: "G" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 5, row: "J" } },
      },
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 10, row: "F" } },
        ],
      },
    ],
  },

  // ── 20: Forced March ──────────────────────────────────────────
  // Advance to undefended CP first, opponent contests the other,
  // then push opponent off the contested one.
  {
    id: 20,
    title: "Forced March",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Take the undefended point first — then deal with the defender.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 7, "E"),   // pusher then occupy
        footman("w-f-4", "white", 10, "E"),  // advances to F10
        archer("w-a-1", "white", 6, "D"),
        footman("b-f-1", "black", 7, "G"),   // can contest F7 (behind river, 1 tile forward)
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 3, "I"),
        knight("b-k-1", "black", 9, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
    },
    solution: [
      {
        // Take F10 first (undefended)
        playerMoves: [
          { type: "move", pieceId: "w-f-4", to: { col: 10, row: "F" } },
        ],
        // Black contests F7
        opponentResponse: { type: "move", pieceId: "b-f-1", to: { col: 7, row: "F" } },
      },
      {
        // Push black off F7 from E7 direction [1,0]
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-3",
          targetPieceId: "b-f-1",
          pushDirection: [1, 0] as [number, number],
        }],
      },
    ],
  },

  // ── 21: Push into Trap ────────────────────────────────────────
  // Push an enemy piece into a diagonal where another footman captures.
  // Pusher at G4 pushes b-f-1 at G5 right to G6. Then w-f-2 at F5
  // (beyond river for white) captures backward diag G6.
  {
    id: 21,
    title: "Push into Trap",
    objective: "White to capture the knight in 2 moves",
    difficulty: "advanced",
    category: "tactical",
    hint: "Push one enemy into the capture range of your other piece.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "G"),   // pusher (beyond river, adjacent to G5)
        footman("w-f-2", "white", 5, "F"),   // capturer (at river)
        // Wait, F5 is "at" river for white. Capture = forward diag only = G4 and G6.
        // After push, enemy is at G6. w-f-2 at F5 captures forward diag right = G6 ✓
        // Actually wait — the push moves b-f-1 from G5 to G6. But w-f-1 is at G4 pushing to G5.
        // Direction from G4 to G5: [0, 1] (same row G, col increases from 4 to 5).
        // Enemy at G5 pushed to G6. ✓
        archer("w-a-1", "white", 8, "D"),
        knight("w-k-1", "white", 2, "C"),
        footman("w-f-3", "white", 1, "F"),
        knight("b-k-1", "black", 5, "G"),    // push target
        footman("b-f-1", "black", 7, "F"),
        footman("b-f-2", "black", 3, "H"),
        archer("b-a-1", "black", 9, "I"),
        footman("b-f-3", "black", 6, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: "black", F10: null },
    },
    solution: [
      {
        // Push b-k-1 from G5 to G6 (direction [0,1] from G4)
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-1",
          targetPieceId: "b-k-1",
          pushDirection: [0, 1] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 6, row: "J" } },
      },
      {
        // w-f-2 at F5 captures forward diag right = G6 (b-k-1)
        playerMoves: [
          { type: "capture", pieceId: "w-f-2", to: { col: 6, row: "G" } },
        ],
      },
    ],
  },

  // ── 22: The Gauntlet ──────────────────────────────────────────
  // 2-move: Longshot to remove enemy from CP, then advance for checkmate.
  {
    id: 22,
    title: "The Gauntlet",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Use your Archer to clear a capture point, then advance.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "F"),
        footman("w-f-2", "white", 10, "F"),
        archer("w-a-1", "white", 7, "C"),    // longshots to F7
        footman("w-f-3", "white", 7, "D"),   // screen
        footman("w-f-4", "white", 1, "E"),   // advances to F1
        knight("w-k-1", "white", 9, "B"),
        footman("b-f-1", "black", 7, "F"),   // on F7 — longshot removes
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 3, "I"),
        knight("b-k-1", "black", 8, "J"),
        footman("b-f-3", "black", 2, "H"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "white", F7: "black", F10: "white" },
    },
    solution: [
      {
        // Longshot: C7 → F7 (dist 3, screen at D7, E7 empty)
        playerMoves: [
          { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "F" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 5, row: "J" } },
      },
      {
        // Advance w-f-4 to F1
        playerMoves: [
          { type: "move", pieceId: "w-f-4", to: { col: 1, row: "F" } },
        ],
      },
    ],
  },

  // ── 23: Contested Waters ──────────────────────────────────────
  // Complex CM1: Three possible CPs, only one works.
  // F7 → contested by b-f-2 at G8 (forward diag from G8 = F7 or F9).
  // F10 → contested by b-k-1 at H9 (L-shape to F10: up 2 = F, right 1 = 10).
  //        Leg check: G9 must be empty. G9 is empty → knight reaches F10. ✗
  // F4 → safe! No black piece can reach it.
  {
    id: 23,
    title: "Contested Waters",
    objective: "White to checkmate in 1 move",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Two capture points are defended — find the one that isn't.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 7, "F"),
        footman("w-f-3", "white", 4, "E"),   // can reach F4
        footman("w-f-4", "white", 7, "E"),   // could reach F7 (trap)
        footman("w-f-5", "white", 10, "E"),  // could reach F10 (trap)
        archer("w-a-1", "white", 5, "D"),
        footman("b-f-1", "black", 3, "K"),
        footman("b-f-2", "black", 8, "G"),   // contests F7 (forward diag)
        knight("b-k-1", "black", 9, "H"),    // contests F10 (L-shape H9→F10)
        archer("b-a-1", "black", 6, "I"),
        footman("b-f-3", "black", 2, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: "white", F10: null },
    },
    solution: [{
      // F4 is the only safe CP. Black can contest F7 (b-f-2) and F10 (b-k-1).
      playerMoves: [
        { type: "move", pieceId: "w-f-3", to: { col: 4, row: "F" } },
      ],
    }],
  },

  // ── 24: Clear and Strike ──────────────────────────────────────
  // 2-move: Push a piece to clear the longshot lane, then longshot
  // the enemy on the capture point for checkmate.
  // Archer at C4. Screen at D4. E4 has blocker (2nd screen = blocks).
  // Push E4 blocker to E5 (sideways), then longshot C4→F4.
  {
    id: 24,
    title: "Clear and Strike",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "The longshot lane is blocked — push the blocker away, then fire.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 7, "F"),
        archer("w-a-1", "white", 4, "C"),    // longshot to F4
        footman("w-f-3", "white", 4, "D"),   // screen
        footman("w-f-4", "white", 3, "E"),   // pusher (adjacent to E4 blocker)
        knight("w-k-1", "white", 8, "B"),
        footman("b-f-1", "black", 4, "E"),   // blocker in lane
        footman("b-f-2", "black", 4, "F"),   // TARGET on F4
        archer("b-a-1", "black", 6, "I"),
        knight("b-k-1", "black", 9, "J"),
        footman("b-f-3", "black", 2, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: "white", F10: null },
    },
    solution: [
      {
        // Push b-f-1 from E4 to E5 (direction [0,1] from E3)
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-4",
          targetPieceId: "b-f-1",
          pushDirection: [0, 1] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 2, row: "J" } },
      },
      {
        // Longshot: C4 → F4 (dist 3 forward). Screen at D4. E4 now empty.
        playerMoves: [
          { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 4, row: "F" } },
        ],
      },
    ],
  },

  // ── 25: Triple Fork ───────────────────────────────────────────
  // CM1: Knight at D8 has three possible L-moves to CPs.
  // F7 (down 2, left 1) — leg E8 empty ✓ — but b-f-1 at G8 contests (forward diag = F7)
  // F9 (down 2, right 1) — leg E8 empty ✓ — F9 is NOT a capture point
  // B7 (up 2, left 1) — not a CP
  // Actually only F7 is a CP reachable. Let me redesign.
  // Knight at D9 can reach: F10 (down 2, right 1, leg E9), F8 (down 2, left 1), B10 (up 2, right 1), B8 (up 2, left 1), C7 (left 2, down 1), E7 (left 2, up 1... wait).
  // Hmm. Let me use a simpler approach.
  // Knight at E8 → F10 (right 2, down 1). Leg: E9... wait.
  // E8: row E (4), col 8 (7). Right 2 = col 10 (9). Down 1 = F (5). = F10. Leg: col 8+1=9, same row E = E9. Must be empty.
  // But F10 may be contested. Let me just make a clean CM1 with knight.
  //
  // Actually, let me make this simpler: Knight can reach two CPs, one defended, one not.
  // Knight at D8. Can reach F7 (down 2=F, left 1=7. Leg: E8 empty ✓) and F9 (down 2=F, right 1=9. Leg: E8 empty ✓).
  // F7 is a CP. F9 is NOT a CP. So only F7 matters.
  // But b-f-2 at G6 can capture forward diag to F7 (behind river for black, forward=toward A, diag = F6 or F8... wait).
  // Black forward from G = toward F. Forward diag from G6 = F5 or F7. So b-f-2 at G6 CAN reach F7. ✗
  // b-f-3 at G8 forward diag = F7 or F9. Also reaches F7!
  // So F7 is contested. The knight can't checkmate via F7.
  // What if the knight captures the defender first? That's 2 moves...
  //
  // Let me simplify this puzzle. White has F1 and F10. Knight at D8 can reach F7.
  // b-f-1 at G6 contests F7 (forward diag F7). b-f-2 at G8 also contests F7 (forward diag F7).
  // But if knight moves to capture b-f-1 at G6... that's not an L-shape from D8 to G6.
  // D8 (row 3, col 7) → G6 = (row 6, col 5). Diff: +3, -2. Not L-shape.
  //
  // OK let me just make a different puzzle for #25. I'll do a non-obvious checkmate where
  // the footman capture creates the 3rd CP.
  {
    id: 25,
    title: "Triple Fork",
    objective: "White to checkmate in 1 move",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Your Knight can reach a capture point — but check if it's defended.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 10, "F"),
        // Knight at D8: can reach F7 (down 2, left 1, leg E8) and F9 (down 2, right 1, leg E8).
        // F7 is contested by b-f-1 at G6 (forward diag F7). F9 is not a CP.
        // But knight can also reach B7 (up 2, left 1, leg C8) and B9 (up 2, right 1, leg C8).
        // None of those are CPs.
        // SO: White needs to find a DIFFERENT piece to get the 3rd CP.
        // w-f-3 at E3 can capture forward diag to F4. If b-f-2 is at F4, capture it!
        knight("w-k-1", "white", 8, "D"),    // distractor
        footman("w-f-3", "white", 3, "E"),   // correct: captures to F4
        archer("w-a-1", "white", 6, "D"),
        footman("b-f-1", "black", 6, "G"),   // contests F7 (forward diag = F5 or F7)
        footman("b-f-2", "black", 4, "F"),   // on F4 — capturable
        archer("b-a-1", "black", 8, "I"),
        knight("b-k-1", "black", 5, "J"),
        footman("b-f-3", "black", 2, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: null, F10: "white" },
    },
    solution: [{
      // w-f-3 at E3 captures forward diag right F4 (b-f-2).
      // White gets F1 + F4 + F10 = 3 CPs.
      // Knight at D8 going to F7 would be contested by b-f-1 at G6.
      // But F4 via capture is safe — no black piece can contest F1/F4/F10.
      playerMoves: [
        { type: "capture", pieceId: "w-f-3", to: { col: 4, row: "F" } },
      ],
    }],
  },

  // ── 26: Endgame Squeeze ───────────────────────────────────────
  // 2-move checkmate with few pieces. White has F1. Need F4+F7 or F4+F10.
  // w-f-2 at E4 advances to F4. Black's only defender moves to contest F7.
  // w-f-3 at E10 advances to F10 for checkmate.
  {
    id: 26,
    title: "Endgame Squeeze",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Force the defender to choose — they can only protect one point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "E"),   // advance to F4
        footman("w-f-3", "white", 10, "E"),  // advance to F10
        footman("w-f-4", "white", 7, "E"),   // advance to F7 (forces response)
        archer("w-a-1", "white", 6, "D"),
        // Black's only piece that can contest anything:
        footman("b-f-1", "black", 8, "G"),   // can reach F7 (behind, forward diag F7 or F9)
        // But can't be in two places — if contests F7, F10 is open.
        footman("b-f-2", "black", 3, "K"),
        archer("b-a-1", "black", 5, "J"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: null, F10: null },
    },
    solution: [
      {
        // Advance w-f-2 to F4
        playerMoves: [
          { type: "move", pieceId: "w-f-2", to: { col: 4, row: "F" } },
        ],
        // Black must try to stop 3 CPs. b-f-1 contests F7 (only option).
        opponentResponse: { type: "move", pieceId: "b-f-1", to: { col: 7, row: "F" } },
      },
      {
        // Take F10 — uncontested. White has F1 + F4 + F10 = 3 CPs.
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 10, row: "F" } },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL (27–30) — Promotion, ransom, endgame puzzles
  // ═══════════════════════════════════════════════════════════════

  // ── 27: Promotion March ───────────────────────────────────────
  // Endgame: Footman reaches enemy back row K for promotion.
  // Must navigate past enemy pieces.
  {
    id: 27,
    title: "Promotion March",
    objective: "White to promote",
    difficulty: "intermediate",
    category: "promotion",
    hint: "Your Footman is beyond the river — advance to the enemy back row.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "I"),   // beyond river, 2 forward to K
        footman("w-f-2", "white", 4, "F"),
        archer("w-a-1", "white", 8, "G"),
        knight("w-k-1", "white", 2, "E"),
        footman("b-f-1", "black", 3, "I"),   // can't block col 5
        archer("b-a-1", "black", 7, "H"),
        knight("b-k-1", "black", 9, "J"),
        footman("b-f-2", "black", 6, "K"),   // on back row but col 6, not blocking col 5
      ],
      turn: "white",
      capturedPieces: {
        white: [knight("w-k-cap", "white", 0, "A")],
        black: [],
      },
    },
    solution: [{
      // w-f-1 at I5 moves 2 forward to K5 (beyond river: 2 forward).
      // K is enemy back row → triggers promotion.
      playerMoves: [
        { type: "move", pieceId: "w-f-1", to: { col: 5, row: "K" } },
      ],
    }],
  },

  // ── 28: Knight's Ransom ───────────────────────────────────────
  // Knight captures enemy knight → triggers ransom mechanic.
  // Realistic position with multiple pieces.
  {
    id: 28,
    title: "Knight's Ransom",
    objective: "White to trigger ransom",
    difficulty: "intermediate",
    category: "promotion",
    hint: "When a Knight captures another Knight, it triggers the ransom mechanic.",
    boardSetup: {
      pieces: [
        knight("w-k-1", "white", 5, "D"),    // D5 → F6 (down 2, right 1, leg E5)
        footman("w-f-1", "white", 4, "F"),
        footman("w-f-2", "white", 1, "F"),
        archer("w-a-1", "white", 7, "C"),
        footman("w-f-3", "white", 3, "E"),
        knight("b-k-1", "black", 6, "F"),    // TARGET (knight captures knight = ransom)
        footman("b-f-1", "black", 7, "F"),
        archer("b-a-1", "black", 5, "H"),
        footman("b-f-2", "black", 9, "I"),
        footman("b-f-3", "black", 3, "G"),
      ],
      turn: "white",
      capturedPieces: {
        white: [archer("w-a-cap", "white", 0, "A")],
        black: [],
      },
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [{
      // Knight D5 → F6 (down 2, right 1). Leg: E5 must be empty ✓.
      // Captures b-k-1 (knight). Triggers ransom.
      playerMoves: [
        { type: "capture", pieceId: "w-k-1", to: { col: 6, row: "F" } },
      ],
    }],
  },

  // ── 29: Breakthrough ──────────────────────────────────────────
  // 2-move: Capture blocker, then advance to back row for promotion.
  {
    id: 29,
    title: "Breakthrough",
    objective: "White to promote in 2 moves",
    difficulty: "advanced",
    category: "promotion",
    hint: "Capture the piece in your path, then advance to the back row.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "I"),   // beyond river
        footman("w-f-2", "white", 4, "F"),
        archer("w-a-1", "white", 8, "G"),
        knight("w-k-1", "white", 2, "E"),
        footman("b-f-1", "black", 6, "J"),   // blocker — capturable (diag from I5)
        archer("b-a-1", "black", 3, "H"),
        knight("b-k-1", "black", 9, "J"),
        footman("b-f-2", "black", 7, "K"),
      ],
      turn: "white",
      capturedPieces: {
        white: [archer("w-a-cap", "white", 0, "A")],
        black: [],
      },
    },
    solution: [
      {
        // w-f-1 at I5 beyond river: all 4 diag captures.
        // Forward diag right = J6 (b-f-1). Capture!
        playerMoves: [
          { type: "capture", pieceId: "w-f-1", to: { col: 6, row: "J" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 7, row: "J" } },
      },
      {
        // w-f-1 now at J6. Beyond river. 2 tiles forward = L6 (invalid) or K6 (1 tile).
        // Wait, beyond river movement: 2 forward/back, 1 sideways.
        // J6 (row J=9) + 1 forward = K6 (row 10). That's within bounds. But 2 forward = row 11 = invalid.
        // So w-f-1 at J6 can move to K6 (1 forward), or 2 backward, or 1 sideways.
        // K6 is the enemy back row → promotion!
        playerMoves: [
          { type: "move", pieceId: "w-f-1", to: { col: 6, row: "K" } },
        ],
      },
    ],
  },

  // ── 30: Grandmaster ───────────────────────────────────────────
  // Hardest puzzle: 2-move checkmate combining longshot and capture.
  // Step 1: Longshot removes defender from F7 area.
  // Step 2: Footman captures enemy on F4 to complete checkmate.
  {
    id: 30,
    title: "Grandmaster",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "The longshot isn't for checkmate — it removes a key defender.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 7, "F"),
        footman("w-f-3", "white", 3, "E"),   // captures forward diag F4
        archer("w-a-1", "white", 5, "B"),    // longshot to E5 (removes defender)
        footman("w-f-4", "white", 5, "C"),   // screen for longshot
        knight("w-k-1", "white", 9, "D"),
        // b-f-1 at F4 is the capture target. b-a-1 at E5 defends F4
        // by being able to move onto F4 if white tries to capture.
        // Wait, actually the defender concept is: if white captures b-f-1 at F4,
        // can black recapture? b-a-1 can't capture (archers don't capture by moving).
        // Let me rethink: b-a-1 at E5 can contest a CP by moving onto it.
        // Actually, for checkmate, what matters is whether black can reduce white's CPs below 3.
        // If white captures at F4, getting F1+F4+F7 = 3 CPs, black needs to take one back.
        // b-a-1 at E5 can't capture (archers don't capture by moving to occupied tiles).
        //
        // Let me redesign: the defender is a footman that can capture white's piece after
        // white takes F4. b-f-2 at E5 (beyond river for black) can capture diag to F4.
        // So step 1: longshot removes b-f-2 from E5. Step 2: capture b-f-1 at F4 safely.
        footman("b-f-1", "black", 4, "F"),   // on F4 (capture target)
        footman("b-f-2", "black", 5, "E"),   // defender (beyond river for black: can capture diag F4)
        // Black beyond river = A-E. E5 is beyond for black.
        // Beyond river captures = all 4 diags = D4, D6, F4, F6.
        // F4 has b-f-1 (friendly) so can't capture there. But if white takes F4,
        // then b-f-2 captures at F4 (diagonal from E5 to F4 = forward for black? No.
        // Beyond river for black = all 4 diags. F4 from E5 = row F, col 4 from row E, col 5.
        // That's (row+1, col-1) = forward diag for white, backward diag for black.
        // But beyond river = ALL 4 diags, so yes ✓
        archer("b-a-1", "black", 8, "I"),
        knight("b-k-1", "black", 3, "J"),
        footman("b-f-3", "black", 6, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: "white", F10: null },
    },
    solution: [
      {
        // Longshot: B5 → E5 (dist 3 forward). Screen at C5. D5 empty. Target E5 (b-f-2).
        // Removes the defender who could recapture at F4.
        playerMoves: [
          { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 5, row: "E" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-3", to: { col: 6, row: "J" } },
      },
      {
        // w-f-3 at E3 captures forward diag right F4 (b-f-1).
        // White now has F1 + F4 + F7 = 3 CPs. No black piece can contest.
        playerMoves: [
          { type: "capture", pieceId: "w-f-3", to: { col: 4, row: "F" } },
        ],
      },
    ],
  },
];

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}
