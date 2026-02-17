# ⚔️ Gambit

**A 2-player tactical board game set in the world of Blackheart: The Spellforge Saga.**

Command armies of Footmen, Archers, and Knights across the River of Kings. Seize territory, outmanoeuvre your opponent, and claim victory through total dominance or strategic capture.

Play free at [gambit.snowkeystudios.com](https://gambit.snowkeystudios.com) *(coming soon)*

---

## How to Play

Gambit is played on a **10×11 grid** divided by a central **River** (Row F). Each player commands **15 pieces** — 5 Footmen, 5 Archers, and 5 Knights — and takes turns moving one unit per turn. Units change behaviour when they cross the River, creating a dynamic strategic landscape.

### Win Conditions

| Condition | How |
|-----------|-----|
| **Annihilation** | Eliminate all enemy units |
| **Check Mate** | Hold 3 of the 4 River Capture Points for a full turn |
| **Forfeit** | Your opponent concedes |

### The Board

```
     1    2    3    4    5    6    7    8    9    10
K  [ ♞ ]      [ ♞ ]      [ ♞ ]      [ ♞ ]      [ ♞ ]     ← Black Knights
J       [ ♜ ]      [ ♜ ]      [ ♜ ]      [ ♜ ]      [ ♜ ] ← Black Archers
I  [ ♟ ]      [ ♟ ]      [ ♟ ]      [ ♟ ]      [ ♟ ]     ← Black Footmen
H
G
F  [🚩]            [🚩]            [🚩]            [🚩]    ← River + Capture Points
E
D
C  [ ♙ ]      [ ♙ ]      [ ♙ ]      [ ♙ ]      [ ♙ ]     ← White Footmen
B       [ ♖ ]      [ ♖ ]      [ ♖ ]      [ ♖ ]      [ ♖ ] ← White Archers
A  [ ♘ ]      [ ♘ ]      [ ♘ ]      [ ♘ ]      [ ♘ ]     ← White Knights
```

**White** plays from the bottom (Rows A–C), **Black** from the top (Rows I–K). The **River** (Row F) is the central dividing line — crossing it changes how your units move and fight.

Four **Capture Points** (flagged tiles at F1, F4, F7, F10) are the focus of territorial control.

### Units

#### Footmen — *Frontline Brawlers*
| | Behind / At River | Beyond River |
|---|---|---|
| **Move** | 1 tile forward, backward, or sideways | Up to 2 tiles forward/backward, or 1 sideways |
| **Capture** | 1 tile diagonally forward | 1 tile diagonally (any direction) |

**First Move** — A Footman that hasn't moved yet can move 2 tiles forward (like a pawn in chess). Cannot jump over pieces.

**Pushback** — A Footman adjacent to an enemy can push it 1 tile orthogonally instead of moving. Can't push into occupied tiles, off the board, or retaliate against a piece that just pushed you.

**Promotion** — A Footman reaching the enemy's back row may be sacrificed to return a captured friendly piece to your first three rows.

#### Archers — *Ranged Support*
| | Behind / At River | Beyond River |
|---|---|---|
| **Move** | 2 tiles orthogonally, or 1 tile diagonally | 1 tile in any direction |
| **Capture** | Longshot only | Longshot only |

**Longshot** — Archers capture at range without moving. They need a **screen** (any piece directly between them and the target):
- Up to **3 tiles forward** through a screen
- Up to **2 tiles backward or sideways** through a screen
- Cannot shoot over 2+ pieces. Cannot shoot diagonally.

#### Knights — *Mobile Disruptors*
| | All positions (unaffected by River) |
|---|---|
| **Move** | L-shaped: 2 tiles in one direction + 1 perpendicular |
| **Capture** | Land on enemy tile via L-move |

**Leg Cut** — If the first tile in the 2-tile direction is occupied, that entire L-direction is blocked.

**Ransom** — When a Knight captures an enemy Knight, you may return a captured Footman or Archer to your first three rows.

### Turn Order

1. **Move** one unit (or use Pushback / Longshot)
2. **Resolve** any capture
3. **Check** victory conditions
4. **Promote** a Footman if eligible

### Check & Check Mate

When you control **3 of 4 Capture Points** at the end of your turn, your opponent is in **Check** — they must break your hold on their next turn. If they fail, it's **Check Mate** and you win.

### Additional Rules

- No passing turns unless no legal moves are available
- If no captures occur for 10 full turns, players may agree to a draw
- Promotion occurs on the turn a Footman reaches the final row
- Pushback cannot target the same piece that pushed you the previous turn

### Optional Modes

| Mode | Rule Change |
|------|-------------|
| **Speed Gambit** | Move 2 different-type pieces per turn |
| **Long Gambit** | Must secure all 4 flags to Check |
| **Imperial Gambit** | Players place pieces one at a time on an empty board before play |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| UI | Tailwind CSS, shadcn/ui |
| Game Board | React + SVG |
| Real-time | Socket.IO |
| Game Engine | TypeScript (shared between client + server) |
| Database | Supabase (Postgres + Auth) |
| Rating System | Glicko-2 |
| Frontend Hosting | Vercel |
| Game Server Hosting | Railway |

### Project Structure

```
gambit/
├── packages/
│   └── engine/              # Pure TS game engine (shared)
│       ├── src/
│       │   ├── types.ts     # Core type definitions
│       │   ├── board.ts     # Board utilities + setup
│       │   ├── game.ts      # Game state machine
│       │   ├── moves.ts     # Legal move aggregation
│       │   ├── capture.ts   # Capture resolution
│       │   ├── victory.ts   # Win condition checks
│       │   └── units/
│       │       ├── footman.ts
│       │       ├── archer.ts
│       │       └── knight.ts
│       └── tests/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── play/              # Lobby
│   │   │   ├── game/[id]/         # Game board
│   │   │   ├── game/local/        # Local hotseat mode
│   │   │   ├── profile/[username] # Player profile
│   │   │   ├── leaderboard/       # Rankings
│   │   │   └── auth/              # Sign in / Sign up
│   │   └── components/
│   │       ├── Board.tsx
│   │       ├── Piece.tsx
│   │       └── ...
│   └── server/              # Socket.IO game server
│       ├── index.ts
│       ├── rooms.ts
│       └── matchmaking.ts
├── supabase/                # DB migrations + RLS policies
└── package.json             # npm workspaces
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (for auth + database)

### Setup

```bash
# Clone the repo
git clone https://github.com/snowkeystudios/gambit.git
cd gambit

# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env.local
# Fill in your Supabase URL, keys, and server config

# Run database migrations
npx supabase db push

# Start the game engine tests (verify everything works)
cd packages/engine
npm test

# Start development servers
cd ../..
npm run dev          # Starts both web (localhost:3000) and server (localhost:3001)
```

### Environment Variables

#### apps/web/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001
```

#### apps/server/.env.local
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGINS=http://localhost:3000
```

---

## Development

```bash
# Run all engine tests
npm run test -w packages/engine

# Run tests in watch mode
npm run test:watch -w packages/engine

# Start web frontend only
npm run dev -w apps/web

# Start game server only
npm run dev -w apps/server

# Build for production
npm run build
```

---

## Deployment

Gambit uses a split deployment: the Next.js frontend on **Vercel** and the Socket.IO game server on **Railway**. Vercel doesn't support persistent WebSocket connections, so the game server must be hosted separately.

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Vercel auto-detects the `vercel.json` at the project root, which handles the monorepo build order (engine → shared → web)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
   - `NEXT_PUBLIC_GAME_SERVER_URL` — your Railway server URL (e.g., `https://gambit-server-production.up.railway.app`)
4. Deploy — Vercel auto-builds on push to `main`

### Game Server → Railway

1. Connect your GitHub repo to Railway
2. Set the Dockerfile path to `apps/server/Dockerfile` (multi-stage build that compiles engine, shared, and server)
3. Add environment variables:
   - `CORS_ORIGINS` — your Vercel domain(s), comma-separated (e.g., `https://gambit.vercel.app,https://gambit.snowkeystudios.com`)
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key
   - `PORT` is set automatically by Railway
4. The server exposes a health check at `GET /health` for readiness detection
5. Deploy — Railway auto-builds on push to `main`

### Database → Supabase

Supabase is already hosted. Ensure:
- RLS policies are enabled on all tables
- Auth redirect URLs include your production domain
- Service role key is only used server-side (never exposed to the client)
- Indexes exist on: `profiles(username)`, `games(white_player_id, black_player_id, status, created_at)`, `ratings(rating DESC)`

### Environment Variable Reference

| Variable | Service | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anon key (safe for client) |
| `NEXT_PUBLIC_GAME_SERVER_URL` | Vercel | Railway server URL |
| `PORT` | Railway | Set automatically by Railway |
| `CORS_ORIGINS` | Railway | Comma-separated allowed origins |
| `SUPABASE_URL` | Railway | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway | Supabase service role key (secret) |

### Custom Domain

To use a custom domain like `gambit.snowkeystudios.com`:
1. Add the domain in Vercel project settings
2. Update `CORS_ORIGINS` on Railway to include the custom domain
3. Update Supabase Auth redirect URLs to include the custom domain

---

## Roadmap

- [x] Game rules specification
- [ ] Game engine with full rule enforcement + tests
- [ ] Board UI with local hotseat play
- [ ] Online multiplayer via Socket.IO
- [ ] User accounts + game persistence (Supabase)
- [ ] Lobby system + matchmaking
- [ ] Game replay
- [ ] Glicko-2 rating system
- [ ] Leaderboard
- [ ] Optional game modes (Speed, Long, Imperial)
- [ ] Bot opponents (AI)
- [ ] Tournaments
- [ ] Branded piece art + board themes
- [ ] Sound design
- [ ] PWA support

---

## Contributing

Gambit is currently in early development. If you're interested in contributing, reach out to us at [snowkeystudios.com](https://snowkeystudios.com).

---

## License

© 2025 Snowkey Studios. All rights reserved.

Gambit is part of the **Blackheart: The Spellforge Saga** universe.