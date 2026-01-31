-- Add scheduled playback date/time for "message to future self" feature
ALTER TABLE public.journal_entries 
ADD COLUMN scheduled_playback_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add a column to track if the reminder notification was sent
ALTER TABLE public.journal_entries 
ADD COLUMN playback_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add index for efficient querying of due reminders
CREATE INDEX idx_journal_entries_scheduled_playback 
ON public.journal_entries (scheduled_playback_at) 
WHERE scheduled_playback_at IS NOT NULL AND playback_reminder_sent = FALSE;