-- Add room_id column to games table for linking active Socket.IO rooms to DB records
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS room_id text;
CREATE INDEX IF NOT EXISTS idx_games_room_id ON public.games(room_id);
