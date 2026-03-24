
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS mentor_style text DEFAULT 'strategist',
  ADD COLUMN IF NOT EXISTS identity_prompt text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS age_range text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS occupation text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS primary_intent text DEFAULT NULL;
