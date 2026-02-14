-- Add bot game tracking columns to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_bot_game BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS bot_id TEXT;

-- Index for filtering bot games
CREATE INDEX IF NOT EXISTS idx_games_is_bot_game ON public.games(is_bot_game);

-- Allow authenticated users to insert their own bot games
-- (One player_id will be the user, the other will be null for the bot)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'games' AND policyname = 'Users can insert own bot games'
  ) THEN
    CREATE POLICY "Users can insert own bot games"
      ON public.games FOR INSERT
      TO authenticated
      WITH CHECK (
        is_bot_game = true
        AND (auth.uid() = white_player_id OR auth.uid() = black_player_id)
      );
  END IF;
END $$;
