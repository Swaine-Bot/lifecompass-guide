
-- =========================================
-- Phase 1: Compliance, Consent, Insurer Foundation
-- =========================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.insurer_provider AS ENUM ('discovery','momentum','profmed','bonitas','other','none','prefer_not_say');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.insurer_connection_status AS ENUM ('demo','pending','connected','revoked','error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.consent_purpose AS ENUM (
    'terms_of_service','privacy_policy','marketing','analytics','research',
    'insurer_share_wellness','insurer_share_activity','insurer_share_nutrition',
    'insurer_share_sleep','insurer_share_rewards','insurer_share_wearable',
    'insurer_share_insights','insurer_personalized_rewards','insurer_ai_recs',
    'insurer_anon_analytics','insurer_research','insurer_sponsor_recs',
    'insurer_connection_discovery','insurer_connection_momentum',
    'insurer_connection_profmed','insurer_connection_bonitas','insurer_connection_other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.compliance_request_status AS ENUM ('pending','processing','complete','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================
-- 1. consent_records (append-only ledger)
-- =========================================
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose public.consent_purpose NOT NULL,
  granted BOOLEAN NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  ip_hash TEXT,
  ua_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_purpose
  ON public.consent_records(user_id, purpose, granted_at DESC);

GRANT SELECT, INSERT ON public.consent_records TO authenticated;
GRANT ALL ON public.consent_records TO service_role;

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consent" ON public.consent_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consent" ON public.consent_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 2. insurer_connections
-- =========================================
CREATE TABLE IF NOT EXISTS public.insurer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider public.insurer_provider NOT NULL,
  status public.insurer_connection_status NOT NULL DEFAULT 'demo',
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  external_member_id_hash TEXT,
  connected_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurer_connections TO authenticated;
GRANT ALL ON public.insurer_connections TO service_role;

ALTER TABLE public.insurer_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own insurer connections" ON public.insurer_connections
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_insurer_connections_updated_at
  BEFORE UPDATE ON public.insurer_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 3. insurer_sharing_prefs (granular toggles)
-- =========================================
CREATE TABLE IF NOT EXISTS public.insurer_sharing_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  share_wellness BOOLEAN NOT NULL DEFAULT false,
  share_activity BOOLEAN NOT NULL DEFAULT false,
  share_nutrition BOOLEAN NOT NULL DEFAULT false,
  share_sleep BOOLEAN NOT NULL DEFAULT false,
  share_rewards BOOLEAN NOT NULL DEFAULT false,
  share_wearable BOOLEAN NOT NULL DEFAULT false,
  share_insights BOOLEAN NOT NULL DEFAULT false,
  allow_personalized_rewards BOOLEAN NOT NULL DEFAULT false,
  allow_ai_recommendations BOOLEAN NOT NULL DEFAULT false,
  allow_anonymized_analytics BOOLEAN NOT NULL DEFAULT false,
  allow_research BOOLEAN NOT NULL DEFAULT false,
  allow_sponsor_recommendations BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurer_sharing_prefs TO authenticated;
GRANT ALL ON public.insurer_sharing_prefs TO service_role;

ALTER TABLE public.insurer_sharing_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sharing prefs" ON public.insurer_sharing_prefs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_insurer_sharing_prefs_updated_at
  BEFORE UPDATE ON public.insurer_sharing_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 4. audit_log (immutable)
-- =========================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  ua_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON public.audit_log(event_type, created_at DESC);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit entries" ON public.audit_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies for authenticated → only SECURITY DEFINER fn can write.

-- =========================================
-- 5. log_audit_event() helper
-- =========================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _event_type TEXT,
  _resource_type TEXT DEFAULT NULL,
  _resource_id TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb,
  _target_user_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id UUID;
  _actor UUID := auth.uid();
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.audit_log (user_id, actor_id, event_type, resource_type, resource_id, details)
  VALUES (COALESCE(_target_user_id, _actor), _actor, _event_type, _resource_type, _resource_id, _details)
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, JSONB, UUID) TO authenticated;

-- =========================================
-- 6. data_export_requests
-- =========================================
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.compliance_request_status NOT NULL DEFAULT 'pending',
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT ON public.data_export_requests TO authenticated;
GRANT ALL ON public.data_export_requests TO service_role;

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own export requests" ON public.data_export_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own export requests" ON public.data_export_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 7. data_erasure_requests
-- =========================================
CREATE TABLE IF NOT EXISTS public.data_erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.compliance_request_status NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  reason TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.data_erasure_requests TO authenticated;
GRANT ALL ON public.data_erasure_requests TO service_role;

ALTER TABLE public.data_erasure_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own erasure requests" ON public.data_erasure_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own erasure requests" ON public.data_erasure_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own erasure requests" ON public.data_erasure_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 8. Profile flags for medical aid + demo mode
-- =========================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS medical_aid_provider public.insurer_provider,
  ADD COLUMN IF NOT EXISTS demo_mode BOOLEAN NOT NULL DEFAULT false;
