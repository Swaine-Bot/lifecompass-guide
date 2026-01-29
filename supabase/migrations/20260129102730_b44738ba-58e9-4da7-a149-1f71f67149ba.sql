-- Fix 1: Recreate profiles_public view with explicit RLS-respecting pattern
-- The view already has security_invoker=on, but we need to ensure it's properly configured
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    name,
    avatar_url,
    life_phase,
    created_at,
    updated_at
  FROM public.profiles;

-- Grant access to authenticated users only (not anon)
GRANT SELECT ON public.profiles_public TO authenticated;

-- Fix 2: Recreate user_subscriptions_safe view with explicit configuration
DROP VIEW IF EXISTS public.user_subscriptions_safe;
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
  FROM public.user_subscriptions;

-- Grant access to authenticated users only
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;

-- Fix 3: Add DELETE policies for data portability/GDPR compliance
-- Users should be able to delete their own data

-- Delete policy for privacy_settings (for account deletion)
CREATE POLICY "Users can delete their own privacy settings"
ON public.privacy_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for user_subscriptions (for account deletion)
CREATE POLICY "Users can delete their own subscription"
ON public.user_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for mentor_messages via conversation ownership
CREATE POLICY "Users can delete messages in their conversations"
ON public.mentor_messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.mentor_conversations
  WHERE mentor_conversations.id = mentor_messages.conversation_id
  AND mentor_conversations.user_id = auth.uid()
));