-- Fix 1: Remove the policy that allows friends direct access to profiles base table
-- Friends should ONLY access profile data through the profiles_public view (which excludes location data)
DROP POLICY IF EXISTS "Friends can view public profile fields via view" ON public.profiles;

-- Fix 2: Add DELETE policy for daily_checkins so users can remove their wellness data
CREATE POLICY "Users can delete their own check-ins"
ON public.daily_checkins
FOR DELETE
USING (auth.uid() = user_id);

-- Note: The profiles_public and user_subscriptions_safe views use security_invoker=on
-- which means they inherit RLS from their base tables. This is the correct pattern.
-- The base tables already have proper RLS policies:
-- - profiles: "Users can view their own full profile" USING (auth.uid() = user_id)
-- - user_subscriptions: "Users can view their own subscription" USING (auth.uid() = user_id)

-- Note: mentor_messages intentionally lacks UPDATE/DELETE to preserve conversation history
-- This is a design decision for AI conversation immutability