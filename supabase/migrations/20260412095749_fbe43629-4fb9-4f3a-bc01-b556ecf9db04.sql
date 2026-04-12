
-- Partners: allow non-admin authenticated users to SELECT active partners (view filters columns)
CREATE POLICY "Authenticated can read active partners"
ON public.partners
FOR SELECT
TO authenticated
USING (status = 'active');

-- Partner assets: allow non-admin authenticated users to SELECT active assets
DROP POLICY IF EXISTS "Only admins can directly query partner_assets" ON public.partner_assets;

CREATE POLICY "Authenticated can read active partner assets"
ON public.partner_assets
FOR SELECT
TO authenticated
USING (asset_status = 'active' AND is_latest_active = true);
