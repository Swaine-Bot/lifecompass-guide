
-- ─── Extend partners with placement-engine fields ─────────────────────
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS deep_link TEXT,
  ADD COLUMN IF NOT EXISTS app_store_link TEXT,
  ADD COLUMN IF NOT EXISTS play_store_link TEXT,
  ADD COLUMN IF NOT EXISTS cta_text TEXT,
  ADD COLUMN IF NOT EXISTS partner_tier TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS availability BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS campaign_start_date DATE,
  ADD COLUMN IF NOT EXISTS campaign_end_date DATE,
  ADD COLUMN IF NOT EXISTS priority_weight INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS supported_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS supported_playbook_tags JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.partners
  DROP CONSTRAINT IF EXISTS partners_partner_tier_check;
ALTER TABLE public.partners
  ADD CONSTRAINT partners_partner_tier_check
  CHECK (partner_tier IN ('strategic','preferred','standard','trial'));

CREATE INDEX IF NOT EXISTS idx_partners_active_placement
  ON public.partners (status, availability, priority_weight DESC)
  WHERE status = 'active' AND availability = true;

CREATE INDEX IF NOT EXISTS idx_partners_categories_gin
  ON public.partners USING gin (supported_categories);

CREATE INDEX IF NOT EXISTS idx_partners_playbook_tags_gin
  ON public.partners USING gin (supported_playbook_tags);

-- ─── Playbook step metadata ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playbook_step_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL UNIQUE REFERENCES public.tasks(id) ON DELETE CASCADE,
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE CASCADE,
  category_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  partner_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  required_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestone_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.playbook_step_metadata TO authenticated;
GRANT ALL ON public.playbook_step_metadata TO service_role;

ALTER TABLE public.playbook_step_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read step metadata"
  ON public.playbook_step_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage step metadata"
  ON public.playbook_step_metadata FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_step_metadata_task ON public.playbook_step_metadata(task_id);
CREATE INDEX IF NOT EXISTS idx_step_metadata_playbook ON public.playbook_step_metadata(playbook_id);
CREATE INDEX IF NOT EXISTS idx_step_metadata_partner_cats_gin
  ON public.playbook_step_metadata USING gin (partner_categories);

CREATE TRIGGER update_step_metadata_updated_at
  BEFORE UPDATE ON public.playbook_step_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Partner campaigns ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  target_playbook_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_step_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_partner_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_life_phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_goal_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_age_bands JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_gender TEXT,
  target_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget NUMERIC(12,2),
  priority INTEGER NOT NULL DEFAULT 50,
  start_date DATE,
  end_date DATE,
  expected_ctr NUMERIC(5,4),
  success_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_campaigns
  ADD CONSTRAINT partner_campaigns_status_check
  CHECK (status IN ('draft','active','paused','archived'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_campaigns TO authenticated;
GRANT ALL ON public.partner_campaigns TO service_role;

ALTER TABLE public.partner_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns"
  ON public.partner_campaigns FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_campaigns_partner ON public.partner_campaigns(partner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active
  ON public.partner_campaigns(status, priority DESC)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_campaigns_partner_cats_gin
  ON public.partner_campaigns USING gin (target_partner_categories);
CREATE INDEX IF NOT EXISTS idx_campaigns_playbook_tags_gin
  ON public.partner_campaigns USING gin (target_playbook_tags);

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.partner_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── AI explanation cache (per partner + step category) ──────────────
CREATE TABLE IF NOT EXISTS public.partner_placement_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_category TEXT NOT NULL,
  step_category TEXT NOT NULL,
  playbook_tag TEXT,
  explanation TEXT NOT NULL,
  headline TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE (partner_id, partner_category, step_category, playbook_tag)
);

GRANT SELECT ON public.partner_placement_cache TO authenticated;
GRANT ALL ON public.partner_placement_cache TO service_role;

ALTER TABLE public.partner_placement_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read placement cache"
  ON public.partner_placement_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_placement_cache_lookup
  ON public.partner_placement_cache (partner_id, step_category, partner_category);

-- ─── Placement events (impressions, views, clicks, etc.) ─────────────
CREATE TABLE IF NOT EXISTS public.partner_placement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.partner_campaigns(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  step_category TEXT,
  partner_category TEXT,
  surface TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_placement_events
  ADD CONSTRAINT partner_placement_events_event_type_check
  CHECK (event_type IN ('impression','view','click','save','share','dismiss','feedback','conversion'));

GRANT SELECT, INSERT ON public.partner_placement_events TO authenticated;
GRANT ALL ON public.partner_placement_events TO service_role;

ALTER TABLE public.partner_placement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own placement events"
  ON public.partner_placement_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can read their own placement events"
  ON public.partner_placement_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_placement_events_partner
  ON public.partner_placement_events (partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placement_events_user
  ON public.partner_placement_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placement_events_event_type
  ON public.partner_placement_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placement_events_campaign
  ON public.partner_placement_events (campaign_id, created_at DESC);

-- ─── Per-user partner preferences (hide/affiliations) ────────────────
CREATE TABLE IF NOT EXISTS public.user_partner_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hidden_partner_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  hidden_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  affiliations JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_partner_preferences TO authenticated;
GRANT ALL ON public.user_partner_preferences TO service_role;

ALTER TABLE public.user_partner_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own partner preferences"
  ON public.user_partner_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_user_partner_prefs_updated_at
  BEFORE UPDATE ON public.user_partner_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Helper RPC: fetch metadata for a task list ──────────────────────
CREATE OR REPLACE FUNCTION public.get_step_metadata_for_tasks(_task_ids uuid[])
RETURNS TABLE (
  task_id uuid,
  category_tags jsonb,
  partner_categories jsonb,
  difficulty text,
  xp_reward integer,
  required_resources jsonb,
  milestone_label text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT task_id, category_tags, partner_categories, difficulty,
         xp_reward, required_resources, milestone_label
  FROM public.playbook_step_metadata
  WHERE task_id = ANY(_task_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_step_metadata_for_tasks(uuid[]) TO authenticated;
