-- Add bio column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- Drop and recreate profiles_public view to include bio and life_phase
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  bio,
  life_phase,
  created_at,
  updated_at
FROM public.profiles;

-- Drop and recreate profiles_searchable view to include bio
DROP VIEW IF EXISTS public.profiles_searchable;
CREATE VIEW public.profiles_searchable AS
SELECT 
  user_id,
  name,
  avatar_url,
  bio,
  life_phase
FROM public.profiles;