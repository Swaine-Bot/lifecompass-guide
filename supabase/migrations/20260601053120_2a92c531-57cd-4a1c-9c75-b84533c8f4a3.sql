-- =========================================================
-- 1. 5-PILLAR XP (public profile)
-- =========================================================
CREATE TYPE public.life_pillar AS ENUM ('mind','money','health','relationship','legacy');

CREATE TABLE public.user_pillar_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pillar life_pillar NOT NULL,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pillar)
);

GRANT SELECT, INSERT, UPDATE ON public.user_pillar_xp TO authenticated;
GRANT ALL ON public.user_pillar_xp TO service_role;

ALTER TABLE public.user_pillar_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pillar xp"
  ON public.user_pillar_xp FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pillar xp"
  ON public.user_pillar_xp FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pillar xp"
  ON public.user_pillar_xp FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Award pillar XP idempotently
CREATE OR REPLACE FUNCTION public.award_pillar_xp(
  _pillar life_pillar,
  _amount integer,
  _source_type text DEFAULT 'manual',
  _source_id uuid DEFAULT NULL
)
RETURNS TABLE(new_total_xp integer, new_level integer, leveled_up boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _old_level integer;
  _new_total integer;
  _new_level integer;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 OR _amount > 1000 THEN RAISE EXCEPTION 'Invalid xp amount'; END IF;

  INSERT INTO user_pillar_xp (user_id, pillar, total_xp, level)
  VALUES (_user, _pillar, _amount, 1)
  ON CONFLICT (user_id, pillar) DO UPDATE
    SET total_xp = user_pillar_xp.total_xp + _amount,
        updated_at = now()
  RETURNING total_xp, level INTO _new_total, _old_level;

  _new_level := GREATEST(1, FLOOR(SQRT(_new_total::numeric / 100)) + 1);
  UPDATE user_pillar_xp SET level = _new_level
    WHERE user_id = _user AND pillar = _pillar;

  new_total_xp := _new_total;
  new_level := _new_level;
  leveled_up := _new_level > _old_level;
  RETURN NEXT;
END $$;

-- =========================================================
-- 2. PLAYBACK SHARES (exact snapshot)
-- =========================================================
CREATE TABLE public.playback_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.playback_shares TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playback_shares TO authenticated;
GRANT ALL ON public.playback_shares TO service_role;

ALTER TABLE public.playback_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public playback shares"
  ON public.playback_shares FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users manage own playback shares"
  ON public.playback_shares FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 3. PROFILE SEARCH (friend directory)
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm
  ON public.profiles USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON public.profiles USING gin (username gin_trgm_ops);

-- Public-safe directory search (respects privacy)
CREATE OR REPLACE FUNCTION public.search_profiles(_query text, _limit int DEFAULT 20)
RETURNS TABLE(user_id uuid, name text, username text, avatar_url text, life_phase life_phase, is_verified boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _query IS NULL OR length(trim(_query)) < 2 THEN RETURN; END IF;

  RETURN QUERY
  SELECT p.user_id, p.name, p.username, p.avatar_url, p.life_phase, p.is_verified
  FROM profiles p
  LEFT JOIN privacy_settings ps ON ps.user_id = p.user_id
  WHERE
    (p.name ILIKE '%' || _query || '%' OR p.username ILIKE '%' || _query || '%')
    AND p.user_id <> auth.uid()
    AND (
      ps.profile_visibility IS NULL
      OR ps.profile_visibility = 'public'
      OR (ps.profile_visibility = 'friends' AND are_friends(auth.uid(), p.user_id))
    )
  ORDER BY
    CASE WHEN p.username = _query THEN 0
         WHEN p.username ILIKE _query || '%' THEN 1
         WHEN p.name ILIKE _query || '%' THEN 2
         ELSE 3 END,
    p.name
  LIMIT LEAST(_limit, 50);
END $$;

-- =========================================================
-- 4. PUBLIC PROFILE RPC (with pillar levels)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_public_profile(_target uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _viewer uuid := auth.uid();
  _profile jsonb;
  _pillars jsonb;
  _public_insights jsonb;
  _visibility text;
  _can_view boolean;
BEGIN
  IF _viewer IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT COALESCE(ps.profile_visibility::text, 'friends') INTO _visibility
  FROM privacy_settings ps WHERE ps.user_id = _target;

  _can_view := _viewer = _target
    OR _visibility = 'public'
    OR (_visibility = 'friends' AND are_friends(_viewer, _target));

  IF NOT _can_view THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT to_jsonb(p) - 'updated_at' INTO _profile
  FROM (
    SELECT user_id, name, username, avatar_url, bio, life_phase,
           account_type, page_category, website_url, is_verified
    FROM profiles WHERE user_id = _target
  ) p;

  IF _profile IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  SELECT COALESCE(jsonb_object_agg(pillar::text, jsonb_build_object('level', level, 'xp', total_xp)), '{}'::jsonb)
    INTO _pillars
  FROM user_pillar_xp WHERE user_id = _target;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'quote', quote, 'context_tag', context_tag, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb) INTO _public_insights
  FROM saved_insights
  WHERE user_id = _target AND is_public = true
  LIMIT 12;

  RETURN jsonb_build_object(
    'profile', _profile,
    'pillars', _pillars,
    'public_insights', _public_insights,
    'is_friend', are_friends(_viewer, _target),
    'is_self', _viewer = _target
  );
END $$;

-- =========================================================
-- 5. SAVED INSIGHTS: opt-in public flag
-- =========================================================
ALTER TABLE public.saved_insights
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- =========================================================
-- 6. MILESTONES: pillar XP linkage (idempotent)
-- =========================================================
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS pillar life_pillar,
  ADD COLUMN IF NOT EXISTS xp_awarded_at timestamptz;