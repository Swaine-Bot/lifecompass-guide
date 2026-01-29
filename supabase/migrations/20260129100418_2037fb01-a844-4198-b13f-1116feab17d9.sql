-- Fix 1: Revoke anon access from profiles_public view
-- The view uses security_invoker=on, so it will respect the base table's RLS
-- But we need to ensure only authenticated users can access it
REVOKE SELECT ON public.profiles_public FROM anon;

-- Fix 2: Revoke broad authenticated access from user_subscriptions_safe view
-- Users should only access their own subscription data via the base table's RLS
REVOKE SELECT ON public.user_subscriptions_safe FROM authenticated;

-- Re-grant access with proper restrictions through the base table RLS
-- The base tables already have proper RLS policies:
-- - profiles: "Users can view their own full profile" and "Friends can view public profile fields via view"
-- - user_subscriptions: "Users can view their own subscription" USING (auth.uid() = user_id)

-- Grant access back to authenticated users - the security_invoker=on ensures RLS is enforced
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;