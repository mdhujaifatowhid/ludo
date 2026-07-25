# Ludo Realtime

A responsive, real-time multiplayer Ludo table for 2-4 players (free-for-all,
no teams). Built with **Next.js + React** on the frontend and **Supabase**
(Postgres + Auth + Realtime) as the entire backend — no separate server
process to run or deploy.

## Why no Socket.io

Vercel's serverless functions don't hold long-lived WebSocket connections, so
a traditional Socket.io server needs its own always-on host (Railway, Render,
a VPS, etc). To keep the stack to exactly **GitHub + Vercel + Supabase** as
requested, this build uses **Supabase Realtime** instead:

- Postgres row changes (`postgres_changes`) push room, game, and chat updates
  to every connected client the moment a row is written.
- Supabase **Presence** tracks who's currently online in a room.
- Turn order is enforced **server-side** by a Postgres RLS policy — a
  player's client can only write the next game state when the database
  already thinks it's their turn — so a slow or malicious client can't jump
  the queue or fake another player's move.

If you outgrow this later, Supabase Realtime and Socket.io are conceptually
interchangeable here: everything reactive lives behind the small set of hooks
in `src/hooks/`, so swapping the transport wouldn't touch game logic or UI.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase**: Postgres, Auth (anonymous sign-in), Realtime, RLS
- Pure-function game engine (`src/lib/gameEngine.ts`) — fully unit-testable,
  no framework dependencies
- Native `Audio` API for sound effects (no extra dependency)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run the entire contents of `supabase/schema.sql`.
   This creates all tables, RLS policies, and RPC functions
   (`create_room`, `join_room`, `advance_turn`) and enables Realtime on the
   relevant tables.
3. In **Authentication → Providers**, make sure **Anonymous sign-ins** are
   enabled (this demo signs everyone in anonymously with a chosen nickname —
   swap in email/OAuth later if you want persistent accounts).
4. Copy your project URL and anon key into `.env.local`.

### Sound effects

Drop your own clips into `public/sounds/` — see
`public/sounds/README.txt` for the exact filenames expected. The app
degrades gracefully if they're missing.

## Deploying

1. Push this repo to GitHub.
2. Import it in Vercel, set the two `NEXT_PUBLIC_SUPABASE_*` env vars in the
   Vercel project settings, and deploy. No custom server config needed.

## How multiplayer sync works

- **Rooms**: `create_room`/`join_room` RPCs generate a unique 6-character
  code and seat players into `red`/`green`/`yellow`/`blue`, 2-4 players.
- **Game state**: one JSONB blob per room in `game_states`, holding token
  positions, whose turn it is, dice value, and a short event log. Every
  client subscribes to `postgres_changes` on that row.
- **Turn enforcement**: `game_states.current_turn` is a plain UUID column;
  an RLS policy only allows `UPDATE` when `auth.uid() = current_turn`. The
  `advance_turn()` RPC bundles "write new state" + "hand off turn" into one
  atomic, RLS-checked call, so two clients racing to move can't both win.
- **Chat & presence**: `chat_messages` table + `postgres_changes` for chat;
  a per-room Supabase Presence channel for online indicators.

## Known simplifications (documented, not bugs)

- **Dice rolls are client-rolled and only become visible to opponents once a
  move is committed** (or a no-move turn is passed). For a quick upgrade,
  broadcast the raw roll immediately over a Realtime `broadcast` event before
  the move is chosen.
- **No blockades**: classic house-rule where two same-color tokens on one
  square block opponents isn't implemented — every square just holds
  whichever tokens land there.
- **Move validity is trusted to the client that computed it** (only *whose
  turn it is* is enforced by the database, not that the move itself follows
  Ludo rules). For a fully server-authoritative engine, port
  `src/lib/gameEngine.ts`'s logic into a Postgres `plpgsql` function.

## Project structure

```
src/
  app/                 Next.js routes (home, room/[code])
  components/          Board, Token, Dice, ChatBox, PlayerCard, etc.
  hooks/                useProfile, useRoom, useGameState, useChat, usePresence
  lib/                  gameEngine.ts, boardLayout.ts, supabaseClient.ts, sounds.ts
  types/                shared TypeScript types
supabase/schema.sql     full DB schema, RLS policies, RPC functions
```
