CREATE TABLE IF NOT EXISTS public.reward_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL UNIQUE,
  label text NOT NULL,
  pillar life_pillar,
  points integer NOT NULL DEFAULT 10 CHECK (points > 0 AND points <= 10000),
  max_per_day integer NOT NULL DEFAULT 5 CHECK (max_per_day > 0 AND max_per_day <= 1000),
  multiplier numeric NOT NULL DEFAULT 1.0 CHECK (multiplier > 0 AND multiplier <= 10),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_rules TO authenticated;
GRANT ALL ON public.reward_rules TO service_role;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read active reward rules"
  ON public.reward_rules FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Admins can manage reward rules"
  ON public.reward_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.reward_rules(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  points integer NOT NULL CHECK (points >= 0),
  source_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reward_ledger_user_created_idx ON public.reward_ledger (user_id, created_at DESC);
GRANT SELECT ON public.reward_ledger TO authenticated;
GRANT ALL ON public.reward_ledger TO service_role;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own reward ledger"
  ON public.reward_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all reward ledger"
  ON public.reward_ledger FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.award_reward(
  _event_type text, _source_id uuid DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS TABLE(awarded integer, daily_remaining integer, balance integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user uuid := auth.uid();
  _rule public.reward_rules%ROWTYPE;
  _today_count integer; _new_balance integer; _amount integer;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _rule FROM public.reward_rules WHERE event_type = _event_type AND active = true LIMIT 1;
  IF NOT FOUND THEN
    awarded := 0; daily_remaining := 0;
    SELECT COALESCE(SUM(points),0) INTO balance FROM public.reward_ledger WHERE user_id = _user;
    RETURN NEXT; RETURN;
  END IF;
  SELECT COUNT(*) INTO _today_count FROM public.reward_ledger
    WHERE user_id = _user AND event_type = _event_type AND created_at::date = CURRENT_DATE;
  IF _today_count >= _rule.max_per_day THEN
    awarded := 0; daily_remaining := 0;
    SELECT COALESCE(SUM(points),0) INTO balance FROM public.reward_ledger WHERE user_id = _user;
    RETURN NEXT; RETURN;
  END IF;
  _amount := GREATEST(1, FLOOR(_rule.points::numeric * _rule.multiplier)::int);
  INSERT INTO public.reward_ledger (user_id, rule_id, event_type, points, source_id, metadata)
  VALUES (_user, _rule.id, _event_type, _amount, _source_id, COALESCE(_metadata, '{}'::jsonb));
  SELECT COALESCE(SUM(points),0) INTO _new_balance FROM public.reward_ledger WHERE user_id = _user;
  awarded := _amount;
  daily_remaining := GREATEST(0, _rule.max_per_day - _today_count - 1);
  balance := _new_balance;
  RETURN NEXT;
END; $$;

CREATE OR REPLACE FUNCTION public.get_my_reward_balance()
RETURNS TABLE(balance integer, earned_today integer, earned_week integer)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT
    COALESCE(SUM(points), 0)::int,
    COALESCE(SUM(points) FILTER (WHERE created_at::date = CURRENT_DATE), 0)::int,
    COALESCE(SUM(points) FILTER (WHERE created_at >= now() - interval '7 days'), 0)::int
  FROM public.reward_ledger WHERE user_id = auth.uid();
$$;

INSERT INTO public.reward_rules (event_type, label, pillar, points, max_per_day) VALUES
  ('habit_completed',    'Habit completed',    'health',       5,  10),
  ('goal_milestone',     'Goal milestone hit', 'money',        25, 5),
  ('journal_entry',      'Journal entry',      'mind',         10, 3),
  ('micro_move_done',    'Micro-move done',    'mind',         5,  20),
  ('mentor_session',     'Mentor session',     'mind',         5,  5),
  ('daily_signal_read',  'Daily signal read',  'mind',         3,  1),
  ('wearable_sync',      'Wearable synced',    'health',       3,  3),
  ('momentum_streak_7',  '7-day streak',       'mind',         50, 1),
  ('momentum_streak_30', '30-day streak',      'mind',         250, 1)
ON CONFLICT (event_type) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_partner_aggregate_analytics(
  _partner_id uuid, _days integer DEFAULT 30
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  _clicks int; _shares int; _unique_users int;
  _since timestamptz := now() - make_interval(days => GREATEST(1, LEAST(_days, 365)));
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT COUNT(*) INTO _clicks FROM public.partner_click_events
    WHERE partner_id = _partner_id AND created_at >= _since;
  SELECT COUNT(*) INTO _shares FROM public.partner_share_events
    WHERE partner_id = _partner_id AND created_at >= _since;
  SELECT COUNT(DISTINCT user_id) INTO _unique_users FROM (
    SELECT user_id FROM public.partner_click_events
      WHERE partner_id = _partner_id AND created_at >= _since AND user_id IS NOT NULL
    UNION
    SELECT user_id FROM public.partner_share_events
      WHERE partner_id = _partner_id AND created_at >= _since AND user_id IS NOT NULL
  ) u;
  IF _unique_users < 5 THEN _unique_users := 0; END IF;
  RETURN jsonb_build_object(
    'partner_id', _partner_id, 'window_days', _days,
    'clicks', _clicks, 'shares', _shares,
    'unique_users', _unique_users, 'min_cohort', 5,
    'cohort_suppressed', _unique_users = 0
  );
END; $$;