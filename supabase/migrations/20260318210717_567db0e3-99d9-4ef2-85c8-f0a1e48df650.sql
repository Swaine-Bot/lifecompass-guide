
-- Wearable connections table
CREATE TABLE public.wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  connection_status text NOT NULL DEFAULT 'disconnected',
  permissions_granted jsonb DEFAULT '[]'::jsonb,
  external_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  last_sync_status text DEFAULT 'never',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wearable connections"
ON public.wearable_connections FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Wearable metrics table
CREATE TABLE public.wearable_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  unit text NOT NULL,
  source_timestamp timestamptz NOT NULL,
  local_date date NOT NULL,
  sync_batch_id uuid,
  raw_provider_reference jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider, metric_type, local_date)
);

ALTER TABLE public.wearable_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wearable metrics"
ON public.wearable_metrics FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Wearable notification preferences
CREATE TABLE public.wearable_notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  step_reminders boolean DEFAULT true,
  step_milestones boolean DEFAULT true,
  inactivity_nudges boolean DEFAULT true,
  streak_alerts boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '07:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.wearable_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wearable notification prefs"
ON public.wearable_notification_prefs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
