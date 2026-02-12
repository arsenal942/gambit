# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All active development is in the `@gambit/engine` package. Run commands from the repo root using workspace flags:

```bash
# Build
npm run build -w packages/engine

# Test (all)
npm run test -w packages/engine

# Test (watch mode)
npm run test:watch -w packages/engine

# Test (single file)
npx vitest run packages/engine/__tests__/board.test.ts
```

No linter or formatter is configured yet.

## Architecture

**Monorepo** using npm workspaces with three packages:

- `packages/engine` (`@gambit/engine`) — Core game logic: types, board utilities, move mechanics. This is the only package with implementation so far.
- `apps/server` (`@gambit/server`) — Placeholder, no implementation yet.
- `apps/web` (`@gambit/web`) — Placeholder, no implementation yet.

All packages are private (not published to npm). TypeScript compiles to `dist/` with declaration files.

### Engine package structure

- `src/types.ts` — All game types and interfaces (pieces, positions, moves, game state)
- `src/board.ts` — Board creation, position conversion, piece placement, board queries
- `src/index.ts` — Barrel re-export of all public API
- `__tests__/` — Vitest test files matching source modules

## Game Domain

Gambit is a strategy board game on a **10-column (1–10) × 11-row (A–K) grid**.

- **Players**: `"white"` (rows A–C) and `"black"` (rows I–K)
- **Piece types**: `"footman"`, `"archer"`, `"knight"` — 15 per player
- **River**: Row F divides the board; capture points at F1, F4, F7, F10
- **Board indexing**: `board[rowIndex][colIndex]`, 0-based. Row A = index 0, col 1 = index 0.
- **Move types**: `"move"`, `"capture"`, `"pushback"`, `"longshot"`, `"promotion"`, `"ransom"`

## Code Conventions

- **ESM only** — All packages use `"type": "module"`. Source imports must use explicit `.js` extensions (e.g., `import { ... } from "./board.js"`).
- **Functional style** — Board operations are standalone functions, not class methods. Some functions mutate the board array in place (`setPieceAt`, `removePieceAt`).
- **Strict TypeScript** — `strict: true`, ES2022 target, bundler module resolution. Base config in `tsconfig.base.json`, extended by each package.
- **Package scope** — All packages use the `@gambit/` npm scope.
