-- Partner share events: tracks when a partner asset is used in a shared card
CREATE TABLE public.partner_share_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_asset_id UUID REFERENCES public.partner_assets(id) ON DELETE SET NULL,
  campaign_name TEXT,
  platform TEXT,
  share_card_type TEXT,
  source_type TEXT,
  tracking_token TEXT NOT NULL,
  destination_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_share_events_partner ON public.partner_share_events(partner_id);
CREATE INDEX idx_partner_share_events_asset ON public.partner_share_events(partner_asset_id);
CREATE INDEX idx_partner_share_events_token ON public.partner_share_events(tracking_token);
CREATE INDEX idx_partner_share_events_created ON public.partner_share_events(created_at);

ALTER TABLE public.partner_share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own share events"
  ON public.partner_share_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all share events"
  ON public.partner_share_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Partner click events: tracks clicks on partner CTA links
CREATE TABLE public.partner_click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_event_id UUID REFERENCES public.partner_share_events(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_asset_id UUID REFERENCES public.partner_assets(id) ON DELETE SET NULL,
  campaign_name TEXT,
  platform TEXT,
  user_agent TEXT,
  destination_url TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_click_events_partner ON public.partner_click_events(partner_id);
CREATE INDEX idx_partner_click_events_share ON public.partner_click_events(share_event_id);
CREATE INDEX idx_partner_click_events_clicked ON public.partner_click_events(clicked_at);

ALTER TABLE public.partner_click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all click events"
  ON public.partner_click_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can log click events"
  ON public.partner_click_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);