
-- Fix views to use security_invoker (queries run as the calling user, not view owner)
ALTER VIEW public.partners_public SET (security_invoker = on);
ALTER VIEW public.partner_assets_public SET (security_invoker = on);
