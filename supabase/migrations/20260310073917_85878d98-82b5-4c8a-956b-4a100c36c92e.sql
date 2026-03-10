
-- Mirror Moments table
CREATE TABLE public.mirror_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  source_categories JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  moment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.mirror_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mirror moments" ON public.mirror_moments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mirror moments" ON public.mirror_moments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mirror moments" ON public.mirror_moments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Cinematic Reports table
CREATE TABLE public.cinematic_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  narrative TEXT,
  key_stats JSONB DEFAULT '{}'::jsonb,
  major_wins JSONB DEFAULT '[]'::jsonb,
  lessons JSONB DEFAULT '[]'::jsonb,
  turning_points JSONB DEFAULT '[]'::jsonb,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cinematic_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cinematic reports" ON public.cinematic_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cinematic reports" ON public.cinematic_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cinematic reports" ON public.cinematic_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Share Cards table
CREATE TABLE public.share_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  stat_value TEXT,
  stat_label TEXT,
  signature_phrase TEXT,
  theme TEXT NOT NULL DEFAULT 'executive',
  privacy_level TEXT NOT NULL DEFAULT 'public',
  source_type TEXT,
  source_id UUID,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own share cards" ON public.share_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own share cards" ON public.share_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own share cards" ON public.share_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own share cards" ON public.share_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reflection Favorites table
CREATE TABLE public.reflection_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reflection_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON public.reflection_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.reflection_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.reflection_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);
