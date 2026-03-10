
-- Share links table for smart link system
CREATE TABLE public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  share_card_id uuid REFERENCES public.share_cards(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_id uuid,
  slug text NOT NULL UNIQUE,
  landing_page_type text NOT NULL DEFAULT 'generic',
  visibility_mode text NOT NULL DEFAULT 'public',
  title text,
  subtitle text,
  card_type text,
  is_revoked boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX idx_share_links_slug ON public.share_links(slug);
CREATE INDEX idx_share_links_user ON public.share_links(user_id);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Users can manage their own share links
CREATE POLICY "Users can insert own share links"
  ON public.share_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own share links"
  ON public.share_links FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own share links"
  ON public.share_links FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own share links"
  ON public.share_links FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Public can view non-revoked, non-expired links (for landing page resolution)
CREATE POLICY "Public can resolve active share links"
  ON public.share_links FOR SELECT TO anon
  USING (
    is_revoked = false
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Share link analytics events
CREATE TABLE public.share_link_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  platform_detected text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.share_link_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (anonymous visitors)
CREATE POLICY "Anyone can log share link events"
  ON public.share_link_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only link owner can view events
CREATE POLICY "Users can view events for own links"
  ON public.share_link_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.share_links sl
      WHERE sl.id = share_link_events.share_link_id
      AND sl.user_id = auth.uid()
    )
  );

-- Admins can view all events
CREATE POLICY "Admins can view all share link events"
  ON public.share_link_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
