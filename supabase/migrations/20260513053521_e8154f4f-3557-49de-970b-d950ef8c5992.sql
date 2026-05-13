
-- Authoritative, timezone-aware, idempotent daily streak update.
-- Client passes its local calendar date; server enforces atomicity and rules.
CREATE OR REPLACE FUNCTION public.record_daily_activity(_local_date date DEFAULT NULL)
RETURNS TABLE(current_streak integer, longest_streak integer, last_activity_date date, shield_available boolean, shield_used boolean, changed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _today date := COALESCE(_local_date, CURRENT_DATE);
  rec momentum_streaks%ROWTYPE;
  _shield_used boolean := false;
  _changed boolean := false;
  _new_streak integer;
  _diff integer;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Sanity bound: clients can't claim future dates beyond +1 day, or past beyond -1 day
  -- (allows for clock skew across timezones around midnight).
  IF _today > (CURRENT_DATE + 1) OR _today < (CURRENT_DATE - 1) THEN
    _today := CURRENT_DATE;
  END IF;

  -- Atomic upsert + lock
  INSERT INTO momentum_streaks (user_id, current_streak, longest_streak, last_activity_date, shield_available)
  VALUES (_user, 1, 1, _today, true)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO rec FROM momentum_streaks WHERE user_id = _user FOR UPDATE;

  IF rec.last_activity_date = _today THEN
    -- Same day: no change
    _new_streak := rec.current_streak;
  ELSE
    _diff := _today - COALESCE(rec.last_activity_date, _today - 999);

    IF _diff = 1 THEN
      _new_streak := rec.current_streak + 1;
      _changed := true;
    ELSIF _diff = 2 AND rec.shield_available THEN
      _new_streak := rec.current_streak + 1;
      _shield_used := true;
      _changed := true;
    ELSIF _diff <= 0 THEN
      -- last_activity_date is in the future (timezone weirdness) — keep streak
      _new_streak := rec.current_streak;
    ELSE
      _new_streak := 1;
      _changed := true;
    END IF;

    UPDATE momentum_streaks SET
      current_streak = _new_streak,
      longest_streak = GREATEST(rec.longest_streak, _new_streak),
      last_activity_date = GREATEST(rec.last_activity_date, _today),
      shield_available = CASE
        WHEN _shield_used THEN false
        WHEN rec.shield_used_date IS NOT NULL AND (_today - rec.shield_used_date) >= 14 THEN true
        ELSE rec.shield_available
      END,
      shield_used_date = CASE WHEN _shield_used THEN _today ELSE rec.shield_used_date END,
      updated_at = now()
    WHERE user_id = _user;
  END IF;

  RETURN QUERY
  SELECT _new_streak,
         GREATEST(rec.longest_streak, _new_streak),
         GREATEST(rec.last_activity_date, _today),
         CASE WHEN _shield_used THEN false ELSE rec.shield_available END,
         _shield_used,
         _changed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_daily_activity(date) TO authenticated;
