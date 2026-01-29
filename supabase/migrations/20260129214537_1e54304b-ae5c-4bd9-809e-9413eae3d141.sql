-- Fix 1: Add RLS policies to profiles_public view
-- First, we need to enable RLS on the view (views inherit from underlying table)
-- Since profiles_public is a VIEW, we need to recreate it with security_invoker

-- Drop and recreate the profiles_public view with proper security
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.avatar_url,
  p.life_phase,
  p.created_at,
  p.updated_at
FROM public.profiles p
LEFT JOIN public.privacy_settings ps ON ps.user_id = p.user_id
WHERE 
  -- User can always see their own profile
  p.user_id = auth.uid()
  -- Or profile is public
  OR ps.profile_visibility = 'public'
  -- Or profile is friends-only and viewer is a friend
  OR (ps.profile_visibility = 'friends' AND public.are_friends(auth.uid(), p.user_id));

-- Add comment for documentation
COMMENT ON VIEW public.profiles_public IS 'Public view of profiles that respects privacy settings. Uses security_invoker to run with caller permissions.';

-- Fix 2: Drop and recreate user_subscriptions_safe view with proper security
DROP VIEW IF EXISTS public.user_subscriptions_safe;

CREATE VIEW public.user_subscriptions_safe
WITH (security_invoker = on)
AS
SELECT 
  id,
  user_id,
  tier,
  is_active,
  started_at,
  expires_at,
  created_at,
  updated_at
FROM public.user_subscriptions
WHERE user_id = auth.uid();

-- Add comment for documentation
COMMENT ON VIEW public.user_subscriptions_safe IS 'Safe view of user subscriptions that only returns the authenticated users own data. Uses security_invoker to run with caller permissions.';