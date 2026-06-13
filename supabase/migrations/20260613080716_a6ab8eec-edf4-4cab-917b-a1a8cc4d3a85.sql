REVOKE EXECUTE ON FUNCTION public.award_reward(text, uuid, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_reward_balance() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_partner_aggregate_analytics(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.award_reward(text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_reward_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_partner_aggregate_analytics(uuid, integer) TO authenticated;