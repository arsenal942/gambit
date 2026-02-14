-- ══════════════════════════════════════════════════════════════
-- ratings table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.ratings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating DOUBLE PRECISION NOT NULL DEFAULT 1200,
  rd DOUBLE PRECISION NOT NULL DEFAULT 350,
  volatility DOUBLE PRECISION NOT NULL DEFAULT 0.06,
  games_played INTEGER NOT NULL DEFAULT 0,
  last_game_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are publicly readable"
  ON public.ratings FOR SELECT
  USING (true);

CREATE INDEX idx_ratings_rating_desc ON public.ratings(rating DESC);
CREATE INDEX idx_ratings_games_played ON public.ratings(games_played);

-- ══════════════════════════════════════════════════════════════
-- Add rating snapshot columns to games table
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS white_rating_before DOUBLE PRECISION;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS white_rating_after DOUBLE PRECISION;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS black_rating_before DOUBLE PRECISION;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS black_rating_after DOUBLE PRECISION;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_rated BOOLEAN NOT NULL DEFAULT false;

-- ══════════════════════════════════════════════════════════════
-- RPC: Ensure a user's rating row exists (idempotent)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION ensure_rating_exists(p_user_id UUID)
RETURNS void AS $$
  INSERT INTO public.ratings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
$$ LANGUAGE sql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════
-- RPC: Get a user's leaderboard rank
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (SELECT COUNT(*)::integer + 1
     FROM public.ratings
     WHERE rating > (SELECT rating FROM public.ratings WHERE user_id = p_user_id)
       AND games_played >= 1),
    0
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
