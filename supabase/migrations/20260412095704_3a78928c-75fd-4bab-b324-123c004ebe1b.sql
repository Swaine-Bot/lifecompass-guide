
-- 1. FIX: Partners table - remove overly broad SELECT, create safe view
DROP POLICY IF EXISTS "Users can view active partners" ON public.partners;

CREATE OR REPLACE VIEW public.partners_public AS
SELECT id, name, slug, logo_url, brand_color, brand_description, disclosure_label,
       default_cta_label, default_cta_url, website_url, status
FROM public.partners
WHERE status = 'active';

-- Grant read access to the view
GRANT SELECT ON public.partners_public TO authenticated;

-- 2. FIX: Share links - restrict anon to public visibility only
DROP POLICY IF EXISTS "Public can resolve active share links" ON public.share_links;

CREATE POLICY "Public can resolve active public share links"
ON public.share_links
FOR SELECT
TO anon
USING (
  is_revoked = false
  AND visibility_mode = 'public'
  AND (expires_at IS NULL OR expires_at > now())
);

-- 3. FIX: Subscriptions - remove user INSERT/UPDATE to prevent tier escalation
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.user_subscriptions;

-- Only admins/service role can manage subscriptions now

-- 4. FIX: XP system - remove user direct manipulation
DROP POLICY IF EXISTS "Users can insert own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can insert own xp_events" ON public.xp_events;

-- award_xp() is SECURITY DEFINER and handles legitimate XP mutations

-- 5. FIX: Share link events - restrict always-true INSERT
DROP POLICY IF EXISTS "Anyone can log share link events" ON public.share_link_events;

CREATE POLICY "Authenticated users can log share link events"
ON public.share_link_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anon to log events only for public share links
CREATE POLICY "Anon can log events for public share links"
ON public.share_link_events
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = share_link_events.share_link_id
      AND sl.is_revoked = false
      AND sl.visibility_mode = 'public'
  )
);

-- 6. FIX: Partner assets - create safe view for non-admin users
DROP POLICY IF EXISTS "Users can view active partner assets" ON public.partner_assets;

CREATE OR REPLACE VIEW public.partner_assets_public AS
SELECT id, partner_id, title, file_url, placement_type, file_type,
       cta_label_override, cta_url_override, disclosure_override, target_surfaces
FROM public.partner_assets
WHERE asset_status = 'active' AND is_latest_active = true;

GRANT SELECT ON public.partner_assets_public TO authenticated;

-- Re-add a restrictive policy: only admins can directly query partner_assets
-- (non-admins use the view)
CREATE POLICY "Only admins can directly query partner_assets"
ON public.partner_assets
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
