-- Create a searchable profiles view for friend discovery
-- This shows minimal info (name, avatar, life_phase) for users who allow friend requests
-- Security: Only exposes non-sensitive data needed for friend search

CREATE OR REPLACE VIEW public.profiles_searchable 
WITH (security_invoker = false)
AS
SELECT 
  p.user_id,
  p.name,
  p.avatar_url,
  p.life_phase
FROM profiles p
LEFT JOIN privacy_settings ps ON ps.user_id = p.user_id
WHERE 
  -- Only include users who allow friend requests (default is true)
  COALESCE(ps.allow_friend_requests, true) = true;