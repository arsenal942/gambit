-- ══════════════════════════════════════════════════════════════
-- profiles table
-- ══════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
    check (char_length(username) >= 3 and char_length(username) <= 20),
  avatar_url text,
  created_at timestamptz not null default now(),
  games_played integer not null default 0,
  games_won integer not null default 0
);

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════
-- games table
-- ══════════════════════════════════════════════════════════════
create table public.games (
  id uuid primary key default gen_random_uuid(),
  white_player_id uuid references public.profiles(id),
  black_player_id uuid references public.profiles(id),
  status text not null default 'waiting'
    check (status in ('waiting', 'playing', 'completed')),
  result text
    check (result is null or result in ('white_wins', 'black_wins', 'draw')),
  win_condition text
    check (win_condition is null or win_condition in (
      'annihilation', 'checkmate', 'forfeit', 'draw'
    )),
  moves_json jsonb not null default '[]'::jsonb,
  final_state_json jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.games enable row level security;

create policy "Completed games are publicly readable"
  on public.games for select
  using (status = 'completed');

create policy "Players can read own in-progress games"
  on public.games for select
  using (
    auth.uid() = white_player_id or auth.uid() = black_player_id
  );

-- Indexes
create index idx_games_white_player on public.games(white_player_id);
create index idx_games_black_player on public.games(black_player_id);
create index idx_games_status on public.games(status);

-- ══════════════════════════════════════════════════════════════
-- RPC functions for atomic stat updates
-- ══════════════════════════════════════════════════════════════
create or replace function increment_games_played(user_id uuid)
returns void as $$
  update public.profiles
  set games_played = games_played + 1
  where id = user_id;
$$ language sql security definer;

create or replace function increment_games_won(user_id uuid)
returns void as $$
  update public.profiles
  set games_won = games_won + 1
  where id = user_id;
$$ language sql security definer;
