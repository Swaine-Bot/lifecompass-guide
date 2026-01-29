-- Add column to control whether friends can see AI mentor comments on user's posts
ALTER TABLE public.privacy_settings 
ADD COLUMN IF NOT EXISTS show_ai_insights_to_friends BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.privacy_settings.show_ai_insights_to_friends IS 'Whether friends can see AI mentor insights on this user posts';