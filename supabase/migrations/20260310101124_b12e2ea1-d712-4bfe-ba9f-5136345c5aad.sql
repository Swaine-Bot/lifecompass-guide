
-- Share events table for aggregate analytics tracking
CREATE TABLE public.share_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_type TEXT NOT NULL,
  share_target TEXT DEFAULT 'native',
  format TEXT DEFAULT 'square',
  privacy_level TEXT DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own share events
CREATE POLICY "Users can insert own share events"
ON public.share_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view own share events
CREATE POLICY "Users can view own share events"
ON public.share_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all share events for aggregate analytics
CREATE POLICY "Admins can view all share events"
ON public.share_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
