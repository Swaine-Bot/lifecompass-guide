ALTER TABLE public.privacy_settings ADD COLUMN IF NOT EXISTS terms_version text DEFAULT '1.0';
ALTER TABLE public.privacy_settings ADD COLUMN IF NOT EXISTS privacy_policy_version text DEFAULT '1.0';