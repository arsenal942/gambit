# Gambit — Claude Code Prompt 6.5: Full Game Integration Tests

Feed this into Claude Code AFTER Prompt 6 is working and BEFORE Prompt 7.

---

```
The Gambit game engine and local hotseat UI are working. Before adding multiplayer, I need comprehensive integration tests that simulate full game scenarios to verify every mechanic works correctly in context.

Create a new test file: packages/engine/tests/integration.test.ts

These tests should use the actual game state machine — createGame(), executeMove(), etc. — to play through realistic multi-turn game sequences. Every test should verify intermediate state at each step, not just the final result.

## Helper Utilities

First, create test helpers to make the scenarios readable:

```typescript
// Helper to execute a sequence of moves and return final state
function playMoves(initialState: GameState, moves: Action[]): GameState

// Helper to quickly set up a board position (for mid-game scenarios)
function createCustomBoard(pieces: { type: UnitType, player: Player, position: Position, hasMoved?: boolean }[]): GameState

// Helper to count pieces on board
function countPieces(state: GameState, player?: Player): number

// Helper to get all pieces of a type
function getPiecesOfType(state: GameState, player: Player, type: UnitType): Piece[]

// Helper to check capture point control
function getControlledFlags(state: GameState, player: Player): Position[]
```

---

## SCENARIO GROUP 1: Opening Sequences (6-10 moves)

### Test 1.1: Standard Opening — Both Players Advance Footmen
Play the first 10 moves with both sides double-stepping Footmen forward, then making normal Footman moves. Verify after each move:
- Turn alternates correctly
- hasMoved is set to true after each piece moves
- Double-step is no longer available for moved Footmen
- No pieces are captured
- Capture points remain uncontrolled
- turnsSinceCapture increments each half-turn

### Test 1.2: Aggressive Opening — Early Footman Contact
White double-steps a Footman, Black double-steps a Footman into a position where they threaten each other. White captures Black's Footman diagonally. Verify:
- Capture succeeds
- Black Footman removed from board
- Black Footman added to White's capturedPieces
- turnsSinceCapture resets to 0
- Board has 29 pieces total (15 white + 14 black)
- Subsequent moves continue normally

### Test 1.3: Knight Early Development
Both players develop Knights in the opening (Knights jumping over Footmen from the back row). Verify:
- Knights can jump from Row A/K over pieces on Row B/J and Row C/I
- Leg Cut applies if the first tile in the 2-direction is blocked
- Knights land on valid tiles
- Board state is consistent after each jump

### Test 1.4: Archer Development — Sliding Into Position
Archers move 2 tiles forward from starting positions. Verify:
- Archers on Row B can slide to Row D (2 forward) if Row C is clear
- Archers on Row B CANNOT slide to Row D if a Footman on Row C is in the way
- Archers must wait for Footmen to move before they can advance
- 1-tile diagonal move works as an alternative development

---

## SCENARIO GROUP 2: Footman Mechanics Deep Dive

### Test 2.1: Footman River Crossing — Ability Change
Move a White Footman from Row C to Row G (beyond river) step by step. At each row, verify the legal moves returned match the rules:
- Rows C-E (behind): 1 tile forward/backward/sideways
- Row F (at river): 1 tile forward/backward/sideways
- Rows G-K (beyond): 2 tiles forward/backward, 1 tile sideways
Verify capture directions also change:
- Behind/at: diagonal forward only
- Beyond: all 4 diagonals

### Test 2.2: Footman Pushback — Full Scenario
Set up: White Footman on E5, Black Footman on E6 (adjacent, both have moved).
- White pushes Black Footman from E6 to E7 (forward push)
- Verify: White Footman stays on E5, Black Footman is now on E7, no capture occurred
- Black's turn: Black CANNOT push the White Footman (anti-retaliation — but wait, the rule is Black can't push the SAME piece that pushed them. The White Footman pushed, so Black can't pushback with the piece that WAS pushed targeting the piece that DID the pushing. Clarify: the piece that was pushed back cannot retaliate against the pusher on the immediately next turn)
- Actually, re-read the rule: "Pushback cannot be used on the same piece that pushed you back the previous turn." So Black's E7 Footman cannot push White's E5 Footman this turn, but a DIFFERENT Black piece could push White's E5 Footman.
- Verify anti-retaliation is piece-specific, not player-wide
- Next turn (White's): White can now push Black again (anti-retaliation only lasts one opponent turn)

### Test 2.3: Pushback Chain — Multiple Pushbacks Across Turns
Set up: White Footman on E5, Black Footman on E6, Black Archer on E8.
- White pushes Black Footman from E6 to E7
- Black moves a different piece (not the pushed Footman)
- White pushes Black Footman from E7 to E8... but wait, E8 has a Black Archer. Push is blocked.
- White pushes Black Footman from E7 to F7 instead (sideways onto a capture point)
- Verify: Black Footman is now on capture point F7, which Black now controls

### Test 2.4: Pushback — All Edge Cases in One Scenario
Create a custom board with a White Footman surrounded by various blocking situations:
- Push target with a piece behind it (blocked)
- Push target at board edge (blocked)  
- Push target onto an occupied tile (blocked)
- Push target onto an empty tile (succeeds)
- Verify each pushback attempt returns the correct result (blocked/allowed)

### Test 2.5: Footman Double-Step — Not Available After Other Moves
- Move a Footman 1 tile forward (normal move, not double-step)
- On a later turn, verify that Footman can NO LONGER double-step
- Also verify: a Footman that was pushbacked (moved by opponent's push) — does it still count as "has moved"? (It should NOT — hasMoved should only be set when the piece's owner deliberately moves it. Pushback is involuntary. Actually, this is an edge case that needs clarification. For safety, test both interpretations and note which one your engine uses.)

---

## SCENARIO GROUP 3: Archer Mechanics Deep Dive

### Test 3.1: Longshot — Forward Through Friendly Screen
Set up: White Archer on B2, White Footman on C2 (screen), Black Footman on D2 (target).
- White executes Longshot: Archer on B2 targets Black Footman on D2 through screen on C2
- Verify: Black Footman captured, White Archer stays on B2, White Footman on C2 unaffected

### Test 3.2: Longshot — Forward Through Enemy Screen
Set up: White Archer on B2, Black Knight on C2 (screen), Black Footman on D2 (target).
- White Longshots through the enemy Knight to hit the enemy Footman
- Verify: works correctly — screen can be enemy

### Test 3.3: Longshot — Maximum Range Forward (3 tiles)
Set up: White Archer on B2, White Footman on C2 (screen), Black piece on E2 (target, 3 tiles forward).
- Verify: Longshot succeeds at distance 3 with screen at distance 1
Set up: White Archer on B2, White Footman on D2 (screen at distance 2), Black piece on E2 (target at distance 3).
- Verify: Longshot succeeds with screen at distance 2

### Test 3.4: Longshot — Over-Screen (Blocked)
Set up: White Archer on B2, White Footman on C2, Black Knight on D2, Black Footman on E2.
- White tries to Longshot E2 — TWO pieces between Archer and target
- Verify: Longshot is blocked (cannot shoot over 2+ pieces)

### Test 3.5: Longshot — No Screen (Blocked)
Set up: White Archer on B2, empty C2, Black Footman on D2.
- White tries to Longshot D2 — no screen
- Verify: Longshot is blocked

### Test 3.6: Longshot — Backward and Sideways (Max 2 Tiles)
Set up for backward: White Archer on D5, White Footman on C5 (screen behind), Black piece on B5 (target, 2 tiles behind).
- Verify: Backward longshot works
Set up for backward at distance 3: same but target on A5 (3 tiles behind).
- Verify: Blocked (max 2 backward)
Set up for sideways: White Archer on D5, White Footman on D6 (screen right), Black piece on D7 (target, 2 tiles right).
- Verify: Sideways longshot works

### Test 3.7: Longshot — Diagonal Attempt (Should Fail)
Set up: White Archer on D5, White Footman on E6 (diagonal), Black Footman on F7 (diagonal target).
- White tries to Longshot diagonally
- Verify: Not a valid Longshot (diagonal not allowed, should not appear in legal moves)

### Test 3.8: Archer Cannot Capture By Moving
Set up: White Archer on D5, Black Footman on D6 (adjacent enemy).
- Verify: D6 does NOT appear in Archer's capture options
- Verify: D6 does NOT appear in Archer's movement options (occupied by enemy)
- The Archer is effectively stuck in terms of that direction — can only move away or Longshot elsewhere

### Test 3.9: Archer River Crossing — Ability Degradation
Move a White Archer from Row B to Row G (beyond river) step by step.
- Behind river (B-E): verify 2-tile orthogonal and 1-tile diagonal moves available
- At river (F): verify same as behind
- Beyond river (G+): verify only 1-tile in any direction
- This tests that the Archer gets weaker when advancing — key strategic mechanic

---

## SCENARIO GROUP 4: Knight Mechanics Deep Dive

### Test 4.1: Leg Cut — Comprehensive Blocking
Set up: White Knight on D5 with pieces placed on strategic intermediate tiles.
- Place a piece on E5 (1 step right): blocks both (2 right, 1 up) = F6 AND (2 right, 1 down) = F4
- Place a piece on D6 (1 step up): blocks both (2 up, 1 right) = F6 AND (2 up, 1 left) = B6
- Verify: correct destinations are blocked while others remain available
- Verify: total legal moves is reduced by the correct amount

### Test 4.2: Leg Cut — Does Not Apply to Final Tile
Set up: White Knight on D5, enemy piece on F6 (final destination of a 2-right-1-up move), E5 is EMPTY.
- Verify: Knight CAN move to F6 (capturing the enemy) — the Leg Cut only checks the intermediate tile, not the destination
- Now place a friendly piece on F6 instead
- Verify: Knight CANNOT move to F6 (friendly piece on destination, but this is a landing block not a Leg Cut)

### Test 4.3: Knight Fork Scenario
Set up: White Knight positioned where it threatens two enemy pieces simultaneously after moving.
- Move Knight to fork position
- Verify: both enemy pieces appear as capture options on the Knight's next turn
- This tests that the engine correctly generates multiple capture options

### Test 4.4: Knight Ransom — Full Flow
1. Set up: Previously captured White Archer exists in Black's capturedPieces
2. White Knight captures Black Knight
3. Verify: Ransom option is available
4. White chooses to ransom the Archer
5. Verify: Archer is placed on a valid tile in White's first 3 rows (A-C)
6. Verify: Archer is removed from capturedPieces
7. Verify: Board now has the ransomed Archer as an active piece
8. Verify: The ransomed Archer can move on a subsequent turn

### Test 4.5: Knight Ransom — Declined
1. White Knight captures Black Knight
2. There are captured Footmen/Archers available
3. White declines ransom
4. Verify: No piece is returned, game continues normally

### Test 4.6: Knight Ransom — Not Triggered on Non-Knight Capture
1. White Knight captures Black Footman
2. Verify: Ransom option is NOT available (only knight-on-knight triggers ransom)

---

## SCENARIO GROUP 5: Capture Point Victory Path

### Test 5.1: Check — Control 3 Flags
Set up custom board with White pieces on F1, F4, F7 (controlling 3 of 4 flags).
- Execute White's move to place the 3rd piece on a flag
- Verify: checkPlayer is set to "black" (Black is in check)
- Verify: game is NOT over yet (Black gets a turn to respond)

### Test 5.2: Check Cleared — Opponent Breaks a Flag
Continue from 5.1:
- Black pushes or captures to remove White from one capture point
- Verify: checkPlayer is cleared (null)
- Verify: game continues normally

### Test 5.3: Check Mate — Opponent Fails to Break
Continue from 5.1 (reset):
- Black makes a move that does NOT remove White from any capture point
- Verify: game ends
- Verify: winner is "white"
- Verify: winCondition is "checkmate"
- Verify: gamePhase is "ended"

### Test 5.4: Check via Pushback onto Flag
White Footman pushes a White piece... wait, you can't push friendly pieces. Let me reconsider.
Set up: Black piece on F4 (controlling it). White Footman adjacent to Black piece. White pushes Black OFF F4, then on a subsequent turn White moves onto F4.
- Verify: pushing an enemy off a capture point changes control correctly
- Verify: capture point becomes uncontrolled when no piece is on it (not "controlled by the pusher")

### Test 5.5: Capture Point — Control Changes via Capture
Set up: Black piece on F7. White Knight captures Black piece on F7.
- Verify: F7 control switches from Black to White in one move
- Verify: if this gives White 3 flags, Check is triggered

### Test 5.6: Capture Point — Piece Moves Away Voluntarily
White piece on F1. White moves that piece off F1 to a different tile.
- Verify: F1 becomes uncontrolled
- Verify: if White had 3 flags and now has 2, Check is not triggered/maintained

### Test 5.7: Near-Checkmate — Multiple Check Cycles
Play a sequence where:
1. White gets 3 flags → Check
2. Black breaks one → Check cleared
3. White retakes → Check again
4. Black breaks again → Check cleared
5. White retakes → Check again
6. Black fails → Checkmate
Verify the check/clear/checkmate cycle works correctly over multiple rounds.

---

## SCENARIO GROUP 6: Promotion Scenarios

### Test 6.1: Full Promotion Journey
Move a White Footman from Row C all the way to Row K (enemy back row), step by step across the entire board.
- Verify it takes the correct number of moves (accounting for movement speed changes at River)
- Verify promotion triggers on arrival at Row K
- Choose a captured Archer to return
- Verify the Archer appears in rows A-C
- Verify the Footman is removed

### Test 6.2: Promotion — No Captured Pieces
White Footman reaches Row K but no friendly pieces have been captured.
- Verify: promotion is offered but there are no pieces to return
- Verify: Footman either stays on the back row (promotion declined) or is handled appropriately
- Document the expected behavior

### Test 6.3: Promotion — All Placement Tiles Occupied
White Footman reaches Row K. Captured pieces exist, but all tiles in rows A-C are occupied.
- Verify: promotion cannot complete (no valid placement tile)
- Verify: game handles this gracefully

### Test 6.4: Promoted Piece — Immediately Usable
After promotion returns an Archer to Row B:
- On White's next turn, verify the returned Archer has full legal moves
- Verify it behaves as a normal Archer (behind river, so 2-tile orthogonal / 1-tile diagonal)
- Verify it can Longshot if a screen and target are available

---

## SCENARIO GROUP 7: Annihilation Victory

### Test 7.1: Annihilation — Remove All Enemy Pieces
Set up a near-endgame: White has 3 pieces, Black has 1 piece.
- White captures Black's last piece
- Verify: game ends immediately
- Verify: winner is "white", winCondition is "annihilation"
- Verify: no further moves can be executed

### Test 7.2: Annihilation — Last Piece Captured via Longshot
Set up: Black has 1 remaining piece. White Archer longshots it.
- Verify: annihilation detected even though the capturing piece didn't move

### Test 7.3: Annihilation — Last Piece Captured via Knight
Set up: Black has 1 remaining Knight. White Knight captures it.
- Verify: annihilation wins (no ransom offered when the game is already won — or is it? Test what happens)

---

## SCENARIO GROUP 8: Draw Mechanics

### Test 8.1: Draw Counter — Increments Without Captures
Play 20 half-turns (10 full turns) where both players move pieces without capturing.
- Verify: turnsSinceCapture reaches 20
- Verify: draw can be offered/agreed

### Test 8.2: Draw Counter — Resets on Capture
Play 18 half-turns without capture, then a capture occurs.
- Verify: turnsSinceCapture resets to 0
- Verify: draw is no longer available

### Test 8.3: Draw Counter — Pushback Does NOT Count as Capture
Play 20 half-turns where pushbacks occur but no captures.
- Verify: turnsSinceCapture still reaches 20 (pushback ≠ capture)
- Verify: draw is available

### Test 8.4: Forfeit Mid-Game
10 moves into a game, White forfeits.
- Verify: Black wins, winCondition is "forfeit"
- Verify: game state is preserved (move history, board state)

---

## SCENARIO GROUP 9: Full Game Simulations

### Test 9.1: Speed Run — Fastest Possible Annihilation
Calculate and play the theoretically fastest possible game (minimum moves to capture all 15 enemy pieces). This validates the engine doesn't break under rapid captures.

### Test 9.2: 50-Move Game — Mixed Mechanics
Script a 50-move game that uses every mechanic at least once:
- Footman double-step (turn 1-2)
- Knight development (turn 3-4)
- Archer development (turn 5-6)
- Footman capture (turn ~8)
- Pushback (turn ~10)
- Longshot (turn ~12)
- Knight capture + ransom (turn ~15)
- Capture point contest (turn ~20)
- Check triggered and cleared (turn ~25)
- Promotion (turn ~35)
- Annihilation victory (turn ~50)
Verify the game state is consistent after EVERY single move (piece count = 30 - total captures, turn alternates, etc.)

### Test 9.3: Stalemate-ish — No Legal Moves
Create a custom board position where one player has pieces but zero legal moves.
- Verify: the player's turn is skipped (or the game handles it per the rules — "no passing turns unless no legal moves are available")
- Verify: the other player can still move
- Verify: game doesn't crash or infinite loop

### Test 9.4: Endgame — 1v1 Knight vs Footman
Set up: White has 1 Knight, Black has 1 Footman.
- Play several moves of the Knight chasing the Footman
- Verify: all moves are legal, game continues
- Knight captures Footman → annihilation
- Verify: game ends correctly

### Test 9.5: Endgame — Archers Only
Set up: White has 2 Archers, Black has 2 Archers.
- This is an interesting edge case: Archers can only capture via Longshot, which requires a screen
- With only 4 pieces on the board, screens might be hard to come by
- Verify: the game can still progress (pieces can move even if they can't capture)
- Verify: draw mechanic eventually kicks in if no captures are possible

---

## SCENARIO GROUP 10: State Integrity Invariants

### Test 10.1: Piece Count Invariant
After EVERY move in every test above, assert:
- pieces on board + white captured + black captured = 30
- This should be a shared assertion helper used in all tests

### Test 10.2: No Duplicate IDs
After every move, assert:
- No two pieces on the board share the same ID
- No piece on the board also appears in capturedPieces

### Test 10.3: Turn Alternation
After every move, assert:
- turn has switched to the other player (unless the game ended)

### Test 10.4: Immutability
Execute a move and verify:
- The original GameState object is unchanged
- The returned GameState is a different object reference
- Modifying the returned state doesn't affect the original

### Test 10.5: Move History Accuracy
Play 20 moves. Verify:
- moveHistory has exactly 20 entries
- Each entry has correct from/to positions
- Each entry has correct piece type and player
- Each entry has correct action type (move/capture/pushback/longshot)
- Replaying the moves from createGame() produces the same final state

Run all tests and ensure they pass. Fix any bugs found — these are the scenarios that will break in real gameplay if not caught now.
```
