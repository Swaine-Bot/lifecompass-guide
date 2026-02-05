-- =====================================================
-- SECURITY FIX: Add admin access to user_subscriptions for support
-- =====================================================

-- Allow admins to view all subscriptions for support purposes
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update subscriptions for support purposes
CREATE POLICY "Admins can update subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));