-- Add location permission to privacy_settings
ALTER TABLE public.privacy_settings 
ADD COLUMN IF NOT EXISTS location_permission text DEFAULT 'never' CHECK (location_permission IN ('always', 'while_using', 'never'));

-- Add last known location to profiles for convenience features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_latitude double precision,
ADD COLUMN IF NOT EXISTS last_longitude double precision,
ADD COLUMN IF NOT EXISTS location_updated_at timestamp with time zone;