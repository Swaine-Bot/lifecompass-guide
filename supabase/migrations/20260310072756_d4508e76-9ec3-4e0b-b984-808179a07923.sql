
-- Life Domains enum
CREATE TYPE public.life_domain AS ENUM ('physical', 'mind', 'wealth', 'relationships', 'legacy');

-- XP events log
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain life_domain NOT NULL,
  xp_amount INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own xp_events" ON public.xp_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own xp_events" ON public.xp_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- User XP summary per domain
CREATE TABLE public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain life_domain NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, domain)
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp" ON public.user_xp
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.user_xp
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON public.user_xp
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Momentum streaks
CREATE TABLE public.momentum_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  shield_available BOOLEAN NOT NULL DEFAULT true,
  shield_used_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.momentum_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON public.momentum_streaks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.momentum_streaks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.momentum_streaks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Daily signals
CREATE TABLE public.daily_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL,
  content TEXT NOT NULL,
  suggested_action TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  signal_date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.daily_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signals" ON public.daily_signals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own signals" ON public.daily_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own signals" ON public.daily_signals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Function to award XP and update level
CREATE OR REPLACE FUNCTION public.award_xp(
  _user_id UUID,
  _domain life_domain,
  _xp_amount INTEGER,
  _source_type TEXT,
  _source_id UUID DEFAULT NULL
)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_level INTEGER;
  calc_level INTEGER;
  calc_xp INTEGER;
BEGIN
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Log the XP event
  INSERT INTO xp_events (user_id, domain, xp_amount, source_type, source_id)
  VALUES (_user_id, _domain, _xp_amount, _source_type, _source_id);

  -- Upsert user_xp
  INSERT INTO user_xp (user_id, domain, total_xp, level, updated_at)
  VALUES (_user_id, _domain, _xp_amount, 1, now())
  ON CONFLICT (user_id, domain)
  DO UPDATE SET
    total_xp = user_xp.total_xp + _xp_amount,
    updated_at = now()
  RETURNING user_xp.total_xp, user_xp.level INTO calc_xp, old_level;

  -- Calculate new level: level = floor(sqrt(total_xp / 100)) + 1, min 1
  calc_level := GREATEST(1, FLOOR(SQRT(calc_xp::NUMERIC / 100)) + 1);

  UPDATE user_xp SET level = calc_level WHERE user_id = _user_id AND domain = _domain;

  new_total_xp := calc_xp;
  new_level := calc_level;
  leveled_up := calc_level > old_level;
  RETURN NEXT;
END;
$$;

-- Function to update momentum streak
CREATE OR REPLACE FUNCTION public.update_momentum_streak(_user_id UUID)
RETURNS TABLE(current_streak INTEGER, shield_used BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rec RECORD;
  today_date DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - 1;
  two_days_ago DATE := CURRENT_DATE - 2;
BEGIN
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO rec FROM momentum_streaks WHERE user_id = _user_id;

  IF NOT FOUND THEN
    INSERT INTO momentum_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (_user_id, 1, 1, today_date);
    current_streak := 1;
    shield_used := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Already logged today
  IF rec.last_activity_date = today_date THEN
    current_streak := rec.current_streak;
    shield_used := false;
    RETURN NEXT;
    RETURN;
  END IF;

  shield_used := false;

  IF rec.last_activity_date = yesterday THEN
    -- Continue streak
    UPDATE momentum_streaks SET
      current_streak = rec.current_streak + 1,
      longest_streak = GREATEST(rec.longest_streak, rec.current_streak + 1),
      last_activity_date = today_date,
      updated_at = now()
    WHERE user_id = _user_id;
    current_streak := rec.current_streak + 1;
  ELSIF rec.last_activity_date = two_days_ago AND rec.shield_available THEN
    -- Use shield
    UPDATE momentum_streaks SET
      current_streak = rec.current_streak + 1,
      longest_streak = GREATEST(rec.longest_streak, rec.current_streak + 1),
      last_activity_date = today_date,
      shield_available = false,
      shield_used_date = today_date,
      updated_at = now()
    WHERE user_id = _user_id;
    current_streak := rec.current_streak + 1;
    shield_used := true;
  ELSE
    -- Streak broken
    UPDATE momentum_streaks SET
      current_streak = 1,
      last_activity_date = today_date,
      shield_available = CASE WHEN rec.shield_used_date IS NULL OR (today_date - rec.shield_used_date) >= 14 THEN true ELSE rec.shield_available END,
      updated_at = now()
    WHERE user_id = _user_id;
    current_streak := 1;
  END IF;

  RETURN NEXT;
END;
$$;
