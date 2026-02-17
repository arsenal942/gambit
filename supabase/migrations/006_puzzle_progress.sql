-- Puzzle progress tracking
ALTER TABLE public.profiles
  ADD COLUMN puzzles_solved integer[] NOT NULL DEFAULT '{}',
  ADD COLUMN puzzle_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN puzzle_last_solved_date date;
