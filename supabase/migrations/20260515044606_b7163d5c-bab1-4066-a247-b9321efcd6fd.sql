ALTER TABLE public.saved_insights
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS saved_insights_user_created_idx
  ON public.saved_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS saved_insights_quote_fts_idx
  ON public.saved_insights USING gin (to_tsvector('english', coalesce(quote, '') || ' ' || coalesce(personal_note, '')));

DROP TRIGGER IF EXISTS update_saved_insights_updated_at ON public.saved_insights;
CREATE TRIGGER update_saved_insights_updated_at
  BEFORE UPDATE ON public.saved_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();