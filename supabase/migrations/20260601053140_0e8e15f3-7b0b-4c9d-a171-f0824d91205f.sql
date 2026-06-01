REVOKE EXECUTE ON FUNCTION public.award_pillar_xp(life_pillar, integer, text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_profiles(text, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.award_pillar_xp(life_pillar, integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_profiles(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;