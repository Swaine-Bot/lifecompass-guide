
-- 1. Playback shares: default to private
ALTER TABLE public.playback_shares ALTER COLUMN is_public SET DEFAULT false;

-- 2. Partner placement cache: internal-only (edge function uses service_role)
DROP POLICY IF EXISTS "Authenticated can read placement cache" ON public.partner_placement_cache;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.partner_placement_cache FROM anon, authenticated;

-- 3. Partner-media bucket: stop listing (keeps public URL reads working via CDN)
DROP POLICY IF EXISTS "Anyone can view partner media" ON storage.objects;

-- 4. Partner click events: drop always-true insert policy; edge function uses service_role
DROP POLICY IF EXISTS "Anyone can log click events" ON public.partner_click_events;

-- 5. Lock down internal SECURITY DEFINER functions
--    Trigger-only functions: revoke from anon + authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_extended() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_assign_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_notification_frequency() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;

--    User-callable SECURITY DEFINER RPCs: revoke from anon (they all require auth.uid() anyway)
REVOKE EXECUTE ON FUNCTION public.activate_partner_asset(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_pillar_xp(life_pillar, integer, text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_reward(text, uuid, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, life_domain, integer, text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_active_partner_asset(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_active_partners() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_reward_balance() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_partner_aggregate_analytics(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_profile_for_viewer(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_step_metadata_for_tasks(uuid[]) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_micro_moves() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_daily_activity(date) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_profiles(text, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_momentum_streak(uuid) FROM anon, PUBLIC;

--    RLS policy helpers: keep executable by authenticated (used inside policies), revoke anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_following(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM anon, PUBLIC;
