-- Add language preference to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'fr', 'nl', 'it', 'es', 'pt', 'ru'));