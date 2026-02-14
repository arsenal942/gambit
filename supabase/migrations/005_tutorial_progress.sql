-- Tutorial progress tracking
ALTER TABLE public.profiles
  ADD COLUMN tutorial_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN tutorial_lessons_completed integer NOT NULL DEFAULT 0;
