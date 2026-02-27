
-- Revoke anonymous access from views that expose user data
REVOKE SELECT ON public.profiles_public FROM anon;
REVOKE SELECT ON public.profiles_searchable FROM anon;
REVOKE SELECT ON public.user_subscriptions_safe FROM anon;

-- Ensure only authenticated users can access these views
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_searchable TO authenticated;
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;
