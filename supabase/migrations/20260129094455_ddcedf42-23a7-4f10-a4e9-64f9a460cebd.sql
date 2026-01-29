-- Enable RLS on the profiles_public view (inherited from base table)
-- Grant access to authenticated users to select from profiles_public

-- Create a policy for the profiles table that allows reading via the view for friends
-- The view uses security_invoker so it respects the viewer's RLS context

-- We need a simple SELECT policy on profiles for friends to read via the view
CREATE POLICY "Friends can view public profile fields via view"
ON public.profiles FOR SELECT
USING (
  are_friends(auth.uid(), user_id)
);

-- Grant SELECT on profiles_public view to authenticated and anon roles
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Grant SELECT on user_subscriptions_safe view to authenticated role only
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;