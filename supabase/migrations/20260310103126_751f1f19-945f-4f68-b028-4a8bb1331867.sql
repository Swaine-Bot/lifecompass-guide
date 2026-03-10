
-- Content reports table
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by_admin_id uuid,
  reviewed_at timestamptz,
  action_taken text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report content"
  ON public.content_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can view all reports"
  ON public.content_reports FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.content_reports FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Moderation actions audit log
CREATE TABLE public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  action_type text NOT NULL,
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert moderation actions"
  ON public.moderation_actions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view moderation actions"
  ON public.moderation_actions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
