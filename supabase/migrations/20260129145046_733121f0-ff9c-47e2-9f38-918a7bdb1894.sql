-- Add country and province/state fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;

-- Create app_sessions table for screen time tracking
CREATE TABLE IF NOT EXISTS public.app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on app_sessions
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_sessions
CREATE POLICY "Users can insert their own sessions"
ON public.app_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.app_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
ON public.app_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON public.app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_started_at ON public.app_sessions(started_at);

-- Grant admin role to the specified user (will be applied after user signs up/in)
-- First, let's create a function to automatically assign admin role by email
CREATE OR REPLACE FUNCTION public.check_and_assign_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'swaine.swaine@gmail.com' THEN
    -- Assign admin role if not already assigned
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to check on user creation
DROP TRIGGER IF EXISTS on_auth_user_check_admin ON auth.users;
CREATE TRIGGER on_auth_user_check_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_assign_admin();