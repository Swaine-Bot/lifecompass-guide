
-- Create playbooks table
CREATE TABLE public.playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'goal',
  source_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  source_conversation_id UUID REFERENCES public.mentor_conversations(id) ON DELETE SET NULL,
  source_message_content TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own playbooks" ON public.playbooks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Extend tasks table with playbook and AI source tracking
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS playbook_id UUID REFERENCES public.playbooks(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source_conversation_id UUID REFERENCES public.mentor_conversations(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0;
