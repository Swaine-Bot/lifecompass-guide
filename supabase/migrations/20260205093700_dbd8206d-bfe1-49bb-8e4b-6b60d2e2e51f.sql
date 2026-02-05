-- =====================================================
-- SECURITY FIX: Recreate views with security_invoker=on
-- This ensures RLS policies from base tables are enforced
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.profiles_searchable;
DROP VIEW IF EXISTS public.user_subscriptions_safe;

-- Recreate profiles_public with security_invoker=on
-- This view shows public-safe profile fields
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

-- Grant access only to authenticated users
REVOKE ALL ON public.profiles_public FROM anon;
REVOKE ALL ON public.profiles_public FROM public;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Recreate profiles_searchable with security_invoker=on
-- This view is for user discovery/search
CREATE VIEW public.profiles_searchable
WITH (security_invoker=on) AS
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

-- Grant access only to authenticated users
REVOKE ALL ON public.profiles_searchable FROM anon;
REVOKE ALL ON public.profiles_searchable FROM public;
GRANT SELECT ON public.profiles_searchable TO authenticated;

-- Recreate user_subscriptions_safe with security_invoker=on
-- This view already filters to auth.uid() but needs security_invoker
CREATE VIEW public.user_subscriptions_safe
WITH (security_invoker=on) AS
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

-- Grant access only to authenticated users
REVOKE ALL ON public.user_subscriptions_safe FROM anon;
REVOKE ALL ON public.user_subscriptions_safe FROM public;
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;

-- =====================================================
-- Add RLS policy for friends to view profiles based on privacy settings
-- =====================================================
CREATE POLICY "Friends can view profiles based on privacy settings"
ON public.profiles
FOR SELECT
USING (
    -- User can always see their own profile
    auth.uid() = user_id
    OR
    -- Friends can see profiles if profile_visibility is 'friends' or 'public'
    (
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps
            WHERE ps.user_id = profiles.user_id
            AND ps.profile_visibility IN ('friends', 'public')
        )
        AND are_friends(auth.uid(), user_id)
    )
    OR
    -- Anyone authenticated can see public profiles
    EXISTS (
        SELECT 1 FROM public.privacy_settings ps
        WHERE ps.user_id = profiles.user_id
        AND ps.profile_visibility = 'public'
    )
);