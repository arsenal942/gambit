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
// CAPTURE PUZZLES (1–6) — Beginner
// ═══════════════════════════════════════════════════════════════

export const PUZZLES: Puzzle[] = [
  // ── 1: First Strike ────────────────────────────────────────
  {
    id: 1,
    title: "First Strike",
    objective: "White to capture",
    difficulty: "beginner",
    category: "capture",
    hint: "Footmen capture diagonally forward.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "E"),
        footman("b-f-1", "black", 6, "F"),
        footman("b-f-2", "black", 3, "H"),
        archer("b-a-1", "black", 8, "G"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 6, row: "F" } },
      ],
    }],
  },

  // ── 2: Rear Guard ──────────────────────────────────────────
  {
    id: 2,
    title: "Rear Guard",
    objective: "White to capture",
    difficulty: "beginner",
    category: "capture",
    hint: "Beyond the River, Footmen capture in all four diagonal directions.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "G"),
        footman("b-f-1", "black", 4, "F"),
        footman("b-f-2", "black", 7, "I"),
        archer("b-a-1", "black", 2, "J"),
      ],
      turn: "white",
    },
    solution: [{
      // Beyond river: backward diagonal capture (G5 → F4)
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 4, row: "F" } },
      ],
    }],
  },

  // ── 3: Knight Fork ─────────────────────────────────────────
  {
    id: 3,
    title: "Knight Fork",
    objective: "White to capture the archer",
    difficulty: "beginner",
    category: "capture",
    hint: "Knights move in an L-shape: 2 tiles then 1 tile perpendicular.",
    boardSetup: {
      pieces: [
        // Knight at D5: down 2 (F5), right 1 = F6 ✓
        // Leg check: E5 (first step down) must be empty ✓
        knight("w-k-1", "white", 5, "D"),
        archer("b-a-1", "black", 6, "F"),
        footman("b-f-1", "black", 4, "F"),
        footman("b-f-2", "black", 8, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-k-1", to: { col: 6, row: "F" } },
      ],
    }],
  },

  // ── 4: Diagonal Sweep ──────────────────────────────────────
  {
    id: 4,
    title: "Diagonal Sweep",
    objective: "White to capture",
    difficulty: "beginner",
    category: "capture",
    hint: "Behind the River, Footmen only capture diagonally forward — not straight ahead.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 3, "D"),
        // Forward diagonal right: E4 ✓
        footman("b-f-1", "black", 4, "E"),
        // Straight ahead at E3: NOT capturable (that's a move, not diagonal)
        footman("b-f-2", "black", 3, "E"),
        archer("b-a-1", "black", 7, "H"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 4, row: "E" } },
      ],
    }],
  },

  // ── 5: Cavalry Charge ──────────────────────────────────────
  {
    id: 5,
    title: "Cavalry Charge",
    objective: "White to capture",
    difficulty: "beginner",
    category: "capture",
    hint: "Check the Knight's L-shaped destinations — some directions may be blocked.",
    boardSetup: {
      pieces: [
        // Knight at E4: right 2 (col 6), down 1 (F) = F6. First step right: E5 must be empty ✓
        knight("w-k-1", "white", 4, "E"),
        archer("b-a-1", "black", 6, "F"),
        // Leg cut blocker: piece at D4 blocks upward direction
        footman("w-f-1", "white", 4, "D"),
        footman("b-f-1", "black", 3, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-k-1", to: { col: 6, row: "F" } },
      ],
    }],
  },

  // ── 6: Double Vision ───────────────────────────────────────
  {
    id: 6,
    title: "Double Vision",
    objective: "White to capture the knight",
    difficulty: "beginner",
    category: "capture",
    hint: "Only one of your pieces can reach the target — which one is beyond the River?",
    boardSetup: {
      pieces: [
        // Beyond river: captures all 4 diags. G7 → H8 ✓
        footman("w-f-1", "white", 7, "G"),
        footman("w-f-2", "white", 3, "E"),
        knight("b-k-1", "black", 8, "H"),
        footman("b-f-1", "black", 5, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-f-1", to: { col: 8, row: "H" } },
      ],
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // LONGSHOT PUZZLES (7–11) — Beginner / Intermediate
  // ═══════════════════════════════════════════════════════════════

  // ── 7: Archer's Eye ────────────────────────────────────────
  {
    id: 7,
    title: "Archer's Eye",
    objective: "White to longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "Fire through your Footman to hit the enemy beyond.",
    boardSetup: {
      pieces: [
        // Forward longshot dist 2: C3→E3, screen at D3
        archer("w-a-1", "white", 3, "C"),
        footman("w-f-1", "white", 3, "D"),
        footman("b-f-1", "black", 3, "E"),
        footman("b-f-2", "black", 7, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 3, row: "E" } },
      ],
    }],
  },

  // ── 8: Long Range ──────────────────────────────────────────
  {
    id: 8,
    title: "Long Range",
    objective: "White to longshot",
    difficulty: "beginner",
    category: "longshot",
    hint: "Archers can fire up to 3 tiles forward through a screen.",
    boardSetup: {
      pieces: [
        // Forward dist 3: B5→E5, screen at C5, D5 empty
        archer("w-a-1", "white", 5, "B"),
        footman("w-f-1", "white", 5, "C"),
        knight("b-k-1", "black", 5, "E"),
        footman("b-f-1", "black", 2, "J"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 5, row: "E" } },
      ],
    }],
  },

  // ── 9: Sidewinder ──────────────────────────────────────────
  {
    id: 9,
    title: "Sidewinder",
    objective: "White to longshot",
    difficulty: "intermediate",
    category: "longshot",
    hint: "Archers can also fire sideways — up to 2 tiles through a screen.",
    boardSetup: {
      pieces: [
        // Sideways right dist 2: F3→F5, screen at F4
        archer("w-a-1", "white", 3, "F"),
        knight("w-k-1", "white", 4, "F"),
        footman("b-f-1", "black", 5, "F"),
        footman("b-f-2", "black", 8, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 5, row: "F" } },
      ],
    }],
  },

  // ── 10: Screen Play ────────────────────────────────────────
  {
    id: 10,
    title: "Screen Play",
    objective: "White to longshot",
    difficulty: "intermediate",
    category: "longshot",
    hint: "Any piece — even an enemy — can be the screen.",
    boardSetup: {
      pieces: [
        // Forward dist 2: B7→D7, screen at C7 (enemy footman)
        archer("w-a-1", "white", 7, "B"),
        footman("b-f-1", "black", 7, "C"),
        knight("b-k-1", "black", 7, "D"),
        footman("b-f-2", "black", 3, "J"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "D" } },
      ],
    }],
  },

  // ── 11: Crossfire ──────────────────────────────────────────
  {
    id: 11,
    title: "Crossfire",
    objective: "White to longshot",
    difficulty: "intermediate",
    category: "longshot",
    hint: "Look for the sideways longshot — only one direction has a valid screen.",
    boardSetup: {
      pieces: [
        // Sideways right dist 2: E6→E8, screen at E7
        archer("w-a-1", "white", 6, "E"),
        footman("w-f-1", "white", 7, "E"),
        archer("b-a-1", "black", 8, "E"),
        footman("b-f-1", "black", 4, "E"),
        knight("b-k-1", "black", 2, "I"),
      ],
      turn: "white",
    },
    solution: [{
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 8, row: "E" } },
      ],
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // PUSHBACK PUZZLES (12–15) — Intermediate
  // ═══════════════════════════════════════════════════════════════

  // ── 12: River Shove ────────────────────────────────────────
  {
    id: 12,
    title: "River Shove",
    objective: "White to push the enemy off the capture point",
    difficulty: "intermediate",
    category: "pushback",
    hint: "Pushback shoves the enemy 1 tile away from your Footman.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "E"),
        footman("b-f-1", "black", 4, "F"),
        footman("w-f-2", "white", 1, "F"),
        footman("b-f-2", "black", 7, "H"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: null, F10: null },
    },
    solution: [{
      // Push from E4→F4 direction [1,0], pushes b-f-1 to G4
      playerMoves: [{
        type: "pushback",
        pieceId: "w-f-1",
        targetPieceId: "b-f-1",
        pushDirection: [1, 0] as [number, number],
      }],
    }],
  },

  // ── 13: Side Push ──────────────────────────────────────────
  {
    id: 13,
    title: "Side Push",
    objective: "White to push the enemy aside",
    difficulty: "intermediate",
    category: "pushback",
    hint: "Push the enemy sideways to clear the path forward.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "F"),
        footman("b-f-1", "black", 6, "F"),
        archer("b-a-1", "black", 9, "J"),
      ],
      turn: "white",
    },
    solution: [{
      // Push from F5→F6 direction [0,1], pushes b-f-1 to F7
      playerMoves: [{
        type: "pushback",
        pieceId: "w-f-1",
        targetPieceId: "b-f-1",
        pushDirection: [0, 1] as [number, number],
      }],
    }],
  },

  // ── 14: Clear the Path ─────────────────────────────────────
  {
    id: 14,
    title: "Clear the Path",
    objective: "White to capture in 2 moves",
    difficulty: "intermediate",
    category: "pushback",
    hint: "Push the blocker away, then capture the exposed target.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "E"),
        footman("b-f-1", "black", 5, "F"),
        footman("w-f-2", "white", 6, "E"),
        archer("b-a-1", "black", 7, "F"),
        footman("b-f-2", "black", 3, "K"),
      ],
      turn: "white",
    },
    solution: [
      {
        // Push b-f-1 from F5 to G5 (direction [1,0] from E5)
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-1",
          targetPieceId: "b-f-1",
          pushDirection: [1, 0] as [number, number],
        }],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 3, row: "J" } },
      },
      {
        // w-f-2 at E6 captures forward diagonal F7 (b-a-1)
        playerMoves: [
          { type: "capture", pieceId: "w-f-2", to: { col: 7, row: "F" } },
        ],
      },
    ],
  },

  // ── 15: Edge Push ──────────────────────────────────────────
  {
    id: 15,
    title: "Edge Push",
    objective: "White to push the enemy off the capture point",
    difficulty: "intermediate",
    category: "pushback",
    hint: "Push the enemy away from the board edge.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 10, "E"),
        footman("b-f-1", "black", 10, "F"),
        footman("b-f-2", "black", 3, "I"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: null, F7: null, F10: "black" },
    },
    solution: [{
      // Push from E10→F10 direction [1,0], pushes to G10
      playerMoves: [{
        type: "pushback",
        pieceId: "w-f-1",
        targetPieceId: "b-f-1",
        pushDirection: [1, 0] as [number, number],
      }],
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // CHECKMATE IN 1 (16–21) — Intermediate
  // ═══════════════════════════════════════════════════════════════

  // ── 16: Three Flags ────────────────────────────────────────
  {
    id: 16,
    title: "Three Flags",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Move onto a third capture point — make sure the opponent can't reach any.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 7, "E"),
        footman("b-f-1", "black", 2, "K"),
        footman("b-f-2", "black", 5, "K"),
        footman("b-f-3", "black", 9, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
    },
    solution: [{
      playerMoves: [
        { type: "move", pieceId: "w-f-3", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 17: River Control ──────────────────────────────────────
  {
    id: 17,
    title: "River Control",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Which capture point can you take where the enemy can't respond?",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 7, "F"),
        footman("w-f-3", "white", 4, "E"),
        // Knight at H9 can reach F10 but NOT F4
        knight("b-k-1", "black", 9, "H"),
        footman("b-f-1", "black", 6, "K"),
        footman("b-f-2", "black", 3, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: "white", F10: null },
    },
    solution: [{
      // Take F4 — knight can reach F10 but not F1/F4/F7
      playerMoves: [
        { type: "move", pieceId: "w-f-3", to: { col: 4, row: "F" } },
      ],
    }],
  },

  // ── 18: Fortress ───────────────────────────────────────────
  {
    id: 18,
    title: "Fortress",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "The enemy knight is blocked by leg cut — it can't reach your capture point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "F"),
        footman("w-f-2", "white", 10, "F"),
        footman("w-f-3", "white", 1, "E"),
        knight("b-k-1", "black", 2, "D"),
        // Blocker causes leg cut on knight's downward direction
        footman("w-f-4", "white", 2, "E"),
        footman("b-f-1", "black", 8, "K"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "white", F7: null, F10: "white" },
    },
    solution: [{
      playerMoves: [
        { type: "move", pieceId: "w-f-3", to: { col: 1, row: "F" } },
      ],
    }],
  },

  // ── 19: Distant Checkmate ──────────────────────────────────
  {
    id: 19,
    title: "Distant Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Your Knight can jump to a capture point in one L-shaped move.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        // Knight at D8 → F7: down 2 (F), left 1 (7). First step E8 must be empty ✓
        knight("w-k-1", "white", 8, "D"),
        footman("b-f-1", "black", 3, "K"),
        footman("b-f-2", "black", 6, "K"),
        archer("b-a-1", "black", 9, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
    },
    solution: [{
      playerMoves: [
        { type: "move", pieceId: "w-k-1", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 20: Capture to Checkmate ───────────────────────────────
  {
    id: 20,
    title: "Capture to Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Capture the enemy sitting on a capture point to take it for yourself.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        // w-f-3 at E6: forward diagonal right = F7 ✓
        footman("w-f-3", "white", 6, "E"),
        footman("b-f-1", "black", 7, "F"),
        footman("b-f-2", "black", 5, "K"),
        footman("b-f-3", "black", 9, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-f-3", to: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 21: Knight Checkmate ───────────────────────────────────
  {
    id: 21,
    title: "Knight Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "intermediate",
    category: "checkmate",
    hint: "Your Knight can jump to the capture point in one L-shaped move.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 7, "F"),
        // Knight at D9 → F10: down 2 (F), right 1 (10). First step E9 must be empty ✓
        knight("w-k-1", "white", 9, "D"),
        footman("b-f-1", "black", 4, "K"),
        archer("b-a-1", "black", 6, "J"),
        footman("b-f-2", "black", 2, "I"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: null, F7: "white", F10: null },
    },
    solution: [{
      playerMoves: [
        { type: "move", pieceId: "w-k-1", to: { col: 10, row: "F" } },
      ],
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // CHECKMATE IN 2 (22–26) — Advanced
  // ═══════════════════════════════════════════════════════════════

  // ── 22: Two-Step Checkmate ─────────────────────────────────
  {
    id: 22,
    title: "Two-Step Checkmate",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Advance both footmen to the river — one per turn.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "E"),
        footman("w-f-3", "white", 7, "E"),
        footman("b-f-1", "black", 3, "K"),
        footman("b-f-2", "black", 6, "K"),
        footman("b-f-3", "black", 9, "K"),
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
          { type: "move", pieceId: "w-f-3", to: { col: 7, row: "F" } },
        ],
      },
    ],
  },

  // ── 23: Knight Advance ─────────────────────────────────────
  {
    id: 23,
    title: "Knight Advance",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Move your Knight closer first, then jump to the capture point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 4, "F"),
        footman("w-f-2", "white", 7, "F"),
        // Knight B3 → D2 → F1 (two L-shaped moves)
        knight("w-k-1", "white", 3, "B"),
        footman("b-f-1", "black", 8, "K"),
        footman("b-f-2", "black", 5, "K"),
        archer("b-a-1", "black", 2, "K"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: "white", F7: "white", F10: null },
    },
    solution: [
      {
        // B3→D2: down 2 (D), left 1 (2). First step C3 empty ✓
        playerMoves: [
          { type: "move", pieceId: "w-k-1", to: { col: 2, row: "D" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-1", to: { col: 8, row: "J" } },
      },
      {
        // D2→F1: down 2 (F), left 1 (1). First step E2 empty ✓
        playerMoves: [
          { type: "move", pieceId: "w-k-1", to: { col: 1, row: "F" } },
        ],
      },
    ],
  },

  // ── 24: River Rush ─────────────────────────────────────────
  {
    id: 24,
    title: "River Rush",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Both footmen advance to the river — the enemy is too far to stop you.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 10, "F"),
        footman("w-f-2", "white", 1, "E"),
        footman("w-f-3", "white", 7, "E"),
        archer("b-a-1", "black", 4, "K"),
        footman("b-f-1", "black", 6, "K"),
        footman("b-f-2", "black", 9, "K"),
      ],
      turn: "white",
      capturePoints: { F1: null, F4: null, F7: null, F10: "white" },
    },
    solution: [
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-2", to: { col: 1, row: "F" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-1", to: { col: 6, row: "J" } },
      },
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 7, row: "F" } },
        ],
      },
    ],
  },

  // ── 25: Capture and Control ────────────────────────────────
  {
    id: 25,
    title: "Capture and Control",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Capture the enemy on a capture point, then advance to another.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        // w-f-2 at E3: forward diagonal right to F4 ✓
        footman("w-f-2", "white", 3, "E"),
        footman("w-f-3", "white", 10, "E"),
        footman("b-f-1", "black", 4, "F"),
        footman("b-f-2", "black", 7, "K"),
        footman("b-f-3", "black", 5, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "black", F7: null, F10: null },
    },
    solution: [
      {
        playerMoves: [
          { type: "capture", pieceId: "w-f-2", to: { col: 4, row: "F" } },
        ],
        opponentResponse: { type: "move", pieceId: "b-f-2", to: { col: 7, row: "J" } },
      },
      {
        playerMoves: [
          { type: "move", pieceId: "w-f-3", to: { col: 10, row: "F" } },
        ],
      },
    ],
  },

  // ── 26: Forced Checkmate ───────────────────────────────────
  {
    id: 26,
    title: "Forced Checkmate",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "checkmate",
    hint: "Take the undefended point first, then push the enemy off the contested one.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 7, "E"),
        footman("w-f-4", "white", 10, "E"),
        // Can reach F7 in 1 move
        footman("b-f-1", "black", 7, "G"),
        footman("b-f-2", "black", 5, "K"),
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
        // Push black off F7: w-f-3 at E7, push F7 to G7 (direction [1,0])
        playerMoves: [{
          type: "pushback",
          pieceId: "w-f-3",
          targetPieceId: "b-f-1",
          pushDirection: [1, 0] as [number, number],
        }],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // TACTICAL COMBOS (27–28) — Advanced
  // ═══════════════════════════════════════════════════════════════

  // ── 27: Longshot Checkmate ───────────────────────────────────
  {
    id: 27,
    title: "Longshot Checkmate",
    objective: "White to checkmate in 1 move",
    difficulty: "advanced",
    category: "tactical",
    hint: "Your Archer can capture the enemy on the capture point with a longshot.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        // Archer at C7, screen at D7, target at F7 (dist 3, E7 empty, 1 screen)
        archer("w-a-1", "white", 7, "C"),
        footman("w-f-3", "white", 7, "D"),
        // Enemy on F7 — longshot target
        footman("b-f-1", "black", 7, "F"),
        footman("b-f-2", "black", 5, "K"),
        footman("b-f-3", "black", 9, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: "black", F10: null },
    },
    solution: [{
      // Longshot: C7→F7, dist 3 forward. Screen at D7, E7 empty. Target at F7 (enemy) ✓
      // Archer moves to F7. White now has F1 + F4 + F7 = 3 CPs = checkmate.
      playerMoves: [
        { type: "longshot", pieceId: "w-a-1", targetPosition: { col: 7, row: "F" } },
      ],
    }],
  },

  // ── 28: Knight Sacrifice ───────────────────────────────────
  {
    id: 28,
    title: "Knight Sacrifice",
    objective: "White to checkmate in 2 moves",
    difficulty: "advanced",
    category: "tactical",
    hint: "Remove the defender with your Knight, then secure the capture point.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 1, "F"),
        footman("w-f-2", "white", 4, "F"),
        footman("w-f-3", "white", 10, "E"),
        // Knight at E9 captures defender at G10
        // E9 = (row 4, col 8). G10 = (row 6, col 9).
        // Down 2 = F (row 5)... wait, row 4 + 2 = row 6 = G. Then perp right = col 9 = 10 → G10 ✓
        // First step: F9 (row 5, col 8) must be empty ✓
        knight("w-k-1", "white", 9, "E"),
        // Defender that can reach F10 in 1 move
        footman("b-f-1", "black", 10, "G"),
        footman("b-f-2", "black", 5, "K"),
      ],
      turn: "white",
      capturePoints: { F1: "white", F4: "white", F7: null, F10: null },
    },
    solution: [
      {
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

  // ═══════════════════════════════════════════════════════════════
  // PROMOTION / RANSOM (29–30) — Intermediate
  // ═══════════════════════════════════════════════════════════════

  // ── 29: Sacrifice and Return ───────────────────────────────
  {
    id: 29,
    title: "Sacrifice and Return",
    objective: "White to promote",
    difficulty: "intermediate",
    category: "promotion",
    hint: "Move your Footman to the enemy back row to trigger promotion.",
    boardSetup: {
      pieces: [
        footman("w-f-1", "white", 5, "J"),
        footman("b-f-1", "black", 3, "I"),
        archer("b-a-1", "black", 8, "H"),
      ],
      turn: "white",
      capturedPieces: {
        white: [knight("w-k-cap", "white", 0, "A")],
        black: [],
      },
    },
    solution: [{
      playerMoves: [
        { type: "move", pieceId: "w-f-1", to: { col: 5, row: "K" } },
      ],
    }],
  },

  // ── 30: Knight Ransom ──────────────────────────────────────
  {
    id: 30,
    title: "Knight Ransom",
    objective: "White to trigger ransom",
    difficulty: "intermediate",
    category: "promotion",
    hint: "Capture the enemy Knight with your Knight to trigger ransom.",
    boardSetup: {
      pieces: [
        // Knight at D5 → F6: down 2 (F), right 1 (6). First step E5 must be empty ✓
        knight("w-k-1", "white", 5, "D"),
        knight("b-k-1", "black", 6, "F"),
        footman("b-f-1", "black", 3, "I"),
      ],
      turn: "white",
      capturedPieces: {
        white: [footman("w-f-cap", "white", 0, "A")],
        black: [],
      },
    },
    solution: [{
      playerMoves: [
        { type: "capture", pieceId: "w-k-1", to: { col: 6, row: "F" } },
      ],
    }],
  },
];

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}
