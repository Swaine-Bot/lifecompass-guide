
-- Feed post AI insights table
CREATE TABLE public.feed_post_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  insight_text text NOT NULL,
  context_tag text DEFAULT 'Life Strategy',
  is_shareable boolean DEFAULT true,
  share_excerpt text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feed_post_ai_insights ENABLE ROW LEVEL SECURITY;

-- Owner of the post can manage insights
CREATE POLICY "Users can view insights on own posts"
  ON public.feed_post_ai_insights FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can insert insights on own posts"
  ON public.feed_post_ai_insights FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete insights on own posts"
  ON public.feed_post_ai_insights FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

-- Feed post suggestion links
CREATE TABLE public.feed_post_suggestion_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  insight_id uuid REFERENCES public.feed_post_ai_insights(id) ON DELETE SET NULL,
  label text NOT NULL,
  url text NOT NULL,
  link_type text DEFAULT 'suggestion',
  is_public_shareable boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feed_post_suggestion_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links on own posts"
  ON public.feed_post_suggestion_links FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can insert links on own posts"
  ON public.feed_post_suggestion_links FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete links on own posts"
  ON public.feed_post_suggestion_links FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

-- Curated offering blocks
CREATE TABLE public.curated_offering_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  thumbnail_url text,
  destination_url text,
  destination_type text DEFAULT 'web',
  access_model text DEFAULT 'public',
  is_public_shareable boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.curated_offering_blocks ENABLE ROW LEVEL SECURITY;

-- Public can view shareable offerings
CREATE POLICY "Anyone can view public offerings"
  ON public.curated_offering_blocks FOR SELECT TO anon, authenticated
  USING (is_public_shareable = true);

-- Admins can manage offerings
CREATE POLICY "Admins can manage offerings"
  ON public.curated_offering_blocks FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Feed share configs
CREATE TABLE public.feed_share_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  share_mode text NOT NULL DEFAULT 'post_only',
  included_insight_id uuid REFERENCES public.feed_post_ai_insights(id) ON DELETE SET NULL,
  included_offering_id uuid REFERENCES public.curated_offering_blocks(id) ON DELETE SET NULL,
  included_link_ids jsonb DEFAULT '[]',
  visibility_mode text DEFAULT 'public',
  created_by_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feed_share_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feed share configs"
  ON public.feed_share_configs FOR ALL TO authenticated
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());
