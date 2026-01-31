-- Create account type enum
CREATE TYPE public.account_type AS ENUM ('individual', 'page');

-- Add account_type column to profiles
ALTER TABLE public.profiles 
ADD COLUMN account_type public.account_type NOT NULL DEFAULT 'individual';

-- Add page-specific fields
ALTER TABLE public.profiles 
ADD COLUMN page_category text,
ADD COLUMN website_url text,
ADD COLUMN is_verified boolean DEFAULT false;

-- Create follows table for unified follow system (pages and individuals)
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows
CREATE POLICY "Users can view their own follows"
ON public.follows FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- Create page_dismissals table to track dismissed suggestions
CREATE TABLE public.page_dismissals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dismissed_page_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, dismissed_page_id)
);

-- Enable RLS on page_dismissals
ALTER TABLE public.page_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_dismissals
CREATE POLICY "Users can view their own dismissals"
ON public.page_dismissals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss pages"
ON public.page_dismissals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove dismissals"
ON public.page_dismissals FOR DELETE
USING (auth.uid() = user_id);

-- Add post_type to posts table for goals/micro moves
CREATE TYPE public.post_type AS ENUM ('regular', 'goal', 'micro_move');

ALTER TABLE public.posts
ADD COLUMN post_type public.post_type NOT NULL DEFAULT 'regular',
ADD COLUMN goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL,
ADD COLUMN habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL;

-- Update profiles_public view to include account_type
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public 
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    name,
    avatar_url,
    bio,
    life_phase,
    account_type,
    page_category,
    website_url,
    is_verified,
    created_at,
    updated_at
  FROM public.profiles;

-- Update profiles_searchable view to include account_type
DROP VIEW IF EXISTS public.profiles_searchable;
CREATE VIEW public.profiles_searchable AS
  SELECT 
    user_id,
    name,
    avatar_url,
    bio,
    life_phase,
    account_type,
    page_category,
    is_verified
  FROM public.profiles;

-- Function to check if user follows another user
CREATE OR REPLACE FUNCTION public.is_following(follower uuid, target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = follower AND following_id = target
  )
$$;

-- Add index for faster follow lookups
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);