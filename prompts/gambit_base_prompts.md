# Gambit — Claude Code Prompts

Feed these prompts into Claude Code **in order**. Each prompt is self-contained with the context Claude Code needs. Wait for each step to be fully working and tested before moving to the next.

---

## PROMPT 1: Project Setup + Game Engine Types & Board

```
I'm building an online board game called "Gambit" — a 2-player tactical game on a 10×11 grid. I need you to set up the project and build the foundational game engine types and board module.

## Project Setup

Create a monorepo with this structure:
- packages/engine/ — Pure TypeScript game engine (no UI dependencies). This will be shared by both client and server.
- apps/web/ — Next.js 14+ App Router frontend (set up later)
- apps/server/ — Socket.IO game server (set up later)

Use npm workspaces. Set up TypeScript with strict mode. Add Vitest for testing the engine package.

For now, ONLY set up packages/engine/. The apps/ folders can be empty placeholders.

## Game Rules Context

**Board:**
- 10 columns (1-10) × 11 rows (A-K)
- Row A is White's back row, Row K is Black's back row
- Row F is "The River" — a central dividing line that affects unit abilities
- 4 Capture Points at positions F1, F4, F7, F10 (flagged tiles on the River)
- Checkerboard pattern: alternating light/dark tiles
- White pieces start on dark tiles, Black pieces on light tiles

**Pieces (15 per player):**
- 5 Footmen, 5 Archers, 5 Knights

**Starting positions:**
- White: Footmen on Row C, Archers on Row B, Knights on Row A — each spaced every other tile
- Black: Footmen on Row I, Archers on Row J, Knights on Row K — each spaced every other tile
- Pieces are placed on alternating tiles diagonally offset from each other

**Players:**
- "white" (starts on rows A-C) and "black" (starts on rows I-K)
- White moves first

**"Forward" direction:**
- For White: increasing row (A→K)
- For Black: decreasing row (K→A)

**River Position Logic:**
- For White: "behind river" = rows A-E, "at river" = row F, "beyond river" = rows G-K
- For Black: "behind river" = rows G-K, "at river" = row F, "beyond river" = rows A-E

## What to Build

### 1. types.ts
Define all core types:
- Player: "white" | "black"
- UnitType: "footman" | "archer" | "knight"
- Position: { col: number (1-10), row: string (A-K) }
- Piece: { id: string, type: UnitType, player: Player, position: Position, hasMoved: boolean }
- MoveType: "move" | "capture" | "pushback" | "longshot" | "promotion" | "ransom"
- Move: { piece: Piece, from: Position, to: Position, type: MoveType, capturedPiece?: Piece, promotedPiece?: Piece, ransomPiece?: Piece }
- CapturePointControl: Record of the 4 capture point positions to Player | null
- GameState: { board: (Piece | null)[][], turn: Player, moveHistory: Move[], capturedPieces: { white: Piece[], black: Piece[] }, capturePoints: CapturePointControl, checkPlayer: Player | null, lastPushback: { targetPieceId: string, byPlayer: Player } | null, turnsSinceCapture: number, gamePhase: "playing" | "ended", winner: Player | null, winCondition: string | null }

### 2. board.ts
Board utility functions:
- createEmptyBoard(): creates the 10×11 grid (columns 1-10, rows A-K)
- posToIndex(pos: Position): converts position to array indices
- indexToPos(col: number, row: number): converts array indices to Position
- isValidPosition(pos: Position): bounds check
- getPieceAt(board, pos): returns piece or null
- setPieceAt(board, pos, piece): places a piece
- removePieceAt(board, pos): removes a piece
- isRiver(pos): returns true if row is F
- isCapturePoint(pos): returns true if position is F1, F4, F7, or F10
- getRiverStatus(pos, player): returns "behind" | "at" | "beyond" based on player and position
- getForwardDirection(player): returns +1 for white, -1 for black (in terms of row index)
- setupInitialBoard(): creates board with all 30 pieces in starting positions. All pieces should have hasMoved: false.
- isDarkTile(pos): returns true if the tile is dark (for checkerboard pattern)

### 3. Tests
Write comprehensive tests for all board utilities:
- Board creation and dimensions
- Position conversion roundtrips
- River status for both players at various positions
- Initial board setup: correct piece counts, correct positions, correct tile colors
- Capture point identification
- Edge cases: invalid positions, boundary tiles

Make sure all tests pass before finishing.
```

---

## PROMPT 2: Footman Logic

```
Continue building the Gambit game engine. The board module and types are already set up in packages/engine/.

Now implement the Footman unit logic.

## Footman Rules

### Movement
- Behind or At River: 1 tile forward, backward, or sideways (orthogonal only, not diagonal)
- Beyond River: 2 tiles forward or backward, OR 1 tile sideways
- **First Move**: A Footman that has never moved may move 2 tiles forward on its first move (like a pawn's double-step in chess). The intermediate tile must be empty (cannot jump over pieces). This applies regardless of River position.
- Cannot move to a tile occupied by a friendly piece
- Cannot move off the board

### Capture
- Behind or At River: 1 tile diagonally forward ONLY
- Beyond River: 1 tile diagonally in ANY direction (forward-left, forward-right, backward-left, backward-right)
- Capture is made by moving to a tile occupied by an enemy piece

### Special Ability: Pushback
- A Footman that STARTS its turn adjacent (orthogonally — up/down/left/right) to an enemy piece may push that enemy piece 1 tile in any orthogonal direction (forward, backward, or sideways relative to the board, not the player)
- The pushback direction does NOT have to be the same direction as the adjacency
- Pushback CANNOT be used if:
  - There is any piece (friendly or enemy) on the tile the target would be pushed to
  - The push would move the target off the board
  - The target piece is the same piece that pushed one of YOUR pieces on the opponent's immediately previous turn (anti-retaliation rule)
- Pushback does NOT capture the piece — it just moves it
- Pushback counts as the player's move for the turn (instead of moving the Footman)
- The Footman performing the pushback does NOT move — it stays in place

### Promotion
- If a Footman reaches the enemy's back row (Row K for White, Row A for Black), the player MAY sacrifice that Footman to return a previously captured friendly piece to any unoccupied tile in the player's first three rows (rows A-C for White, rows I-K for Black)
- The Footman is removed from the board
- The returned piece must be one that was previously captured
- If no pieces have been captured, promotion cannot occur (but the Footman still reached the back row — clarification: the Footman is still sacrificed, it simply reaches the end and is removed. Actually re-reading the rules: "the player may sacrifice that piece to return a captured unit" — this is optional. If they choose not to or can't, the Footman simply stays on the back row)

## What to Build

### 1. packages/engine/src/units/footman.ts
Functions:
- getFootmanMoves(piece, gameState): returns all legal movement positions
- getFootmanCaptures(piece, gameState): returns all legal capture positions (with the target piece)
- getFootmanPushbacks(piece, gameState): returns all legal pushback actions (target piece + push direction + resulting position)
- canPromote(piece, gameState): returns true if the footman is on the enemy back row
- getPromotionOptions(piece, gameState): returns list of captured pieces that could be returned, plus valid placement positions

### 2. Tests (packages/engine/tests/footman.test.ts)
Write thorough tests covering:
- Movement behind river (1 tile orthogonal, all 4 directions)
- Movement at river (1 tile orthogonal)
- Movement beyond river (2 tiles forward/backward, 1 tile sideways)
- **First move double-step: unmoved Footman can move 2 tiles forward**
- **First move double-step: blocked by piece on intermediate tile**
- **First move double-step: blocked by piece on destination tile**
- **First move double-step: not available after the Footman has already moved (hasMoved = true)**
- **First move double-step: cannot double-step backward or sideways (forward only)**
- Cannot move onto friendly pieces
- Cannot move off board (edge/corner cases)
- Capture behind river (diagonal forward only — test that diagonal backward is NOT allowed)
- Capture beyond river (all 4 diagonals)
- Capture at river (diagonal forward only)
- Pushback: basic push in each direction
- Pushback: blocked by piece behind target
- Pushback: blocked by board edge
- Pushback: anti-retaliation rule (cannot push the piece that pushed you last turn)
- Pushback: must be adjacent at START of turn
- Promotion: footman on enemy back row with captured pieces available
- Promotion: footman on enemy back row with no captured pieces
- Beyond-river movement: cannot move 2 tiles sideways (only 1 sideways)
- Beyond-river movement: 2 tiles forward blocked by piece at intermediate tile? (Clarification: footmen move 2 tiles, meaning they slide — they CANNOT jump over pieces. If a piece is in the way on the first tile, they cannot move 2 tiles in that direction.)

Run all tests and ensure they pass.
```

---

## PROMPT 3: Archer Logic

```
Continue building the Gambit game engine. Footman logic is complete and tested.

Now implement the Archer unit logic.

## Archer Rules

### Movement
- Behind or At River: 2 tiles forward, backward, or sideways (orthogonal) — OR 1 tile diagonally
- Beyond River: 1 tile in any direction (orthogonal or diagonal — like a king in chess)
- Cannot move to a tile occupied by a friendly piece
- Cannot move off the board
- When moving 2 tiles orthogonally, the Archer slides (cannot jump over pieces — the intermediate tile must be empty)

### Capture
- Archers CANNOT capture by moving onto an enemy piece's tile
- Archers can ONLY capture using their special ability: Longshot

### Special Ability: Longshot
Longshot is a ranged capture. The Archer does NOT move when using Longshot — it stays in place and removes the enemy piece at range.

**Forward Longshot (up to 3 tiles):**
- The Archer can take an enemy piece that is up to 3 tiles directly FORWARD (in the player's forward direction)
- There MUST be at least one piece (friendly OR enemy) acting as a "screen" between the Archer and the target
- The screen piece must be directly in the line between the Archer and the target
- The Archer cannot longshot over 2 or more pieces (i.e., there must be exactly 1 screen piece between the Archer and the target, with no additional pieces in between)

**Backward and Sideways Longshot (up to 2 tiles):**
- The Archer can take an enemy piece that is up to 2 tiles directly BEHIND or SIDEWAYS
- Same screen rules apply: exactly 1 piece must be between Archer and target
- Cannot longshot over 2+ pieces

**Key clarifications:**
- Longshot only works in orthogonal directions (forward, backward, left, right) — NOT diagonal
- The screen can be any piece (friendly or enemy, any type)
- The Archer stays in place after a Longshot — it does not move to the target's tile
- Longshot counts as the player's action for the turn
- You cannot longshot a piece that is adjacent (1 tile away) — there must be a screen, which means minimum distance is 2 tiles (1 screen + 1 target)

## What to Build

### 1. packages/engine/src/units/archer.ts
Functions:
- getArcherMoves(piece, gameState): returns all legal movement positions
- getArcherLongshots(piece, gameState): returns all legal longshot targets (the enemy piece that would be captured, the direction, and the screen piece)
- Note: Archers have NO normal captures — getArcherCaptures should return empty or not exist

### 2. Tests (packages/engine/tests/archer.test.ts)
Write thorough tests covering:

**Movement:**
- Behind river: 2 tiles in each orthogonal direction
- Behind river: 1 tile diagonal in each direction
- Behind river: cannot move 2 tiles diagonally
- At river: same as behind river
- Beyond river: 1 tile in all 8 directions
- Beyond river: cannot move 2 tiles in any direction
- Sliding: 2-tile orthogonal move blocked by piece on intermediate tile
- Cannot move onto friendly pieces
- Board edge cases

**Longshot:**
- Forward longshot at distance 2 with 1 screen (simplest case)
- Forward longshot at distance 3 with 1 screen at distance 1
- Forward longshot at distance 3 with 1 screen at distance 2
- Cannot forward longshot at distance 4+
- Backward longshot at distance 2 with 1 screen
- Sideways longshot (left and right) at distance 2 with 1 screen
- Cannot backward/sideways longshot at distance 3+
- Longshot blocked: 2 pieces between archer and target (over-screen)
- Longshot blocked: no screen piece present
- Longshot blocked: target is friendly piece (can only capture enemies)
- Longshot blocked: target tile is empty
- Screen can be a friendly piece
- Screen can be an enemy piece
- Cannot longshot diagonally
- Archer does NOT move after longshot

Run all tests and ensure they pass.
```

---

## PROMPT 4: Knight Logic

```
Continue building the Gambit game engine. Footman and Archer logic is complete and tested.

Now implement the Knight unit logic.

## Knight Rules

### Movement
- L-shaped jump: 2 tiles in one direction (orthogonal) THEN 1 tile perpendicular
- IMPORTANT: The reverse (1 tile then 2 perpendicular) is NOT allowed. The first leg must always be 2 tiles.
- This means from any position, a Knight has up to 8 possible destinations:
  - 2 up, 1 left
  - 2 up, 1 right
  - 2 down, 1 left
  - 2 down, 1 right
  - 2 left, 1 up
  - 2 left, 1 down
  - 2 right, 1 up
  - 2 right, 1 down
- Knights CAN jump over pieces on the final tile of the L-shape
- EXCEPT: "Leg Cut" — if the tile on the FIRST STEP of the 2-tile direction (the intermediate tile) is occupied by ANY piece (friendly or enemy), that entire L-move direction is blocked
  - Example: Knight at D5 wants to move to F6 (2 right, 1 up). The intermediate tile is E5 (first step of the 2-tile rightward move). If E5 is occupied, the Knight CANNOT move to F6 or F4 (both moves that go 2 right).
- Knights are NOT affected by the River — same movement rules everywhere on the board
- Cannot land on a tile occupied by a friendly piece

### Capture
- Standard capture by displacement: move to a tile occupied by an enemy piece using normal L-shaped movement
- All Leg Cut rules still apply

### Special Ability: Ransom (Optional)
- When a Knight captures an ENEMY Knight specifically (knight takes knight), the capturing player MAY return one previously captured Footman or Archer to any unoccupied tile in their first three rows
- This is optional — the player can decline the ransom
- Only Footmen and Archers can be ransomed (not Knights)
- The returned piece goes to the first three rows of the capturing player's side (rows A-C for White, rows I-K for Black)

## What to Build

### 1. packages/engine/src/units/knight.ts
Functions:
- getKnightMoves(piece, gameState): returns all legal movement positions (excluding tiles with friendly pieces)
- getKnightCaptures(piece, gameState): returns all legal capture positions (tiles with enemy pieces reachable by L-move)
- isLegCut(piece, direction, gameState): checks if a specific 2-tile direction is blocked
- getRansomOptions(piece, capturedPiece, gameState): if the captured piece is an enemy Knight, returns the list of captured Footmen/Archers that can be ransomed and valid placement positions

### 2. Tests (packages/engine/tests/knight.test.ts)
Write thorough tests covering:

**Movement:**
- All 8 L-shaped moves from a central position (no obstructions)
- Knight on edge of board (reduced moves)
- Knight on corner (minimal moves)
- Cannot land on friendly piece
- Can land on empty tile

**Leg Cut:**
- Piece on intermediate tile blocks both L-moves in that direction
  - E.g., if intermediate tile for "2 up" is blocked, both "2 up 1 left" and "2 up 1 right" are illegal
- Friendly piece causes leg cut
- Enemy piece causes leg cut
- Piece on the FINAL tile of the L does NOT cause a leg cut (knight can jump to that tile if enemy, capturing; or it's blocked if friendly)
- Multiple directions blocked simultaneously

**Capture:**
- Can capture enemy piece via L-shaped move
- Cannot capture friendly piece
- Leg cut still applies when trying to capture

**Ransom:**
- Knight captures enemy Knight → ransom option available for captured Footman
- Knight captures enemy Knight → ransom option available for captured Archer
- Knight captures enemy Knight → cannot ransom a captured Knight
- Knight captures enemy Footman → no ransom (not a knight-on-knight capture)
- Knight captures enemy Archer → no ransom
- No captured pieces available → ransom not possible
- Valid ransom placement positions (first 3 rows, unoccupied)

**River independence:**
- Same moves behind, at, and beyond river

Run all tests and ensure they pass.
```

---

## PROMPT 5: Game State Machine — Moves, Captures, Victory

```
Continue building the Gambit game engine. All three unit types (Footman, Archer, Knight) are complete and tested.

Now build the central game state machine that ties everything together: move execution, turn management, capture point control, and victory conditions.

## Game Flow Rules

### Turn Order
Each turn, a player must:
1. Move one unit (or use a special ability: Pushback/Longshot — these count as the move)
2. Resolve any capture that occurs from the move
3. Check victory conditions
4. Handle promotion if a Footman reached the enemy back row

### Capture Points
- 4 Capture Points at F1, F4, F7, F10
- A player "controls" a Capture Point if they have a piece on that tile
- If no piece is on it, it's neutral/uncontrolled

### Check & Check Mate (Capture Point Victory)
- "Check": When a player controls 3 of the 4 Capture Points at the END of their turn, the opponent is in "Check" — they MUST push the checking player off at least one Capture Point on their next turn
- "Check Mate": If a player controls 3 of the 4 Capture Points and STILL controls 3+ at the end of the OPPONENT'S next turn (the opponent failed to break the hold), the game ends — the player holding 3 points wins
- Essentially: hold 3/4 capture points for one full turn (your turn + surviving the opponent's response)

### Win Conditions
1. Annihilation: a player has zero pieces remaining → the other player wins
2. Check Mate: hold 3/4 capture points through the opponent's turn
3. Forfeit: a player concedes
4. Draw: if no captures occur for 10 full turns (20 half-turns), players may agree to draw

### Additional Rules
- No passing turns unless the player has zero legal moves
- Pushback cannot target the same piece that pushed you on the immediately previous opponent turn

## What to Build

### 1. packages/engine/src/moves.ts
- getAllLegalMoves(player, gameState): aggregates legal moves across all of a player's pieces. Returns a list of possible actions: { piece, moves: Position[], captures: CaptureAction[], pushbacks: PushbackAction[], longshots: LongshotAction[] }
- hasLegalMoves(player, gameState): returns true if the player has at least one legal action

### 2. packages/engine/src/game.ts
The main game state machine:
- createGame(): returns initial GameState with board set up, white to move
- executeMove(gameState, action): takes current state + a player action, validates it, and returns the new GameState (immutable — return new state, don't mutate)
  - Validates it's the correct player's turn
  - Validates the action is legal
  - Applies the move/capture/pushback/longshot
  - Sets hasMoved = true on the piece that moved (important for Footman double-step)
  - Updates capture point control
  - Checks for annihilation
  - Checks for Check (3/4 capture points)
  - Checks for Check Mate (held 3/4 through opponent's turn)
  - Handles Footman promotion (if applicable — may need a two-step action: move, then choose promotion)
  - Handles Knight Ransom (if applicable — may need a two-step action: capture, then choose ransom)
  - Increments/resets turnsSinceCapture counter
  - Switches turn to opponent
  - Returns new GameState
- forfeit(gameState, player): ends the game with the other player winning
- offerDraw(gameState): handles draw agreement (if turnsSinceCapture >= 20 half-turns)

### 3. packages/engine/src/victory.ts
- checkAnnihilation(gameState): returns winner if a player has 0 pieces
- checkCapturePointVictory(gameState): returns the check/checkmate status
- updateCapturePointControl(gameState): recalculates who controls each flag
- isGameOver(gameState): returns { isOver: boolean, winner?: Player, condition?: string }

### 4. Tests (packages/engine/tests/game.test.ts)
Write comprehensive tests:

**Basic game flow:**
- Create game → white moves first
- Execute a valid move → turn switches to black
- Cannot move opponent's pieces
- Cannot move when it's not your turn

**Capture resolution:**
- Footman captures enemy diagonally → enemy removed, capturedPieces updated
- Knight captures enemy via L-move → enemy removed
- Archer longshots enemy → enemy removed, archer stays in place
- Footman pushback → enemy moved, not captured

**Capture Point control:**
- Place piece on F1 → white controls F1
- Remove piece from F4 → F4 becomes neutral
- White controls F1, F4, F7 → Check declared against black
- After Check: black breaks one flag → Check cleared
- After Check: black fails to break → Check Mate, white wins

**Victory conditions:**
- Annihilation: remove all of one player's pieces → other player wins
- Check Mate: as above
- Forfeit: player forfeits → other player wins
- Draw: 10 full turns with no captures → draw available

**Promotion:**
- White footman reaches row K → promotion available
- Choose captured piece → piece placed in rows A-C
- Footman is removed after promotion

**Ransom:**
- White knight captures black knight → ransom offered
- Choose captured footman → footman placed in rows A-C
- Decline ransom → no piece returned

**Edge cases:**
- No legal moves → turn is skipped (or game over?)
- Pushback anti-retaliation tracking across turns
- Multiple captures in sequence across turns — turnsSinceCapture resets

Run all tests and ensure they pass.
```

---

## PROMPT 6: Board UI — React + SVG Hotseat Mode

```
Now build the frontend. The game engine is complete in packages/engine/. 

Set up the Next.js app in apps/web/ and create a fully playable local hotseat mode (two players on one device, taking turns).

## Tech Stack
- Next.js 14+ with App Router
- Tailwind CSS + shadcn/ui for UI components
- React + SVG for the board renderer
- Import the game engine from packages/engine/ (configure npm workspace properly)

## Board Design
The board should feel medieval/tactical — inspired by the game's theme (Blackheart: The Spellforge Saga). 

**Board layout:**
- 10 columns × 11 rows checkerboard
- Dark tiles: warm brown (e.g., #8B6914 or similar)
- Light tiles: cream/parchment (e.g., #F5E6C8 or similar)
- Row F (River): visually distinct — use a blue/teal tint or water-like pattern on those tiles
- Capture Points (F1, F4, F7, F10): show a red flag icon or red border/marker on those tiles
- Column labels (1-10) along bottom, Row labels (A-K) along left side
- Board should be oriented so Row A is at the bottom (White's side) and Row K at the top (Black's side)

**Piece rendering (placeholder SVG icons for now):**
- Footmen: simple shield/infantry icon
- Archers: bow icon
- Knights: horse head icon
- White pieces: light/cream colored with dark outline
- Black pieces: dark colored with light outline
- Each piece should be clearly distinguishable by type AND player color

**Mobile responsive:**
- Board should scale to fit the viewport width on mobile
- Minimum touch target size of 44px per tile
- On desktop, board should be centered with reasonable max-width

## Interactions

### Click-to-move flow:
1. Player clicks one of their own pieces → piece is highlighted/selected
2. Legal moves are shown on the board:
   - Blue dots for movement tiles
   - Red dots/stars for capture targets
   - Orange dots for pushback targets (show the direction arrow)
   - Purple dots for longshot targets
3. Player clicks a highlighted tile → move is executed via the game engine
4. Board updates, turn switches to the other player
5. Clicking an empty tile or the same piece deselects

### Special action handling:
- **Pushback**: when a Footman is selected and has pushback options, show pushback targets. If the player clicks a pushback target, show directional arrows for which way to push. Player clicks the arrow to confirm.
- **Promotion**: when a Footman reaches the back row, show a modal/overlay listing the captured pieces available to return. Player picks one, then picks a tile in their first 3 rows. If no captures available or player declines, the footman simply remains (per the rules, promotion is optional — "may sacrifice").
- **Ransom**: after a Knight captures another Knight, show a modal asking if the player wants to ransom. If yes, show available captured Footmen/Archers and valid placement tiles.
- **Longshot**: when an Archer is selected, show longshot targets distinctly from movement tiles. Clicking a longshot target executes the shot (archer stays in place).

### Game state display:
- Show whose turn it is (prominently)
- Show captured pieces for each player (in a tray/sidebar)
- Show Capture Point status (which player controls each flag)
- Show Check alert when a player controls 3/4 capture points
- Show game over overlay with result and win condition
- Show last move highlight (the from/to tiles of the previous move)

### Additional UI:
- "New Game" button to reset
- "Forfeit" button
- Move history panel (scrollable list of moves, like chess notation)

## Pages
- `/` — landing page with "Play Local Game" button (for now)
- `/game/local` — the hotseat game page

Build this fully functional. I should be able to play a complete game of Gambit on one screen, taking turns as white and black, with all rules enforced by the engine.
```

---

## PROMPT 7: Multiplayer — Socket.IO Server + Online Play

```
The Gambit game engine and local hotseat UI are working. Now add real-time online multiplayer.

## Architecture
- apps/server/ — A standalone Node.js + Socket.IO server
- apps/web/ — Update the Next.js frontend to connect to the game server
- The game engine (packages/engine/) is used by BOTH the server (authoritative) and client (for move previews/legal move display)

## Server (apps/server/)

### Setup
- Node.js + TypeScript
- Socket.IO for WebSocket communication
- Import the game engine from packages/engine/

### Game Rooms
- Each game is a "room" identified by a unique game ID (nanoid or uuid)
- A room holds: the GameState, both player socket IDs, and player metadata
- Room lifecycle: created → waiting for opponent → playing → ended

### Socket Events

**Client → Server:**
- `create_game` → server creates a room, returns game ID. Creator is assigned White.
- `join_game { gameId }` → joins an existing room as Black. If room is full, reject.
- `make_move { gameId, action }` → player submits a move. Server validates using the engine. If valid, applies the move and broadcasts new state. If invalid, sends error back to the player.
- `forfeit { gameId }` → player forfeits
- `offer_draw { gameId }` → player offers a draw
- `accept_draw { gameId }` → opponent accepts the draw
- `decline_draw { gameId }` → opponent declines

**Server → Client:**
- `game_created { gameId }` → sent to creator with the game link
- `game_started { gameState, playerColor }` → sent to both players when opponent joins
- `game_updated { gameState, lastMove }` → sent to both after a valid move
- `move_rejected { error }` → sent to the player who made an invalid move
- `game_over { winner, condition }` → sent to both when the game ends
- `opponent_disconnected` → sent when the other player disconnects
- `opponent_reconnected` → sent when they come back
- `draw_offered` → sent to opponent
- `draw_declined` → sent back to offerer

### Reconnection
- When a player disconnects, start a 60-second grace timer
- If they reconnect within 60 seconds (using a stored player token/cookie), restore them to the game and send them the current GameState
- If the timer expires, the disconnected player forfeits

### Server-Authoritative Validation
- The server NEVER trusts the client's game state
- The server maintains the true GameState for each room
- When a move comes in, the server validates it against its own state using the engine
- Only if valid does it update and broadcast

## Frontend Updates (apps/web/)

### New page: /game/online
- Two modes: "Create Game" and "Join Game"
- Create Game: calls create_game, shows a shareable link (copy to clipboard)
- Join Game: enter game ID or use the link directly
- URL structure: /game/[gameId]

### Game page updates:
- Connect to Socket.IO server on mount
- Listen for game_started, game_updated, game_over events
- Only allow interaction (clicking pieces, making moves) when it's the player's turn
- Show "Waiting for opponent..." when the game is created but opponent hasn't joined
- Show "Opponent disconnected" banner when the opponent drops
- Show the player's color assignment (you are White/Black)
- Board orientation: auto-rotate so the current player's pieces are at the bottom
  - White sees Row A at the bottom (default)
  - Black sees Row K at the bottom (flipped)

### Connection handling:
- Auto-reconnect on disconnect
- Store a player token in localStorage or a cookie to enable reconnection to the same game
- Show connection status indicator (connected/reconnecting/disconnected)

## Environment
- Game server runs on a configurable port (default 3001)
- Frontend connects to the server via environment variable: NEXT_PUBLIC_GAME_SERVER_URL
- For local dev: server at localhost:3001, frontend at localhost:3000
- Add CORS configuration for the frontend domain

Build all of this. I should be able to:
1. Open the app, create a game, get a link
2. Open the link in another browser/tab
3. Play a full game of Gambit in real-time
4. See moves reflected instantly on both screens
5. Handle disconnection and reconnection gracefully
```

---

## PROMPT 8: User Accounts + Game Persistence (Supabase)

```
The Gambit multiplayer game is working with Socket.IO. Now add user accounts and game persistence using Supabase.

## Supabase Setup
- Create a Supabase project (I'll provide the URL and anon key via environment variables)
- Use Supabase Auth for user accounts
- Use Supabase Postgres for game data

## Database Schema

Create these tables with appropriate migrations:

### users (extends Supabase auth.users)
- Handled by Supabase Auth — we just reference auth.users.id

### profiles
- id (uuid, references auth.users.id)
- username (text, unique, 3-20 chars)
- avatar_url (text, nullable)
- created_at (timestamptz)
- games_played (integer, default 0)
- games_won (integer, default 0)

### games
- id (uuid, primary key)
- white_player_id (uuid, references profiles.id, nullable for anonymous)
- black_player_id (uuid, references profiles.id, nullable)
- status (text: 'waiting' | 'playing' | 'completed')
- result (text, nullable: 'white_wins' | 'black_wins' | 'draw')
- win_condition (text, nullable: 'annihilation' | 'checkmate' | 'forfeit' | 'draw')
- moves_json (jsonb — array of all moves)
- final_state_json (jsonb, nullable — final board state)
- started_at (timestamptz)
- ended_at (timestamptz, nullable)
- created_at (timestamptz)

### Add Row Level Security (RLS)
- profiles: users can read any profile, only update their own
- games: anyone can read completed games, players can read their own in-progress games

## Auth Implementation

### Frontend (apps/web/)
- Add Supabase client setup (environment variables for URL + anon key)
- Sign up / Sign in page at /auth with:
  - Google OAuth sign-in button
  - Email + password sign-in/sign-up
- After first sign-in, prompt for username (create profile)
- Auth state managed via Supabase's onAuthStateChange
- Protected routes: redirect to /auth if not logged in (for creating games)
- Allow anonymous play: users CAN play without an account, but games won't be saved to their profile

### Game Server Integration
- When creating/joining a game, send the Supabase JWT token
- Server validates the token to identify the user
- When a game ends, server saves the game record to Supabase

## Updated Pages

### / (Landing page)
- Hero section with game description
- "Play Now" button → creates a game (logged in or anonymous)
- "Sign In" link in header
- If logged in: show username + quick stats in header

### /profile/[username]
- Display username, avatar, member since date
- Stats: games played, win rate, wins/losses
- Recent games list (last 20) with:
  - Opponent name
  - Result (W/L/D)
  - Win condition
  - Date
  - Click to view game replay (future feature — just link for now)

### /auth
- Sign in / Sign up forms
- Google OAuth button
- Redirect to / after successful auth

### Header component
- Logo/title: "Gambit"
- Nav: Play, Profile (if logged in), Sign In/Sign Out
- Show current user's username when logged in

## Environment Variables Needed
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side only, for game saves)

Build all of this. Keep the anonymous/local play working — accounts are optional but enable persistence and profiles.
```

---

## PROMPT 9: Lobby, Game History + Replay

```
Gambit now has accounts and game persistence. Add a proper lobby system and game replay functionality.

## Lobby System

### /play page
Create a lobby page where logged-in users can:

1. **Quick Play** — Create a game and wait for a random opponent
   - User clicks "Quick Play"
   - Server creates a game room and puts the user in a queue
   - When another user clicks Quick Play, they're matched together
   - Simple FIFO queue for now (no ELO matching yet)
   - Show "Searching for opponent..." with a cancel button
   - Auto-start when matched

2. **Create Private Game** — Generate a link to share
   - Same as current flow — create room, get shareable link
   - Show the link with a copy button
   - Show "Waiting for opponent to join..."

3. **Join Private Game** — Enter a game code
   - Input field for game ID
   - "Join" button

4. **Active Games** — Show the user's in-progress games (if any)
   - Clicking resumes the game (reconnection)

### /play layout
- Clean, centered card-based layout
- Show the user's current rating (placeholder for now, just show "Unrated")
- Show number of players online (from Socket.IO connected count)

## Game History + Replay

### /profile/[username] updates
- Recent games section now clickable
- Each game row shows: opponent, result, win condition, date, number of moves

### /game/[gameId]/replay page
- Load the game's moves_json from Supabase
- Render the board (same SVG component, but read-only)
- Playback controls:
  - ⏮ Go to start
  - ◀ Previous move
  - ▶ Next move
  - ⏭ Go to end
  - ▶️ Auto-play (step through moves with 1-second delay)
- Show move number and description (e.g., "White Footman C1 → D1")
- Show captured pieces accumulating as the replay progresses
- Show Capture Point control updating in real-time
- Keyboard shortcuts: left/right arrows for prev/next

## Server updates
- Track connected user count, broadcast to clients for "players online" display
- Implement the matchmaking queue (simple FIFO for now)
- Save all game data on completion (already partially done in Prompt 8)

Build all of this.
```

---

## PROMPT 10: ELO Rating System + Leaderboard

```
Gambit has lobby, accounts, and game history. Now add the competitive rating system.

## Glicko-2 Rating System

Implement Glicko-2 (not basic ELO). Use an existing npm package if one is well-maintained (e.g., glicko2), or implement from scratch if needed.

### Rating Parameters
- Starting rating: 1200
- Starting rating deviation (RD): 350
- Starting volatility: 0.06
- Rating period: per-game (recalculate after each game)

### Database
Add a `ratings` table:
- user_id (uuid, references profiles.id)
- rating (float, default 1200)
- rd (float, default 350) — rating deviation
- volatility (float, default 0.06)
- games_played (integer, default 0)
- last_game_at (timestamptz, nullable)
- created_at (timestamptz)

### Rating Calculation
- After each ranked game ends, recalculate both players' ratings
- Store the rating change in the games table: add columns `white_rating_before`, `white_rating_after`, `black_rating_before`, `black_rating_after`
- Provisional badge: show "Provisional" next to rating if games_played < 20

### Server Logic (apps/server/)
- On game completion, calculate new ratings for both players
- Update the ratings table
- Include rating changes in the game_over event sent to clients
- Show "+15" / "-12" style rating changes on the game over screen

## Leaderboard

### /leaderboard page
- Show top 100 players ranked by Glicko-2 rating
- Columns: Rank, Username, Rating (± RD), Games Played, Win Rate
- Highlight the current user's row if they're on the board
- If user is not in top 100, show their rank at the bottom: "Your rank: #247"
- Pagination or infinite scroll if needed
- Search/filter by username

### Profile updates
- Show rating prominently on profile page
- Show rating history chart (line graph of rating over last 30 games) — use a simple SVG chart or recharts
- Show "Provisional" badge if < 20 games

### Matchmaking update
- Update the Quick Play queue to prefer opponents within ±200 rating points
- If no match found within 30 seconds, widen the range by ±100 every 15 seconds
- Still fall back to FIFO if no rated match is found

### Header update
- Show the user's current rating next to their username in the nav bar

Build all of this. Ensure ratings are only calculated for games where both players are logged in (anonymous games are unrated).
```

---

## PROMPT 11: Deployment — Vercel + Railway + Supabase

```
Gambit is feature-complete for the MVP. Now set up production deployment.

## Deployment Architecture

- **Next.js frontend (apps/web/)** → Vercel
- **Socket.IO game server (apps/server/)** → Railway
- **Database + Auth** → Supabase (already hosted)

Vercel does NOT support persistent WebSocket connections, so the game server MUST be deployed separately.

## 1. Prepare the Game Server for Railway (apps/server/)

### Add a Dockerfile
Create a Dockerfile in apps/server/:
```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./
COPY packages/engine/ ./packages/engine/
COPY apps/server/ ./apps/server/

# Install dependencies
RUN npm ci --workspace=apps/server --workspace=packages/engine

# Build the engine
RUN npm run build --workspace=packages/engine

# Build the server
RUN npm run build --workspace=apps/server

EXPOSE 3001
CMD ["node", "apps/server/dist/index.js"]
```

Adjust paths as needed based on the actual project structure. The key requirement is that the server deployment includes the engine package since it's a workspace dependency.

### Ensure apps/server/package.json has:
- A `build` script that compiles TypeScript to dist/
- A `start` script: `node dist/index.js`
- The PORT should be read from `process.env.PORT` (Railway sets this automatically)

### Update CORS in the server:
- Read allowed origins from `process.env.CORS_ORIGIN`
- Support comma-separated origins for multiple domains:
  ```typescript
  const origins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  ```

### Health check endpoint:
- Add a GET `/health` route that returns `{ status: 'ok', uptime: process.uptime() }`
- Railway uses this to verify the service is running

## 2. Prepare the Next.js Frontend for Vercel (apps/web/)

### vercel.json (in project root)
```json
{
  "buildCommand": "npm run build --workspace=apps/web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "rootDirectory": "."
}
```

If Vercel has trouble with the monorepo, an alternative approach is to set the root directory to `apps/web/` in Vercel's project settings and ensure the build can resolve the engine workspace package.

### Environment variables for Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key  
- `NEXT_PUBLIC_GAME_SERVER_URL` — your Railway server URL (e.g., https://gambit-server-production.up.railway.app)

### Environment variables for Railway:
- `PORT` — Railway sets this automatically, just make sure the server reads it
- `CORS_ORIGIN` — your Vercel domain (e.g., https://gambit.vercel.app,https://gambit.snowkeystudios.com)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (for saving games server-side)

## 3. Production Hardening

### Game server:
- Add rate limiting to Socket.IO events (max 2 events per second per client)
- Add input validation on all incoming socket events (sanitise game IDs, move data)
- Log errors to stdout (Railway captures these automatically)
- Handle graceful shutdown (SIGTERM) — close active connections cleanly

### Frontend:
- Ensure all API calls have error handling and user-friendly error states
- Add a loading state while connecting to the game server
- Show a clear error if the game server is unreachable ("Server maintenance — please try again shortly")
- Set appropriate Cache-Control headers for static assets

### Supabase:
- Verify all RLS policies are active (never expose service role key to the client)
- Ensure the profiles and games tables have appropriate indexes:
  - profiles: index on username
  - games: index on white_player_id, black_player_id, status, created_at
  - ratings: index on rating DESC (for leaderboard queries)

## 4. Custom Domain (Optional)

If deploying to a custom domain like gambit.snowkeystudios.com:
- Add the domain in Vercel project settings
- Update CORS_ORIGIN on Railway to include the custom domain
- Update Supabase Auth redirect URLs to include the custom domain

## 5. Scripts

Add these to the root package.json:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=apps/web\" \"npm run dev --workspace=apps/server\"",
    "build": "npm run build --workspace=packages/engine && npm run build --workspace=apps/web && npm run build --workspace=apps/server",
    "test": "npm run test --workspace=packages/engine",
    "start:server": "npm run start --workspace=apps/server"
  }
}
```

Install `concurrently` as a dev dependency if not already present.

## 6. README Updates

Update the README.md with a Deployment section explaining:
- How to deploy the frontend to Vercel
- How to deploy the game server to Railway
- Required environment variables for each service
- How to connect a custom domain

Implement all of this. After setup, I should be able to:
1. Push to GitHub and have Vercel auto-deploy the frontend
2. Push to GitHub and have Railway auto-deploy the game server
3. Both services communicate correctly via the configured URLs
4. The game is fully playable in production
```

---

## Notes on Using These Prompts

**Before each prompt:**
- Make sure the previous step compiles and all tests pass
- Commit your progress to git between steps

**Context management:**
- Each prompt includes the game rules it needs
- If Claude Code loses context on rules, paste the relevant section from the development plan

**Adjustments:**
- If Claude Code makes architectural decisions you disagree with, course-correct before the next prompt
- If bugs emerge, fix them before moving forward — especially engine bugs

**What's NOT covered yet (future prompts):**
- Bot/AI opponents
- Tournaments
- Cosmetic customisation
- Optional game modes (Speed, Long, Imperial Gambit)
- Sound design
- PWA support
- Branding asset integration (once you provide them)
- CI/CD pipeline (GitHub Actions for automated testing)
