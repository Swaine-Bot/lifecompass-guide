-- =====================================================
-- FIX 1: Protect sensitive location data from friends
-- =====================================================

-- Drop the existing policy that allows friends to see all profile fields
DROP POLICY IF EXISTS "Users can view own profile and friends can view profiles" ON public.profiles;

-- Create a view that exposes only safe fields to friends (excludes location data)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    name,
    avatar_url,
    life_phase,
    created_at,
    updated_at
    -- Excludes: last_latitude, last_longitude, location_updated_at, 
    -- micro_moves_count, strictness_level, focus_areas, available_minutes_per_day, etc.
  FROM public.profiles;

-- Users can always view their own FULL profile (including location)
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================
-- FIX 2: Protect sensitive subscription/payment data
-- =====================================================

-- Create a view that exposes only safe subscription fields (excludes license keys)
CREATE OR REPLACE VIEW public.user_subscriptions_safe
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
    -- Excludes: gumroad_license_key, gumroad_product_id
  FROM public.user_subscriptions;