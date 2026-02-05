-- =====================================================
-- SECURITY FIX: Protect location data from exposure
-- Location coordinates should never be visible to friends/public
-- =====================================================

-- Drop and recreate the profile view policy to exclude location from friend/public access
DROP POLICY IF EXISTS "Friends can view profiles based on privacy settings" ON public.profiles;

-- Create a more restrictive policy that only allows viewing non-sensitive fields for friends/public
-- The full profile (including location) is only visible to the user themselves
CREATE POLICY "Users can view profiles with privacy controls"
ON public.profiles
FOR SELECT
USING (
    -- User can always see their own full profile
    auth.uid() = user_id
);

-- Create a separate policy for friends viewing limited profile data
-- This is handled through the views which now exclude location data

-- Recreate profiles_public view WITHOUT location data
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
    -- Explicitly NOT including: last_latitude, last_longitude, location_updated_at, province, country
FROM public.profiles;

-- Grant access only to authenticated users
REVOKE ALL ON public.profiles_public FROM anon;
REVOKE ALL ON public.profiles_public FROM public;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Create a helper function for profile viewing with privacy controls
CREATE OR REPLACE FUNCTION public.get_profile_for_viewer(target_user_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    name text,
    avatar_url text,
    bio text,
    life_phase public.life_phase,
    account_type public.account_type,
    page_category text,
    website_url text,
    is_verified boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If viewing own profile, return all data (caller should use direct query)
    IF auth.uid() = target_user_id THEN
        RETURN QUERY
        SELECT 
            p.id, p.user_id, p.name, p.avatar_url, p.bio, 
            p.life_phase, p.account_type, p.page_category, 
            p.website_url, p.is_verified
        FROM profiles p
        WHERE p.user_id = target_user_id;
        RETURN;
    END IF;
    
    -- Check privacy settings and friendship
    RETURN QUERY
    SELECT 
        p.id, p.user_id, p.name, p.avatar_url, p.bio, 
        p.life_phase, p.account_type, p.page_category, 
        p.website_url, p.is_verified
    FROM profiles p
    LEFT JOIN privacy_settings ps ON ps.user_id = p.user_id
    WHERE p.user_id = target_user_id
    AND (
        -- Public profiles visible to all authenticated users
        ps.profile_visibility = 'public'
        OR
        -- Friends can see friend-visibility profiles
        (ps.profile_visibility = 'friends' AND are_friends(auth.uid(), target_user_id))
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_for_viewer(uuid) TO authenticated;