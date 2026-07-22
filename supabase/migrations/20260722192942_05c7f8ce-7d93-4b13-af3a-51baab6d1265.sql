
-- ── Fix 1: partner_placement_cache — add explicit deny policies for anon/authenticated
-- Table is server-only via service role. Add explicit deny policies to make intent clear.
CREATE POLICY "Deny all anon access to placement cache"
  ON public.partner_placement_cache FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny all authenticated access to placement cache"
  ON public.partner_placement_cache FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- ── Fix 2: share_links — stop exposing user_id + internal columns to anon
-- Replace broad anon SELECT policy with a security-definer RPC returning only
-- the public-facing fields the client actually needs.
DROP POLICY IF EXISTS "Public can resolve active public share links" ON public.share_links;

CREATE OR REPLACE FUNCTION public.resolve_public_share_link(_slug text)
RETURNS TABLE(
  id uuid,
  source_type text,
  source_id uuid,
  title text,
  subtitle text,
  card_type text,
  landing_page_type text,
  visibility_mode text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.source_type, s.source_id, s.title, s.subtitle,
         s.card_type, s.landing_page_type, s.visibility_mode
  FROM public.share_links s
  WHERE s.slug = _slug
    AND s.is_revoked = false
    AND s.visibility_mode = 'public'
    AND (s.expires_at IS NULL OR s.expires_at > now())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_public_share_link(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_public_share_link(text) TO anon, authenticated;
