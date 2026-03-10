
-- Table A: notification_preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  mirror_moments boolean NOT NULL DEFAULT true,
  cinematic_reports boolean NOT NULL DEFAULT true,
  milestone_alerts boolean NOT NULL DEFAULT true,
  weekly_recap boolean NOT NULL DEFAULT true,
  drift_warnings boolean NOT NULL DEFAULT false,
  frequency text NOT NULL DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Frequency validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_notification_frequency()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.frequency NOT IN ('minimal', 'normal', 'all') THEN
    RAISE EXCEPTION 'frequency must be minimal, normal, or all';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_notification_frequency_trigger
  BEFORE INSERT OR UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.validate_notification_frequency();

-- updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification prefs"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification prefs"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification prefs"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Table B: engagement_events
CREATE TABLE public.engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  source_engine text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_engagement_events_user_id ON public.engagement_events (user_id);
CREATE INDEX idx_engagement_events_event_type ON public.engagement_events (event_type);
CREATE INDEX idx_engagement_events_created_at ON public.engagement_events (created_at DESC);

-- RLS
ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own engagement events"
  ON public.engagement_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own engagement events"
  ON public.engagement_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
