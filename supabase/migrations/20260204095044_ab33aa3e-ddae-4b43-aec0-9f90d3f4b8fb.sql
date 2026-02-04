-- Add mentor_feedback column to store AI insights for each journal entry
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS mentor_feedback JSONB DEFAULT NULL;

-- This will store the analysis result: {mentorComment, nudge, opportunities[]}