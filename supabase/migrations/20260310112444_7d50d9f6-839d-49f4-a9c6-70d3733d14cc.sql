
CREATE TABLE public.saved_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quote TEXT NOT NULL,
  context_tag TEXT DEFAULT 'Life Strategy',
  personal_note TEXT,
  source_conversation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insights"
  ON public.saved_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
