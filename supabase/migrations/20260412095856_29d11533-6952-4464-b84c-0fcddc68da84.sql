
-- Tighten authenticated share_link_events INSERT
DROP POLICY IF EXISTS "Authenticated users can log share link events" ON public.share_link_events;

CREATE POLICY "Authenticated users can log share link events"
ON public.share_link_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = share_link_events.share_link_id
      AND sl.is_revoked = false
  )
);

-- Narrow partners SELECT for non-admins to only essential display columns
-- by using column-level security via the view. Remove broad table access.
DROP POLICY IF EXISTS "Authenticated can read active partners" ON public.partners;

-- Create a function to safely fetch partner display data
CREATE OR REPLACE FUNCTION public.get_active_partners()
RETURNS TABLE (
  id uuid, name text, slug text, logo_url text, brand_color text,
  brand_description text, disclosure_label text, default_cta_label text,
  default_cta_url text, website_url text, status partner_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.slug, p.logo_url, p.brand_color,
         p.brand_description, p.disclosure_label, p.default_cta_label,
         p.default_cta_url, p.website_url, p.status
  FROM public.partners p
  WHERE p.status = 'active'
  ORDER BY p.name;
$$;

-- Create a function to safely fetch active partner assets
CREATE OR REPLACE FUNCTION public.get_active_partner_asset(_partner_id uuid, _placement text DEFAULT 'share_card')
RETURNS TABLE (
  id uuid, partner_id uuid, title text, file_url text, placement_type text,
  file_type text, cta_label_override text, cta_url_override text,
  disclosure_override text, target_surfaces jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pa.id, pa.partner_id, pa.title, pa.file_url, pa.placement_type,
         pa.file_type, pa.cta_label_override, pa.cta_url_override,
         pa.disclosure_override, pa.target_surfaces
  FROM public.partner_assets pa
  WHERE pa.partner_id = _partner_id
    AND pa.placement_type = _placement
    AND pa.asset_status = 'active'
    AND pa.is_latest_active = true
  LIMIT 1;
$$;

-- Remove non-admin direct access to partner_assets
DROP POLICY IF EXISTS "Authenticated can read active partner assets" ON public.partner_assets;
