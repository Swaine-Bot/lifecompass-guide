
-- Create partner status enum
CREATE TYPE public.partner_status AS ENUM ('active', 'inactive');

-- Create partner asset lifecycle status enum
CREATE TYPE public.partner_asset_status AS ENUM ('draft', 'approved', 'active', 'archived');

-- ═══ PARTNERS TABLE ═══
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  industry TEXT,
  status partner_status NOT NULL DEFAULT 'active',
  brand_description TEXT,
  brand_color TEXT,
  logo_url TEXT,
  disclosure_label TEXT NOT NULL DEFAULT 'Sponsored',
  default_cta_label TEXT,
  default_cta_url TEXT,
  billing_entity TEXT,
  country TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage partners" ON public.partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ PARTNER ASSETS TABLE ═══
CREATE TABLE public.partner_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  campaign_name TEXT,
  placement_type TEXT NOT NULL DEFAULT 'share_card',
  asset_status partner_asset_status NOT NULL DEFAULT 'draft',
  is_latest_active BOOLEAN NOT NULL DEFAULT false,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  disclosure_override TEXT,
  cta_label_override TEXT,
  cta_url_override TEXT,
  target_surfaces JSONB DEFAULT '["share_card"]'::jsonb,
  version_number INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID,
  notes TEXT,
  archived_at TIMESTAMPTZ,
  replaced_by_asset_id UUID REFERENCES public.partner_assets(id),
  replaced_campaign_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage partner assets" ON public.partner_assets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can read active assets (needed for Share Studio)
CREATE POLICY "Users can view active partner assets" ON public.partner_assets
  FOR SELECT TO authenticated
  USING (asset_status = 'active' AND is_latest_active = true);

CREATE TRIGGER update_partner_assets_updated_at
  BEFORE UPDATE ON public.partner_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast active asset lookup
CREATE INDEX idx_partner_assets_active ON public.partner_assets (partner_id, placement_type)
  WHERE is_latest_active = true AND asset_status = 'active';

-- ═══ ACTIVATE PARTNER ASSET FUNCTION ═══
CREATE OR REPLACE FUNCTION public.activate_partner_asset(_asset_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _partner_id UUID;
  _placement TEXT;
  _campaign TEXT;
  _old_active_id UUID;
BEGIN
  -- Only admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get the asset info
  SELECT partner_id, placement_type, campaign_name
  INTO _partner_id, _placement, _campaign
  FROM partner_assets WHERE id = _asset_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  -- Find current active asset for same partner + placement
  SELECT id INTO _old_active_id
  FROM partner_assets
  WHERE partner_id = _partner_id
    AND placement_type = _placement
    AND is_latest_active = true
    AND id != _asset_id;

  -- Archive old active
  IF _old_active_id IS NOT NULL THEN
    UPDATE partner_assets SET
      asset_status = 'archived',
      is_latest_active = false,
      archived_at = now(),
      replaced_by_asset_id = _asset_id,
      replaced_campaign_name = _campaign
    WHERE id = _old_active_id;
  END IF;

  -- Activate the new asset
  UPDATE partner_assets SET
    asset_status = 'active',
    is_latest_active = true,
    approval_status = 'approved'
  WHERE id = _asset_id;
END;
$$;

-- ═══ STORAGE BUCKET ═══
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-media', 'partner-media', true);

-- Storage policies
CREATE POLICY "Admins can upload partner media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partner media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partner media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'partner-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view partner media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'partner-media');

-- Allow active partners to be read by authenticated users (for dropdown)
CREATE POLICY "Users can view active partners" ON public.partners
  FOR SELECT TO authenticated
  USING (status = 'active');
