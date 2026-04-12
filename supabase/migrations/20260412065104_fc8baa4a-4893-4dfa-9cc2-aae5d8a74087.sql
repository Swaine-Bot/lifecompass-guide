
-- Add domain column to habits table using existing life_domain enum
ALTER TABLE public.habits
ADD COLUMN domain public.life_domain NOT NULL DEFAULT 'physical';

-- Add an index for filtering habits by domain
CREATE INDEX idx_habits_domain ON public.habits (domain);
