# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run commands from the repo root using workspace flags:

```bash
# Full-stack dev (web + server concurrently)
npm run dev

# Build all packages in dependency order
npm run build

# Build individual packages
npm run build -w packages/engine
npm run build -w packages/shared
npm run build -w apps/web
npm run build -w apps/server

# Test (engine only — the only package with tests)
npm run test -w packages/engine
npm run test:watch -w packages/engine
npx vitest run packages/engine/__tests__/board.test.ts

# Run individual apps
npm run dev -w apps/web       # Next.js on localhost:3000
npm run dev -w apps/server    # Socket.IO on localhost:3001
npm run start:server          # Production server
```

No linter or formatter is configured yet.

## Architecture

**Monorepo** using npm workspaces with four packages:

- `packages/engine` (`@gambit/engine`) — Pure game logic: types, board utilities, move mechanics, victory conditions. Shared by client and server.
- `packages/shared` (`@gambit/shared`) — Socket.IO event type definitions and room/player schemas. Depends on `@gambit/engine`.
- `apps/web` (`@gambit/web`) — Next.js 14+ frontend with Supabase auth and Socket.IO client.
- `apps/server` (`@gambit/server`) — Socket.IO game server with in-memory rooms, matchmaking, Glicko-2 ratings, and Supabase persistence.

All packages are private. TypeScript compiles to `dist/` with declaration files. Build order matters: engine → shared → web/server.

### Engine package (`packages/engine/src/`)

- `types.ts` — All game types: `Piece`, `Position`, `Move`, `GameState`, `GameAction`, `GamePhase`, etc.
- `board.ts` — Board creation (`setupInitialBoard`), position conversion (`posToIndex`/`indexToPos`), tile queries, piece placement (mutates in place)
- `game.ts` — State machine: `createGame()`, `executeMove()`, `forfeit()`, `offerDraw()`. Clones state immutably before applying actions. Enforces phase gating (promotion/ransom must resolve before play continues).
- `moves.ts` — `getAllLegalMoves()` and `hasLegalMoves()` aggregate actions across all pieces
- `victory.ts` — Win condition checks: annihilation, capture point control (check/checkmate), draw eligibility
- `units/footman.ts` — Movement, capture, pushback (with anti-retaliation rule), promotion
- `units/archer.ts` — Movement, longshot (ranged capture through exactly 1 screen piece)
- `units/knight.ts` — L-shaped movement with leg cut rule, capture, ransom

### Server (`apps/server/src/`)

Event-driven Socket.IO architecture with handler modules per concern:
- `handlers/` — `game.ts`, `moves.ts`, `meta.ts` (forfeit/draw), `matchmaking.ts`, `connection.ts`
- `rooms.ts` — In-memory room storage; stale rooms cleaned every 5 minutes
- `matchmaking.ts` — Background matchmaking loop
- `persistence/` — Supabase game and rating persistence
- `ratings/calculate.ts` — Glicko-2 rating calculations

### Web app (`apps/web/`)

Next.js App Router with Supabase auth middleware on all routes.

Key patterns:
- **Game state hooks**: `useGameState` (local), `useOnlineGameState` (Socket.IO sync), `useReplayState` (replay playback)
- **Board interaction**: `useBoardInteraction` hook handles piece selection and move preview
- **Auth**: Supabase SSR with `AuthProvider` context, middleware session refresh, OAuth callback at `/auth/callback`
- **Socket.IO**: Singleton client in `lib/socket.ts` with auto-reconnect (up to 10 attempts)
- **Path alias**: `@/*` maps to project root (e.g., `@/components/...`, `@/lib/...`)

## Game Domain

Gambit is a strategy board game on a **10-column (1–10) × 11-row (A–K) grid**.

- **Players**: `"white"` (home rows A–C) and `"black"` (home rows I–K)
- **Piece types**: `"footman"`, `"archer"`, `"knight"` — 5 each, 15 per player
- **River**: Row F divides the board; capture points at F1, F4, F7, F10
- **Board indexing**: `board[rowIndex][colIndex]`, 0-based. Row A = index 0, col 1 = index 0.
- **Move types**: `"move"`, `"capture"`, `"pushback"`, `"longshot"`, `"promotion"`, `"ransom"`
- **Game phases**: `"playing"` → `"awaitingPromotion"` / `"awaitingRansom"` → `"playing"` / `"ended"`
- **Victory**: Annihilation (all enemy pieces eliminated), Checkmate (hold 3+ capture points for a full turn), Forfeit, Draw (20+ half-turns without capture, mutual agreement)

## Code Conventions

- **ESM only** — All packages use `"type": "module"`. Source imports must use explicit `.js` extensions (e.g., `import { ... } from "./board.js"`).
- **Functional style** — Board operations are standalone functions, not class methods. Some functions mutate the board in place (`setPieceAt`, `removePieceAt`), but `game.ts` clones state before mutations for immutability.
- **Strict TypeScript** — `strict: true`, ES2022 target, bundler module resolution. Base config in `tsconfig.base.json`, extended by each package.
- **Package scope** — All packages use the `@gambit/` npm scope.

## Deployment

Split deployment: Next.js frontend on **Vercel**, Socket.IO server on **Railway**, database on **Supabase**. Build order defined in `vercel.json` and `apps/server/Dockerfile`.
